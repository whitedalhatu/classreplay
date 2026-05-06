'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PaymentPage() {
  const router = useRouter()
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  useEffect(() => {
    const data = localStorage.getItem('pendingRegistration')
    if (!data) {
      router.push('/register')
    } else {
      setRegistrationData(JSON.parse(data))
    }
  }, [router])

  const prices: any = {
    skyline_student: 5000,
    skyline_alumni: 8000,
    other_university: 8000
  }

  async function handlePayment() {
    if (!registrationData) return
    
    setLoading(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create user account in database
    if (!supabase) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        email: registrationData.email,
        full_name: registrationData.fullName,
        user_type: registrationData.userType,
        password_hash: registrationData.password,
        program_id: registrationData.programId,
        subscription_active: true,
        subscription_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
        device_count: 0
      }])
      .select()
    
    if (error) {
      alert('Registration failed. Please try again.')
      setLoading(false)
      return
    }
    
    // Store login session
    localStorage.setItem('isStudent', 'true')
    localStorage.setItem('studentEmail', registrationData.email)
    localStorage.setItem('studentProgramId', registrationData.programId)
    localStorage.removeItem('pendingRegistration')
    
    setSuccess(true)
    setLoading(false)
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (!registrationData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created. Redirecting to your dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  const amount = prices[registrationData.userType]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Subscription Fee</span>
            <span className="text-2xl font-bold text-indigo-600">₦{amount.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            {registrationData.userType === 'skyline_student' ? 'Skyline Student' : 
             registrationData.userType === 'skyline_alumni' ? 'Skyline Alumni' : 
             'Other University'} - Valid for 6 months
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              paymentMethod === 'card'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-600'
            }`}
          >
            💳 Card Payment
          </button>
          <button
            onClick={() => setPaymentMethod('transfer')}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              paymentMethod === 'transfer'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-600'
            }`}
          >
            🏦 Bank Transfer
          </button>
        </div>

        {paymentMethod === 'card' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <input
                type="text"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="text"
                  value={cardData.expiryDate}
                  onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="123"
                  maxLength={3}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <input
                type="text"
                value={cardData.cardName}
                onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="John Doe"
              />
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()}`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-bold mb-3">Transfer to:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-semibold">Access Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-semibold">0123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-semibold">ClassReplay Limited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-indigo-600">₦{amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">⚠️ Important:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Use your email ({registrationData.email}) as payment reference</li>
                <li>Your account will be activated within 24 hours of payment confirmation</li>
                <li>Keep your payment receipt for verification</li>
              </ul>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'I have completed the transfer'}
            </button>
          </div>
        )}
        
        <p className="text-center mt-6 text-sm text-gray-600">
          <Link href="/register" className="text-indigo-600 hover:underline">
            ← Back to registration
          </Link>
        </p>
      </div>
    </div>
  )
}
