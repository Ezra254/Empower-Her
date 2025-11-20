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

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free-default',
    name: 'free',
    displayName: 'Free Plan',
    price: 0,
    currency: 'KES',
    interval: 'month',
    description: 'Perfect for getting started with up to 3 reports per month.',
    features: {
      maxReportsPerMonth: 3,
      unlimitedReports: false,
      prioritySupport: false,
      detailedTracking: false,
      downloadReports: false,
      smsNotifications: false,
      emailNotifications: true,
      advancedAnalytics: false,
      caseNotesAccess: true
    }
  },
  {
    id: 'premium-default',
    name: 'premium',
    displayName: 'Premium Plan',
    price: 500,
    currency: 'KES',
    interval: 'month',
    description: 'Unlimited reports, priority support, and advanced tracking tools.',
    features: {
      maxReportsPerMonth: 999,
      unlimitedReports: true,
      prioritySupport: true,
      detailedTracking: true,
      downloadReports: true,
      smsNotifications: true,
      emailNotifications: true,
      advancedAnalytics: true,
      caseNotesAccess: true
    }
  }
]

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
        try {
          const plansRes = await fetch(`${API_URL}/subscriptions/plans`, {
            headers: authService.getAuthHeaders()
          })
          if (plansRes.ok) {
            const plansData = await plansRes.json()
            const loadedPlans = plansData.plans || []
            setPlans(loadedPlans)
            console.log('Plans loaded:', loadedPlans)
            
            if (loadedPlans.length === 0) {
              console.warn('No plans returned from API')
              toast.error('No subscription plans available. Showing defaults.')
              setPlans(DEFAULT_PLANS)
            }
          } else {
            const errorData = await plansRes.json().catch(() => ({}))
            console.error('Failed to load plans:', plansRes.status, plansRes.statusText, errorData)
            toast.error(`Failed to load subscription plans (${plansRes.status}). Please refresh the page.`)
            setPlans(DEFAULT_PLANS)
          }
        } catch (error) {
          console.error('Error fetching plans:', error)
          toast.error('Network error loading plans. Please check your connection.')
          setPlans(DEFAULT_PLANS)
        }

        // Get subscription
        try {
          const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
            headers: authService.getAuthHeaders()
          })
          if (subRes.ok) {
            const subData = await subRes.json()
            setSubscription(subData.subscription || null)
            console.log('Subscription loaded:', subData.subscription)
          } else {
            const errorData = await subRes.json().catch(() => ({}))
            console.error('Failed to load subscription:', subRes.status, subRes.statusText, errorData)
            // Don't show error toast here - subscription might not exist yet for new users
            // Default to free plan if subscription doesn't load
            setSubscription({ 
              plan: 'free', 
              status: 'active', 
              cancelAtPeriodEnd: false,
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: undefined,
              usage: { reportsThisMonth: 0, lastResetDate: new Date().toISOString() },
              planDetails: {
                name: 'free',
                displayName: 'Free Plan',
                price: 0,
                features: { maxReportsPerMonth: 3 }
              }
            })
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
          // Default to free plan on error
          setSubscription({ 
            plan: 'free', 
            status: 'active', 
            cancelAtPeriodEnd: false,
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: undefined,
            usage: { reportsThisMonth: 0, lastResetDate: new Date().toISOString() },
            planDetails: {
              name: 'free',
              displayName: 'Free Plan',
              price: 0,
              features: { maxReportsPerMonth: 3 }
            }
          })
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
    console.log('handleSubscribe called with:', planName, { isSubscribing, currentPlan })
    
    if (isSubscribing) {
      console.log('Already subscribing, ignoring click')
      return
    }

    // Free plan - subscribe directly
    if (planName === 'free') {
      console.log('Subscribing to free plan')
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
      console.log('Opening payment modal for premium plan')
      setSelectedPlan(planName)
    setPaymentMethod('mpesa')
    setPhoneNumber(user?.profile?.phone || '')
      setShowPaymentModal(true)
    }
  }

  const handleInitiatePayment = async () => {
    if (!selectedPlan || isSubscribing) return

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
          paymentMethod,
          phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined
        })
      })

      // Read response text first (can only read once)
      const responseText = await response.text()
      const contentType = response.headers.get('content-type') || ''
      let data
      
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse JSON response:', responseText.substring(0, 500))
          toast.error(`Server returned invalid response. Status: ${response.status}. Please check your backend configuration.`)
          return
        }
      } else {
        // Response is not JSON (likely HTML error page)
        console.error('Backend returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          body: responseText.substring(0, 500)
        })
        toast.error(`Server error: ${response.status} ${response.statusText}. Please check your backend configuration.`)
        return
      }

      if (response.ok) {
        toast.success(data.message || 'Payment initiated successfully!')
        
        if (paymentMethod === 'card' && data.payment?.paymentLink) {
          setPaymentLink(data.payment.paymentLink)
          window.open(data.payment.paymentLink, '_blank')
          toast('Please complete the payment in the new window', { icon: 'ℹ️' })
        }

        if (paymentMethod === 'mpesa') {
          toast.success(data.instructions || 'Please check your phone for the M-Pesa prompt.')
        }

        // Close modal after a short delay
        setTimeout(() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
          setPaymentLink(null)
          setPhoneNumber('')
          setPaymentMethod('mpesa')
        }, 2000)

        if (paymentMethod === 'card') {
          // Poll for subscription update while user completes payment
          const pollSubscription = setInterval(async () => {
            try {
              const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
                headers: authService.getAuthHeaders()
              })
              if (subRes.ok) {
                const subData = await subRes.json()
                if (subData.subscription?.plan === 'premium' && subData.subscription?.status === 'active') {
                  setSubscription(subData.subscription)
                  toast.success('Subscription activated! You now have unlimited reports.')
                  clearInterval(pollSubscription)
                  window.location.reload()
                }
              }
            } catch (error) {
              console.error('Error polling subscription:', error)
            }
          }, 3000)

          // Stop polling after 5 minutes
          setTimeout(() => {
            clearInterval(pollSubscription)
          }, 300000)
        } else {
          setTimeout(async () => {
            try {
              const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
                headers: authService.getAuthHeaders()
              })
              if (subRes.ok) {
                const subData = await subRes.json()
                setSubscription(subData.subscription)
                if (subData.subscription?.plan === 'premium' && subData.subscription?.status === 'active') {
                  toast.success('Subscription activated! You now have unlimited reports.')
                  window.location.reload()
                }
              }
            } catch (error) {
              console.error('Error reloading subscription:', error)
            }
          }, 7000)
        }
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

  const freePlan = plans.find(p => p.name === 'free')
  const premiumPlan = plans.find(p => p.name === 'premium')
  const currentPlan = subscription?.plan || 'free'

  // Debug logging
  useEffect(() => {
    console.log('Subscription Page State:', {
      plans: plans.length,
      freePlan: !!freePlan,
      premiumPlan: !!premiumPlan,
      currentPlan,
      subscription,
      isSubscribing,
      showPaymentModal
    })
  }, [plans, freePlan, premiumPlan, currentPlan, subscription, isSubscribing, showPaymentModal])

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Free Plan */}
            {freePlan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-white rounded-lg shadow-lg p-8 border-2 ${
                  currentPlan === 'free' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                }`}
              >
                {currentPlan === 'free' && (
                  <div className="mb-4 text-center">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{freePlan.displayName}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    KES {freePlan.price}
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Free button clicked', { currentPlan, isSubscribing, freePlan })
                    handleSubscribe('free')
                  }}
                  disabled={currentPlan === 'free' || isSubscribing || !freePlan}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    currentPlan === 'free'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isSubscribing || !freePlan
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95'
                  }`}
                  aria-label={currentPlan === 'free' ? 'Current Free Plan' : 'Select Free Plan'}
                >
                  {currentPlan === 'free' ? '✓ Current Plan' : isSubscribing ? 'Processing...' : !freePlan ? 'Loading...' : 'Select Free Plan'}
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center py-8">
                  <div className="animate-pulse text-gray-400">Loading Free Plan...</div>
                </div>
              </div>
            )}

            {/* Premium Plan */}
            {premiumPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-xl p-8 text-white relative border-2 ${
                  currentPlan === 'premium' ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-transparent'
                }`}
              >
                {currentPlan === 'premium' && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Current Plan
                  </div>
                )}
                {currentPlan !== 'premium' && (
                  <div className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <SparklesIcon className="h-6 w-6 mr-2" />
                    <h3 className="text-2xl font-bold">{premiumPlan.displayName}</h3>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    KES {premiumPlan.price}
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Premium button clicked', { currentPlan, isSubscribing, premiumPlan })
                    handleSubscribe('premium')
                  }}
                  disabled={currentPlan === 'premium' || isSubscribing || !premiumPlan}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    currentPlan === 'premium'
                      ? 'bg-white/20 text-white cursor-not-allowed'
                      : isSubscribing || !premiumPlan
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:bg-purple-50 hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95'
                  }`}
                  aria-label={
                    currentPlan === 'premium'
                      ? 'Current Premium Plan'
                      : `Upgrade to Premium for KES ${premiumPlan?.price}/${premiumPlan?.interval}`
                  }
                >
                  {currentPlan === 'premium' ? (
                    '✓ Current Plan'
                  ) : isSubscribing ? (
                    'Processing...'
                  ) : !premiumPlan ? (
                    'Loading...'
                  ) : (
                    <>
                      Upgrade to Premium - KES {premiumPlan.price}/{premiumPlan.interval}
                      <ArrowRightIcon className="h-5 w-5 inline-block ml-2" />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-xl p-8 text-white">
                <div className="text-center py-8">
                  <div className="animate-pulse text-white/70">Loading Premium Plan...</div>
                </div>
              </div>
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
                  You are subscribing to <strong>Premium Plan</strong> for KES {premiumPlan?.price}/{premiumPlan?.interval}
                </p>

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

                {paymentMethod === 'card' ? (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Payments are processed securely via Paystack. Click "Pay Now" to open the checkout window in a new tab
                      and complete your card payment.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      After clicking "Pay Now", you will receive an M-Pesa prompt on your phone to enter your PIN and
                      complete the payment securely.
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
                  {isSubscribing ? 'Processing...' : `Pay KES ${premiumPlan?.price}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}



