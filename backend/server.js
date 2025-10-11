// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '4200',
  database: process.env.DB_NAME || 'student_result_mgmt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to verify teacher token
const verifyTeacher = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.teacherId = decoded.teacherId;
    req.teacherClassId = decoded.classId;
    req.teacherSubjectId = decoded.subjectId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Teacher Login (returns token + teacher info incl. class_id & subject_id and names)
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Join to get class/subject names and ids in one query
    const [rows] = await pool.query(
      `SELECT t.*, c.class_id, c.class_name, s.subject_id, s.subject_name
       FROM teachers t
       LEFT JOIN classes c ON t.class_id = c.class_id
       LEFT JOIN subjects s ON t.subject_id = s.subject_id
       WHERE t.email = ?`,
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials (email)' });
    }
    
    const teacher = rows[0];
    const validPassword = await bcrypt.compare(password, teacher.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials (password)' });
    }
    
    const token = jwt.sign(
      { teacherId: teacher.teacher_id, classId: teacher.class_id, subjectId: teacher.subject_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      teacher: {
        id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        class_id: teacher.class_id,
        class_name: teacher.class_name,
        subject_id: teacher.subject_id,
        subject_name: teacher.subject_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const [classes] = await pool.query('SELECT * FROM classes ORDER BY class_name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subjects', async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by class
app.get('/api/students/class/:classId', verifyTeacher, async (req, res) => {
  try {
    const classId = req.params.classId;
    // Optionally: check that req.teacherClassId matches requested classId for authorization
    // if (req.teacherClassId && `${req.teacherClassId}` !== `${classId}`) return res.status(403).json({ error: 'Forbidden' });

    const [students] = await pool.query(
      'SELECT * FROM students WHERE class_id = ? ORDER BY roll_no',
      [classId]
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subjects by class
app.get('/api/subjects/class/:classId', async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE class_id = ?',
      [req.params.classId]
    );
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or Update Result
app.post('/api/results', verifyTeacher, async (req, res) => {
  try {
    const { studentId, subjectId, marksObtained, examDate, remarks } = req.body;

    // Defensive checks
    if (!studentId || !subjectId || typeof marksObtained !== 'number' && isNaN(Number(marksObtained))) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    // Check if result already exists for the student/subject/date
    const [existing] = await pool.query(
      'SELECT * FROM results WHERE student_id = ? AND subject_id = ? AND exam_date = ?',
      [studentId, subjectId, examDate]
    );
    
    if (existing.length > 0) {
      // Update existing result
      await pool.query(
        'UPDATE results SET marks_obtained = ?, remarks = ?, teacher_id = ? WHERE result_id = ?',
        [marksObtained, remarks, req.teacherId, existing[0].result_id]
      );
      res.json({ message: 'Result updated successfully' });
    } else {
      // Insert new result
      await pool.query(
        'INSERT INTO results (student_id, subject_id, marks_obtained, teacher_id, exam_date, remarks) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, subjectId, marksObtained, req.teacherId, examDate, remarks]
      );
      res.json({ message: 'Result added successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student results by roll number and class
app.get('/api/results/student', async (req, res) => {
  try {
    const { rollNo, classId } = req.query;
    if (!rollNo || !classId) return res.status(400).json({ error: 'rollNo and classId are required' });

    const [results] = await pool.query(`
      SELECT 
        s.student_id, s.name, s.roll_no,
        c.class_name,
        sub.subject_name, sub.max_marks,
        r.marks_obtained, r.exam_date, r.remarks,
        t.name as teacher_name
      FROM students s
      JOIN classes c ON s.class_id = c.class_id
      LEFT JOIN results r ON s.student_id = r.student_id
      LEFT JOIN subjects sub ON r.subject_id = sub.subject_id
      LEFT JOIN teachers t ON r.teacher_id = t.teacher_id
      WHERE s.roll_no = ? AND s.class_id = ?
      ORDER BY r.exam_date DESC, sub.subject_name
    `, [rollNo, classId]);
    
    if (results.length === 0) {
      // no student found
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teacher info
app.get('/api/teacher/info', verifyTeacher, async (req, res) => {
  try {
    const [teachers] = await pool.query(`
      SELECT t.teacher_id, t.name, t.email, c.class_id, c.class_name, s.subject_id, s.subject_name
      FROM teachers t
      LEFT JOIN classes c ON t.class_id = c.class_id
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.teacher_id = ?
    `, [req.teacherId]);
    
    if (!teachers[0]) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teachers[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, email, password, class_id, subject_id } = req.body;

    // Defensive checks
    if (!name || !email || !password || !class_id || !subject_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const [existingTeacher] = await pool.query(
      'SELECT teacher_id FROM teachers WHERE email = ?',
      [email]
    );

    if (existingTeacher.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO teachers (name, email, password, class_id, subject_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, class_id, subject_id]
    );

    // Don't send sensitive data back
    res.status(201).json({ 
      message: 'Teacher added successfully', 
      teacherId: result.insertId,
      teacher: {
        id: result.insertId,
        name,
        email,
        class_id,
        subject_id
      }
    });
  } catch (error) {
    console.error('Error adding teacher:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
