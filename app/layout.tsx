import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Fraunces, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',   // ← variable enables axes
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: 'variable',   // ← variable enables axes
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],  // ← DM Mono is not variable, keep specific weights
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'TaskFlow — Manage Your Work',
  description: 'A production-ready task management application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1e1e18',
                color: '#f4f4f0',
                border: '1px solid #32322a',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1e1e18' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#1e1e18' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}