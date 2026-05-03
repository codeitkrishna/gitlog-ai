'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2800,
        style: {
          background: '#121f23',
          border: '1px solid #1e3a2a',
          color: '#CAFFD6',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#0d1317',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '#0d1317',
          },
        },
      }}
    />
  )
}
