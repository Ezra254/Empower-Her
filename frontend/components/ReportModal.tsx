import { useState } from 'react'
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const reportSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  
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
  
  // Privacy & Consent
  consentToContact: z.boolean().refine(val => val === true, 'You must consent to be contacted'),
  consentToShare: z.boolean().refine(val => val === true, 'You must consent to share information with authorities'),
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
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  })

  const onSubmit = async (data: ReportFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock OB number
      const obNumber = `OB-${Date.now().toString().slice(-8)}`
      
      toast.success(`Report submitted successfully! Your OB number is: ${obNumber}`)
      reset()
      setCurrentStep(1)
      onClose()
    } catch (error) {
      toast.error('Failed to submit report. Please try again.')
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

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
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
                      {...register('consentToContact')}
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
                      {...register('consentToShare')}
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
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
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
