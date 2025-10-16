import React from 'react'
import { BarChart3, Users, TrendingUp, LogIn, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative px-6 py-16 sm:px-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Student Result <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management System</span>
            </h1>
            <p className="text-lg text-gray-600 mb-2">A lightweight system to add, view and analyze student results</p>
            <p className="text-sm text-gray-500">Built by <span className="font-semibold text-gray-700">Master Saujanya</span></p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-6 sm:px-12 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
          <Link to="/student-result" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Search size={20} />
            View Student Result
          </Link>
          <Link to="/login" className="flex-1 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-100 flex items-center justify-center gap-2">
            <LogIn size={20} />
            Teacher Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 sm:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teacher Features */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="text-blue-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Teacher Features</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Login/Logout with activity tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Add and update student results</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Subject-level analysis with interactive charts</span>
                </li>
              </ul>
            </div>

            {/* Department Features */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-purple-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Department & Students</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Student result lookup by Roll No & Class</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Department-wide analysis and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Discover top performers and trends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 sm:px-12 py-12 bg-white/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center">
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">100+</div>
            <p className="text-gray-600 text-sm mt-2">Students</p>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">20+</div>
            <p className="text-gray-600 text-sm mt-2">Subjects</p>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">Real-time</div>
            <p className="text-gray-600 text-sm mt-2">Analytics</p>
          </div>
        </div>
      </div>
    </div>
  )
}