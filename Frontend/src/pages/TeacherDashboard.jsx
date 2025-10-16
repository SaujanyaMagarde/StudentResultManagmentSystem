import React, { useEffect, useState, useContext } from 'react'
import api from '../api/api'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import SmallCard from '../components/SmallCard'

export default function TeacherDashboard(){
  const { teacher } = useContext(AuthContext)
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/me')
        setSubjects(res.data.subjects || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Welcome, {teacher?.name || 'Teacher'}</h2>
          <div className="text-sm text-gray-600">Dept: {teacher?.dept_id}</div>
        </div>
        <div className="flex gap-2">
          <Link to="/add-result" className="px-3 py-1 border rounded">Add / Update Result</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjects.map(s => (
          <SmallCard key={s.subject_id} title={s.subject_name} subtitle={s.class_name}>
            <div className="mt-3 flex gap-2">
              <Link to={`/teacher/analysis/${s.subject_id}`} className="text-sm px-2 py-1 border rounded">View Analysis</Link>
            </div>
          </SmallCard>
        ))}
      </div>
    </div>
  )
}
