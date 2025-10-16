import React, { createContext, useState, useEffect } from 'react'
import {jwtDecode} from 'jwt-decode'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setTeacher(prev => prev || { id: decoded.teacherId, deptId: decoded.deptId })
        localStorage.setItem('token', token)
      } catch (e) {
        setToken(null)
        localStorage.removeItem('token')
      }
    } else {
      setTeacher(null)
      localStorage.removeItem('token')
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/teacher/login', { email, password })
    setToken(res.data.token)
    // set teacher details from API response
    if (res.data.teacher) setTeacher(res.data.teacher)
    return res
  }

  const logout = async () => {
    // call logout endpoint to revoke token
    try {
      await api.post('/teacher/logout')
    } catch (e) {
      console.warn('Logout request failed (still clearing local session).')
    }
    setToken(null)
    setTeacher(null)
    navigate('/login')
  }

  const value = { teacher, token, login, logout, setToken, setTeacher }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
