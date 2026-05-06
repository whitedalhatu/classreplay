'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function StudentDashboard() {
  const router = useRouter()
  const [studentEmail, setStudentEmail] = useState('')
  const [studentProgramId, setStudentProgramId] = useState('')
  const [program, setProgram] = useState<any>(null)
  const [semesters, setSemesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const isStudent = localStorage.getItem('isStudent')
    const email = localStorage.getItem('studentEmail')
    const programId = localStorage.getItem('studentProgramId')
    
    if (!isStudent || !email || !programId) {
      router.push('/login')
    } else {
      setStudentEmail(email)
      setStudentProgramId(programId)
      fetchProgramData(programId)
    }
  }, [router])

  async function fetchProgramData(programId: string) {
    const { data: programData } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()
    
    const { data: semestersData } = await supabase
      .from('semesters')
      .select(`
        *,
        courses (
          *,
          lectures (count)
        )
      `)
      .eq('program_id', programId)
    
    setProgram(programData)
    setSemesters(semestersData || [])
    setLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('isStudent')
    localStorage.removeItem('studentEmail')
    localStorage.removeItem('studentProgramId')
    router.push('/')
  }

  const allCourses = semesters.flatMap(s => 
    s.courses?.map((c: any) => ({
      ...c,
      semesterName: s.name,
      level: s.level
    })) || []
  )

  const filteredCourses = searchQuery
    ? allCourses.filter((c: any) => 
        c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCourses

  const totalLectures = allCourses.reduce((acc: number, c: any) => 
    acc + (c.lectures?.[0]?.count || 0), 0
  )

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">ClassReplay</Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">{program?.name}</p>
                <p className="text-xs text-gray-500">{studentEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back! 👋</h2>
              <p className="text-indigo-100">{program?.name}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-4 py-2 mb-2">
                <p className="text-xs opacity-80">Devices Used</p>
                <p className="text-2xl font-bold">1/2</p>
              </div>
              <p className="text-xs opacity-80">Valid until Aug 2026</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold">{allCourses.length}</p>
              <p className="text-xs opacity-80">Your Courses</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold">{totalLectures}</p>
              <p className="text-xs opacity-80">Total Lectures</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold">{semesters.length}</p>
              <p className="text-xs opacity-80">Semesters</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search courses by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {searchQuery ? 'Search Results' : 'My Courses'}
            </h2>
            <p className="text-gray-600">{filteredCourses.length} courses</p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">
                {searchQuery ? 'No courses found' : 'No courses available yet for your program'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-indigo-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-indigo-600 font-semibold mb-1">
                        {course.code}
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{course.name}</h3>
                    </div>
                    <div className="bg-indigo-100 text-indigo-600 rounded-full px-2 py-1 text-xs font-semibold">
                      {course.lectures?.[0]?.count || 0} videos
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{course.level}</span>
                    <span className="text-indigo-600 font-medium">View Lectures →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold">Manage Devices</div>
              <div className="text-xs text-gray-600 mt-1">Currently using 1 of 2 devices</div>
            </button>

            <button className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-semibold">Renew Subscription</div>
              <div className="text-xs text-gray-600 mt-1">Expires in 3 months</div>
            </button>

            <button className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 transition text-left">
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-semibold">Download Certificate</div>
              <div className="text-xs text-gray-600 mt-1">Proof of enrollment</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
