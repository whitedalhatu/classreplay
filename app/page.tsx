import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">ClassReplay</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Never Miss a Lecture Again
          </h2>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            ClassReplay is Skyline University's premier lecture platform, designed for students who struggle to attend classes, 
            need to review at their own pace, or want to catch up on missed content.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Access high-quality video tutorials created by your own lecturers and top-performing students. 
            Study anytime, anywhere, on any device.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 shadow-lg">
              Start Learning Today
            </Link>
            <Link href="/courses" className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50">
              Preview Available Courses
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold mb-2">Lecturer-Created Content</h3>
              <p className="text-gray-600 text-sm">
                Videos directly from your professors ensure you're learning exactly what will be on the exam
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-lg font-bold mb-2">Learn at Your Pace</h3>
              <p className="text-gray-600 text-sm">
                Pause, rewind, and rewatch as many times as you need. No more rushing to keep up in class
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-lg font-bold mb-2">Multi-Device Access</h3>
              <p className="text-gray-600 text-sm">
                Watch on your phone, laptop, or tablet. Download lectures for offline viewing
              </p>
            </div>
          </div>

          {/* Browse Courses Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Explore Our Course Library</h3>
            <p className="text-gray-600 mb-6">
              Browse all available courses and see what content is waiting for you
            </p>
            <Link 
              href="/courses" 
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700"
            >
              View All Courses →
            </Link>
          </div>

          {/* Pricing */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-8">Affordable Pricing for Every Student</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-2">Skyline Students</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-4">₦5,000<span className="text-sm text-gray-500">/semester</span></p>
                <ul className="text-left text-gray-600 space-y-2 text-sm mb-6">
                  <li>✓ All course access</li>
                  <li>✓ 2 device limit</li>
                  <li>✓ Offline downloads</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/register?type=student" className="block bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Subscribe Now
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-indigo-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                  POPULAR
                </div>
                <h3 className="text-lg font-bold mb-2">Skyline Alumni</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-4">₦8,000<span className="text-sm text-gray-500">/semester</span></p>
                <ul className="text-left text-gray-600 space-y-2 text-sm mb-6">
                  <li>✓ All course access</li>
                  <li>✓ 2 device limit</li>
                  <li>✓ Offline downloads</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/register?type=alumni" className="block bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Subscribe Now
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-2">Other Universities</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-4">₦8,000<span className="text-sm text-gray-500">/semester</span></p>
                <ul className="text-left text-gray-600 space-y-2 text-sm mb-6">
                  <li>✓ All course access</li>
                  <li>✓ 2 device limit</li>
                  <li>✓ Offline downloads</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/register?type=other" className="block bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Subscribe Now
                </Link>
              </div>
            </div>
          </div>

          {/* Volunteer CTA */}
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Are You a Lecturer or Top Student?</h3>
            <p className="text-gray-600 mb-6">
              Help your peers succeed by contributing video tutorials. Earn recognition, certificates, and build your teaching portfolio.
            </p>
            <Link href="/register?type=volunteer" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700">
              Become a Contributor
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 ClassReplay - Skyline University. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">Empowering students to learn at their own pace.</p>
        </div>
      </footer>
    </div>
  )
}
