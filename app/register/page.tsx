'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') || 'student'
  
  const [registrationType, setRegistrationType] = useState<'student' | 'volunteer'>(
    typeParam === 'volunteer' ? 'volunteer' : 'student'
  )
  
  const [programs, setPrograms] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'skyline_student',
    programId: '',
    courseId: '' // For volunteers
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPrograms()
    fetchCourses()
    
    const type = searchParams.get('type')
    if (type === 'volunteer') {
      setRegistrationType('volunteer')
    } else {
      setRegistrationType('student')
      const userType = type === 'alumni' ? 'skyline_alumni' : 
                       type === 'other' ? 'other_university' : 'skyline_student'
      setFormData(prev => ({ ...prev, userType }))
    }
  }, [searchParams])

  async function fetchPrograms() {
    const { data } = await supabase.from('programs').select('*')
    setPrograms(data || [])
  }

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*, semesters(name, level)')
      .order('code')
    setCourses(data || [])
  }

  const prices: any = {
    skyline_student: '₦5,000',
    skyline_alumni: '₦8,000',
    other_university: '₦8,000'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (registrationType === 'volunteer') {
      if (!formData.courseId) {
        setError('Please select which course you will contribute to')
        return
      }

      const { data, error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          email: formData.email,
          password_hash: formData.password,
          full_name: formData.fullName,
          role: 'volunteer',
          verification_status: 'pending',
          course_id: formData.courseId
        }])
      
      if (insertError) {
        if (insertError.code === '23505') {
          setError('Email already registered')
        } else {
          setError('Registration failed. Please try again.')
        }
      } else {
        setSuccess(true)
      }
    } else {
      if (!formData.programId) {
        setError('Please select your program')
        return
      }
      
      localStorage.setItem('pendingRegistration', JSON.stringify(formData))
      router.push('/payment')
    }
  }

  if (success && registrationType === 'volunteer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Registration Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your volunteer application has been submitted. A super admin will review and approve your account shortly.
            You'll receive access to upload lectures for your selected course once approved.
          </p>
          <div className="space-y-3">
            <Link href="/admin/login" className="block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
              Go to Volunteer Login
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-gray-900">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            {registrationType === 'volunteer' ? 'Volunteer Registration' : 'Create Student Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {registrationType === 'volunteer' 
              ? 'Join as a content contributor' 
              : 'Get access to all course videos'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setRegistrationType('student')}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              registrationType === 'student'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-600'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRegistrationType('volunteer')}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              registrationType === 'volunteer'
                ? 'bg-white shadow text-green-600'
                : 'text-gray-600'
            }`}
          >
            Volunteer
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
              placeholder={registrationType === 'volunteer' ? 'lecturer@skyline.edu.ng' : 'student@skyline.edu.ng'}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="••••••••"
              required
            />
          </div>
          
          {registrationType === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Select Your Program</label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({...formData, programId: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                >
                  <option value="">-- Choose Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">I am a...</label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="skyline_student">Skyline Student</option>
                  <option value="skyline_alumni">Skyline Alumni</option>
                  <option value="other_university">Other University</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  Price: <span className="font-bold text-indigo-600">{prices[formData.userType]}/semester</span>
                </p>
              </div>
            </>
          )}

          {registrationType === 'volunteer' && (
            <div>
              <label className="block text-sm font-medium mb-2">Which course will you contribute to?</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.semesters?.level})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                You'll be able to upload lecture videos for this course after approval
              </p>
            </div>
          )}
          
          <button 
            type="submit"
            className={`w-full text-white py-3 rounded-lg font-semibold ${
              registrationType === 'volunteer'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {registrationType === 'volunteer' ? 'Submit Application' : 'Continue to Payment'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href={registrationType === 'volunteer' ? '/admin/login' : '/login'} 
            className="text-indigo-600 hover:underline"
          >
            Login
          </Link>
        </p>
        
        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-gray-900">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
