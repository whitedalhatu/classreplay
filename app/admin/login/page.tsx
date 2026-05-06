'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    alert('Login function called!')
    setError('')
    
    console.log('Attempting login with:', email, password)
    
    // Check against admin_users table
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .single()
    
    console.log('Query result:', adminUser, queryError)
    
    if (adminUser) {
      const role = adminUser.role || 'super_admin'
      const verificationStatus = adminUser.verification_status || 'approved'
      
      console.log('Role:', role, 'Status:', verificationStatus)
      
      if (role === 'volunteer' && verificationStatus !== 'approved') {
        setError('Your account is pending approval by an administrator')
        return
      }
      
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminRole', role)
      console.log('Login successful, redirecting...')
      router.push('/admin')
    } else {
      console.log('No user found or wrong password')
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin / Volunteer Login</h1>
          <p className="text-gray-600 mt-2">ClassReplay Content Management</p>
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
              placeholder="your@email.com"
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
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
          >
            Login
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 mb-2">Don't have an account?</p>
          <Link href="/register?type=volunteer" className="text-indigo-600 hover:underline">
            Register as Volunteer
          </Link>
        </div>
        
        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-gray-900">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
