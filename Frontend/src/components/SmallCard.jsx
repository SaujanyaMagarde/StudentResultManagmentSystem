import React from 'react'

export default function SmallCard({ title, subtitle, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
      <div>{children}</div>
    </div>
  )
}
