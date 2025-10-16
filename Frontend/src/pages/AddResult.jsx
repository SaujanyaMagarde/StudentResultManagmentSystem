import React, { useEffect, useState } from 'react'
import api from '../api/api'

export default function AddResult(){
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ studentId: '', subjectId: '', marksObtained: '', examDate: '', remarks: '' })
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    async function load(){
      const c = await api.get('/classes')
      setClasses(c.data)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    async function load() {
      const s = await api.get(`/students/class/${selectedClass}`)
      setStudents(s.data || [])
      const allSubjects = await api.get('/subjects')
      // filter subjects by class
      setSubjects(allSubjects.data.filter(sub => String(sub.class_id) === String(selectedClass)))
    }
    load()
  }, [selectedClass])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      await api.post('/results', {
        studentId: form.studentId,
        subjectId: form.subjectId,
        marksObtained: Number(form.marksObtained),
        examDate: form.examDate || undefined,
        remarks: form.remarks || ''
      })
      setMsg('Result added/updated successfully.')
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed')
    }
  }

  return (
    <div className="max-w-xl bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Add / Update Result</h3>

      <div className="space-y-3">
        <div>
          <label className="text-sm">Select Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full border p-2 rounded">
            <option value="">--Select--</option>
            {classes.map(c => <option value={c.class_id} key={c.class_id}>{c.class_name}</option>)}
          </select>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm">Student</label>
            <select value={form.studentId} onChange={e=>setForm({...form, studentId:e.target.value})} className="w-full border p-2 rounded">
              <option value="">--Select student--</option>
              {students.map(s => <option key={s.student_id} value={s.student_id}>{s.roll_no} — {s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">Subject</label>
            <select value={form.subjectId} onChange={e=>setForm({...form, subjectId:e.target.value})} className="w-full border p-2 rounded">
              <option value="">--Select subject--</option>
              {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">Marks Obtained</label>
            <input value={form.marksObtained} onChange={e=>setForm({...form, marksObtained:e.target.value})} className="w-full border p-2 rounded" type="number" />
          </div>

          <div>
            <label className="text-sm">Exam Date</label>
            <input type="date" value={form.examDate} onChange={e=>setForm({...form, examDate:e.target.value})} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="text-sm">Remarks</label>
            <input value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})} className="w-full border p-2 rounded" />
          </div>

          {msg && <div className="text-sm text-green-600">{msg}</div>}
          <button className="px-4 py-2 bg-primary text-white rounded">Submit</button>
        </form>
      </div>
    </div>
  )
}
