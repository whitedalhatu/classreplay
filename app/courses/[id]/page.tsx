'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CoursePage() {
  const params = useParams()
  const [course, setCourse] = useState<any>(null)
  const [lectures, setLectures] = useState<any[]>([])
  const [selectedLecture, setSelectedLecture] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
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
    }
    fetchData()
  }, [params.id])

  if (!course) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/courses" className="text-indigo-600 hover:text-indigo-800">← Back to Courses</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{course.code} - {course.name}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedLecture ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(selectedLecture.youtube_url)}
                    title={selectedLecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedLecture.title}</h2>
                  <p className="text-gray-600">{selectedLecture.description}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                No lectures available yet
              </div>
            )}
          </div>

          {/* Lecture List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">Lectures ({lectures.length})</h3>
            <div className="space-y-2">
              {lectures.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() => setSelectedLecture(lecture)}
                  className={`w-full text-left p-3 rounded transition ${
                    selectedLecture?.id === lecture.id
                      ? 'bg-indigo-100 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{lecture.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
