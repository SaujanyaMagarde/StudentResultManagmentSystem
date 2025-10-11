import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, LogOut, Award, UserPlus } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:5000/api';

export default function StudentResultManagement() {
  const [mode, setMode] = useState('student');
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [teacherInfo, setTeacherInfo] = useState(() => {
    const stored = localStorage.getItem('teacherInfo');
    return stored ? JSON.parse(stored) : null;
  });

  // persist token and teacherInfo
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (teacherInfo) localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
    else localStorage.removeItem('teacherInfo');
  }, [teacherInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap size={32} />
              <h1 className="text-2xl font-bold">Student Result Management</h1>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setMode('student')}
                className={`px-4 py-2 rounded-lg transition ${
                  mode === 'student' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'
                }`}
              >
                Student Portal
              </button>
              {!token && (
                <>
                  <button
                    onClick={() => setMode('teacher')}
                    className={`px-4 py-2 rounded-lg transition ${
                      mode === 'teacher' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'
                    }`}
                  >
                    Teacher Portal
                  </button>
                  <button
                    onClick={() => setMode('admin')}
                    className={`px-4 py-2 rounded-lg transition ${
                      mode === 'admin' ? 'bg-white text-indigo-600' : 'bg-indigo-500 hover:bg-indigo-400'
                    }`}
                  >
                    Admin Portal
                  </button>
                </>
              )}
            </div>

            {token && (
              <button
                onClick={() => {
                  setToken(null);
                  setTeacherInfo(null);
                  setMode('student');
                }}
                className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {mode === 'student' ? (
          <StudentPortal />
        ) : mode === 'admin' ? (
          <TeacherRegistration />
        ) : token ? (
          <TeacherDashboard token={token} teacherInfo={teacherInfo} />
        ) : (
          <TeacherLogin setToken={setToken} setTeacherInfo={setTeacherInfo} />
        )}
      </main>
    </div>
  );
}

/* ---------------- TeacherRegistration ---------------- */
function TeacherRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    class_id: '',
    subject_id: ''
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_URL}/classes`);
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/subjects`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register teacher');
      }

      setMessage('Teacher registered successfully! ✓');
      setFormData({
        name: '',
        email: '',
        password: '',
        class_id: '',
        subject_id: ''
      });
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus className="mr-3 text-indigo-600" />
          Register New Teacher
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter teacher's full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="teacher@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Class
            </label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Subject
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a subject</option>
              {subjects.map((subject) => (
                <option key={subject?.subject_id} value={subject?.subject_id}>
                  {subject?.subject_name}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Registering...' : 'Register Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- StudentPortal ---------------- */
function StudentPortal() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_URL}/classes`);
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleViewResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch(`${API_URL}/results/student?rollNo=${encodeURIComponent(rollNo)}&classId=${encodeURIComponent(selectedClass)}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Student not found or no results available');
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!results) return { obtained: 0, max: 0, percentage: 0 };
    const obtained = results.reduce((sum, r) => sum + (r.marks_obtained || 0), 0);
    const max = results.reduce((sum, r) => sum + (r.max_marks || 0), 0);
    return { obtained, max, percentage: max ? ((obtained / max) * 100).toFixed(2) : 0 };
  };

  const totalStats = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BookOpen className="mr-3 text-indigo-600" />
          View Your Results
        </h2>

        <form onSubmit={handleViewResult} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              placeholder="Enter your roll number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Loading...' : 'View Results'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Student Information</h3>
              <p className="text-lg"><span className="font-semibold">Name:</span> {results[0].name}</p>
              <p className="text-lg"><span className="font-semibold">Roll No:</span> {results[0].roll_no}</p>
              <p className="text-lg"><span className="font-semibold">Class:</span> {results[0].class_name}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center">
                <Award className="mr-2" />
                Overall Performance
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-700">{totalStats.obtained}</p>
                  <p className="text-sm text-gray-600">Marks Obtained</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">{totalStats.max}</p>
                  <p className="text-sm text-gray-600">Total Marks</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">{totalStats.percentage}%</p>
                  <p className="text-sm text-gray-600">Percentage</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Subject-wise Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-center">Max Marks</th>
                      <th className="px-4 py-3 text-center">Obtained</th>
                      <th className="px-4 py-3 text-center">Percentage</th>
                      <th className="px-4 py-3 text-left">Exam Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(r => r.subject_name).map((result, idx) => {
                      const maxMarks = result.max_marks || 0;
                      const obtained = result.marks_obtained || 0;
                      const percentage = maxMarks ? ((obtained / maxMarks) * 100).toFixed(2) : '0.00';
                      const percentageNum = parseFloat(percentage);
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{result.subject_name}</td>
                          <td className="px-4 py-3 text-center">{maxMarks}</td>
                          <td className="px-4 py-3 text-center font-semibold">{obtained}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${
                              percentageNum >= 60 
                                ? 'text-green-600' 
                                : percentageNum >= 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {result.exam_date ? new Date(result.exam_date).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- TeacherLogin ---------------- */
function TeacherLogin({ setToken, setTeacherInfo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Invalid credentials');
      }

      const data = await res.json();
      setToken(data.token);
      setTeacherInfo(data.teacher);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Teacher Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- TeacherDashboard ---------------- */
function TeacherDashboard({ token, teacherInfo }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [examDate, setExamDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherInfo) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherInfo]);

  const fetchStudents = async () => {
    try {
      const classId = teacherInfo.class_id || teacherInfo.classId;
      if (!classId) {
        console.warn('No class_id available in teacherInfo');
        return;
      }

      const res = await fetch(`${API_URL}/students/class/${encodeURIComponent(classId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const subjectId = teacherInfo.subject_id || teacherInfo.subjectId;
      const body = {
        studentId: selectedStudent,
        subjectId: subjectId,
        marksObtained: parseInt(marksObtained, 10),
        examDate,
        remarks
      };

      const res = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to add result');

      setMessage(data.message || 'Result added successfully');
      setSelectedStudent('');
      setMarksObtained('');
      setExamDate('');
      setRemarks('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!teacherInfo) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8 bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">Welcome, {teacherInfo.name}</h2>
          <p className="text-gray-700"><span className="font-semibold">Class:</span> {teacherInfo.class_name}</p>
          <p className="text-gray-700"><span className="font-semibold">Subject:</span> {teacherInfo.subject_name}</p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Student Result</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.roll_no} - {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
            <input
              type="number"
              min="0"
              max="100"
              value={marksObtained}
              onChange={(e) => setMarksObtained(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              placeholder="Enter any additional remarks"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Submitting...' : 'Add Result'}
          </button>
        </form>
      </div>
    </div>
  );
}