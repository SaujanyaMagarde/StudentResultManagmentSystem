import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function TeacherAnalysis(){
  const { subjectId } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load(){
      const res = await api.get(`/teacher/analysis/subject/${subjectId}`)
      setData(res.data)
    }
    load()
  }, [subjectId])

  if (!data) return <div>Loading...</div>

  // build buckets data for chart
  const buckets = Object.entries(data.buckets || {}).map(([label, cnt]) => ({ label, cnt }))

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Subject Analysis — ID {subjectId}</h3>
        <div className="mt-2 text-sm text-gray-600">Avg: {data.avg_marks} | Max: {data.max_marks_obtained} | Min: {data.min_marks_obtained} | Attempts: {data.attempts}</div>
        <div className="mt-2 text-sm text-gray-600">Pass Rate: {data.pass_rate_percent}%</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium mb-2">Distribution</h4>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={buckets}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cnt" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
