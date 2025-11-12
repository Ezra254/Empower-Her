import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { 
  XMarkIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { authService, User } from '../utils/auth'

const reportSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)').refine((val) => {
    // Remove all non-digit characters and check length
    const digitsOnly = val.replace(/\D/g, '')
    return digitsOnly.length >= 10
  }, {
    message: 'Please enter a valid phone number (at least 10 digits)'
  }),
  
  // Incident Details
  incidentType: z.string().min(1, 'Please select an incident type'),
  incidentDate: z.string().min(1, 'Please select the incident date'),
  incidentTime: z.string().min(1, 'Please select the incident time'),
  location: z.string().min(5, 'Please provide a detailed location'),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 characters)'),
  
  // Additional Information
  witnesses: z.string().optional(),
  evidence: z.string().optional(),
  urgency: z.string().min(1, 'Please select urgency level'),
  
  // Privacy & Consent - checkboxes return boolean, but we validate they must be true
  consentToContact: z.boolean().refine((val) => val === true, {
    message: 'You must consent to be contacted'
  }),
  consentToShare: z.boolean().refine((val) => val === true, {
    message: 'You must consent to share information with authorities'
  }),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
}

const incidentTypes = [
  'Physical Violence',
  'Sexual Violence',
  'Emotional/Psychological Abuse',
  'Economic Abuse',
  'Digital/Online Harassment',
  'Stalking',
  'Threats/Intimidation',
  'Other'
]

