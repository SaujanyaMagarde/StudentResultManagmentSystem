import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { GraduationCap, BarChart3, Medal } from 'lucide-react'

export default function DepartmentAnalysis() {
  const [departments, setDepartments] = useState([
    { id: 1, avgSubject: [], topStudents: [] },
    { id: 2, avgSubject: [], topStudents: [] },
  ])

  useEffect(() => {
    async function load() {
      const newDepartments = await Promise.all(
        departments.map(async (dept) => {
          const res = await api.get(`/department/analysis/${dept.id}`)
          return {
            ...dept,
            avgSubject: res.data.avgPerSubject || [],
            topStudents: res.data.topStudents || [],
          }
        })
      )
      setDepartments(newDepartments)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 sm:p-10 space-y-10">
      {departments.map((dept) => (
        <div key={dept.id}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="text-indigo-600" size={36} />
            <h1 className="text-3xl font-bold text-gray-800">
              Department Analysis — <span className="text-indigo-600">Dept {dept.id}</span>
            </h1>
          </div>

          {/* Subject Averages */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 transition hover:shadow-xl hover:-translate-y-1 duration-200 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                Subject-wise Average Marks
              </h3>
            </div>

            <div className="w-full h-[340px] mt-3">
              <ResponsiveContainer>
                <BarChart data={dept.avgSubject} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="subject_name"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avg_marks"
                    name="Average Marks"
                    fill="url(#colorGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Students */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 transition hover:shadow-xl hover:-translate-y-1 duration-200 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Medal className="text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-800">Top Performing Students</h3>
            </div>

            {dept.topStudents.length === 0 ? (
              <p className="text-gray-500 text-sm">No student data available</p>
            ) : (
              <ol className="space-y-3 mt-3">
                {dept.topStudents.map((s, index) => (
                  <li
                    key={s.student_id}
                    className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-700 font-bold w-8 h-8 flex items-center justify-center rounded-full">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-500">
                          {s.roll_no} — {s.class_name}
                        </p>
                      </div>
                    </div>
                    <div className="font-bold text-indigo-700 text-lg">{s.avg_marks}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
