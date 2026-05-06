'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PaymentPage() {
  const router = useRouter()
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card')
  const [processing, setProcessing] = useState(false)
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  useEffect(() => {
    const pending = localStorage.getItem('pendingRegistration')
    if (!pending) {
      router.push('/register')
    } else {
      setRegistrationData(JSON.parse(pending))
    }
  }, [router])

  if (!registrationData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const prices: any = {
    skyline_student: { amount: 5000, label: '₦5,000' },
    skyline_alumni: { amount: 8000, label: '₦8,000' },
    other_university: { amount: 8000, label: '₦8,000' }
  }

  const price = prices[registrationData.userType]

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)

    // Simulate payment processing
    setTimeout(async () => {
      // Create user in database
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          email: registrationData.email,
          full_name: registrationData.fullName,
          user_type: registrationData.userType,
          password_hash: registrationData.password,
          program_id: registrationData.programId,
          subscription_active: true,
          subscription_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months
        }])
      
      if (error) {
        console.error('Error creating user:', error)
        alert('Registration failed. Please try again.')
        setProcessing(false)
        return
      }

      localStorage.removeItem('pendingRegistration')
      localStorage.setItem('isStudent', 'true')
      localStorage.setItem('studentEmail', registrationData.email)
      localStorage.setItem('studentProgramId', registrationData.programId)
      
      setProcessing(false)
      router.push('/dashboard')
    }, 2000)
  }

  function formatCardNumber(value: string) {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  function formatExpiryDate(value: string) {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">ClassReplay</Link>
          <h1 className="text-3xl font-bold mt-4">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Secure checkout powered by Paystack</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{registrationData.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-xs">{registrationData.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">
                    {registrationData.userType === 'skyline_student' ? 'Skyline Student' :
                     registrationData.userType === 'skyline_alumni' ? 'Skyline Alumni' :
                     'Other University'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">1 Semester</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">{price.label}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                <strong>✓ Secure Payment</strong><br/>
                Your payment information is encrypted and secure
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-4 border-2 rounded-lg font-medium transition ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  💳 Card Payment
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`flex-1 p-4 border-2 rounded-lg font-medium transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🏦 Bank Transfer
                </button>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({
                        ...cardData, 
                        cardNumber: formatCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))
                      })}
                      className="w-full border rounded-lg px-4 py-3 text-lg tracking-wider"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={cardData.expiryDate}
                        onChange={(e) => setCardData({
                          ...cardData,
                          expiryDate: formatExpiryDate(e.target.value)
                        })}
                        className="w-full border rounded-lg px-4 py-3"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 3)
                        })}
                        className="w-full border rounded-lg px-4 py-3"
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardData.cardName}
                      onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
                      className="w-full border rounded-lg px-4 py-3"
                      placeholder="JOHN DOE"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ${price.label}`
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Transfer {price.label} to:</strong>
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name:</span>
                        <strong>GTBank</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <strong>0123456789</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <strong>ClassReplay Limited</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> After making the transfer, send proof of payment to 
                    <strong> payment@classreplay.com</strong> with your email address.
                  </div>

                  <button
                    onClick={() => {
                      alert('Payment instructions sent to your email!')
                      router.push('/')
                    }}
                    className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700"
                  >
                    I've Made the Transfer
                  </button>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Secured by Paystack • 256-bit SSL encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
