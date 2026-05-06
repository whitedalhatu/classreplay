'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CoursesPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: programsData } = await supabase
        .from('programs')
        .select(`
          *,
          semesters (
            *,
            courses (*)
          )
        `)
      
      setPrograms(programsData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">ClassReplay</Link>
          <div className="space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Browse Courses</h1>
        
        {programs.map(program => (
          <div key={program.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{program.name}</h2>
            
            {program.semesters?.map((semester: any) => (
              <div key={semester.id} className="mb-8 bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">{semester.name} - {semester.level}</h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semester.courses?.map((course: any) => (
                    <Link 
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition"
                    >
                      <div className="font-semibold text-indigo-600">{course.code}</div>
                      <div className="text-gray-900 font-medium">{course.name}</div>
                      <div className="text-sm text-gray-500 mt-2">{course.description}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  )
}
