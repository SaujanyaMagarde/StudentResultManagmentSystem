import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Header(){
  const { teacher, logout } = useContext(AuthContext)
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">SR</div>
          <div>
            <div className="font-semibold">Student Result System</div>
            <div className="text-sm text-gray-500">By Master Saujanya</div>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/student-result" className="text-sm">Student Result</Link>
          <Link to="/department/1" className="text-sm">Department Analysis</Link>
          {teacher ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium">Dashboard</Link>
              <button onClick={logout} className="ml-2 px-3 py-1 rounded bg-red-500 text-white text-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-sm px-3 py-1 border rounded">Teacher Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
