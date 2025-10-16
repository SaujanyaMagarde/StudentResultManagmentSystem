// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_prod';
const PORT = process.env.PORT || 5000;

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_result_mgmt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ensure revoked_tokens table exists (for logout)
async function ensureRevokedTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      id INT PRIMARY KEY AUTO_INCREMENT,
      token TEXT NOT NULL,
      revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
ensureRevokedTable().catch(console.error);

// Middleware: check token not revoked and valid
const verifyTeacher = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Authorization header required' });
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token missing' });

    // check revoked
    const [revokedRows] = await pool.query('SELECT 1 FROM revoked_tokens WHERE token = ? LIMIT 1', [token]);
    if (revokedRows.length > 0) return res.status(401).json({ error: 'Token revoked (logged out)' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.teacherId = decoded.teacherId;
    req.teacherDeptId = decoded.deptId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/* ============================
   AUTH: teacher register/login/logout
   ============================ */

// Register teacher (for admin or initial seeding). Teacher belongs to a department.
app.post('/api/teacher/register', async (req, res) => {
  try {
    const { name, email, password, dept_id } = req.body;
    if (!name || !email || !password || !dept_id) return res.status(400).json({ error: 'Missing fields' });

    // check duplicate email
    const [exists] = await pool.query('SELECT teacher_id FROM teachers WHERE email = ? LIMIT 1', [email]);
    if (exists.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO teachers (name, email, password, dept_id) VALUES (?, ?, ?, ?)',
      [name, email, hashed, dept_id]
    );

    res.status(201).json({ message: 'Teacher created', teacherId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Teacher login — returns token and teacher info (and subjects they teach)
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

    const [rows] = await pool.query('SELECT * FROM teachers WHERE email = ? LIMIT 1', [email]);
    console.log(rows);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const teacher = rows[0];
    console.log(teacher);
    if(!teacher)return res.status(401).json({ error: 'Invalid credentials' });

    // fetch teacher subjects and classes (they may teach many subjects)
    const [subjects] = await pool.query(
      `SELECT s.subject_id, s.subject_name, s.class_id, c.class_name
       FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.subject_id
       JOIN classes c ON s.class_id = c.class_id
       WHERE ts.teacher_id = ?`,
      [teacher.teacher_id]
    );

    const token = jwt.sign(
      { teacherId: teacher.teacher_id, deptId: teacher.dept_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      teacher: {
        id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        dept_id: teacher.dept_id
      },
      subjects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (server-side revoke token)
app.post('/api/teacher/logout', verifyTeacher, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await pool.query('INSERT INTO revoked_tokens (token) VALUES (?)', [token]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/* ============================
   Teacher - manage subject assignments
   ============================ */

// Assign subjects to a teacher (many-to-many). Accepts array of subjectIds.
app.post('/api/teacher/:teacherId/assign-subjects', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subjectIds } = req.body; // e.g. [1,2,3]
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) return res.status(400).json({ error: 'subjectIds array required' });

    // Optionally: ensure teacher exists
    const [tRows] = await pool.query('SELECT * FROM teachers WHERE teacher_id = ? LIMIT 1', [teacherId]);
    if (!tRows.length) return res.status(404).json({ error: 'Teacher not found' });

    // Insert ignoring duplicates
    const insertValues = subjectIds.map(sid => [teacherId, sid]);
    await pool.query('INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES ?', [insertValues]);

    res.json({ message: 'Subjects assigned to teacher' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Get teacher profile (with subjects)
   ============================ */
app.get('/api/teacher/me', verifyTeacher, async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const [[teacher]] = await pool.query('SELECT teacher_id, name, email, dept_id FROM teachers WHERE teacher_id = ? LIMIT 1', [teacherId]);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const [subjects] = await pool.query(
      `SELECT s.subject_id, s.subject_name, s.class_id, c.class_name
       FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.subject_id
       JOIN classes c ON s.class_id = c.class_id
       WHERE ts.teacher_id = ?`,
      [teacherId]
    );

    res.json({ teacher, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Results: Teacher add/update results
   - Teacher may only add/update results for subjects they are linked to
   - Student must belong to the class to which subject belongs (class_id consistency)
   - Teacher must belong to same department as student's class (business rule 3)
   ============================ */

app.post('/api/results', verifyTeacher, async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const { studentId, subjectId, marksObtained, examDate, remarks } = req.body;

    if (!studentId || !subjectId || typeof marksObtained !== 'number') {
      return res.status(400).json({ error: 'studentId, subjectId and numeric marksObtained required' });
    }

    // 1) Check teacher teaches subject
    const [teachRows] = await pool.query(
      'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ? LIMIT 1',
      [teacherId, subjectId]
    );
    if (teachRows.length === 0) return res.status(403).json({ error: 'You are not assigned to teach this subject' });

    // 2) Check student exists & fetch student's class and department
    const [[student]] = await pool.query(
      `SELECT s.student_id, s.name, s.class_id, c.dept_id
       FROM students s
       JOIN classes c ON s.class_id = c.class_id
       WHERE s.student_id = ? LIMIT 1`,
      [studentId]
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // 3) Get subject class and department
    const [[subject]] = await pool.query(
      `SELECT s.subject_id, s.class_id AS subject_class_id, c.dept_id AS subject_dept_id
       FROM subjects s
       JOIN classes c ON s.class_id = c.class_id
       WHERE s.subject_id = ? LIMIT 1`,
      [subjectId]
    );
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Ensure subject belongs to student's class
    if (student.class_id !== subject.subject_class_id) {
      return res.status(400).json({ error: 'Subject does not belong to student\'s class' });
    }

    // Ensure teacher department equals subject/class department (business rule)
    const [[teacher]] = await pool.query('SELECT dept_id FROM teachers WHERE teacher_id = ? LIMIT 1', [teacherId]);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.dept_id !== subject.subject_dept_id) {
      return res.status(403).json({ error: 'Teacher department mismatch for this subject/class' });
    }

    // Insert or update results (unique by student + subject + exam_date)
    const exam_date_val = examDate || new Date().toISOString().slice(0, 10);
    const [existing] = await pool.query('SELECT result_id FROM results WHERE student_id = ? AND subject_id = ? AND exam_date = ? LIMIT 1', [studentId, subjectId, exam_date_val]);

    if (existing.length) {
      await pool.query('UPDATE results SET marks_obtained = ?, teacher_id = ?, remarks = ? WHERE result_id = ?', [marksObtained, teacherId, remarks || null, existing[0].result_id]);
      return res.json({ message: 'Result updated' });
    } else {
      await pool.query('INSERT INTO results (student_id, subject_id, marks_obtained, teacher_id, exam_date, remarks) VALUES (?, ?, ?, ?, ?, ?)', [studentId, subjectId, marksObtained, teacherId, exam_date_val, remarks || null]);
      return res.status(201).json({ message: 'Result added' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Student Full Result by roll no (no partial allowed)
   - Query params: rollNo & classId (or just rollNo if roll numbers are unique across system)
   - Returns 400 if results missing for any subject of that class
   ============================ */
app.get('/api/student/result', async (req, res) => {
  try {
    const { rollNo, classId } = req.query;
    if (!rollNo || !classId) return res.status(400).json({ error: 'rollNo and classId required' });

    // fetch student
    const [srows] = await pool.query('SELECT student_id, name, class_id FROM students WHERE roll_no = ? AND class_id = ? LIMIT 1', [rollNo, classId]);
    if (srows.length === 0) return res.status(404).json({ error: 'Student not found' });
    const student = srows[0];

    // expected subjects for the class
    const [subjectRows] = await pool.query('SELECT subject_id, subject_name, max_marks FROM subjects WHERE class_id = ? ORDER BY subject_id', [classId]);
    if (subjectRows.length === 0) return res.status(404).json({ error: 'No subjects found for this class' });

    // student's results for those subjects (latest exam_date for each subject if multiple)
    // We'll fetch the latest result for each subject (by exam_date) for that student
    const [resultRows] = await pool.query(`
  SELECT sub.subject_id, sub.subject_name, sub.max_marks,
         r.marks_obtained, r.exam_date, r.remarks, t.name AS teacher_name
  FROM subjects sub
  LEFT JOIN results r
    ON sub.subject_id = r.subject_id
    AND r.student_id = ?
    AND r.exam_date = (
      SELECT MAX(rr.exam_date)
      FROM results rr
      WHERE rr.subject_id = sub.subject_id AND rr.student_id = ?
    )
  LEFT JOIN teachers t ON r.teacher_id = t.teacher_id
  WHERE sub.class_id = ?
  ORDER BY sub.subject_id
`, [student.student_id, student.student_id, classId]);

    if(resultRows.length != 5) {
      return res.status(400).json({ error: 'Incomplete results: student does not have results for all subjects' });
    }

    // Check completeness: there should be one result per subject (marks_obtained not null)
    const missing = [];
    const results = [];
    for (const subj of subjectRows) {
      const found = resultRows.find(r => Number(r.subject_id) === Number(subj.subject_id) && r.marks_obtained !== null && r.marks_obtained !== undefined);
      if (!found) missing.push(subj.subject_name);
      else results.push(found);
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Incomplete results: student does not have results for all subjects',
        missingSubjects: missing
      });
    }

    // compute totals & percentage
    const totalObtained = results.reduce((sum, r) => sum + Number(r.marks_obtained), 0);
    const totalMax = results.reduce((sum, r) => sum + Number(r.max_marks), 0);
    const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

    res.json({
      student: { id: student.student_id, name: student.name, roll_no: rollNo, class_id: classId },
      subjects: results,
      totalObtained,
      totalMax,
      percentage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Analysis APIs
   1) Teacher subject analysis: average, highest, lowest, pass rate, distribution
      - teacher can only query for subjects they teach
   2) Department analysis: average per subject, top students in department
   ============================ */

// Teacher subject analysis
app.get('/api/teacher/analysis/subject/:subjectId', verifyTeacher, async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const subjectId = req.params.subjectId;

    // verify teacher teaches this subject
    const [ts] = await pool.query('SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ? LIMIT 1', [teacherId, subjectId]);
    if (!ts.length) return res.status(403).json({ error: 'Not authorized for this subject' });

    // stats: avg, max, min, count, pass_rate (pass >= 33% of max_marks), distribution buckets
    const [[meta]] = await pool.query(
      `SELECT AVG(r.marks_obtained) AS avg_marks, MAX(r.marks_obtained) AS max_marks, MIN(r.marks_obtained) AS min_marks, COUNT(r.result_id) AS attempts, sub.max_marks
       FROM results r
       JOIN subjects sub ON r.subject_id = sub.subject_id
       WHERE r.subject_id = ?
       GROUP BY sub.subject_id
      `,
      [subjectId]
    );

    if (!meta) return res.status(404).json({ error: 'No results found for this subject' });

    // pass rate
    const passMark = Math.ceil((meta.max_marks || 100) * 0.33);
    const [[passRow]] = await pool.query(
      'SELECT COUNT(*) AS pass_count FROM results WHERE subject_id = ? AND marks_obtained >= ?',
      [subjectId, passMark]
    );

    // distribution: simple buckets 0-32,33-49,50-64,65-79,80-100 (scale according to max)
    const buckets = [
      { label: '0-32', min: 0, max: Math.floor(meta.max_marks * 0.32) },
      { label: '33-49', min: Math.ceil(meta.max_marks * 0.33), max: Math.floor(meta.max_marks * 0.49) },
      { label: '50-64', min: Math.ceil(meta.max_marks * 0.50), max: Math.floor(meta.max_marks * 0.64) },
      { label: '65-79', min: Math.ceil(meta.max_marks * 0.65), max: Math.floor(meta.max_marks * 0.79) },
      { label: '80-100', min: Math.ceil(meta.max_marks * 0.80), max: meta.max_marks }
    ];

    const bucketCounts = {};
    for (const b of buckets) {
      const [r] = await pool.query('SELECT COUNT(*) AS cnt FROM results WHERE subject_id = ? AND marks_obtained BETWEEN ? AND ?', [subjectId, b.min, b.max]);
      bucketCounts[b.label] = r[0].cnt;
    }

    res.json({
      subjectId,
      avg_marks: Number(meta.avg_marks).toFixed(2),
      max_marks_obtained: meta.max_marks,
      min_marks_obtained: meta.min_marks,
      attempts: meta.attempts,
      pass_count: passRow.pass_count,
      pass_rate_percent: ((passRow.pass_count / meta.attempts) * 100).toFixed(2),
      buckets: bucketCounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Department analysis: average per subject & top N students in department
app.get('/api/department/analysis/:deptId', async (req, res) => {
  try {
    const deptId = req.params.deptId;
    // 1) average per subject in department
    const [avgPerSubject] = await pool.query(`
      SELECT sub.subject_id, sub.subject_name, ROUND(AVG(r.marks_obtained),2) AS avg_marks
      FROM subjects sub
      LEFT JOIN results r ON sub.subject_id = r.subject_id
      JOIN classes c ON sub.class_id = c.class_id
      WHERE c.dept_id = ?
      GROUP BY sub.subject_id
      ORDER BY avg_marks DESC
    `, [deptId]);

    // 2) top students in department by average marks (only students with complete results considered)
    // We'll compute average over the subjects that belong to student's class; require completeness: student must have result for all subjects of their class
    const [topStudents] = await pool.query(`
      SELECT s.student_id, s.name, s.roll_no, c.class_id, c.class_name,
             ROUND(AVG(r.marks_obtained),2) AS avg_marks, COUNT(r.result_id) AS subjects_count
      FROM students s
      JOIN classes c ON s.class_id = c.class_id
      JOIN subjects sub ON sub.class_id = c.class_id
      JOIN results r ON r.student_id = s.student_id AND r.subject_id = sub.subject_id
      WHERE c.dept_id = ?
      GROUP BY s.student_id
      HAVING COUNT(r.result_id) = (SELECT COUNT(1) FROM subjects WHERE class_id = c.class_id) -- ensures completeness
      ORDER BY avg_marks DESC
      LIMIT 10
    `, [deptId]);

    res.json({ avgPerSubject, topStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Utility endpoints (read-only) - classes, subjects, students, teachers
   ============================ */

app.get('/api/classes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classes ORDER BY class_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/subjects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, c.class_name, c.dept_id FROM subjects s JOIN classes c ON s.class_id = c.class_id ORDER BY s.subject_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/students/class/:classId', async (req, res) => {
  try {
    const classId = req.params.classId;
    const [rows] = await pool.query('SELECT * FROM students WHERE class_id = ? ORDER BY roll_no', [classId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   Start server
   ============================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
