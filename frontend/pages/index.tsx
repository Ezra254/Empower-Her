import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import ReportModal from '../components/ReportModal'
import { authService, User } from '../utils/auth'

const Home: NextPage = () => {
  const router = useRouter()
  const [isReporting, setIsReporting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      if (token) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    }
    checkAuth()
  }, [])

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Secure Reporting',
      description: 'Confidential submission of incident details with end-to-end encryption'
    },
    {
      icon: ClockIcon,
      title: 'Instant OB Numbers',
      description: 'Integration with police databases for immediate case identification'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Real-time Tracking',
      description: 'Live status updates from submission to resolution'
    },
    {
      icon: UserGroupIcon,
      title: 'Support Network',
      description: 'Access to advocates, legal resources, and support services'
    }
  ]

  return (
    <>
      <Head>
        <title>EmpowerHer - Empowering Victims, Accelerating Justice</title>
        <meta name="description" content="A secure platform for reporting gender-based violence and tracking case progress" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EmpowerHer</span>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-purple-600">Features</a>
                <button 
                  onClick={() => setShowAbout(!showAbout)}
                  className="text-gray-600 hover:text-purple-600"
                >
                  About
                </button>
                <button 
                  onClick={() => setShowContact(!showContact)}
                  className="text-gray-600 hover:text-purple-600"
                >
                  Contact
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <a 
                      href="/dashboard"
                      className="text-gray-600 hover:text-purple-600 px-4 py-2"
                    >
                      Dashboard
                    </a>
                    <button 
                      onClick={() => authService.logout()}
                      className="text-gray-600 hover:text-purple-600 px-4 py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a 
                      href="/login"
                      className="text-gray-600 hover:text-purple-600 px-4 py-2"
                    >
                      Login
                    </a>
                    <a 
                      href="/register"
                      className="border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Sign Up
                    </a>
                  </>
                )}
                <button 
                  onClick={() => {
                    if (user) {
                      setIsReporting(true)
                    } else {
                      router.push('/login')
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Report Incident
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Empowering Victims,
                <span className="text-purple-600"> Accelerating Justice</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                A secure, accessible platform for reporting gender-based violence incidents 
                and tracking case progress until justice is served.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    if (user) {
                      setIsReporting(true)
                    } else {
                      router.push('/login')
                    }
                  }}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  Report Incident
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How EmpowerHer Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform simplifies the reporting process while ensuring your safety and privacy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Scale of Gender-Based Violence
              </h2>
              <p className="text-xl opacity-90">
                Together, we can make a difference
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1 in 3</div>
                <div className="text-lg opacity-90">Women globally affected by GBV</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">70%</div>
                <div className="text-lg opacity-90">Of cases go unreported</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-lg opacity-90">Support available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Take Action?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your voice matters. Report incidents safely and track progress transparently.
            </p>
            <button 
              onClick={() => {
                if (user) {
                  setIsReporting(true)
                } else {
                  router.push('/login')
                }
              }}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Start Your Report
            </button>
          </div>
        </section>

        {/* About Section Modal */}
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">About EmpowerHer</h2>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
                    <p className="leading-relaxed">
                      EmpowerHer is a secure, accessible platform dedicated to empowering victims of gender-based violence 
                      by providing a safe channel for reporting incidents and tracking case progress. We believe that every 
                      victim deserves justice, support, and protection.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What We Do</h3>
                    <ul className="list-disc list-inside space-y-2 leading-relaxed">
                      <li>Provide a secure and confidential reporting system for gender-based violence incidents</li>
                      <li>Generate unique OB (Occurrence Book) numbers for each reported case</li>
                      <li>Enable real-time tracking of case status from submission to resolution</li>
                      <li>Connect victims with support services, legal aid, and counseling</li>
                      <li>Facilitate communication between victims and law enforcement</li>
                      <li>Ensure transparency and accountability in case handling</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Confidentiality</h4>
                        <p className="text-sm">Your privacy and security are our top priorities.</p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-pink-900 mb-2">Empowerment</h4>
                        <p className="text-sm">We empower victims to speak up and seek justice.</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Transparency</h4>
                        <p className="text-sm">Clear communication throughout the entire process.</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Support</h4>
                        <p className="text-sm">Comprehensive support services at every step.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Contact Section Modal */}
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
                  <button
                    onClick={() => setShowContact(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <EnvelopeIcon className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:support@empowerher.org" className="text-purple-600 hover:text-purple-700">
                            support@empowerher.org
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <PhoneIcon className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a href="tel:+254719638006" className="text-purple-600 hover:text-purple-700">
                            +254 719 638 006
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <ClockIcon className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Operating Hours</p>
                          <p className="text-gray-600">24/7 Support Available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-red-900 mb-1">Emergency Services</p>
                        <a href="tel:1195" className="text-red-600 font-medium text-lg">1195</a>
                        <p className="text-sm text-red-700 mt-1">Call immediately in case of emergency</p>
                      </div>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="font-semibold text-purple-900 mb-1">GBV Helpline</p>
                        <a href="tel:0800720565" className="text-purple-600 font-medium">0800-720-565</a>
                        <p className="text-sm text-purple-700 mt-1">24/7 confidential support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <HeartIcon className="h-6 w-6 text-purple-400" />
                  <span className="ml-2 text-lg font-bold">EmpowerHer</span>
                </div>
                <p className="text-gray-400">
                  Empowering victims, accelerating justice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Emergency Contacts</a></li>
                  <li><a href="#" className="hover:text-white">Legal Support</a></li>
                  <li><a href="#" className="hover:text-white">Counseling Services</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>support@empowerher.org</li>
                  <li>+1 (555) 123-4567</li>
                  <li>24/7 Emergency: 911</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 EmpowerHer. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Report Modal */}
        <ReportModal 
          isOpen={isReporting} 
          onClose={() => setIsReporting(false)} 
        />
      </main>
    </>
  )
}

export default Home
