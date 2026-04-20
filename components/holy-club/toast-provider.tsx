'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm z-[200] whitespace-nowrap max-w-[90%] transition-all duration-300 pointer-events-none ${
          visible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-1.5'
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  )
}
