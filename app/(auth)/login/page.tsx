import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse glass rounded-2xl p-8 h-96" />
    }>
      <LoginForm />
    </Suspense>
  )
}