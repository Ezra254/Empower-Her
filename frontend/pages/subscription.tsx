import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { authService, User } from '../utils/auth'
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  currency: string
  interval: string
  features: {
    maxReportsPerMonth: number
    unlimitedReports: boolean
    prioritySupport: boolean
    detailedTracking: boolean
    downloadReports: boolean
    smsNotifications: boolean
    emailNotifications: boolean
    advancedAnalytics: boolean
    caseNotesAccess: boolean
  }
  description: string
}

interface Subscription {
  plan: string
  status: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  usage: {
    reportsThisMonth: number
    lastResetDate: string
  }
  planDetails?: {
    name: string
    displayName: string
    price: number
    features: any
  }
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentLink, setPaymentLink] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const token = authService.getToken()
      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Get current user
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        // Get plans
        const plansRes = await fetch(`${API_URL}/subscriptions/plans`, {
          headers: authService.getAuthHeaders()
        })
        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setPlans(plansData.plans || [])
        }

        // Get subscription
        const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
          headers: authService.getAuthHeaders()
        })
        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscription(subData.subscription)
        }
      } catch (error) {
        console.error('Error loading subscription page:', error)
        toast.error('Failed to load subscription data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSubscribe = async (planName: string) => {
    if (isSubscribing) return

    // Free plan - subscribe directly
    if (planName === 'free') {
      setIsSubscribing(true)
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${API_URL}/subscriptions/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders()
          },
          body: JSON.stringify({ plan: planName })
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(data.message || 'Subscription updated successfully!')
          // Reload subscription data
          const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
            headers: authService.getAuthHeaders()
          })
          if (subRes.ok) {
            const subData = await subRes.json()
            setSubscription(subData.subscription)
          }
          // Update user subscription in local state
          if (user) {
            setUser({
              ...user,
              subscription: {
                plan: planName,
                status: 'active'
              }
            })
          }
        } else {
          toast.error(data.message || 'Failed to subscribe')
        }
      } catch (error) {
        console.error('Subscription error:', error)
        toast.error('Failed to process subscription')
      } finally {
        setIsSubscribing(false)
      }
    } else {
      // Premium plan - show payment modal
      setSelectedPlan(planName)
      setShowPaymentModal(true)
    }
  }

  const handleInitiatePayment = async () => {
    if (!selectedPlan || isSubscribing) return

    // Validate phone number for M-Pesa
    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast.error('Please enter your phone number for M-Pesa payment')
      return
    }

    setIsSubscribing(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/subscriptions/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: paymentMethod,
          phoneNumber: phoneNumber || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Payment initiated successfully!')
        
        if (paymentMethod === 'card' && data.payment?.paymentLink) {
          // For card payments, redirect to payment link
          setPaymentLink(data.payment.paymentLink)
          window.open(data.payment.paymentLink, '_blank')
          toast('Please complete the payment in the new window', { icon: 'ℹ️' })
        } else if (paymentMethod === 'mpesa') {
          // For M-Pesa, show instructions
          toast.success(data.instructions || 'Please check your phone for M-Pesa prompt')
        }

        // Close modal and reload subscription data after a delay
        setTimeout(() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
          setPhoneNumber('')
          setPaymentLink(null)
          
          // Reload subscription data
          const subRes = fetch(`${API_URL}/subscriptions/my-subscription`, {
            headers: authService.getAuthHeaders()
          })
          subRes.then(res => res.json()).then(subData => {
            setSubscription(subData.subscription)
          })
        }, 2000)
      } else {
        toast.error(data.message || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      toast.error('Failed to process payment')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Subscription cancellation scheduled')
        // Reload subscription data
        const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
          headers: authService.getAuthHeaders()
        })
        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscription(subData.subscription)
        }
      } else {
        toast.error(data.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const freePlan = plans.find(p => p.name === 'free')
  const premiumPlan = plans.find(p => p.name === 'premium')
  const currentPlan = subscription?.plan || 'free'

  return (
    <>
      <Head>
        <title>Subscription Plans - EmpowerHer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EmpowerHer</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-purple-600 px-4 py-2 flex items-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the plan that best fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan: {subscription.planDetails?.displayName || subscription.plan}</h3>
                  <p className="text-gray-600">
                    {subscription.plan === 'premium' ? (
                      <>
                        {subscription.cancelAtPeriodEnd ? (
                          <span className="text-orange-600">Cancelling at end of billing period</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                        {subscription.currentPeriodEnd && (
                          <span className="ml-2 text-gray-500">
                            • Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600">
                          Reports used this month: {subscription.usage?.reportsThisMonth || 0} / {freePlan?.features.maxReportsPerMonth || 3}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                {subscription.plan === 'premium' && !subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            {freePlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-white rounded-lg shadow-lg p-8 ${
                  currentPlan === 'free' ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{freePlan.displayName}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${freePlan.price}
                    <span className="text-lg text-gray-600">/{freePlan.interval}</span>
                  </div>
                  <p className="text-gray-600">{freePlan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{freePlan.features.maxReportsPerMonth} reports per month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Basic case tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Email notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Access to helplines</span>
                  </li>
                  <li className="flex items-start">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Download reports</span>
                  </li>
                  <li className="flex items-start">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">SMS notifications</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe('free')}
                  disabled={currentPlan === 'free' || isSubscribing}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    currentPlan === 'free'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {currentPlan === 'free' ? 'Current Plan' : 'Select Free Plan'}
                </button>
              </motion.div>
            )}

            {/* Premium Plan */}
            {premiumPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-xl p-8 text-white relative ${
                  currentPlan === 'premium' ? 'ring-4 ring-purple-300' : ''
                }`}
              >
                {currentPlan === 'premium' && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Current Plan
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <SparklesIcon className="h-6 w-6 mr-2" />
                    <h3 className="text-2xl font-bold">{premiumPlan.displayName}</h3>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    ${premiumPlan.price}
                    <span className="text-lg opacity-90">/{premiumPlan.interval}</span>
                  </div>
                  <p className="opacity-90">{premiumPlan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Unlimited reports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Detailed case tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Download reports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>SMS & Email notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                    <span>Full case notes access</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe('premium')}
                  disabled={currentPlan === 'premium' || isSubscribing}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    currentPlan === 'premium'
                      ? 'bg-white/20 text-white cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {currentPlan === 'premium' ? 'Current Plan' : isSubscribing ? 'Processing...' : `Subscribe for $${premiumPlan?.price}/${premiumPlan?.interval}`}
                </button>
              </motion.div>
            )}
          </div>

          {/* Feature Comparison */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-4 px-4 font-semibold text-purple-600">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4 text-gray-700">Reports per month</td>
                    <td className="py-4 px-4 text-center">{freePlan?.features.maxReportsPerMonth || 3}</td>
                    <td className="py-4 px-4 text-center text-purple-600 font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4 text-gray-700">Priority support</td>
                    <td className="py-4 px-4 text-center">
                      <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4 text-gray-700">Download reports</td>
                    <td className="py-4 px-4 text-center">
                      <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4 text-gray-700">SMS notifications</td>
                    <td className="py-4 px-4 text-center">
                      <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Advanced analytics</td>
                    <td className="py-4 px-4 text-center">
                      <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPlan(null)
                    setPhoneNumber('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  You are subscribing to <strong>Premium Plan</strong> for ${premiumPlan?.price}/{premiumPlan?.interval}
                </p>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'mpesa'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">M-Pesa</div>
                      <div className="text-xs text-gray-500">Mobile Money</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">Card</div>
                      <div className="text-xs text-gray-500">Credit/Debit</div>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input for M-Pesa */}
                {paymentMethod === 'mpesa' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (M-Pesa)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your M-Pesa registered phone number (with country code)
                    </p>
                  </div>
                )}

                {/* Payment Instructions */}
                {paymentMethod === 'card' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      You will be redirected to a secure payment page to complete your card payment.
                    </p>
                  </div>
                )}

                {paymentMethod === 'mpesa' && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      After clicking "Pay Now", you will receive an M-Pesa prompt on your phone to complete the payment.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPlan(null)
                    setPhoneNumber('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubscribing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiatePayment}
                  disabled={isSubscribing || (paymentMethod === 'mpesa' && !phoneNumber)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Processing...' : `Pay $${premiumPlan?.price}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}



