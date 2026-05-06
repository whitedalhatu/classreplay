'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<'super_admin' | 'volunteer'>('volunteer')
  const [activeTab, setActiveTab] = useState('lectures')
  
  const [programs, setPrograms] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [lectures, setLectures] = useState<any[]>([])
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  // Form states
  const [newProgram, setNewProgram] = useState({ name: '', description: '' })
  const [newSemester, setNewSemester] = useState({ program_id: '', name: '', level: '' })
  const [newCourse, setNewCourse] = useState({ semester_id: '', code: '', name: '', description: '' })
  const [newLecture, setNewLecture] = useState({ 
    course_id: '', 
    title: '', 
    description: '', 
    youtube_url: '', 
    order_number: 1,
    video_file: null as File | null
  })

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    const role = localStorage.getItem('adminRole') as 'super_admin' | 'volunteer'
    
    if (!isAdmin) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      setUserRole(role || 'volunteer')
      fetchAll()
      if (role === 'super_admin') {
        fetchVolunteers()
      }
    }
  }, [router])

  async function fetchAll() {
    const { data: p } = await supabase.from('programs').select('*')
    const { data: s } = await supabase.from('semesters').select('*, programs(name)')
    const { data: c } = await supabase.from('courses').select('*, semesters(name)')
    const { data: l } = await supabase.from('lectures').select('*, courses(code, name)')
    
    setPrograms(p || [])
    setSemesters(s || [])
    setCourses(c || [])
    setLectures(l || [])
  }

  async function fetchVolunteers() {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'volunteer')
      .order('created_at', { ascending: false })
    
    setVolunteers(data || [])
  }

  async function updateVolunteerStatus(volunteerId: string, status: 'approved' | 'rejected') {
    await supabase
      .from('admin_users')
      .update({ verification_status: status })
      .eq('id', volunteerId)
    
    fetchVolunteers()
  }

  async function handleLogout() {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminRole')
    router.push('/admin/login')
  }

  async function addProgram() {
    await supabase.from('programs').insert([newProgram])
    setNewProgram({ name: '', description: '' })
    fetchAll()
  }

  async function addSemester() {
    await supabase.from('semesters').insert([newSemester])
    setNewSemester({ program_id: '', name: '', level: '' })
    fetchAll()
  }

  async function addCourse() {
    await supabase.from('courses').insert([newCourse])
    setNewCourse({ semester_id: '', code: '', name: '', description: '' })
    fetchAll()
  }

  async function addLecture() {
    setUploading(true)
    
    let videoPath = newLecture.youtube_url
    
    if (newLecture.video_file) {
      const fileExt = newLecture.video_file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lecture-videos')
        .upload(fileName, newLecture.video_file)
      
      if (!uploadError && uploadData) {
        const { data: publicData } = supabase.storage
          .from('lecture-videos')
          .getPublicUrl(fileName)
        
        videoPath = publicData.publicUrl
      }
    }
    
    await supabase.from('lectures').insert([{
      course_id: newLecture.course_id,
      title: newLecture.title,
      description: newLecture.description,
      youtube_url: newLecture.youtube_url || null,
      video_file_path: videoPath,
      order_number: newLecture.order_number
    }])
    
    setNewLecture({ course_id: '', title: '', description: '', youtube_url: '', order_number: 1, video_file: null })
    setUploading(false)
    fetchAll()
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const tabs = userRole === 'super_admin' 
    ? ['programs', 'semesters', 'courses', 'lectures', 'volunteers']
    : ['lectures']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-bold text-indigo-600">ClassReplay Admin</Link>
            <p className="text-xs text-gray-500 mt-1">
              {userRole === 'super_admin' ? 'Super Administrator' : 'Volunteer Contributor'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">View Site</Link>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-indigo-600 text-indigo-600' 
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SUPER ADMIN ONLY - Programs Tab */}
        {activeTab === 'programs' && userRole === 'super_admin' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Add Program</h2>
              <input
                type="text"
                placeholder="Program Name"
                value={newProgram.name}
                onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <textarea
                placeholder="Description"
                value={newProgram.description}
                onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
                rows={3}
              />
              <button onClick={addProgram} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Program
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Existing Programs</h2>
              {programs.map(p => (
                <div key={p.id} className="border-b py-2">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPER ADMIN ONLY - Semesters Tab */}
        {activeTab === 'semesters' && userRole === 'super_admin' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Add Semester</h2>
              <select
                value={newSemester.program_id}
                onChange={(e) => setNewSemester({...newSemester, program_id: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              >
                <option value="">Select Program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Semester Name"
                value={newSemester.name}
                onChange={(e) => setNewSemester({...newSemester, name: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Level"
                value={newSemester.level}
                onChange={(e) => setNewSemester({...newSemester, level: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <button onClick={addSemester} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Semester
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Existing Semesters</h2>
              {semesters.map(s => (
                <div key={s.id} className="border-b py-2">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.level} - {s.programs?.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPER ADMIN ONLY - Courses Tab */}
        {activeTab === 'courses' && userRole === 'super_admin' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Add Course</h2>
              <select
                value={newCourse.semester_id}
                onChange={(e) => setNewCourse({...newCourse, semester_id: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              >
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name} - {s.level}</option>)}
              </select>
              <input
                type="text"
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
                rows={3}
              />
              <button onClick={addCourse} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Course
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Existing Courses</h2>
              {courses.map(c => (
                <div key={c.id} className="border-b py-2">
                  <div className="font-semibold">{c.code} - {c.name}</div>
                  <div className="text-sm text-gray-600">{c.semesters?.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTH - Lectures Tab */}
        {activeTab === 'lectures' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Add Lecture</h2>
              <select
                value={newLecture.course_id}
                onChange={(e) => setNewLecture({...newLecture, course_id: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              >
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Lecture Title"
                value={newLecture.title}
                onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <textarea
                placeholder="Description"
                value={newLecture.description}
                onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
                rows={2}
              />
              <input
                type="text"
                placeholder="YouTube URL (optional)"
                value={newLecture.youtube_url}
                onChange={(e) => setNewLecture({...newLecture, youtube_url: e.target.value})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">OR Upload Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewLecture({...newLecture, video_file: e.target.files?.[0] || null})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <input
                type="number"
                placeholder="Order Number"
                value={newLecture.order_number}
                onChange={(e) => setNewLecture({...newLecture, order_number: parseInt(e.target.value)})}
                className="w-full border rounded px-3 py-2 mb-3"
              />
              <button 
                onClick={addLecture} 
                disabled={uploading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Add Lecture'}
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Existing Lectures</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lectures.map(l => (
                  <div key={l.id} className="border-b pb-2">
                    <div className="font-semibold text-sm">{l.title}</div>
                    <div className="text-xs text-gray-600">{l.courses?.code} - {l.courses?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPER ADMIN ONLY - Volunteers Tab */}
        {activeTab === 'volunteers' && userRole === 'super_admin' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Manage Volunteers</h2>
            <div className="space-y-4">
              {volunteers.map(v => (
                <div key={v.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{v.full_name}</div>
                    <div className="text-sm text-gray-600">{v.email}</div>
                    <div className={`text-xs mt-1 ${
                      v.verification_status === 'approved' ? 'text-green-600' :
                      v.verification_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      Status: {v.verification_status}
                    </div>
                  </div>
                  {v.verification_status === 'pending' && (
                    <div className="space-x-2">
                      <button 
                        onClick={() => updateVolunteerStatus(v.id, 'approved')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateVolunteerStatus(v.id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
