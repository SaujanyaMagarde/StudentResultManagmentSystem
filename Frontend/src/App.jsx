import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import AddResult from './pages/AddResult'
import TeacherAnalysis from './pages/TeacherAnalysis'
import StudentResult from './pages/StudentResult'
import DepartmentAnalysis from './pages/DepartmentAnalysis'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthContext } from './context/AuthContext'

function App(){
  const { teacher } = useContext(AuthContext)
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={teacher ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/add-result" element={<ProtectedRoute><AddResult /></ProtectedRoute>} />
          <Route path="/teacher/analysis/:subjectId" element={<ProtectedRoute><TeacherAnalysis /></ProtectedRoute>} />
          <Route path="/student-result" element={<StudentResult />} />
          <Route path="/department/:deptId" element={<DepartmentAnalysis />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
