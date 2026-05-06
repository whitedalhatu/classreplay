'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [lectures, setLectures] = useState<any[]>([])
  const [selectedLecture, setSelectedLecture] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const studentLoggedIn = localStorage.getItem('isStudent')
    setIsLoggedIn(!!studentLoggedIn)
    
    fetchCourseData()
  }, [params.id])

  async function fetchCourseData() {
    if (!supabase) return;
    
    const { data: courseData } = await supabase
      .from('courses')
      .select('*, semesters(name, level, programs(name))')
      .eq('id', params.id)
      .single()
    
    const { data: lecturesData } = await supabase
      .from('lectures')
      .select('*')
      .eq('course_id', params.id)
      .order('order_number')
    
    setCourse(courseData)
    setLectures(lecturesData || [])
    if (lecturesData && lecturesData.length > 0) {
      setSelectedLecture(lecturesData[0])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Course not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">ClassReplay</Link>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  ← Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/courses" className="text-gray-600 hover:text-gray-900">
                    ← All Courses
                  </Link>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                  <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            {course.semesters?.programs?.name} • {course.semesters?.level} • {course.semesters?.name}
          </div>
          <h1 className="text-3xl font-bold mb-2">{course.code}: {course.name}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        {lectures.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">No Lectures Yet</h2>
            <p className="text-gray-600">Lectures will be added soon. Check back later!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {selectedLecture?.youtube_url ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedLecture.youtube_url.split('v=')[1]?.split('&')[0] || selectedLecture.youtube_url.split('/').pop()}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedLecture?.video_file_path ? (
                  <div className="aspect-video bg-black">
                    <video
                      src={`https://zjtiunvakvsbqjojrklz.supabase.co/storage/v1/object/public/lecture-videos/${selectedLecture.video_file_path}`}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedLecture?.title}</h2>
                  <p className="text-gray-600">{selectedLecture?.description}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg">Lectures ({lectures.length})</h3>
                </div>
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {lectures.map((lecture, index) => (
                    <button
                      key={lecture.id}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedLecture?.id === lecture.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedLecture?.id === lecture.id ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{lecture.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{lecture.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
