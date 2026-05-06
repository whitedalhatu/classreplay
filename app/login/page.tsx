'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function StudentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Check in user_profiles table
    const { data: user, error: queryError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    console.log('User found:', user, queryError)

    if (user && user.password_hash === password) {
      if (!user.subscription_active) {
        setError('Your subscription is not active. Please contact support.')
        return
      }

      localStorage.setItem('isStudent', 'true')
      localStorage.setItem('studentEmail', user.email)
      localStorage.setItem('studentProgramId', user.program_id)
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Login</h1>
          <p className="text-gray-600 mt-2">Access your courses</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="student@skyline.edu.ng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/admin/login" className="text-xs text-gray-500 hover:text-gray-700">
            Volunteer/Admin Login →
          </Link>
        </div>

        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-gray-900">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
