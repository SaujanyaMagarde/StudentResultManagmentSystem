import React, { useState } from 'react'
import api from '../api/api'

export default function StudentResult(){
  const [rollNo, setRollNo] = useState('')
  const [classId, setClassId] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)

  const load = async (e) => {
    e.preventDefault()
    setErr(null)
    setResult(null)
    try {
      const res = await api.get('/student/result', { params: { rollNo, classId } })
      setResult(res.data)
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed')
    }
  }

  return (
    <div className="max-w-2xl bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Student Result Lookup</h3>
      <form onSubmit={load} className="mt-3 space-y-3">
        <div>
          <label className="text-sm">Roll No</label>
          <input value={rollNo} onChange={e=>setRollNo(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="text-sm">Class ID</label>
          <input value={classId} onChange={e=>setClassId(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded">Get Result</button>
      </form>

      {err && <div className="text-red-600 mt-3">{err}</div>}

      {result && (
        <div className="mt-4">
          <div className="font-semibold">{result.student.name} (Roll: {result.student.roll_no})</div>
          <div className="text-sm text-gray-600">Total: {result.totalObtained}/{result.totalMax} — {result.percentage}%</div>

          <table className="w-full mt-3 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Marks</th>
                <th className="p-2 text-left">Exam Date</th>
                <th className="p-2 text-left">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map(s => (
                <tr key={s.subject_id} className="border-t">
                  <td className="p-2">{s.subject_name}</td>
                  <td className="p-2">{s.marks_obtained}/{s.max_marks}</td>
                  <td className="p-2">{s.exam_date}</td>
                  <td className="p-2">{s.teacher_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
