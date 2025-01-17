'use client'

import { useState } from 'react'

interface CollapsibleInfoProps {
  title: string
  children: React.ReactNode
}

/**
 * A collapsible component that can show/hide content
 */
export default function CollapsibleInfo({ title, children }: CollapsibleInfoProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="font-medium">{title}</span>
        <span className="transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : '' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  )
}
