import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { authService, User } from '../../utils/auth'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Report {
  _id: string
  obNumber: string
  status: string
  urgency: string
  userId?: {
    firstName: string
    lastName: string
    email: string
  }
  personalInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  incidentDetails: {
    type: string
    date: string
    location: string
    description: string
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

const statusOptions = [
  'submitted',
  'under_review',
  'investigating',
  'case_assigned',
  'in_progress',
  'ongoing',
  'summoning',
  'invite_to_court',
  'resolved',
  'completed',
  'closed',
  'referred'
]

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    urgentReports: 0,
    resolvedReports: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: '',
    message: '',
    assignedOfficer: {
      name: '',
      phone: '',
      email: '',
      department: ''
    },
    handlingParties: [] as Array<{ name: string; role: string; phone?: string; email?: string; department?: string }>
  })

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

        if (currentUser.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setUser(currentUser)

        // Get admin dashboard data
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const [dashboardRes, reportsRes] = await Promise.all([
          fetch(`${API_URL}/admin/dashboard`, {
            headers: authService.getAuthHeaders()
          }),
          fetch(`${API_URL}/admin/reports`, {
            headers: authService.getAuthHeaders()
          })
        ])

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json()
          setStats(dashboardData.stats)
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json()
          setReports(reportsData.reports || [])
        }
      } catch (error) {
        console.error('Error loading admin dashboard:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleStatusUpdate = async () => {
    if (!selectedReport) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/admin/reports/${selectedReport.obNumber}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        },
        body: JSON.stringify({
          status: statusForm.status,
          message: statusForm.message,
          assignedOfficer: statusForm.assignedOfficer.name ? statusForm.assignedOfficer : undefined,
          handlingParties: statusForm.handlingParties.length > 0 ? statusForm.handlingParties : undefined
        })
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        setShowStatusModal(false)
        setSelectedReport(null)
        // Reload reports
        const reportsRes = await fetch(`${API_URL}/admin/reports`, {
          headers: authService.getAuthHeaders()
        })
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json()
          setReports(reportsData.reports || [])
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const openStatusModal = (report: Report) => {
    setSelectedReport(report)
    setStatusForm({
      status: report.status,
      message: '',
      assignedOfficer: report.assignedOfficer ? {
        name: report.assignedOfficer.name ?? '',
        phone: report.assignedOfficer.phone ?? '',
        email: report.assignedOfficer.email ?? '',
        department: report.assignedOfficer.department ?? ''
      } : { name: '', phone: '', email: '', department: '' },
      handlingParties: report.handlingParties ?? []
    })
    setShowStatusModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
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

  return (
    <>
      <Head>
        <title>Admin Dashboard - EmpowerHer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EmpowerHer Admin</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user?.firstName} {user?.lastName} (Admin)
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-purple-600 px-4 py-2"
                >
                  User Dashboard
                </button>
                <button
                  onClick={() => authService.logout()}
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <DocumentTextIcon className="h-10 w-10 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
                <ClockIcon className="h-10 w-10 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Urgent</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.urgentReports}</p>
                </div>
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.resolvedReports}</p>
                </div>
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
              </div>
            </motion.div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Reports</h2>
              <div className="text-sm text-gray-600">
                Total: {reports.length} report{reports.length !== 1 ? 's' : ''}
              </div>
            </div>
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                <p className="text-gray-600">No incident reports have been submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OB Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => {
                      const statusInfo = getStatusInfo(report.status)
                      return (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{report.obNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {report.userId ? `${report.userId.firstName} ${report.userId.lastName}` : report.personalInfo ? `${report.personalInfo.firstName} ${report.personalInfo.lastName}` : 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.userId?.email || report.personalInfo?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.incidentDetails.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                              report.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                              report.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {report.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(report.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openStatusModal(report)}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Update
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Update Report Status</h2>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OB Number
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{selectedReport.obNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      className="input-field"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {statusConfig[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Message *
                    </label>
                    <textarea
                      value={statusForm.message}
                      onChange={(e) => setStatusForm({ ...statusForm, message: e.target.value })}
                      className="input-field"
                      rows={4}
                      placeholder="Enter status update message..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Officer
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={statusForm.assignedOfficer.name}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          assignedOfficer: { ...statusForm.assignedOfficer, name: e.target.value }
                        })}
                        className="input-field"
                        placeholder="Officer Name"
                      />
                      <input
                        type="text"
                        value={statusForm.assignedOfficer.phone}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          assignedOfficer: { ...statusForm.assignedOfficer, phone: e.target.value }
                        })}
                        className="input-field"
                        placeholder="Phone Number"
                      />
                      <input
                        type="email"
                        value={statusForm.assignedOfficer.email}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          assignedOfficer: { ...statusForm.assignedOfficer, email: e.target.value }
                        })}
                        className="input-field"
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        value={statusForm.assignedOfficer.department}
                        onChange={(e) => setStatusForm({
                          ...statusForm,
                          assignedOfficer: { ...statusForm.assignedOfficer, department: e.target.value }
                        })}
                        className="input-field"
                        placeholder="Department"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!statusForm.status || !statusForm.message}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}

