import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { authService, User } from '../utils/auth'
import {
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import ReportModal from '../components/ReportModal'

interface Report {
  obNumber: string
  status: string
  urgency: string
  incidentDetails: {
    type: string
    date: string
    location: string
  }
  assignedOfficer?: {
    name?: string
    phone?: string
    email?: string
    department?: string
  }
  handlingParties: Array<{
    name: string
    role: string
    phone?: string
    email?: string
    department?: string
  }>
  statusUpdates: Array<{
    status: string
    message: string
    updatedAt: string
    updatedBy?: {
      firstName: string
      lastName: string
    }
  }>
  submittedAt: string
  lastUpdated: string
  resolvedAt?: string
  caseNotes: Array<{ note: string; addedAt: string }>
  nextSteps: Array<{ step: string; completed: boolean }>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  investigating: { label: 'Investigating', color: 'bg-purple-100 text-purple-800' },
  case_assigned: { label: 'Case Assigned', color: 'bg-indigo-100 text-indigo-800' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  ongoing: { label: 'Ongoing', color: 'bg-orange-100 text-orange-800' },
  summoning: { label: 'Summoning', color: 'bg-pink-100 text-pink-800' },
  invite_to_court: { label: 'Invited to Court', color: 'bg-red-100 text-red-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  referred: { label: 'Referred', color: 'bg-teal-100 text-teal-800' }
}

const encouragementMessages = [
  "You are stronger than you know. Your courage in reporting is the first step toward healing and justice.",
  "You are not alone. There are people who care about you and want to help you through this difficult time.",
  "Your voice matters. By speaking up, you're not only helping yourself but potentially protecting others.",
  "Healing is a journey, not a destination. Take it one day at a time, and be gentle with yourself.",
  "You deserve to be safe, respected, and free from harm. What happened to you was not your fault.",
  "Your strength inspires others. You are a survivor, and that makes you powerful.",
  "It's okay to ask for help. Seeking support is a sign of strength, not weakness.",
  "You have the right to justice. Your case matters, and we're here to support you every step of the way.",
  "Every step forward, no matter how small, is progress. Celebrate your courage.",
  "You are worthy of love, respect, and a life free from violence. Keep moving forward."
]

const helplines = [
  {
    name: "National GBV Helpline",
    phone: "0800-000-999",
    available: "24/7",
    description: "Free, confidential support for gender-based violence"
  },
  {
    name: "Emergency Services",
    phone: "911",
    available: "24/7",
    description: "For immediate danger or emergencies"
  },
  {
    name: "Crisis Counseling",
    phone: "0800-123-456",
    available: "24/7",
    description: "Trauma-informed counseling and support"
  },
  {
    name: "Legal Aid Services",
    phone: "0800-789-012",
    available: "Mon-Fri 8am-5pm",
    description: "Free legal advice and representation"
  },
  {
    name: "Medical Support",
    phone: "0800-345-678",
    available: "24/7",
    description: "Medical care and forensic examination services"
  }
]

interface Subscription {
  plan: string
  status: string
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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReporting, setIsReporting] = useState(false)
  const [showAllReports, setShowAllReports] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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

        // Get user reports
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${API_URL}/reports/user/my-reports`, {
          headers: authService.getAuthHeaders()
        })

        if (response.ok) {
          const data = await response.json()
          setReports(data.reports || [])
        }

        // Get subscription info
        const subResponse = await fetch(`${API_URL}/subscriptions/my-subscription`, {
          headers: authService.getAuthHeaders()
        })

        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData.subscription)
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    authService.logout()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const displayedReports = showAllReports ? reports : reports.slice(0, 3)

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
        <title>Dashboard - EmpowerHer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EmpowerHer</span>
              </div>
              <div className="flex items-center space-x-4">
                {subscription && subscription.plan === 'premium' && (
                  <div className="hidden md:flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Premium
                  </div>
                )}
                <button
                  onClick={() => router.push('/subscription')}
                  className="text-gray-600 hover:text-purple-600 px-4 py-2 flex items-center text-sm"
                >
                  <CreditCardIcon className="h-5 w-5 mr-1" />
                  Subscription
                </button>
                <span className="text-gray-700 hidden md:block">
                  Welcome, {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  You are safe here. Access your reports, get help, and find support.
                </p>
              </div>
            </div>

            {/* Subscription Status Banner */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-4 mb-4 ${
                  subscription.plan === 'premium'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {subscription.plan === 'premium' ? (
                      <StarIcon className="h-6 w-6 mr-3" />
                    ) : (
                      <ShieldCheckIcon className="h-6 w-6 mr-3 text-blue-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {subscription.plan === 'premium' ? 'Premium Plan Active' : 'Free Plan'}
                      </h3>
                      <p className={`text-sm ${subscription.plan === 'premium' ? 'text-white/90' : 'text-gray-600'}`}>
                        {subscription.plan === 'premium' ? (
                          subscription.cancelAtPeriodEnd ? (
                            `Cancelling on ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'end of period'}`
                          ) : (
                            `Renews on ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}`
                          )
                        ) : (
                          `Reports used: ${subscription.usage?.reportsThisMonth || 0} / ${subscription.planDetails?.features?.maxReportsPerMonth || 3} this month`
                        )}
                      </p>
                    </div>
                  </div>
                  {subscription.plan === 'free' && (
                    <button
                      onClick={() => router.push('/subscription')}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
                    >
                      Upgrade to Premium
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Report Incident Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIsReporting(true)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Incident</h3>
              <p className="text-gray-600 text-sm mb-4">Submit a new incident report securely</p>
              <div className="flex items-center text-purple-600 font-medium">
                Start Report <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* My Reports Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setActiveSection(activeSection === 'reports' ? null : 'reports')}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Reports</h3>
              <p className="text-gray-600 text-sm mb-4">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center text-blue-600 font-medium">
                View Reports <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Contact Helpline Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setActiveSection(activeSection === 'helpline' ? null : 'helpline')}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500"
            >
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Helpline</h3>
              <p className="text-gray-600 text-sm mb-4">Get immediate help and support</p>
              <div className="flex items-center text-green-600 font-medium">
                View Contacts <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Words of Encouragement Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setActiveSection(activeSection === 'encouragement' ? null : 'encouragement')}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-500"
            >
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <SparklesIcon className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Encouragement</h3>
              <p className="text-gray-600 text-sm mb-4">Words of strength and hope</p>
              <div className="flex items-center text-pink-600 font-medium">
                Read Messages <ArrowRightIcon className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          </div>

          {/* My Reports Section */}
          {activeSection === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
                </div>
                <button
                  onClick={() => setActiveSection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't submitted any incident reports yet.</p>
                  <button
                    onClick={() => {
                      setActiveSection(null)
                      setIsReporting(true)
                    }}
                    className="btn-primary inline-flex items-center"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Report Your First Incident
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedReports.map((report) => {
                    const statusInfo = getStatusInfo(report.status)
                    return (
                      <div key={report.obNumber} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                          <div>
                            <div className="flex items-center mb-2">
                              <ShieldCheckIcon className="h-5 w-5 text-purple-600 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                OB Number: {report.obNumber}
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                report.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                report.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                report.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1)} Priority
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="text-gray-900 font-medium">{report.incidentDetails.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p className="text-gray-900 font-medium">{formatDate(report.incidentDetails.date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Location:</span>
                              <p className="text-gray-900 font-medium">{report.incidentDetails.location}</p>
                            </div>
                          </div>

                          {report.assignedOfficer && (report.assignedOfficer.name || report.assignedOfficer.phone) && (
                            <div className="mt-3 pt-3 border-t">
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                Assigned Officer
                              </h4>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                {report.assignedOfficer.name && (
                                  <p className="text-gray-900 font-medium">{report.assignedOfficer.name}</p>
                                )}
                                {report.assignedOfficer.phone && (
                                  <p className="text-sm text-gray-600 flex items-center mt-1">
                                    <PhoneIcon className="h-4 w-4 mr-1" />
                                    {report.assignedOfficer.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {report.statusUpdates && report.statusUpdates.length > 0 && (
                            <div className="mt-4 pt-3 border-t">
                              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Status Updates
                              </h4>
                              <div className="space-y-3">
                                {report.statusUpdates.map((update, idx) => {
                                  const updateStatusInfo = getStatusInfo(update.status)
                                  return (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-start justify-between mb-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${updateStatusInfo.color}`}>
                                          {updateStatusInfo.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(update.updatedAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700">{update.message}</p>
                                      {update.updatedBy && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Updated by: {update.updatedBy.firstName} {update.updatedBy.lastName}
                                        </p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-500 mt-3">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Submitted: {formatDate(report.submittedAt)}
                            {report.lastUpdated && report.lastUpdated !== report.submittedAt && (
                              <> • Last updated: {formatDate(report.lastUpdated)}</>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {reports.length > 3 && (
                    <button
                      onClick={() => setShowAllReports(!showAllReports)}
                      className="w-full mt-4 py-3 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      {showAllReports ? 'Show Less' : `View All ${reports.length} Reports`}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Contact Helpline Section */}
          {activeSection === 'helpline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <PhoneIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Contact Helpline</h2>
                </div>
                <button
                  onClick={() => setActiveSection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Emergency?</p>
                    <p className="text-sm text-red-800">
                      If you're in immediate danger, call <strong>911</strong> or your local emergency number right away.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helplines.map((helpline, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{helpline.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{helpline.description}</p>
                      </div>
                      <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a
                        href={`tel:${helpline.phone.replace(/-/g, '')}`}
                        className="flex items-center text-green-600 font-semibold hover:text-green-700"
                      >
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        {helpline.phone}
                      </a>
                      <p className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Available: {helpline.available}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">All calls are confidential</p>
                    <p className="text-sm text-blue-800">
                      All helpline services are free, confidential, and available to support you. You are not alone.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Words of Encouragement Section */}
          {activeSection === 'encouragement' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <SparklesIcon className="h-6 w-6 text-pink-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Words of Encouragement</h2>
                </div>
                <button
                  onClick={() => setActiveSection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encouragementMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <HeartIcon className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0 mt-1" />
                      <p className="text-gray-700 leading-relaxed">{message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-purple-900 font-medium">
                  Remember: You are stronger than you think. Keep going. 💜
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          {reports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                  </div>
                  <DocumentTextIcon className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Active Cases</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reports.filter(r => !['completed', 'closed', 'resolved'].includes(r.status)).length}
                    </p>
                  </div>
                  <ClockIcon className="h-10 w-10 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reports.filter(r => ['completed', 'closed', 'resolved'].includes(r.status)).length}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-10 w-10 text-green-500" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Report Modal */}
        <ReportModal 
          isOpen={isReporting} 
          onClose={() => setIsReporting(false)} 
        />
      </div>
    </>
  )
}
