import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      const res = await login(email, password)
      // after login go to dashboard
      navigate('/dashboard')
    } catch (error) {
      setErr(error.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Teacher Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full border p-2 rounded" />
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-primary text-white py-2 rounded mt-2">Login</button>
      </form>
    </div>
  )
}