const urgencyLevels = [
  { value: 'low', label: 'Low - No immediate danger' },
  { value: 'medium', label: 'Medium - Some concern' },
  { value: 'high', label: 'High - Immediate attention needed' },
  { value: 'emergency', label: 'Emergency - Call 911 immediately' }
]

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    trigger
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    mode: 'onBlur', // Validate on blur to avoid premature errors
    shouldUnregister: false // Keep form values when navigating between steps
  })

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkAuth = async () => {
        setIsCheckingAuth(true)
        const token = authService.getToken()
        if (token) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setIsCheckingAuth(false)
      }
      checkAuth()
    }
  }, [isOpen])

  // Debug: Log form state when submitting
  const debugFormState = () => {
    const formValues = watch()
    console.log('Current form values:', formValues)
    console.log('Form errors:', errors)
    console.log('Form isSubmitting:', isSubmitting)
  }

  const onSubmit = async (data: ReportFormData) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please login or create an account to submit a report')
      onClose()
      router.push('/login')
      return
    }

    console.log('✅ Form validation passed, onSubmit called with data:', data)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      console.log('Submitting report to:', `${baseUrl}/reports`)
      console.log('Report data:', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        incidentType: data.incidentType,
        incidentDate: data.incidentDate,
        incidentTime: data.incidentTime,
        location: data.location,
        description: data.description.substring(0, 50) + '...',
        urgency: data.urgency,
        consentToContact: data.consentToContact,
        consentToShare: data.consentToShare
      })

      // Include auth token (required)
      const authHeaders = authService.getAuthHeaders()
      if (!authHeaders.Authorization) {
        toast.error('Authentication required. Please login again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          incidentType: data.incidentType,
          incidentDate: data.incidentDate, // ISO8601 (yyyy-mm-dd)
          incidentTime: data.incidentTime, // HH:mm
          location: data.location,
          description: data.description,
          witnesses: data.witnesses || '',
          evidence: data.evidence || '',
          urgency: data.urgency,
          consentToContact: Boolean(data.consentToContact),
          consentToShare: Boolean(data.consentToShare)
        })
      })

      console.log('Request body:', JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        incidentType: data.incidentType,
        incidentDate: data.incidentDate,
        incidentTime: data.incidentTime,
        location: data.location,
        description: data.description.substring(0, 50) + '...',
        urgency: data.urgency,
        consentToContact: Boolean(data.consentToContact),
        consentToShare: Boolean(data.consentToShare)
      }, null, 2))

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      let payload
      try {
        const text = await response.text()
        console.log('Response text:', text)
        payload = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError)
        toast.error(`Server error: ${response.status} ${response.statusText}`)
        return
      }

      if (!response.ok) {
        // Handle subscription limit errors - redirect to subscription page
        if (payload?.requiresUpgrade && payload?.message) {
          toast.error(payload.message, {
            duration: 5000
          })
          onClose()
          setTimeout(() => {
            router.push('/subscription')
          }, 1500)
          return
        }

        // Try to show validation messages if available
        if (payload?.errors?.length) {
          const firstErr = payload.errors[0]
          toast.error(firstErr.msg || 'Validation failed. Please check your inputs.')
          console.error('Validation errors:', payload.errors)
        } else if (payload?.message) {
          toast.error(payload.message)
          console.error('Error message:', payload.message)
        } else {
          toast.error('Failed to submit report. Please try again.')
          console.error('Unknown error:', payload)
        }
        return
      }

      // Expected 201 with obNumber and status
      const obNumber: string | undefined = payload?.obNumber
      const status: string | undefined = payload?.status

      if (obNumber) {
        toast.success(`Report submitted! OB: ${obNumber}${status ? ` • Status: ${status}` : ''}`)
      } else {
        toast.success('Report submitted successfully!')
      }

      reset()
      setCurrentStep(1)
      onClose()
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(`Failed to submit report: ${error instanceof Error ? error.message : 'Network error'}`)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  // Show authentication required message if user is not logged in
  if (isCheckingAuth) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (!user) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <LockClosedIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                You need to create an account or login to submit an incident report. This ensures your reports are securely linked to your account and you can track their status.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose()
                    router.push('/register')
                  }}
                  className="btn-primary"
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    onClose()
                    router.push('/login')
                  }}
                  className="btn-secondary"
                >
                  Login
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Report Incident</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form 
            onSubmit={handleSubmit(
              onSubmit,
              (errors) => {
                console.error('❌ Form validation errors:', errors)
                const errorMessages = Object.values(errors).map((err: any) => err?.message || 'Invalid field')
                if (errorMessages.length > 0) {
                  toast.error(`Validation failed: ${errorMessages[0]}`)
                } else {
                  toast.error('Please fill in all required fields correctly')
                }
                // Scroll to first error
                const firstErrorField = Object.keys(errors)[0]
                if (firstErrorField) {
                  setTimeout(() => {
                    const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
                    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    errorElement?.focus()
                  }, 100)
                }
              }
            )} 
            className="p-6"
            noValidate
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <UserIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-gray-600">Your information is encrypted and secure</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('firstName')}
                      className="input-field"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName')}
                      className="input-field"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <DocumentTextIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Incident Details</h3>
                  <p className="text-gray-600">Provide as much detail as you're comfortable with</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Incident *
                  </label>
                  <select {...register('incidentType')} className="input-field">
                    <option value="">Select incident type</option>
                    {incidentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.incidentType && (
                    <p className="text-red-500 text-sm mt-1">{errors.incidentType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Incident *
                    </label>
                    <input
                      {...register('incidentDate')}
                      type="date"
                      className="input-field"
                    />
                    {errors.incidentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.incidentDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time of Incident *
                    </label>
                    <input
                      {...register('incidentTime')}
                      type="time"
                      className="input-field"
                    />
                    {errors.incidentTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.incidentTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    {...register('location')}
                    className="input-field"
                    placeholder="Enter the location where the incident occurred"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="input-field"
                    placeholder="Describe what happened in detail..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <MapPinIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  <p className="text-gray-600">Any additional details that might help</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Were there any witnesses?
                  </label>
                  <textarea
                    {...register('witnesses')}
                    rows={3}
                    className="input-field"
                    placeholder="Describe any witnesses or people who may have seen what happened"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Do you have any evidence?
                  </label>
                  <textarea
                    {...register('evidence')}
                    rows={3}
                    className="input-field"
                    placeholder="Describe any photos, messages, documents, or other evidence you have"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level *
                  </label>
                  <select {...register('urgency')} className="input-field">
                    <option value="">Select urgency level</option>
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.urgency && (
                    <p className="text-red-500 text-sm mt-1">{errors.urgency.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Consent & Submit */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <ShieldCheckIcon className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Consent & Privacy</h3>
                  <p className="text-gray-600">Review and confirm your consent</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Notice</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Your report will be encrypted and securely stored. We will only share information 
                    with law enforcement and support services with your explicit consent. You can 
                    withdraw your consent at any time.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start">
                    <input
                      {...register('consentToContact', {
                        required: 'You must consent to be contacted'
                      })}
                      defaultChecked={false}
                      type="checkbox"
                      className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to be contacted by EmpowerHer support staff regarding my report *
                    </span>
                  </label>
                  {errors.consentToContact && (
                    <p className="text-red-500 text-sm">{errors.consentToContact.message}</p>
                  )}

                  <label className="flex items-start">
                    <input
                      {...register('consentToShare', {
                        required: 'You must consent to share information with authorities'
                      })}
                      defaultChecked={false}
                      type="checkbox"
                      className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to share my report information with law enforcement authorities *
                    </span>
                  </label>
                  {errors.consentToShare && (
                    <p className="text-red-500 text-sm">{errors.consentToShare.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Emergency:</strong> If you are in immediate danger, please call 911 or your local emergency number right away.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={async () => {
                    // Only validate fields for the current step
                    let fieldsToValidate: (keyof ReportFormData)[] = []
                    
                    if (currentStep === 1) {
                      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone']
                    } else if (currentStep === 2) {
                      fieldsToValidate = ['incidentType', 'incidentDate', 'incidentTime', 'location', 'description']
                    } else if (currentStep === 3) {
                      fieldsToValidate = ['urgency']
                    }
                    
                    console.log('Validating step', currentStep, 'fields:', fieldsToValidate)
                    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true
                    
                    if (isValid) {
                      console.log('✅ Step', currentStep, 'validation passed, moving to next step')
                      nextStep()
                    } else {
                      console.error('❌ Form validation failed for step:', currentStep)
                      const stepErrors = fieldsToValidate.filter(field => errors[field])
                      if (stepErrors.length > 0) {
                        const firstErrorField = stepErrors[0]
                        const firstError = errors[firstErrorField]
                        toast.error(firstError?.message || 'Please fill in all required fields correctly')
                        // Scroll to error
                        setTimeout(() => {
                          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
                          errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          errorElement?.focus()
                        }, 100)
                      } else {
                        toast.error('Please fill in all required fields correctly')
                      }
                    }
                  }}
                  className="btn-primary flex items-center"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    debugFormState()
                  }}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
