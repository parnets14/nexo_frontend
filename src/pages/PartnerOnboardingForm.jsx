import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCheckCircle,
  FaUpload,
  FaWhatsapp,
  FaArrowRight,
  FaArrowLeft,
  FaIdCard,
  FaCreditCard,
  FaToolbox,
  FaUserCheck,
  FaSpinner,
  FaPhone,
  FaLock,
  FaMapMarkerAlt,
  FaCamera,
  FaUser,
  FaClock,
  FaShieldAlt,
  FaCheck,
  FaHourglassHalf,
  FaSyncAlt,
  FaBullseye
} from 'react-icons/fa'
import SEO from '../components/SEO'
import { partnerApi } from '../services/partnerApi'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'
import PayUPayment from '../components/PayUPayment'

const trades = [
  { id: 'ac-service', name: 'AC Service', icon: '❄️' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' }
]

const defaultMGPlans = [
  { name: 'Silver', price: 1000, leads: 20, commission: 5, leadFee: 50, minWalletBalance: 20, icon: '🥈', color: 'bg-gray-100', borderColor: 'border-gray-300', features: ['Priority support', 'Weekly performance insights'] },
  { name: 'Gold', price: 2000, leads: 50, commission: 4, leadFee: 40, minWalletBalance: 50, icon: '🥇', color: 'bg-yellow-50', borderColor: 'border-yellow-300', features: ['Dedicated success manager', 'Higher lead priority'] },
  { name: 'Platinum', price: 5000, leads: 150, commission: 3, leadFee: 30, minWalletBalance: 100, icon: '💎', color: 'bg-purple-50', borderColor: 'border-purple-300', features: ['Featured listing', 'Daily performance insights', 'Fast-track payouts'] }
]

// Profile Review Step Component with Enhanced UI and Auto-checking
const ProfileReviewStep = ({ currentStep, setCurrentStep, formData, token }) => {
  const [isApproved, setIsApproved] = useState(false)
  const [isPaymentVerified, setIsPaymentVerified] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [lastChecked, setLastChecked] = useState(new Date())
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Auto-check approval status every 1 minute
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!token) return

      setCheckingStatus(true)
      try {
        // Check partner profile status
        const response = await partnerApi.getProfile(token)
        if (response.success && response.profile) {
          const profile = response.profile
          console.log('Profile status check:', profile)

          // Check payment verification - check both root level and profile object
          const paymentVerified = 
            profile.paymentApproved === true || 
            profile.registerdFee === true ||
            profile.profile?.paymentApproved === true ||
            profile.profile?.registerdFee === true

          // Check profile approval (partner-level status)
          const profileApproved = profile.status === 'approved' || profile.isApproved === true || profile.approvedAt

          const approved = profileApproved && paymentVerified

          console.log('Payment verified:', paymentVerified, 'Profile approved:', profileApproved, 'Overall approved:', approved)

          setIsApproved(approved)
          setIsPaymentVerified(paymentVerified)
          setLastChecked(new Date())

          // If approved, store this step completion in server
          if (approved) {
            try {
              await partnerApi.updateOnboardingStep(token, {
                step: 9,
                completed: true,
                approved: true,
                approvedAt: new Date().toISOString()
              })
            } catch (updateError) {
              console.error('Error updating step completion:', updateError)
            }
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    // Initial check
    checkApprovalStatus()

    // Set up interval to check every 1 minute
    const interval = setInterval(checkApprovalStatus, 60000)

    return () => clearInterval(interval)
  }, [token])

  // Update time elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
          className="w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <motion.div
            animate={{
              rotate: checkingStatus ? 360 : 0,
              scale: checkingStatus ? [1, 1.2, 1] : [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: checkingStatus ? 1 : 3, repeat: checkingStatus ? Infinity : Infinity, ease: "linear" },
              scale: { duration: checkingStatus ? 0.5 : 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            {isApproved ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <FaCheck className="w-10 h-10 text-green-600" />
              </motion.div>
            ) : (
              <FaHourglassHalf className="w-10 h-10 text-blue-600" />
            )}
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-primary mb-2"
        >
          {isApproved ? 'Profile Approved!' : isPaymentVerified ? 'Your Account Under Review' : 'Waiting for Payment Verification'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-4"
        >
          {isApproved
            ? 'Congratulations! Your profile has been approved and payment verified. You can now proceed to select your MG plan.'
            : isPaymentVerified
              ? 'Your payment has been successfully verified! Your partner account is now under review by our admin team. We will notify you once approved.'
              : 'Your payment is being verified by our admin team. Once approved, your profile will be reviewed.'
          }
        </motion.p>

        {/* Status and Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${
            isApproved
              ? 'bg-green-100 text-green-800 border border-green-200'
              : isPaymentVerified
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {checkingStatus ? (
            <FaSyncAlt className="animate-spin" />
          ) : isApproved ? (
            <FaCheckCircle className="text-green-600" />
          ) : isPaymentVerified ? (
            <FaCheckCircle className="text-yellow-600" />
          ) : (
            <FaClock className="text-blue-600" />
          )}
          <span>
            {checkingStatus
              ? 'Checking status...'
              : isApproved
                ? 'Profile & Payment Approved'
                : isPaymentVerified
                  ? 'Payment Verified - Profile Review Pending'
                  : `Payment Verification Pending • Last checked: ${lastChecked.toLocaleTimeString()}`
            }
          </span>
        </motion.div>
      </div>

      {/* Payment Details Section - Show if payment verified */}
      {isPaymentVerified && formData.payment.payId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaCheckCircle className="text-green-600 text-2xl" />
            <h3 className="text-lg font-bold text-green-800">Payment Details</h3>
          </div>
          
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transaction ID:</span>
              <span className="font-mono font-semibold text-gray-800">{formData.payment.payId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Registration Fee:</span>
              <span className="font-semibold text-gray-800">₹{formData.payment.registrationFee?.toLocaleString()}</span>
            </div>
            {formData.payment.securityDepositSelected && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Security Deposit:</span>
                <span className="font-semibold text-gray-800">₹{formData.payment.securityDeposit?.toLocaleString()}</span>
              </div>
            )}
            {formData.toolkit.selected && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toolkit:</span>
                <span className="font-semibold text-gray-800">₹{formData.toolkit.price?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total Paid:</span>
                <span className="font-bold text-lg text-green-600">
                  ₹{((formData.payment.registrationFee || 0) + 
                     (formData.payment.securityDepositSelected ? (formData.payment.securityDeposit || 0) : 0) + 
                     (formData.toolkit.selected ? (formData.toolkit.price || 0) : 0)).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Status:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                <FaCheckCircle />
                Verified
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Review Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${
          isApproved
            ? 'from-green-50 to-emerald-100 border-green-200'
            : isPaymentVerified
              ? 'from-yellow-50 to-amber-100 border-yellow-200'
              : 'from-blue-50 to-indigo-100 border-blue-200'
        }`}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            {isApproved ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 bg-green-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="w-4 h-4 bg-green-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="w-4 h-4 bg-green-500 rounded-full"
                ></motion.div>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-4 bg-blue-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-4 h-4 bg-blue-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-4 h-4 bg-blue-500 rounded-full"
                ></motion.div>
              </>
            )}
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isApproved ? 'text-green-800' : isPaymentVerified ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {isApproved ? 'Review Completed Successfully' : isPaymentVerified ? 'Profile Review in Progress' : 'Payment Verification Pending'}
          </h3>
          <p className={`text-sm ${
            isApproved ? 'text-green-600' : isPaymentVerified ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {isApproved
              ? 'All verification checks have been completed successfully'
              : isPaymentVerified
                ? 'Your payment has been verified. Our team is now reviewing your profile information.'
                : 'Your payment is being verified by our admin team before profile review begins.'
            }
          </p>
        </div>

        {/* Review Steps */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-start gap-3"
          >
            <motion.div
              animate={isPaymentVerified ? { scale: [1, 1.2, 1] } : {}}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isPaymentVerified ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
            >
              <FaCreditCard className={`w-4 h-4 ${isPaymentVerified ? 'text-yellow-600' : 'text-gray-400'}`} />
            </motion.div>
            <div>
              <div className="font-medium text-gray-800">Payment Verification</div>
              <div className="text-sm text-gray-600">Registration fee and payment details verification</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-start gap-3"
          >
            <motion.div
              animate={isApproved ? { scale: [1, 1.2, 1] } : {}}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isApproved ? 'bg-green-100' : isPaymentVerified ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <FaCheckCircle className={`w-4 h-4 ${isApproved ? 'text-green-600' : isPaymentVerified ? 'text-green-500' : 'text-gray-400'}`} />
            </motion.div>
            <div>
              <div className="font-medium text-gray-800">Documents Verified</div>
              <div className="text-sm text-gray-600">KYC documents, address proof, and business details checked</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 }}
            className="flex items-start gap-3"
          >
            <motion.div
              animate={isApproved ? { scale: [1, 1.2, 1] } : {}}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isApproved ? 'bg-blue-100' : isPaymentVerified ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <FaShieldAlt className={`w-4 h-4 ${isApproved ? 'text-blue-600' : isPaymentVerified ? 'text-blue-500' : 'text-gray-400'}`} />
            </motion.div>
            <div>
              <div className="font-medium text-gray-800">Background Check</div>
              <div className="text-sm text-gray-600">Business legitimacy and service category verification</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
            className="flex items-start gap-3"
          >
            <motion.div
              animate={isApproved ? { scale: [1, 1.2, 1] } : {}}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isApproved ? 'bg-purple-100' : isPaymentVerified ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            >
              <FaUserCheck className={`w-4 h-4 ${isApproved ? 'text-purple-600' : isPaymentVerified ? 'text-purple-500' : 'text-gray-400'}`} />
            </motion.div>
            <div>
              <div className="font-medium text-gray-800">Final Approval</div>
              <div className="text-sm text-gray-600">Account activation and partner onboarding completion</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="text-center"
      >
        {isApproved ? (
          <motion.button
            onClick={() => setCurrentStep(11)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2 mx-auto"
          >
            Proceed to MG Plan Selection
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
          </motion.button>
        ) : (
          <div className={`border-2 rounded-xl p-4 max-w-md mx-auto ${
            isPaymentVerified
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaClock className={`${
                isPaymentVerified ? 'text-yellow-500' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                isPaymentVerified ? 'text-yellow-700' : 'text-gray-700'
              }`}>
                {isPaymentVerified ? 'Waiting for Profile Approval' : 'Waiting for Payment Verification'}
              </span>
            </div>
            <p className="text-xs text-gray-600 text-center">
              {isPaymentVerified
                ? 'Your payment has been verified! Your profile is now under review by our team.'
                : 'Your payment is being verified by our admin team. You will be notified once approved.'
              }
            </p>
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500">Time elapsed: {formatTime(timeElapsed)}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="bg-gray-50 rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <div className="font-medium text-gray-800">Need Help?</div>
            <div className="text-gray-600">Contact our support team if you have any questions about your application status.</div>
          </div>
        </div>
      </motion.div>

      {/* New Partner Registration Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="border-t border-gray-200 pt-6"
      >
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-gray-800 mb-1">Want to register a new partner?</h4>
            <p className="text-sm text-gray-600">Clear all saved data and start fresh registration</p>
          </div>
          <motion.button
            onClick={() => {
              if (window.confirm('Are you sure you want to start a new registration? This will clear all saved data from this device.')) {
                // Clear all localStorage data
                localStorage.removeItem('partnerOnboardingStep')
                localStorage.removeItem('partnerOnboardingFormData')
                localStorage.removeItem('partnerOnboardingToken')
                localStorage.removeItem('partnerOnboardingPartnerData')
                
                // Reload the page to start fresh
                window.location.href = '/partner/onboard'
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register New Partner
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

const PartnerOnboardingForm = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const fromLeads = searchParams.get('from') === 'leads' || location.state?.fromLeads
  const fromLeadsneed = searchParams.get('from') === 'leadsneed' || location.state?.fromLeadsneed
  
  // Load saved data from localStorage on mount
  const loadSavedData = () => {
    try {
      const savedStep = localStorage.getItem('partnerOnboardingStep')
      const savedToken = localStorage.getItem('partnerOnboardingToken')
      const savedFormData = localStorage.getItem('partnerOnboardingFormData')
      const savedPartnerData = localStorage.getItem('partnerOnboardingPartnerData')
      
      return {
        step: savedStep ? parseInt(savedStep) : 1,
        token: savedToken || null,
        formData: savedFormData ? JSON.parse(savedFormData) : null,
        partnerData: savedPartnerData ? JSON.parse(savedPartnerData) : null
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
      return { step: 1, token: null, formData: null, partnerData: null }
    }
  }
  
  const savedData = loadSavedData()
  
  const [currentStep, setCurrentStep] = useState(savedData.step)
  const [token, setToken] = useState(savedData.token)
  const [partnerData, setPartnerData] = useState(savedData.partnerData)
  const [mgPlanSkipped, setMgPlanSkipped] = useState(false)
  const [formData, setFormData] = useState(savedData.formData || {
    phone: '',
    otp: '',
    name: '',
    email: '',
    whatsappNumber: '',
    qualification: '',
    experience: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    referralCode: '',
    gstNumber: '',
    partnerType: 'individual', // Default to individual
    trade: '',
    categories: [], // Array for multiple category selection
    categoryNames: [], // Store category names
    subcategory: '',
    service: '',
    modeOfService: 'offline',
    profilePicture: null, // Profile picture file or base64
    selectedHubs: [], // Array of selected hub objects with name and pinCodes
    selectedPlan: null,
    selectedPlanId: null,
    selectedLeadPlan: null,
    selectedLeadPlanId: null,
    kyc: {
      panCard: null,
      aadhaar: null,
      aadhaarback: null,
      chequeImage: null,
      drivingLicence: null,
      bill: null,
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
      }
    },
    toolkit: {
      selected: false,
      type: 'ac-toolkit',
      price: 2499
    },
    payment: {
      registrationFee: 0, // Will be updated from backend
      securityDeposit: 0, // Will be updated from backend
      securityDepositSelected: true, // Default to selected
      total: 0, // Will be calculated
      payId: '',
      paidBy: 'Self'
    },
    terms: {
      accepted: false,
      signature: null // base64 image data
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [partnerId, setPartnerId] = useState(null)
  const [mgPlans, setMgPlans] = useState([]) // Start empty, will be loaded dynamically
  const [loadingMGPlans, setLoadingMGPlans] = useState(false) // Loading state for MG plans
  const [leadPlans, setLeadPlans] = useState([]) // Lead plans for leadsneed flow
  const [loadingLeadPlans, setLoadingLeadPlans] = useState(false) // Loading state for Lead plans
  const [existingLeadPlan, setExistingLeadPlan] = useState(null) // Existing lead plan subscription
  const [categories, setCategories] = useState([]) // Dynamic categories from API
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [pricingSettings, setPricingSettings] = useState(null) // Pricing settings including refundable status
  const [availableHubs, setAvailableHubs] = useState([]) // Available hubs from admin
  const [loadingHubs, setLoadingHubs] = useState(false) // Loading state for hubs
  const signatureCanvasRef = useRef(null) // Ref for signature canvas
  const videoRef = useRef(null) // Ref for camera video stream
  const [showCamera, setShowCamera] = useState(false) // Show/hide camera
  const [stream, setStream] = useState(null) // Camera stream
  const [videoReady, setVideoReady] = useState(false) // Track if video is ready
  const whatsappNumber = '+15558136145'
  const handleWhatsAppClick = useWhatsAppClick()
  const [payuPaymentData, setPayuPaymentData] = useState(null) // PayU payment data
  const [processingPayment, setProcessingPayment] = useState(false) // Payment processing state

  const totalSteps = 12
  const selectedPlanMeta = mgPlans.find((plan) => plan.name === formData.selectedPlan)

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      // Don't save if no meaningful data yet
      if (formData.phone || formData.name || formData.email) {
        localStorage.setItem('partnerOnboardingFormData', JSON.stringify(formData))
      }
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [formData])

  // Save current step to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('partnerOnboardingStep', currentStep.toString())
    } catch (error) {
      console.error('Error saving step:', error)
    }
  }, [currentStep])

  // Save token to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('partnerOnboardingToken', token)
      }
    } catch (error) {
      console.error('Error saving token:', error)
    }
  }, [token])

  // Save partner data to localStorage
  useEffect(() => {
    try {
      if (partnerData) {
        localStorage.setItem('partnerOnboardingPartnerData', JSON.stringify(partnerData))
      }
    } catch (error) {
      console.error('Error saving partner data:', error)
    }
  }, [partnerData])

  // Clear localStorage when onboarding is complete (step 11)
  useEffect(() => {
    if (currentStep === 11 && (formData.selectedPlan || mgPlanSkipped)) {
      try {
        localStorage.removeItem('partnerOnboardingStep')
        localStorage.removeItem('partnerOnboardingFormData')
        localStorage.removeItem('partnerOnboardingToken')
        localStorage.removeItem('partnerOnboardingPartnerData')
        console.log('✅ Onboarding complete - localStorage cleared')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
  }, [currentStep, formData.selectedPlan, mgPlanSkipped])

  // Handle Payment Callback (Success/Failure)
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const txnid = searchParams.get('txnid')
    const payid = searchParams.get('payid')
    const reason = searchParams.get('reason')
    const paymentType = searchParams.get('type') // 'leadplan' for lead plan payments
    const planName = searchParams.get('plan') // Lead plan name

    if (paymentStatus === 'success' && paymentType === 'leadplan' && planName) {
      // Lead plan payment success
      console.log('💳 Lead plan payment success:', { planName })
      
      // Decode the plan name in case it was URL encoded
      const decodedPlanName = decodeURIComponent(planName)
      
      setFormData(prev => ({
        ...prev,
        selectedLeadPlan: decodedPlanName,
        leadPlanPaymentStatus: 'success'
      }))
      
      // Move to success step (case 11 for lead plan success)
      setTimeout(() => {
        setCurrentStep(11)
        // Clear URL parameters but preserve the 'from' parameter
        const currentUrl = new URL(window.location)
        const fromParam = currentUrl.searchParams.get('from')
        const newUrl = window.location.pathname + (fromParam ? `?from=${fromParam}` : '')
        window.history.replaceState({}, '', newUrl)
      }, 100)
      
      return
    }

    if (paymentStatus === 'failed' && paymentType === 'leadplan') {
      // Lead plan payment failed
      console.log('❌ Lead plan payment failed:', { reason })
      setError(`Lead plan payment failed: ${reason || 'Unknown error'}`)
      return
    }

    if (paymentStatus === 'success' && txnid && payid) {
      // Regular registration payment callback received - verify with backend before showing success
      console.log('💳 Payment callback received:', { txnid, payid })
      
      const verifyPayment = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Verify payment status with backend
          const apiUrl = import.meta.env.VITE_API_URL || 'https://nexo.works'
          console.log('🔍 Verifying payment with:', `${apiUrl}/api/payu/payment-status/${txnid}`)
          
          const response = await fetch(`${apiUrl}/api/payu/payment-status/${txnid}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          // Check if response is JSON
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ API returned non-JSON response:', contentType)
            throw new Error('Invalid API response format. Please check backend configuration.')
          }
          
          const data = await response.json()
          console.log('📦 Payment verification response:', data)
          
          if (data.success && data.data.status === 'completed' && data.data.approved) {
            // Payment verified by backend
            console.log('✅ Payment verified by backend:', data.data)
            
            setFormData(prev => ({
              ...prev,
              payment: {
                ...prev.payment,
                payId: payid,
                status: 'completed'
              }
            }))
            
            // Move to step 8 (payment confirmation) to show payment details
            setTimeout(() => {
              setCurrentStep(8)
              // Clear URL parameters
              window.history.replaceState({}, '', window.location.pathname)
            }, 100)
          } else if (data.success && (data.data.status === 'pending' || data.data.status === 'initiated')) {
            // Payment initiated or received but not yet approved by admin
            console.log('⏳ Payment status:', data.data.status, '- Waiting for PayU callback or admin approval')
            
            setFormData(prev => ({
              ...prev,
              payment: {
                ...prev.payment,
                payId: payid,
                status: data.data.status === 'initiated' ? 'pending' : 'pending'
              }
            }))
            
            // If payment is just initiated, wait a bit and retry
            if (data.data.status === 'initiated') {
              setError('Payment is being processed by PayU. Please wait...')
              
              // Retry after 3 seconds
              setTimeout(() => {
                console.log('🔄 Retrying payment verification...')
                window.location.reload()
              }, 3000)
            } else {
              // Payment completed, move to step 8
              setTimeout(() => {
                setCurrentStep(8)
                // Clear URL parameters
                window.history.replaceState({}, '', window.location.pathname)
              }, 100)
            }
          } else {
            // Payment not found or other error
            console.log('❌ Payment verification failed:', data)
            setError(data.message || 'Payment verification failed. Please contact support.')
            
            // Move to step 8 with failed status
            setFormData(prev => ({
              ...prev,
              payment: {
                ...prev.payment,
                payId: txnid,
                status: 'failed'
              }
            }))
            
            setTimeout(() => {
              setCurrentStep(8)
              window.history.replaceState({}, '', window.location.pathname)
            }, 100)
          }
        } catch (err) {
          console.error('Payment verification error:', err)
          setError(`Failed to verify payment: ${err.message}. Please contact support with transaction ID: ${txnid}`)
          
          // Move to step 8 with failed status
          setFormData(prev => ({
            ...prev,
            payment: {
              ...prev.payment,
              payId: txnid,
              status: 'failed'
            }
          }))
          
          setTimeout(() => {
            setCurrentStep(8)
            window.history.replaceState({}, '', window.location.pathname)
          }, 100)
        } finally {
          setLoading(false)
        }
      }
      
      verifyPayment()
      
    } else if (paymentStatus === 'failed') {
      // Payment failed
      console.log('❌ Payment failed:', { reason, txnid })
      
      // Map PayU error codes to user-friendly messages
      const errorMessages = {
        'E4179': 'Payment was cancelled. Please try again.',
        'E000': 'Payment failed. Please check your payment details and try again.',
        'E001': 'Unauthorized payment key. Please contact support.',
        'E002': 'Invalid transaction. Please try again.',
        'E003': 'Payment declined by bank. Please try a different payment method.',
        'E004': 'Insufficient funds. Please check your account balance.',
        'E005': 'Transaction timeout. Please try again.',
        'payment_failed': 'Payment could not be processed. Please try again.',
        'invalid_hash': 'Security verification failed. Please contact support.',
        'server_error': 'Server error occurred. Please try again later.'
      }
      
      const errorMessage = errorMessages[reason] || `Payment failed: ${reason || 'Unknown error'}. Please try again.`
      setError(errorMessage)
      
      // Set payment status to failed and move to step 8 to show failure
      setFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          payId: txnid || '',
          status: 'failed'
        }
      }))
      
      // Move to step 8 to show payment failure
      setTimeout(() => {
        setCurrentStep(8)
        // Clear URL parameters
        window.history.replaceState({}, '', window.location.pathname)
      }, 100)
    }
  }, [searchParams, token])

  // Fetch Categories when on step 4 (token optional)
  useEffect(() => {
    const fetchCategories = async () => {
      if (currentStep === 4) {
        setLoadingCategories(true)
        try {
          // Try with token if available, otherwise without
          const response = await partnerApi.getCategories(token || '')
          if (response.success && response.categories) {
            setCategories(response.categories)
          } else if (response.categories && Array.isArray(response.categories)) {
            setCategories(response.categories)
          }
        } catch (err) {
          console.error('Failed to fetch Categories:', err)
          // Fallback to default trades if API fails
          setCategories(trades)
        } finally {
          setLoadingCategories(false)
        }
      }
    }
    fetchCategories()
  }, [currentStep, token])

  // Fetch Pricing Settings when on payment step or when partner type changes
  useEffect(() => {
    const fetchPricingSettings = async () => {
        try {
          const response = await partnerApi.getPricingSettings()
          if (response.success && response.data) {
            // Get partner type specific fees
            const partnerType = formData.partnerType || 'individual'
            const partnerTypeFees = response.data[partnerType] || response.data
            
            // Store all pricing data including partner type specific fees
            const pricingData = {
              ...response.data,
              // Store current partner type fees at root level for easy access
              registrationFee: partnerTypeFees.registrationFee,
              securityDeposit: partnerTypeFees.securityDeposit,
              toolkitPrice: partnerTypeFees.toolkitPrice,
              registrationFeeRefundable: partnerTypeFees.registrationFeeRefundable !== undefined ? Boolean(partnerTypeFees.registrationFeeRefundable) : false,
              securityDepositRefundable: partnerTypeFees.securityDepositRefundable !== undefined ? Boolean(partnerTypeFees.securityDepositRefundable) : false,
              toolkitPriceRefundable: partnerTypeFees.toolkitPriceRefundable !== undefined ? Boolean(partnerTypeFees.toolkitPriceRefundable) : false
            }
            setPricingSettings(pricingData)

            // Update form data with fetched fees based on partner type
            setFormData(prev => {
              const registrationFee = partnerTypeFees.registrationFee || 500
              const baseSecurityDeposit = partnerTypeFees.securityDeposit || 1000
              const securityDeposit = prev.payment.securityDepositSelected ? baseSecurityDeposit : 0
              const toolkitPrice = partnerTypeFees.toolkitPrice || 2499
              const toolkitSelected = prev.toolkit.selected
              
              console.log('Updating fees for partner type:', formData.partnerType, {
                registrationFee,
                baseSecurityDeposit,
                securityDeposit,
                toolkitPrice,
                securityDepositSelected: prev.payment.securityDepositSelected,
                toolkitSelected
              })
              
              return {
              ...prev,
              payment: {
                ...prev.payment,
                registrationFee: registrationFee,
                securityDeposit: securityDeposit,
                total: registrationFee + securityDeposit + (toolkitSelected ? toolkitPrice : 0)
              },
              toolkit: {
                ...prev.toolkit,
                price: toolkitPrice
              }
              }
            })
          }
        } catch (err) {
          console.error('Failed to fetch pricing settings:', err)
      }
    }
    fetchPricingSettings()
  }, [formData.partnerType])

  // Fetch Available Service Hubs when on step 5
  useEffect(() => {
    const fetchAvailableHubs = async () => {
      if (token && currentStep === 5) {
        setLoadingHubs(true)
        try {
          const response = await partnerApi.getAvailableServiceHubs(token)
          if (response.success && response.data) {
            setAvailableHubs(response.data || [])
          }
        } catch (err) {
          console.error('Failed to fetch available hubs:', err)
          setAvailableHubs([])
        } finally {
          setLoadingHubs(false)
        }
      }
    }
    fetchAvailableHubs()
  }, [token, currentStep])

  // Initialize signature canvas when on step 6 (Terms & Conditions)
  useEffect(() => {
    if (currentStep !== 6) {
      // Clear canvas when leaving step 6
      const canvas = signatureCanvasRef.current
      if (canvas && canvas._cleanup) {
        canvas._cleanup()
        canvas._cleanup = null
      }
      return
    }

    // Function to initialize canvas
    const initializeCanvas = () => {
      const canvas = signatureCanvasRef.current
      if (!canvas) {
        return false // Canvas not ready yet
      }

      // Check if canvas is in the DOM
      if (!canvas.isConnected) {
        return false // Canvas not in DOM yet
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return false
      }

      // Set canvas size based on container
      const container = canvas.parentElement
      if (!container) {
        return false // Container not ready
      }

      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return false // Container not sized yet
      }

      // Set actual canvas size to match display size for better quality
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = 150 * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = '150px'
      
      // Reset transform and scale context for high DPI displays
      ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
      ctx.scale(dpr, dpr)

      // Clear any previous drawing
      ctx.clearRect(0, 0, rect.width, 150)
      
      // Set drawing style
      ctx.strokeStyle = '#0ea5a4'
      ctx.fillStyle = '#0ea5a4'
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      let isDrawing = false
      let lastX = 0
      let lastY = 0

      const getCoordinates = (e) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = (canvas.width / dpr) / rect.width
        const scaleY = (canvas.height / dpr) / rect.height
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientX : e.clientX)
        const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientY : e.clientY)
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        }
      }

      const startDrawing = (e) => {
        e.preventDefault()
        e.stopPropagation()
        isDrawing = true
        const coords = getCoordinates(e)
        lastX = coords.x
        lastY = coords.y
        // Draw a point for single clicks/taps
        ctx.beginPath()
        ctx.arc(lastX, lastY, 1.25, 0, 2 * Math.PI)
        ctx.fill()
      }

      const draw = (e) => {
        if (!isDrawing) return
        e.preventDefault()
        e.stopPropagation()
        const coords = getCoordinates(e)
        const currentX = coords.x
        const currentY = coords.y

        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(currentX, currentY)
        ctx.stroke()

        lastX = currentX
        lastY = currentY

        // Update signature data continuously while drawing
        try {
          const signatureData = canvas.toDataURL('image/png')
          setFormData(prev => ({
            ...prev,
            terms: { ...prev.terms, signature: signatureData }
          }))
        } catch (err) {
          console.error('Error updating signature:', err)
        }
      }

      const stopDrawing = (e) => {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        if (isDrawing) {
          isDrawing = false
          try {
            const signatureData = canvas.toDataURL('image/png')
            setFormData(prev => ({
              ...prev,
              terms: { ...prev.terms, signature: signatureData }
            }))
          } catch (err) {
            console.error('Error saving signature:', err)
          }
        }
      }

      // Remove any existing listeners first
      if (canvas._cleanup) {
        canvas._cleanup()
      }

      // Add event listeners
      canvas.addEventListener('mousedown', startDrawing)
      canvas.addEventListener('mousemove', draw)
      canvas.addEventListener('mouseup', stopDrawing)
      canvas.addEventListener('mouseleave', stopDrawing)
      canvas.addEventListener('touchstart', startDrawing, { passive: false })
      canvas.addEventListener('touchmove', draw, { passive: false })
      canvas.addEventListener('touchend', stopDrawing, { passive: false })
      canvas.addEventListener('touchcancel', stopDrawing, { passive: false })

      // Store cleanup function
      const cleanup = () => {
        canvas.removeEventListener('mousedown', startDrawing)
        canvas.removeEventListener('mousemove', draw)
        canvas.removeEventListener('mouseup', stopDrawing)
        canvas.removeEventListener('mouseleave', stopDrawing)
        canvas.removeEventListener('touchstart', startDrawing)
        canvas.removeEventListener('touchmove', draw)
        canvas.removeEventListener('touchend', stopDrawing)
        canvas.removeEventListener('touchcancel', stopDrawing)
      }

      // Store cleanup on canvas for later use
      canvas._cleanup = cleanup
      return true // Successfully initialized
    }

    // Try to initialize immediately
    let timer
    let retryCount = 0
    const maxRetries = 20 // Try for up to 2 seconds (20 * 100ms)

    const tryInitialize = () => {
      if (initializeCanvas()) {
        // Successfully initialized
        return
      }

      retryCount++
      if (retryCount < maxRetries) {
        // Try again after a short delay
        timer = setTimeout(tryInitialize, 100)
      } else {
        console.warn('Could not initialize signature canvas after multiple attempts')
      }
    }

    // Start initialization after a short delay to ensure DOM is ready
    timer = setTimeout(tryInitialize, 100)

    // Also try on next animation frame
    requestAnimationFrame(() => {
      if (!signatureCanvasRef.current?._cleanup) {
        tryInitialize()
      }
    })

    return () => {
      if (timer) clearTimeout(timer)
      const canvas = signatureCanvasRef.current
      if (canvas && canvas._cleanup) {
        canvas._cleanup()
        canvas._cleanup = null
      }
    }
  }, [currentStep])

  // Fetch MG Plans when token is available and on step 11 or 12
  useEffect(() => {
    const fetchPlans = async () => {
      if (token && (currentStep === 11 || currentStep === 12)) {
        // Load MG Plans for regular flow
        if (!fromLeadsneed) {
          setLoadingMGPlans(true)
          try {
            // Fetch both available plans and current plan
            const [plansResponse, currentPlanResponse] = await Promise.all([
              partnerApi.getMGPlans(token, formData.partnerType),
              partnerApi.getCurrentPlan(token).catch(() => null) // Don't fail if no current plan
            ])
            
            // Check if partner already has a plan selected
            if (currentPlanResponse?.data || currentPlanResponse?.plan) {
              const currentPlan = currentPlanResponse.data || currentPlanResponse
              const planData = currentPlan.plan || currentPlan
              
              // Update formData with current plan info
              if (planData && planData.name) {
                setFormData(prev => ({
                  ...prev,
                  selectedPlan: planData.name,
                  selectedPlanId: planData._id || planData.id || currentPlan.planId
                }))
              }
            }
            
            if (plansResponse.success && plansResponse.data && Array.isArray(plansResponse.data)) {
              // Filter plans by partner type
              const filteredPlans = plansResponse.data.filter(plan => {
                if (!plan.partnerType || plan.partnerType === 'both') return true
                return plan.partnerType === formData.partnerType
              })
              
              // Map admin-configured plans dynamically
              setMgPlans(filteredPlans.map(plan => {
                // Determine icon and colors dynamically based on plan name or use defaults
                const planName = plan.name || ''
                const nameLower = planName.toLowerCase()
                let icon = '📦'
                let color = 'bg-blue-50'
                let borderColor = 'border-blue-300'
                
                // Smart icon/color assignment based on plan name
                if (nameLower.includes('silver')) {
                  icon = '🥈'
                  color = 'bg-gray-100'
                  borderColor = 'border-gray-300'
                } else if (nameLower.includes('gold')) {
                  icon = '🥇'
                  color = 'bg-yellow-50'
                  borderColor = 'border-yellow-300'
                } else if (nameLower.includes('platinum') || nameLower.includes('diamond')) {
                  icon = '💎'
                  color = 'bg-purple-50'
                  borderColor = 'border-purple-300'
                } else if (nameLower.includes('bronze')) {
                  icon = '🥉'
                  color = 'bg-orange-50'
                  borderColor = 'border-orange-300'
                }
                
                return {
                _id: plan._id,
                id: plan._id,
                name: plan.name,
                  price: plan.price || 0,
                  leads: plan.leads || 0,
                  commission: plan.commission || 0,
                  leadFee: plan.leadFee || 0,
                  minWalletBalance: plan.minWalletBalance || 0,
                features: plan.features || [],
                  icon: plan.icon || icon,
                  color: plan.color || color,
                  borderColor: plan.borderColor || borderColor,
                  partnerType: plan.partnerType || 'individual'
                }
              }))
            } else {
              // If no plans returned, set empty array
              setMgPlans([])
            }
          } catch (err) {
            console.error('Failed to fetch MG plans:', err)
            setMgPlans([]) // Set empty array on error
          } finally {
            setLoadingMGPlans(false)
          }
        }
        
        // Load Lead Plans for leadsneed flow
        if (fromLeadsneed) {
          setLoadingLeadPlans(true)
          try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
              (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)
            
            // First check if partner already has an active lead plan
            if (token) {
              try {
                const currentPlanResponse = await fetch(`${API_BASE_URL}/api/partner/lead-plans/current`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                })
                
                if (currentPlanResponse.ok) {
                  const currentPlanResult = await currentPlanResponse.json()
                  if (currentPlanResult.success && currentPlanResult.data && currentPlanResult.data.subscription) {
                    const subscription = currentPlanResult.data.subscription
                    const currentPlan = currentPlanResult.data.currentPlan
                    
                    setExistingLeadPlan({
                      ...subscription,
                      planName: currentPlan?.name || 'Lead Plan'
                    })
                    console.log('Partner already has active lead plan:', subscription)
                  }
                }
              } catch (err) {
                console.error('Error checking existing lead plan:', err)
              }
            }
            
            const response = await fetch(`${API_BASE_URL}/api/partner/lead-plans/public?partnerType=${formData.partnerType}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const result = await response.json()
              if (result.success && result.data && Array.isArray(result.data)) {
                const mappedPlans = result.data.map(plan => {
                  const planName = plan.name || ''
                  const nameLower = planName.toLowerCase()
                  let icon = plan.icon || '📦'
                  let color = 'bg-blue-50'
                  let borderColor = 'border-blue-300'

                  if (!plan.icon) {
                    if (nameLower.includes('silver')) {
                      icon = '🥈'
                      color = 'bg-gray-100'
                      borderColor = 'border-gray-300'
                    } else if (nameLower.includes('gold')) {
                      icon = '🥇'
                      color = 'bg-yellow-50'
                      borderColor = 'border-yellow-300'
                    } else if (nameLower.includes('platinum') || nameLower.includes('diamond')) {
                      icon = '💎'
                      color = 'bg-purple-50'
                      borderColor = 'border-purple-300'
                    } else if (nameLower.includes('custom')) {
                      icon = '⚙️'
                      color = 'bg-indigo-50'
                      borderColor = 'border-indigo-300'
                    }
                  }

                  return {
                    _id: plan._id,
                    id: plan._id,
                    name: plan.name,
                    price: plan.price || 0,
                    leads: plan.leads || 0,
                    leadFee: plan.leadFee || 50,
                    leadQuality: plan.leadQuality || 'standard',
                    responseTime: plan.responseTime || '24 hours',
                    supportLevel: plan.supportLevel || 'basic',
                    features: plan.features || [],
                    icon: icon,
                    color: color,
                    borderColor: borderColor,
                    partnerType: plan.partnerType || 'individual',
                    termsAndConditions: plan.termsAndConditions || '',
                    customPricing: plan.customPricing || null
                  }
                })

                setLeadPlans(mappedPlans)
              }
            }
          } catch (err) {
            console.error('Failed to fetch Lead plans:', err)
            setLeadPlans([])
          } finally {
            setLoadingLeadPlans(false)
          }
        }
      }
    }
    fetchPlans()
  }, [token, currentStep, formData.partnerType, fromLeadsneed])

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await partnerApi.sendOTP(formData.phone)
      setOtpSent(true)
      setOtpTimer(60)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await partnerApi.verifyOTP(formData.phone, formData.otp)
      if (response.success && response.partner) {
        setToken(response.partner.token)
        setPartnerData(response.partner)
        
        // Fetch existing profile data to auto-fill form
        try {
          const profileResponse = await partnerApi.getProfile(response.partner.token)
          if (profileResponse.success && profileResponse.profile) {
            const profile = profileResponse.profile
            const kyc = profile.kyc || profile.KYC || {}
            const bankDetails = profile.bankDetails || kyc.bankDetails || {}
            
            // Helper function to convert filename to full URL if needed
            const getDocumentUrl = (doc) => {
              if (!doc) return null
              if (typeof doc === 'string') {
                // If it's already a full URL, return as is
                if (doc.startsWith('http://') || doc.startsWith('https://') || doc.startsWith('/')) {
                  return doc
                }
                // Otherwise, it's a filename, return as is (will be handled as uploaded)
                return doc
              }
              return null
            }
            
            // Auto-fill form with existing data
            setFormData(prev => ({
              ...prev,
              name: profile.name || prev.name,
              email: profile.email || prev.email,
              whatsappNumber: profile.whatsappNumber || prev.whatsappNumber,
              qualification: profile.qualification || prev.qualification,
              experience: profile.experience?.toString() || prev.experience,
              city: profile.city || prev.city,
              partnerType: profile.partnerType || prev.partnerType,
              // referralCode: Don't auto-fill referral code - let user enter it manually
              modeOfService: profile.modeOfService || prev.modeOfService,
              // Handle categories
              categories: profile.category?.map(cat => cat._id || cat.id || cat) || prev.categories,
              categoryNames: profile.category?.map(cat => cat.name || cat) || profile.categoryNames || prev.categoryNames,
              trade: profile.categoryNames?.[0] || profile.category?.[0]?.name || prev.trade,
              // Handle address if available
              ...(profile.address && { address: profile.address }),
              ...(profile.landmark && { landmark: profile.landmark }),
              ...(profile.pincode && { pincode: profile.pincode }),
              // Handle GST if available
              ...(profile.gstNumber && { gstNumber: profile.gstNumber }),
              // Handle existing KYC documents (if they exist as URLs/strings, mark as uploaded)
              kyc: {
                ...prev.kyc,
                // If KYC documents exist (as strings/URLs), store them as strings to indicate they're already uploaded
                panCard: getDocumentUrl(kyc.panCard) || prev.kyc.panCard,
                aadhaar: getDocumentUrl(kyc.aadhaar) || prev.kyc.aadhaar,
                aadhaarback: getDocumentUrl(kyc.aadhaarback) || prev.kyc.aadhaarback,
                chequeImage: getDocumentUrl(kyc.chequeImage) || prev.kyc.chequeImage,
                drivingLicence: getDocumentUrl(kyc.drivingLicence) || prev.kyc.drivingLicence,
                bill: getDocumentUrl(kyc.bill) || prev.kyc.bill,
                // Handle bank details
                bankDetails: {
                  accountNumber: bankDetails.accountNumber || prev.kyc.bankDetails.accountNumber,
                  ifscCode: bankDetails.ifscCode || prev.kyc.bankDetails.ifscCode,
                  accountHolderName: bankDetails.accountHolderName || prev.kyc.bankDetails.accountHolderName,
                  bankName: bankDetails.bankName || prev.kyc.bankDetails.bankName
                }
              },
              // Handle payment data if exists
              payment: {
                ...prev.payment,
                payId: profile.payId || response.partner.payId || prev.payment.payId,
                registrationFee: profile.registerAmount || response.partner.registerAmount || prev.payment.registrationFee
              },
              // Handle terms if already accepted
              terms: {
                accepted: profile.termsAccepted || response.partner.termsAccepted || prev.terms.accepted,
                signature: profile.termsSignature || response.partner.termsSignature || prev.terms.signature
              },
              // Handle MG Plan if already selected
              selectedPlan: profile.mgPlan || response.partner.mgPlan || prev.selectedPlan,
              selectedPlanId: profile.mgPlanId || response.partner.mgPlanId || prev.selectedPlanId
            }))
            
            // Determine which step to show based on completion status
            // Check profile data directly from API response
            const isProfileCompleted = profile.profileCompleted || response.partner.profileCompleted
            const hasPayment = profile.payId || response.partner.payId || profile.registerAmount
            const hasMGPlan = profile.mgPlan || response.partner.mgPlan
            const hasTermsAccepted = profile.termsAccepted || response.partner.termsAccepted
            
            // Check Personal Information (Step 2) - check both profile and formData that was just set
            const hasPersonalInfo = !!(
              (profile.name || formData.name) && 
              (profile.email || formData.email) && 
              (profile.address || formData.address) && 
              (profile.pincode || formData.pincode) && 
              (profile.city || formData.city)
            )
            
            // Check KYC Documents (Step 3) - check kyc object from profile
            const hasKYC = !!(
              kyc.panCard &&
              kyc.aadhaar &&
              kyc.aadhaarback &&
              kyc.chequeImage &&
              kyc.drivingLicence &&
              kyc.bill &&
              bankDetails.accountNumber &&
              bankDetails.ifscCode &&
              bankDetails.accountHolderName &&
              bankDetails.bankName
            )
            
            // Check Categories (Step 4)
            const hasCategories = !!(profile.category && profile.category.length > 0)
            
            // Route to appropriate step based on completion status
            if (fromLeads) {
              // Lead Marketplace flow - check all required steps
              const allRequiredStepsComplete = hasPersonalInfo && hasKYC && hasCategories && hasTermsAccepted
              
              if (allRequiredStepsComplete) {
                // All required steps completed - show "Already Registered" message
                setCurrentStep(11) // Already Registered step
              } else {
                // Find first missing step
                if (!hasPersonalInfo) {
                  setCurrentStep(2) // Personal Information
                } else if (!hasKYC) {
                  setCurrentStep(3) // KYC Documents
                } else if (!hasCategories) {
                  setCurrentStep(4) // Categories
                } else if (!hasTermsAccepted) {
                  setCurrentStep(6) // Terms
                } else {
                  // If MG Plan not selected but everything else is done, go to MG Plan
                  setCurrentStep(12) // MG Plan selection
                }
              }
            } else {
              // Regular onboarding flow
              if (isProfileCompleted && hasPayment && hasMGPlan) {
                // Everything completed
                setCurrentStep(11) // Success page
              } else if (isProfileCompleted && hasPayment && !hasMGPlan) {
                // Payment done, need MG Plan
                setCurrentStep(12) // MG Plan selection
              } else if (isProfileCompleted && !hasPayment) {
                // Profile done, need payment
                setCurrentStep(7) // Payment step
              } else if (isProfileCompleted && !hasTermsAccepted) {
                // Profile done but terms not accepted
                setCurrentStep(6) // Terms step
              } else {
                // Profile not completed, start from step 2
                setCurrentStep(2)
              }
            }
          } else {
            // No profile found, start from step 2
            setCurrentStep(2)
          }
        } catch (profileErr) {
          console.log('No existing profile found or error fetching profile:', profileErr)
          // Continue with empty form if profile fetch fails
        setCurrentStep(2) // Move to Personal Information step
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleTradeSelect = (tradeId) => {
    setFormData(prev => ({
      ...prev,
      trade: tradeId
    }))
  }

  const handleFileUpload = (field, file) => {
    if (!file) return
    setFormData(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        [field]: file
      }
    }))
  }

  const handleProfilePictureUpload = (file) => {
    if (!file) return
    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }))
  }

  const startCamera = async () => {
    try {
      setError(null) // Clear any previous errors
      setVideoReady(false) // Reset video ready state
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      })
      setStream(mediaStream)
      setShowCamera(true)
      
      // Wait for the video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          // Wait for video to be loaded
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                setVideoReady(true)
              }).catch(err => {
                console.error('Error playing video:', err)
                setError('Failed to start camera. Please try again.')
              })
            }
          }
        }
      }, 100)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions or upload a photo instead.')
      setShowCamera(false)
      setVideoReady(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setVideoReady(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) {
      setError('Camera not ready. Please wait a moment and try again.')
      return
    }
    
    const video = videoRef.current
    
    // Check if video is ready
    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera is still loading. Please wait a moment and try again.')
      return
    }
    
    // Wait for video to be ready if needed
    if (video.readyState < 2) {
      video.addEventListener('loadedmetadata', () => {
        capturePhoto()
      }, { once: true })
      return
    }
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      
      // Flip the image back since we mirrored it for display
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' })
          handleProfilePictureUpload(file)
          stopCamera()
          setError(null) // Clear any previous errors
        } else {
          setError('Failed to capture photo. Please try again.')
        }
      }, 'image/jpeg', 0.9)
    } catch (err) {
      console.error('Error capturing photo:', err)
      setError('Failed to capture photo. Please try again.')
    }
  }

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleCompleteProfile = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const profileData = {
        name: formData.name,
        email: formData.email,
        whatsappNumber: formData.whatsappNumber || formData.phone,
        qualification: formData.qualification,
        experience: formData.experience,
        contactNumber: formData.phone,
        address: formData.address,
        landmark: formData.landmark || '',
        pincode: formData.pincode,
        city: formData.city,
        referralCode: formData.referralCode || '',
        gstNumber: formData.gstNumber || '',
        partnerType: formData.partnerType || 'individual',
        profilePicture: formData.profilePicture || null
      }

      const response = await partnerApi.completeProfile(token, profileData)
      if (response.success) {
        setCurrentStep(3) // Move to KYC step
      }
    } catch (err) {
      const errorMessage = err.message || err.data?.message || 'Failed to save profile'
      setError(errorMessage)
      if (err.status === 401) {
        setError('Session expired. Please verify your phone number again.')
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Save categories when moving from step 4
  const handleSaveCategories = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    if (formData.categories.length === 0) {
      setError('Please select at least one category')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const profileData = {
        categories: formData.categories,
        categoryNames: formData.categoryNames,
        subcategory: formData.subcategory ? (Array.isArray(formData.subcategory) ? formData.subcategory : [formData.subcategory]) : [],
        service: formData.service ? (Array.isArray(formData.service) ? formData.service : [formData.service]) : [],
        modeOfService: formData.modeOfService
      }

      console.log('📤 Saving categories:', {
        categories: profileData.categories,
        categoryNames: profileData.categoryNames,
        categoriesCount: profileData.categories.length,
        categoryNamesCount: profileData.categoryNames.length
      })

      const response = await partnerApi.updateProfile(token, profileData)
      console.log('📥 Update Profile Response:', response)
      
      if (response.success) {
        console.log('✅ Categories saved successfully')
        setCurrentStep(5) // Move to hub selection step
      } else {
        setError(response.message || 'Failed to save categories')
      }
    } catch (err) {
      console.error('❌ Error saving categories:', err)
      const errorMessage = err.message || err.data?.message || 'Failed to save categories'
      setError(errorMessage)
      if (err.status === 401) {
        setError('Session expired. Please verify your phone number again.')
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteKYC = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Check if all documents are already uploaded (stored as strings)
      const allDocumentsUploaded = 
        formData.kyc.panCard && typeof formData.kyc.panCard === 'string' &&
        formData.kyc.aadhaar && typeof formData.kyc.aadhaar === 'string' &&
        formData.kyc.aadhaarback && typeof formData.kyc.aadhaarback === 'string' &&
        formData.kyc.chequeImage && typeof formData.kyc.chequeImage === 'string' &&
        formData.kyc.drivingLicence && typeof formData.kyc.drivingLicence === 'string' &&
        formData.kyc.bill && typeof formData.kyc.bill === 'string'

      // Check if there are any new files to upload
      const hasNewFiles = 
        formData.kyc.panCard instanceof File ||
        formData.kyc.aadhaar instanceof File ||
        formData.kyc.aadhaarback instanceof File ||
        formData.kyc.chequeImage instanceof File ||
        formData.kyc.drivingLicence instanceof File ||
        formData.kyc.bill instanceof File

      // If all documents are already uploaded and no new files, skip API call
      if (allDocumentsUploaded && !hasNewFiles) {
        // All documents already uploaded, just proceed to next step
        setCurrentStep(4)
        setLoading(false)
        return
      }

      // Only include files that are File objects (new uploads), skip strings (already uploaded)
      const kycData = {
        panCard: formData.kyc.panCard instanceof File ? formData.kyc.panCard : undefined,
        aadhaar: formData.kyc.aadhaar instanceof File ? formData.kyc.aadhaar : undefined,
        aadhaarback: formData.kyc.aadhaarback instanceof File ? formData.kyc.aadhaarback : undefined,
        chequeImage: formData.kyc.chequeImage instanceof File ? formData.kyc.chequeImage : undefined,
        drivingLicence: formData.kyc.drivingLicence instanceof File ? formData.kyc.drivingLicence : undefined,
        bill: formData.kyc.bill instanceof File ? formData.kyc.bill : undefined,
        accountNumber: formData.kyc.bankDetails.accountNumber,
        ifscCode: formData.kyc.bankDetails.ifscCode,
        accountHolderName: formData.kyc.bankDetails.accountHolderName,
        bankName: formData.kyc.bankDetails.bankName
      }

      // Only submit if there are new files to upload
      if (hasNewFiles) {
      const response = await partnerApi.completeKYC(token, kycData)
      if (response.success) {
        setCurrentStep(4) // Move to category selection step
        }
      } else {
        // All documents already uploaded, just proceed
        setCurrentStep(4)
      }
    } catch (err) {
      const errorMessage = err.message || err.data?.message || 'Failed to upload KYC documents'
      setError(errorMessage)
      if (err.status === 401) {
        setError('Session expired. Please verify your phone number again.')
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = () => {
    // Redirect to WhatsApp for payment assistance
    const message = "Hi, I need help with partner registration payment."
    const whatsappUrl = `https://wa.aisensy.com/+15558136145?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCompletePayment = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Calculate correct fee amounts
      const registrationFee = formData.payment.registrationFee || 0;
      const securityDeposit = formData.payment.securityDeposit || 0;
      const toolkitPrice = formData.toolkit.selected ? (formData.toolkit.price || 0) : 0;
      
      const paymentData = {
        registerAmount: registrationFee, // Registration fee only, not total
        // payId will be provided in step 8
        paidBy: formData.payment.paidBy,
        securityDeposit: securityDeposit,
        toolkitPrice: toolkitPrice,
        // Include terms data
        terms: {
          accepted: formData.terms.accepted,
          signature: formData.terms.signature,
          acceptedAt: new Date().toISOString()
        }
      }

      console.log('Sending payment data from onboarding:', paymentData);

      const response = await partnerApi.completePayment(token, paymentData)
      if (response.success) {
        // Get partner ID from response or existing partnerData
        const partnerIdValue = response.partnerId || partnerData?._id?.toString() || partnerData?.partnerId || `PRT-${Date.now().toString().slice(-6)}`
        setPartnerId(partnerIdValue)

        // Assign selected hubs to partner (using new Hub system)
        // Wait a bit to ensure partner is fully saved
        if (formData.selectedHubs.length > 0 && token) {
          try {
            // Small delay to ensure partner is saved
            await new Promise(resolve => setTimeout(resolve, 500))

            const assignmentResults = []
            for (const hub of formData.selectedHubs) {
              // Only assign if hubId exists (from new Hub system)
              if (hub.hubId) {
                try {
                  const assignResponse = await partnerApi.assignHub(token, hub.hubId)
                  assignmentResults.push({ hub: hub.name, success: true, response: assignResponse })
                } catch (hubErr) {
                  console.error(`Error assigning hub ${hub.name}:`, hubErr)
                  assignmentResults.push({ hub: hub.name, success: false, error: hubErr.message })
                  // Continue with other hubs even if one fails
                }
              }
            }

            // Log results for debugging
            const failed = assignmentResults.filter(r => !r.success)
            if (failed.length > 0) {
              console.warn('Some hubs failed to assign:', failed)
            } else {
              console.log('All hubs assigned successfully:', assignmentResults)
            }
          } catch (hubErr) {
            console.error('Error in hub assignment process:', hubErr)
            // Continue even if hub assignment fails - don't block onboarding
          }
        }

        setCurrentStep(8) // Move to Payment Confirmation step
      }
    } catch (err) {
      const errorMessage = err.message || err.data?.message || 'Failed to complete payment'
      setError(errorMessage)
      if (err.status === 401) {
        setError('Session expired. Please verify your phone number again.')
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToolkitToggle = () => {
    setFormData(prev => {
      const toolkitPrice = prev.toolkit.selected ? 0 : (prev.toolkit.price || 0)
      return {
      ...prev,
      toolkit: {
        ...prev.toolkit,
        selected: !prev.toolkit.selected
        },
        payment: {
          ...prev.payment,
          // Recalculate total when toolkit is toggled
          total: (prev.payment.registrationFee || 0) + (prev.payment.securityDeposit || 0) + toolkitPrice
      }
      }
    })
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Skip payment step (7) if coming from Lead Marketplace or Lead Need
      if ((fromLeads || fromLeadsneed) && currentStep === 6) {
        // After terms, complete registration without payment and go to plan selection
        handleCompleteRegistrationWithoutPayment()
      } else if ((fromLeads || fromLeadsneed) && currentStep === 7) {
        // Skip step 7 (payment) entirely
        setCurrentStep(12)
      } else if (currentStep === 6 && formData.payment.payId && formData.payment.status === 'completed') {
        // If payment already completed and verified, skip to step 8 (payment confirmation)
        setCurrentStep(8)
      } else if (currentStep === 8) {
        // From step 8, call handleUpdatePaymentConfirmation to validate and proceed
        handleUpdatePaymentConfirmation()
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      // Skip payment step (7) when going back if from Lead Marketplace or Lead Need
      if ((fromLeads || fromLeadsneed) && currentStep === 8) {
        setCurrentStep(6) // Go back to terms from plan selection
      } else if (currentStep === 9 && formData.payment.payId && formData.payment.status === 'completed') {
        // If on profile review (step 9) and payment was completed and verified, skip back to step 8 (payment confirmation)
        setCurrentStep(8)
      } else if (currentStep === 8 && formData.payment.payId && formData.payment.status === 'completed') {
        // If on payment confirmation (step 8) and payment was completed and verified, skip back to step 7 (payment options)
        setCurrentStep(7)
      } else {
        let prevStepNum = currentStep - 1
        
        // Skip step 7 if fromLeads when going back
        if (fromLeads && prevStepNum === 7) {
          prevStepNum = 6
        }
        
        setCurrentStep(prevStepNum)
      }
    }
  }

  // Complete registration without payment (for Lead Marketplace flow)
  const handleCompleteRegistrationWithoutPayment = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Save profile data without payment
      const profileData = {
        name: formData.name,
        email: formData.email,
        whatsappNumber: formData.whatsappNumber,
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        landmark: formData.landmark,
        pincode: formData.pincode,
        city: formData.city,
        referralCode: formData.referralCode,
        gstNumber: formData.gstNumber,
        partnerType: formData.partnerType || 'individual',
        categories: formData.categories,
        categoryNames: formData.categoryNames,
        subcategory: formData.subcategory ? (Array.isArray(formData.subcategory) ? formData.subcategory : [formData.subcategory]) : [],
        service: formData.service ? (Array.isArray(formData.service) ? formData.service : [formData.service]) : [],
        modeOfService: formData.modeOfService,
        terms: {
          accepted: formData.terms.accepted,
          signature: formData.terms.signature,
          acceptedAt: new Date().toISOString()
        }
      }

      // Update profile
      const response = await partnerApi.updateProfile(token, profileData)
      if (response.success) {
        const partnerIdValue = partnerData?._id?.toString() || partnerData?.partnerId || `PRT-${Date.now().toString().slice(-6)}`
        setPartnerId(partnerIdValue)
        
        // Assign selected hubs to partner (using new Hub system)
        // Wait a bit to ensure partner is fully saved
        if (formData.selectedHubs.length > 0 && token) {
          try {
            // Small delay to ensure partner is saved
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const assignmentResults = []
            for (const hub of formData.selectedHubs) {
              // Only assign if hubId exists (from new Hub system)
              if (hub.hubId) {
                try {
                  const assignResponse = await partnerApi.assignHub(token, hub.hubId)
                  assignmentResults.push({ hub: hub.name, success: true, response: assignResponse })
                } catch (hubErr) {
                  console.error(`Error assigning hub ${hub.name}:`, hubErr)
                  assignmentResults.push({ hub: hub.name, success: false, error: hubErr.message })
                  // Continue with other hubs even if one fails
                }
              }
            }
            
            // Log results for debugging
            const failed = assignmentResults.filter(r => !r.success)
            if (failed.length > 0) {
              console.warn('Some hubs failed to assign:', failed)
            } else {
              console.log('All hubs assigned successfully:', assignmentResults)
            }
          } catch (hubErr) {
            console.error('Error in hub assignment process:', hubErr)
            // Continue even if hub assignment fails - don't block onboarding
          }
        }
        
        // Create a lead entry in Lead Management for this partner registration
        // This will help track partners who registered from Lead Marketplace or Lead Need
        if ((fromLeads || fromLeadsneed) && formData.categories && formData.categories.length > 0 && formData.city) {
          try {
            // Use the first category as the lead category
            const leadCategory = formData.categories[0]
            const leadData = {
              partnerId: partnerIdValue,
              category: leadCategory,
              service: formData.categories.length > 1 ? formData.categories[1] : null,
              city: formData.city,
              address: formData.address || '',
              landmark: formData.landmark || '',
              pincode: formData.pincode || '',
              value: 0, // Default value for partner registration leads
              allocationStrategy: 'rule_based',
              priority: 'medium',
              description: `Partner registration from ${fromLeadsneed ? 'Lead Need' : 'Lead Marketplace'} - ${formData.name || 'New Partner'}`
            }
            
            // Call backend API to create lead (this requires admin token, so we'll create a partner endpoint)
            // For now, we'll just log it - the backend should handle this automatically
            console.log(`Partner registered from ${fromLeadsneed ? 'Lead Need' : 'Lead Marketplace'}:`, leadData)
          } catch (leadErr) {
            console.error('Error creating lead entry:', leadErr)
            // Don't block registration if lead creation fails
          }
        }
        
        // Go to plan selection (step 12 for fromLeads/fromLeadsneed)
        if (fromLeads || fromLeadsneed) {
          setCurrentStep(12) // Skip success message, go directly to plan selection
        } else {
          setCurrentStep(12) // Go to plan selection
        }
      }
    } catch (err) {
      const errorMessage = err.message || err.data?.message || 'Failed to complete registration'
      setError(errorMessage)
      if (err.status === 401) {
        setError('Session expired. Please verify your phone number again.')
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle PayU Payment
  const handlePayUPayment = async () => {
    if (!token) {
      setError('Please verify your phone number first')
      return
    }

    setProcessingPayment(true)
    setError(null)

    try {
      const totalAmount = formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)
      
      // Call backend to initiate PayU payment
      const apiUrl = import.meta.env.VITE_API_URL || 'https://nexo.works'
      console.log('Calling PayU API:', `${apiUrl}/api/payu/initiate-payment`)
      const response = await fetch(`${apiUrl}/api/payu/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          phone: formData.phone,
          name: formData.name,
          email: formData.email,
          partnerId: partnerData?._id || partnerId
        })
      })

      const data = await response.json()

      if (data.success) {
        // Set PayU payment data to trigger form submission
        setPayuPaymentData(data.data)
      } else {
        setError(data.message || 'Failed to initiate payment')
        setProcessingPayment(false)
      }
    } catch (err) {
      console.error('Payment initiation error:', err)
      setError('Failed to initiate payment. Please try again.')
      setProcessingPayment(false)
    }
  }

  // Check if a step is already completed
  const isStepCompleted = (step) => {
    switch (step) {
      case 2:
        return !!(formData.name && formData.email && formData.address && formData.pincode && formData.city && formData.partnerType)
      case 3:
        const hasPanCard = formData.kyc.panCard && (formData.kyc.panCard instanceof File || typeof formData.kyc.panCard === 'string')
        const hasAadhaar = formData.kyc.aadhaar && (formData.kyc.aadhaar instanceof File || typeof formData.kyc.aadhaar === 'string')
        const hasAadhaarBack = formData.kyc.aadhaarback && (formData.kyc.aadhaarback instanceof File || typeof formData.kyc.aadhaarback === 'string')
        const hasCheque = formData.kyc.chequeImage && (formData.kyc.chequeImage instanceof File || typeof formData.kyc.chequeImage === 'string')
        const hasDL = formData.kyc.drivingLicence && (formData.kyc.drivingLicence instanceof File || typeof formData.kyc.drivingLicence === 'string')
        const hasBill = formData.kyc.bill && (formData.kyc.bill instanceof File || typeof formData.kyc.bill === 'string')
        return hasPanCard && hasAadhaar && hasAadhaarBack && hasCheque && hasDL && hasBill &&
               formData.kyc.bankDetails.accountNumber && formData.kyc.bankDetails.ifscCode &&
               formData.kyc.bankDetails.accountHolderName && formData.kyc.bankDetails.bankName
      case 4:
        return formData.categories.length > 0
      case 5:
        // Hubs are optional, so always return true
        return true
      case 6:
        return !!(formData.terms.accepted && formData.terms.signature)
      case 7:
        return true // Payment initiated - proceed to payment confirmation
      case 8:
        return !!(formData.payment.payId && formData.payment.payId.trim().length > 0)
      case 9:
        return true // Profile review - always proceed (admin approval handled separately)
      case 10:
        // Automatically proceed to MG Plan selection
        setTimeout(() => setCurrentStep(11), 100)
        return (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to MG Plan selection...</p>
          </div>
        )
      default:
        return false
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return otpSent && formData.otp.length === 6
      case 2:
        return formData.name && formData.email && formData.address && formData.pincode && formData.city && formData.partnerType
      case 3:
        // Check if documents exist (either as File objects or as strings/URLs for existing uploads)
        const hasPanCard = formData.kyc.panCard && (formData.kyc.panCard instanceof File || typeof formData.kyc.panCard === 'string')
        const hasAadhaar = formData.kyc.aadhaar && (formData.kyc.aadhaar instanceof File || typeof formData.kyc.aadhaar === 'string')
        const hasAadhaarBack = formData.kyc.aadhaarback && (formData.kyc.aadhaarback instanceof File || typeof formData.kyc.aadhaarback === 'string')
        const hasCheque = formData.kyc.chequeImage && (formData.kyc.chequeImage instanceof File || typeof formData.kyc.chequeImage === 'string')
        const hasDL = formData.kyc.drivingLicence && (formData.kyc.drivingLicence instanceof File || typeof formData.kyc.drivingLicence === 'string')
        const hasBill = formData.kyc.bill && (formData.kyc.bill instanceof File || typeof formData.kyc.bill === 'string')
        return hasPanCard && hasAadhaar && hasAadhaarBack && hasCheque && hasDL && hasBill &&
               formData.kyc.bankDetails.accountNumber && formData.kyc.bankDetails.ifscCode &&
               formData.kyc.bankDetails.accountHolderName && formData.kyc.bankDetails.bankName
      case 4:
        return formData.categories.length > 0 // At least one category must be selected
      case 5:
        // Hubs are optional, but if selected, each hub must have at least one pin code
        if (formData.selectedHubs.length === 0) {
          return true // No hubs selected is okay
        }
        // Check that all selected hubs have at least one pin code
        // Also ensure pinCodes is an array and not empty
        const allHubsValid = formData.selectedHubs.every(hub => {
          if (!hub) return false
          const pinCodes = hub.pinCodes || []
          if (!Array.isArray(pinCodes) || pinCodes.length === 0) {
            return false
          }
          // Check that all pin codes are non-empty strings/numbers
          return pinCodes.every(pin => pin !== null && pin !== undefined && pin.toString().trim().length > 0)
        })
        return allHubsValid
      case 6:
        // If terms are already accepted and signature exists, allow proceeding
        // Otherwise, require both acceptance and signature
        return formData.terms.accepted && !!formData.terms.signature
      case 7:
        return true // Payment handled via WhatsApp
      case 8:
        return !!(formData.payment.payId && formData.payment.payId.trim().length > 0)
      case 9:
        return true // Profile review - always proceed
      case 10:
        return true // Success message step - always proceed
      default:
        return false
    }
  }

  // Auto-skip step 7 if fromLeads or fromLeadsneed and somehow reached step 7
  useEffect(() => {
    if ((fromLeads || fromLeadsneed) && currentStep === 7) {
      setCurrentStep(12)
    }
  }, [currentStep, fromLeads, fromLeadsneed])

  // Auto-skip MG plan selection (step 12) if partner already has an active MG plan
  useEffect(() => {
    if (currentStep === 12 && !fromLeads && !fromLeadsneed && formData.selectedPlan && formData.selectedPlanId) {
      // Partner already has an MG plan, auto-skip to success page
      console.log('Partner already has MG plan, auto-skipping to success page')
      setMgPlanSkipped(true)
      setTimeout(() => setCurrentStep(11), 1000) // Small delay to show the "already active" message briefly
    }
  }, [currentStep, fromLeads, fromLeadsneed, formData.selectedPlan, formData.selectedPlanId])

  // Auto-skip payment steps if payment already completed AND verified
  useEffect(() => {
    // Only skip if payment is completed AND verified by backend
    // Check if we're on step 7 and payment is already verified
    if (currentStep === 7 && formData.payment.payId && formData.payment.status === 'completed') {
      // Payment already completed and verified, skip to step 8
      console.log('⏭️ Payment already completed and verified, showing payment confirmation')
      setCurrentStep(8)
    }
  }, [currentStep, formData.payment.payId, formData.payment.status])

  // Auto-proceed from step 10 to step 11 (MG Plan selection)
  useEffect(() => {
    if (currentStep === 10) {
      const timer = setTimeout(() => {
        setCurrentStep(11)
      }, 1500) // Show loading for 1.5 seconds then proceed
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Check if registration is complete and route accordingly (for Lead Marketplace and Lead Need flow)
  useEffect(() => {
    if ((fromLeads || fromLeadsneed) && token && partnerData && currentStep !== 12 && currentStep !== 11) {
      // Check if all required data is collected
      const hasPersonalInfo = !!(formData.name && formData.email && formData.address && formData.pincode && formData.city)
      const hasKYC = !!(
        (formData.kyc.panCard && (formData.kyc.panCard instanceof File || typeof formData.kyc.panCard === 'string')) &&
        (formData.kyc.aadhaar && (formData.kyc.aadhaar instanceof File || typeof formData.kyc.aadhaar === 'string')) &&
        (formData.kyc.aadhaarback && (formData.kyc.aadhaarback instanceof File || typeof formData.kyc.aadhaarback === 'string')) &&
        (formData.kyc.chequeImage && (formData.kyc.chequeImage instanceof File || typeof formData.kyc.chequeImage === 'string')) &&
        (formData.kyc.drivingLicence && (formData.kyc.drivingLicence instanceof File || typeof formData.kyc.drivingLicence === 'string')) &&
        (formData.kyc.bill && (formData.kyc.bill instanceof File || typeof formData.kyc.bill === 'string')) &&
        formData.kyc.bankDetails.accountNumber &&
        formData.kyc.bankDetails.ifscCode &&
        formData.kyc.bankDetails.accountHolderName &&
        formData.kyc.bankDetails.bankName
      )
      const hasCategories = !!(formData.categories && formData.categories.length > 0)
      const hasTermsAccepted = !!(formData.terms.accepted && formData.terms.signature)
      
      const allRequiredStepsComplete = hasPersonalInfo && hasKYC && hasCategories && hasTermsAccepted
      
      // If all required steps are complete, show "Already Registered" message
      if (allRequiredStepsComplete && currentStep !== 12) {
        setCurrentStep(11)
      }
    }
  }, [formData, fromLeads, fromLeadsneed, token, partnerData, currentStep])

  const handleUpdatePaymentConfirmation = async () => {
    // Check if payment ID is provided
    if (!formData.payment.payId || formData.payment.payId.trim().length === 0) {
      setError('Please enter a valid payment transaction ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First, ensure payment information is saved/updated
      const paymentData = {
        registerAmount: formData.payment.registrationFee || 0,
        payId: formData.payment.payId,
        paidBy: formData.payment.paidBy || 'partner',
        securityDeposit: formData.payment.securityDepositSelected ? formData.payment.securityDeposit : 0,
        toolkitPrice: formData.toolkit.selected ? formData.toolkit.price : 0,
        terms: {
          accepted: formData.terms.accepted,
          signature: formData.terms.signature,
          acceptedAt: new Date().toISOString()
        }
      }

      // Update onboarding step to mark step 8 as completed
      const stepResponse = await partnerApi.updateOnboardingStep(token, {
        step: 8,
        completed: true,
        approved: false, // Not approved yet, just completed
        ...paymentData
      })

      if (stepResponse.success) {
        setCurrentStep(9) // Move to profile approval step
      } else {
        setError(stepResponse.message || 'Failed to update onboarding step')
      }
    } catch (err) {
      console.error('Payment confirmation error:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while confirming payment')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1.5 sm:mb-2">Welcome to NEXO Partner Onboarding</h2>
              <p className="text-sm sm:text-base text-gray-600">Enter your phone number to get started</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
                      setError(null)
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.otp}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))
                          setError(null)
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                      <FaWhatsapp className="text-green-500 text-lg" />
                      <span>OTP sent to your WhatsApp: +91 {formData.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Verify OTP'}
                  </button>
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500 text-center">
                      Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOTP}
                      className="w-full text-primary font-semibold"
                    >
                      Resend OTP
                    </button>
                  )}
                </motion.div>
              )}

              {!otpSent && (
                <button
                  onClick={handleSendOTP}
                  disabled={loading || formData.phone.length !== 10}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Send OTP'}
                </button>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1.5 sm:mb-2">Personal Information</h2>
              <p className="text-sm sm:text-base text-gray-600">Tell us about yourself</p>
              {isStepCompleted(2) && (
                <p className="text-sm text-green-600 mt-2">✓ Information already saved</p>
              )}
            </div>

            {/* Partner Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Select Partner Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="partnerType"
                    value="individual"
                    checked={formData.partnerType === 'individual'}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerType: e.target.value }))}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="partnerType"
                    value="franchise"
                    checked={formData.partnerType === 'franchise'}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerType: e.target.value }))}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Franchise</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter WhatsApp number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="e.g., ITI, Diploma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter your city"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Nearby landmark"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter pincode"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter GST number (if applicable)"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter referral code if any"
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                {formData.profilePicture ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img
                        src={formData.profilePicture instanceof File ? URL.createObjectURL(formData.profilePicture) : formData.profilePicture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profilePicture: null }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-green-600 font-semibold">✓ Profile picture uploaded</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center">
                      <FaUser className="text-6xl text-gray-400" />
                    </div>
                    <div className="flex gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleProfilePictureUpload(e.target.files[0])
                            }
                          }}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
                          <FaUpload /> Upload Photo
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        <FaCamera /> Capture Photo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Upload a photo or capture using camera</p>
                  </div>
                )}
              </div>
            </div>

            {/* Camera Modal */}
            {showCamera && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Capture Photo</h3>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      style={{ transform: 'scaleX(-1)' }} // Mirror effect for display
                    />
                    {!videoReady && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <FaSpinner className="animate-spin text-3xl mx-auto mb-2" />
                          <p className="text-sm">Loading camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {error && showCamera && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={!videoReady}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaCamera /> Capture
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">KYC Documents</h2>
              <p className="text-gray-600">Upload your identity and bank documents</p>
              {isStepCompleted(3) && (
                <p className="text-sm text-green-600 mt-2">✓ Documents already uploaded</p>
              )}
            </div>

            <div className="space-y-4">
              {[
                { key: 'panCard', label: 'PAN Card', required: true },
                { key: 'aadhaar', label: 'Aadhaar Card (Front)', required: true },
                { key: 'aadhaarback', label: 'Aadhaar Card (Back)', required: true },
                { key: 'chequeImage', label: 'Cancelled Cheque', required: true },
                { key: 'drivingLicence', label: 'Driving Licence', required: true },
                { key: 'bill', label: 'Utility Bill', required: true }
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(key, e.target.files[0])}
                      className="hidden"
                      id={key}
                    />
                    <label
                      htmlFor={key}
                      className={`cursor-pointer flex flex-col items-center ${formData.kyc[key] && typeof formData.kyc[key] === 'string' ? 'opacity-100' : ''}`}
                    >
                      {formData.kyc[key] && typeof formData.kyc[key] === 'string' ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheckCircle className="text-2xl text-green-600" />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-green-600 font-semibold">✓ Already Uploaded</span>
                            <span className="text-xs text-gray-500">Click to replace</span>
                          </div>
                        </div>
                      ) : formData.kyc[key] instanceof File ? (
                        <div className="flex flex-col items-center gap-1">
                          <FaUpload className="text-3xl text-primary mb-2" />
                        <span className="text-sm text-green-600">✓ {formData.kyc[key].name || 'Uploaded'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <FaUpload className="text-3xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload {label}</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ))}

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'accountNumber', label: 'Account Number', required: true },
                    { key: 'ifscCode', label: 'IFSC Code', required: true },
                    { key: 'accountHolderName', label: 'Account Holder Name', required: true },
                    { key: 'bankName', label: 'Bank Name', required: true }
                  ].map(({ key, label, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.kyc.bankDetails[key]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            bankDetails: {
                              ...prev.kyc.bankDetails,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        {...(key === 'ifscCode' && { maxLength: 11, style: { textTransform: 'uppercase' } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Select Categories</h2>
              <p className="text-gray-600">Select one or more service categories you want to provide</p>
              {isStepCompleted(4) && (
                <p className="text-sm text-green-600 mt-2">✓ Categories already selected</p>
              )}
            </div>
            
            {loadingCategories ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-4xl text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(categories.length > 0 ? categories : trades).map((category) => {
                  const categoryId = category.id || category._id || category.name
                  const categoryName = category.name
                  const categoryIcon = category.icon || '🔧'
                  const isSelected = formData.categories.includes(categoryId) || formData.categoryNames.includes(categoryName)
                  
                  return (
                    <motion.button
                      key={categoryId}
                      onClick={() => {
                        setFormData(prev => {
                          const newCategories = [...prev.categories]
                          const newCategoryNames = [...prev.categoryNames]
                          
                          if (isSelected) {
                            // Remove if already selected
                            const index = newCategories.indexOf(categoryId)
                            if (index > -1) newCategories.splice(index, 1)
                            const nameIndex = newCategoryNames.indexOf(categoryName)
                            if (nameIndex > -1) newCategoryNames.splice(nameIndex, 1)
                          } else {
                            // Add if not selected
                            if (!newCategories.includes(categoryId)) {
                              newCategories.push(categoryId)
                            }
                            if (!newCategoryNames.includes(categoryName)) {
                              newCategoryNames.push(categoryName)
                            }
                          }
                          
                          return {
                            ...prev,
                            categories: newCategories,
                            categoryNames: newCategoryNames,
                            // Keep trade for backward compatibility
                            trade: newCategoryNames.length > 0 ? newCategoryNames[0] : ''
                          }
                        })
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-4xl mb-3">{categoryIcon}</div>
                      <div className="font-semibold text-gray-800">{categoryName}</div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2"
                        >
                          <FaCheckCircle className="text-primary mx-auto" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            )}
            
            {formData.categories.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Selected:</span> {formData.categoryNames.join(', ')}
                </p>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Select Service Hubs</h2>
              <p className="text-gray-600">Select from available service hubs created by admin. Choose hubs and pin codes for your service areas.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>What are Service Hubs?</strong> Service hubs define the areas where you provide services. 
                  Each hub can have multiple pin codes. Select hubs and choose the pin codes you want to cover.
                </p>
              </div>

              {/* Available Hubs for Selection */}
              {loadingHubs ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading available hubs...</p>
                </div>
              ) : availableHubs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Available Service Hubs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableHubs.map((hub) => {
                      const isSelected = formData.selectedHubs.some(sh => sh.hubId === hub._id?.toString() || sh.name === hub.name)
                      const selectedHub = formData.selectedHubs.find(sh => sh.hubId === hub._id?.toString() || sh.name === hub.name)
                      const selectedPinCodes = selectedHub?.pinCodes || []
                      
                      return (
                        <div
                          key={hub._id || hub.name}
                          className={`border-2 rounded-xl p-4 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FaMapMarkerAlt className="text-primary" />
                                <h4 className="font-semibold text-gray-800">{hub.name}</h4>
                                {hub.isPrimary && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                                    Primary
                                  </span>
                                )}
                              </div>
                              {(hub.city || hub.state) && (
                                <p className="text-xs text-gray-500 ml-6">{[hub.city, hub.state].filter(Boolean).join(', ')}</p>
                              )}
                              {hub.areas && hub.areas.length > 0 && (
                                <p className="text-xs text-gray-500 ml-6 mt-1">
                                  {hub.areas.length} area{hub.areas.length !== 1 ? 's' : ''} • {hub.pinCodes?.length || 0} pin code{hub.pinCodes?.length === 1 ? '' : 's'}
                                </p>
                              )}
                            </div>
                  <button
                    type="button"
                    onClick={() => {
                                if (isSelected) {
                                  // Remove hub
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedHubs: prev.selectedHubs.filter(sh => 
                                      sh.hubId !== hub._id?.toString() && sh.name !== hub.name
                                    )
                                  }))
                                } else {
                                  // Add hub with all pin codes selected by default
                                  const hubPinCodes = hub.pinCodes || []
                                  // Only add if hub has pin codes
                                  if (hubPinCodes.length > 0) {
                                    setFormData(prev => ({
                                      ...prev,
                                      selectedHubs: [
                                        ...prev.selectedHubs,
                                        {
                                          hubId: hub._id?.toString(),
                                          name: hub.name,
                                          pinCodes: [...hubPinCodes],
                                          isPrimary: prev.selectedHubs.length === 0
                                        }
                                      ]
                                    }))
                                  } else {
                                    // Show warning if hub has no pin codes
                                    alert('This hub has no pin codes available. Please contact admin.')
                                  }
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                isSelected
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-primary text-white hover:bg-primary-dark'
                              }`}
                            >
                              {isSelected ? 'Remove' : 'Select Hub'}
                            </button>
                          </div>
                          
                          {isSelected && hub.pinCodes && hub.pinCodes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Select Pin Codes:</p>
                              <div className="flex flex-wrap gap-2">
                                {hub.pinCodes.map((pin) => {
                                  const isPinSelected = selectedPinCodes.includes(pin)
                                  return (
                                    <button
                                      key={pin}
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => {
                                          const updatedHubs = prev.selectedHubs.map(sh => {
                                            if (sh.hubId === hub._id?.toString() || sh.name === hub.name) {
                                              const currentPins = sh.pinCodes || []
                                              // Prevent deselecting the last pin code
                                              if (isPinSelected && currentPins.length === 1) {
                                                alert('At least one pin code must be selected for each hub. Remove the hub instead if you don\'t need it.')
                                                return sh
                                              }
                                              const newPins = isPinSelected
                                                ? currentPins.filter(p => p !== pin)
                                                : [...currentPins, pin]
                                              return {
                                                ...sh,
                                                pinCodes: newPins
                                              }
                                            }
                                            return sh
                                          })
                                          return {
                        ...prev,
                                            selectedHubs: updatedHubs
                                          }
                                        })
                                      }}
                                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                        isPinSelected
                                          ? 'bg-primary text-white border-2 border-primary'
                                          : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-primary'
                                      }`}
                                    >
                                      {pin}
                  </button>
                                  )
                                })}
                </div>
                              {selectedPinCodes.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2">⚠ Please select at least one pin code</p>
                              )}
              </div>
                          )}
                          
                          {!isSelected && hub.pinCodes && hub.pinCodes.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {hub.pinCodes.map((pin) => (
                                <span
                                  key={pin}
                                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold"
                                >
                                  {pin}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No Service Hubs Available</p>
                  <p className="text-sm text-gray-500">
                    No service hubs have been created yet. Please contact admin or proceed without hubs.
                  </p>
                </div>
              )}

              {/* Selected Hubs Summary */}
              {formData.selectedHubs.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Your Selected Service Hubs</h3>
                    <span className="text-sm text-gray-500">{formData.selectedHubs.length} hub{formData.selectedHubs.length !== 1 ? 's' : ''} selected</span>
                  </div>
                  {formData.selectedHubs.map((hub, index) => (
                    <div key={index} className="border-2 border-primary rounded-xl p-4 bg-primary/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">{hub.name}</span>
                            {hub.isPrimary && (
                              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-semibold">
                                Primary
                              </span>
                            )}
                          </div>
                          {hub.pinCodes && hub.pinCodes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {hub.pinCodes.map((pin, pinIndex) => (
                              <span
                                key={pinIndex}
                                className="px-2.5 py-1 bg-white border border-primary rounded-full text-xs font-semibold text-primary"
                              >
                                {pin}
                              </span>
                            ))}
                          </div>
                          ) : (
                            <p className="text-xs text-amber-600">No pin codes selected</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedHubs = formData.selectedHubs.filter((_, i) => i !== index)
                            // If deleting primary hub, make first remaining hub primary
                            if (hub.isPrimary && updatedHubs.length > 0) {
                              updatedHubs[0].isPrimary = true
                            }
                            setFormData(prev => ({
                              ...prev,
                              selectedHubs: updatedHubs
                            }))
                          }}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                          title="Delete Hub"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-sm font-semibold">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Terms & Conditions</h2>
              <p className="text-gray-600">Please read and accept the Partner Agreement</p>
                </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Terms Content */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">PARTNER TERMS & CONDITIONS</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Effective Date:</strong> 15th November 2025</p>
                    <p><strong>Last Updated:</strong> 15th November 2025</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-gray-700">
                  {/* 1. Introduction */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">1. Introduction</h4>
                    <p className="leading-relaxed">These Partner Terms & Conditions ("Terms") constitute a binding agreement between NEXO ("Company", "Platform", "We", "Us") and the individual or business entity ("Partner", "Service Provider", "You") who registers to provide on-site or online services through the Platform.</p>
                    <p className="leading-relaxed mt-2">By registering or accepting any service request, the Partner expressly agrees to these Terms.</p>
                  </div>

                  {/* 2. Independent Contractor Status */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">2. Independent Contractor Status</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="leading-relaxed">The Partner is an independent contractor, not an employee, representative, or agent of NEXO.</li>
                      <li className="leading-relaxed">No employment benefits (PF, ESI, gratuity, insurance, paid leave, salary) shall be applicable.</li>
                      <li className="leading-relaxed">The Partner is solely responsible for compliance with GST, income tax, labour laws, and all statutory obligations.</li>
                    </ul>
                  </div>

                  {/* 3. Mandatory Registration & Onboarding Requirements */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">3. Mandatory Registration & Onboarding Requirements</h4>
                    <p className="leading-relaxed mb-2">The Partner shall complete mandatory onboarding, including but not limited to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Valid Government ID</li>
                      <li>Address proof</li>
                      <li>Skill verification/trade test (if applicable)</li>
                      <li>Police verification (whenever required)</li>
                      <li>Recent photograph</li>
                      <li>Bank account details</li>
                      <li>GST number (if applicable)</li>
                    </ul>
                    <p className="leading-relaxed mb-2"><strong>Payment of applicable onboarding fees:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Registration Fee</li>
                      <li>Toolkit Fee (if provided)</li>
                      <li>Minimum Guarantee (MG) Plan</li>
                      <li>Security Deposit</li>
                    </ul>
                    <p className="leading-relaxed text-xs">All fees are non-refundable, except security deposit which is refundable as per Clause 23.</p>
                  </div>

                  {/* 4. Partner Obligations */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">4. Partner Obligations</h4>
                    <p className="leading-relaxed mb-2">Partner shall:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Maintain professional behaviour at all times.</li>
                      <li>Deliver high-quality, safe, and lawful services.</li>
                      <li>Carry valid Partner ID during every service.</li>
                      <li>Reach customer location on time.</li>
                      <li>Provide correct service estimates before starting work.</li>
                      <li>Maintain hygiene, wear uniform/ID (if provided).</li>
                      <li>Not engage in misconduct, harassment, abuse, threats, or illegal activity.</li>
                      <li>Maintain tools and ensure safe operation.</li>
                      <li>Not demand cash payments directly from customers.</li>
                      <li>Not solicit or accept off-platform work (strict penalty).</li>
                    </ul>
                  </div>

                  {/* 5. Pricing, Estimates & Billing */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">5. Pricing, Estimates & Billing</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Partner must follow NEXO pricing structure and guidelines.</li>
                      <li>Any additional work must be pre-approved through the Platform.</li>
                      <li>Partner shall not overcharge or misrepresent pricing.</li>
                      <li>All payments shall be processed solely through NEXO.</li>
                      <li>Partner is responsible for issuing bills/invoices where required by law.</li>
                    </ul>
                  </div>

                  {/* 6. Platform Commission & Deductions */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">6. Platform Commission & Deductions</h4>
                    <p className="leading-relaxed mb-2">Partner agrees to the following deductions:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Platform Commission (%)</li>
                      <li>Lead Cost per lead</li>
                      <li>GST applicable on Platform Commission</li>
                      <li>Penalties & Fines</li>
                      <li>TDS (if applicable)</li>
                      <li>Outstanding dues from previous jobs</li>
                      <li>MG Plan adjustments</li>
                    </ul>
                    <p className="leading-relaxed text-xs">All deductions shall be final and binding.</p>
                  </div>

                  {/* 7. Mandatory Safety Requirements */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">7. Mandatory Safety Requirements</h4>
                    <p className="leading-relaxed mb-2">Partner shall:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Follow safety protocols prescribed by NEXO.</li>
                      <li>Use proper tools and protective equipment.</li>
                      <li>Not perform services beyond skill level or without proper safety.</li>
                      <li>Not endanger customer, property, or themselves.</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Failure may result in:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Immediate suspension</li>
                      <li>Penalty up to ₹5,000</li>
                      <li>Legal action for damages</li>
                    </ul>
                  </div>

                  {/* 8. Customer Safety & Code of Conduct */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">8. Customer Safety & Code of Conduct</h4>
                    <p className="leading-relaxed mb-2">Partner must strictly adhere to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>No harassment (verbal, physical, emotional)</li>
                      <li>No misbehaviour, disrespect, abusive language</li>
                      <li>No consumption of alcohol/drugs on duty</li>
                      <li>No theft, damage, or misconduct</li>
                      <li>No photography or unauthorised recording at customer premises</li>
                      <li>No requesting personal favours or discounts</li>
                      <li>No entering restricted areas without consent</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Any violation may lead to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Permanent termination</li>
                      <li>Police complaint</li>
                      <li>Forfeiture of dues and deposits</li>
                      <li>Penalties up to ₹25,000</li>
                    </ul>
                  </div>

                  {/* 9. Punctuality & Attendance */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">9. Punctuality & Attendance</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Partner must accept bookings only if available.</li>
                      <li>Must reach customer location on time.</li>
                      <li>Any delay beyond 20 minutes must be informed.</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Repeated delays may lead to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>₹50–₹200 penalty per incident</li>
                      <li>Reduced lead allocation</li>
                      <li>Temporary suspension</li>
                    </ul>
                  </div>

                  {/* 10. No Offline Deals */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-bold text-base mb-2 text-red-900">10. No Offline Deals (Strictly Prohibited)</h4>
                    <p className="leading-relaxed mb-2 text-red-900">Partner shall not:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2 text-red-900">
                      <li>Ask customer to cancel platform booking</li>
                      <li>Offer lower pricing for offline work</li>
                      <li>Share personal phone number for future services</li>
                      <li>Accept cash or direct payments</li>
                    </ul>
                    <p className="leading-relaxed mb-2 text-red-900"><strong>Penalty:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-red-900">
                      <li>₹5,000 minimum</li>
                      <li>Permanent termination</li>
                      <li>Deduction from wallet and MG plan</li>
                      <li>Legal action for business loss</li>
                    </ul>
                  </div>

                  {/* 11. Service Quality & Returns */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">11. Service Quality & Returns</h4>
                    <p className="leading-relaxed mb-2">Partner must ensure:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>High-quality workmanship</li>
                      <li>Correct problem diagnosis</li>
                      <li>Use of original parts (if applicable)</li>
                      <li>Guarantee service quality as per NEXO policy</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Poor work or customer complaints may attract:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Rework without charges</li>
                      <li>Penalty from ₹100–₹1,000</li>
                      <li>Suspension on repeated offences</li>
                    </ul>
                  </div>

                  {/* 12. Damage, Theft, or Loss */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">12. Damage, Theft, or Loss</h4>
                    <p className="leading-relaxed mb-2">Partner shall be fully liable for:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Damage to customer property</li>
                      <li>Theft or loss at customer premises</li>
                      <li>Fire, accident, or injury caused due to Partner negligence</li>
                      <li>Incorrect installation or unsafe practices</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Recovery will be made through:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Partner wallet</li>
                      <li>Security deposit</li>
                      <li>MG payouts</li>
                      <li>Legal recovery</li>
                    </ul>
                    <p className="leading-relaxed text-xs mt-2">Police FIR may be filed for severe cases.</p>
                  </div>

                  {/* 13. Fraudulent Activities */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">13. Fraudulent Activities</h4>
                    <p className="leading-relaxed mb-2">Strictly prohibited:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>Faking job completion</li>
                      <li>False OTP entry</li>
                      <li>Manipulating customer rating</li>
                      <li>Overcharging</li>
                      <li>Providing false documents</li>
                    </ul>
                    <p className="leading-relaxed mb-2">Penalty:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Up to ₹25,000</li>
                      <li>Permanent removal</li>
                      <li>Legal prosecution</li>
                    </ul>
                  </div>

                  {/* 14. Penalty Structure */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-bold text-base mb-3 text-amber-900">14. Penalty Structure</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-amber-100">
                            <th className="border border-amber-300 px-2 py-1 text-left font-bold">Violation</th>
                            <th className="border border-amber-300 px-2 py-1 text-left font-bold">Penalty</th>
                          </tr>
                        </thead>
                        <tbody className="text-amber-900">
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Late arrival</td>
                            <td className="border border-amber-300 px-2 py-1">₹50–₹200</td>
                          </tr>
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Job rejection after acceptance</td>
                            <td className="border border-amber-300 px-2 py-1">₹100–₹300</td>
                          </tr>
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Misbehaviour</td>
                            <td className="border border-amber-300 px-2 py-1">₹1,000–₹5,000</td>
                          </tr>
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Unsafe work</td>
                            <td className="border border-amber-300 px-2 py-1">₹2,000</td>
                          </tr>
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Offline deal</td>
                            <td className="border border-amber-300 px-2 py-1">₹5,000+ termination</td>
                          </tr>
                          <tr>
                            <td className="border border-amber-300 px-2 py-1">Theft/misconduct</td>
                            <td className="border border-amber-300 px-2 py-1">Legal action + termination</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-amber-900 mt-2">NEXO reserves the right to modify penalties anytime.</p>
                  </div>

                  {/* 15. Partner Wallet & Settlement */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">15. Partner Wallet & Settlement</h4>
                    <p className="leading-relaxed mb-2">Deductions will be applied in the following order:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 mb-2">
                      <li>Penalties</li>
                      <li>Platform Commission</li>
                      <li>Lead cost</li>
                      <li>MG plan adjustments</li>
                      <li>Pending dues</li>
                    </ol>
                    <p className="leading-relaxed">Settlement cycles will be weekly or as updated by NEXO.</p>
                  </div>

                  {/* 16. MG Plan */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">16. MG Plan (Minimum Guarantee)</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>MG plan is optional or mandatory as per category.</li>
                      <li>MG provides priority leads based on plan.</li>
                      <li>MG fee is non-refundable.</li>
                      <li>Partner failing to meet service quality/minimum performance may lose MG benefits without refund.</li>
                    </ul>
                  </div>

                  {/* 17. Ratings & Reviews */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">17. Ratings & Reviews</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Partner must maintain minimum rating (e.g., 4.0).</li>
                      <li>Low ratings may result in reduced leads or suspension.</li>
                      <li>False or manipulated ratings are punishable.</li>
                    </ul>
                  </div>

                  {/* 18. Use of Platform & Technology */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">18. Use of Platform & Technology</h4>
                    <p className="leading-relaxed mb-2">Partner shall:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Keep app updated</li>
                      <li>Not misuse customer data</li>
                      <li>Not reverse engineer, hack, or modify NEXO systems</li>
                      <li>Use genuine documents only</li>
                    </ul>
                  </div>

                  {/* 19. Termination */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">19. Termination</h4>
                    <p className="leading-relaxed mb-2">NEXO may terminate partner access without notice for:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Misconduct</li>
                      <li>Fraud</li>
                      <li>Unsafe behaviour</li>
                      <li>Low performance</li>
                      <li>Offline deals</li>
                      <li>Customer complaints</li>
                      <li>Violation of any Terms</li>
                    </ul>
                  </div>

                  {/* 20. Security Deposit Refund */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">20. Security Deposit Refund</h4>
                    <p className="leading-relaxed mb-2">Refund only upon:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li>30-day notice period</li>
                      <li>Return of toolkit (if applicable)</li>
                      <li>No pending dues or penalties</li>
                      <li>No active customer complaints</li>
                    </ul>
                    <p className="leading-relaxed">Refund processing time: 21–45 working days.</p>
                  </div>

                  {/* 21. Dispute Resolution */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">21. Dispute Resolution</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                      <li><strong>Jurisdiction:</strong> Bangalore, Karnataka</li>
                      <li><strong>Governing Law:</strong> Laws of India</li>
                    </ul>
                    <p className="leading-relaxed mb-2"><strong>Method:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Internal review</li>
                      <li>Mediation</li>
                      <li>Arbitration (if required)</li>
                    </ul>
                  </div>

                  {/* 22. Amendments */}
                  <div>
                    <h4 className="font-bold text-base mb-2 text-gray-900">22. Amendments</h4>
                    <p className="leading-relaxed">NEXO reserves the right to change Terms anytime. Continued use of the Platform constitutes acceptance.</p>
                  </div>

                  {/* Acceptance Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      <strong>By signing and accepting this Agreement, Partner confirms that:</strong> (i) they have read, understood, and agree to be bound by all terms, conditions, and penalties outlined herein; (ii) they have had the opportunity to review the full terms published on the Platform; (iii) they understand that this Agreement is legally binding; and (iv) they agree to comply with all obligations and accept all penalties for violations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Signature and Acceptance */}
              <div className="space-y-6">
                {/* Show signature section only if terms are not already accepted */}
                {formData.terms.accepted && formData.terms.signature ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FaCheckCircle className="text-green-600 text-2xl" />
                      <h3 className="text-lg font-bold text-green-800">Terms Already Accepted</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      You have already accepted the Terms & Conditions and provided your digital signature.
                    </p>
                    {formData.terms.signature && (
                      <div className="mt-4">
                        <p className="text-xs text-green-600 mb-2 font-semibold">Your Signature:</p>
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <img 
                            src={formData.terms.signature} 
                            alt="Signature" 
                            className="max-w-full h-auto"
                            style={{ maxHeight: '100px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Digital Signature</h3>
                  
                  <div className="mb-4">
                    <canvas
                      ref={signatureCanvasRef}
                      className="border-2 border-dashed border-gray-300 rounded-lg w-full cursor-crosshair"
                      style={{ 
                        touchAction: 'none',
                        display: 'block',
                        maxWidth: '100%',
                        height: '150px'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Draw your signature in the box above</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const canvas = signatureCanvasRef.current
                        if (canvas) {
                          const ctx = canvas.getContext('2d')
                          ctx.clearRect(0, 0, canvas.width, canvas.height)
                          setFormData(prev => ({
                            ...prev,
                            terms: { ...prev.terms, signature: null }
                          }))
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                    >
                      Clear Signature
                    </button>
                  </div>

                  {formData.terms.signature && (
                    <p className="text-sm text-green-600 mt-2 font-semibold">✓ Signature captured</p>
                  )}
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.terms.accepted}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          terms: { ...prev.terms, accepted: e.target.checked }
                        }))
                      }}
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      <strong>I have read, understood and accept the Terms & Conditions</strong> *
                      <br />
                      <span className="text-xs text-gray-500">By checking this box, you agree to be bound by all terms, conditions, and penalties outlined in the Partner Agreement.</span>
                    </span>
                  </label>
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 7:
        // Skip payment step if coming from Lead Marketplace
        if (fromLeads) {
          // This should not be reached, but if it is, redirect to MG Plan
          return null
        }
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">💳 Payment Options</h2>
              <p className="text-gray-600">Choose your preferred payment plan and complete via WhatsApp Pay</p>
            </div>

            {/* Payment Status Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
              >
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Payment Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 space-y-4">
              {/* Registration Fee - Required */}
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
              </div>
                  <div>
                    <span className="text-gray-800 font-semibold">Registration Fee</span>
                    <p className="text-xs text-gray-600">One-time onboarding fee</p>
                  </div>
                </div>
                <span className="font-bold text-xl text-primary">₹{formData.payment.registrationFee.toLocaleString()}</span>
              </div>
              {/* Enhanced Security Deposit Section */}
              <div className="relative">
                <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                  formData.payment.securityDepositSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-primary/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        formData.payment.securityDepositSelected
                          ? 'bg-primary border-primary'
                          : 'border-gray-300 hover:border-primary/70'
                      }`}>
                        <input
                          type="checkbox"
                          id="securityDeposit"
                          checked={formData.payment.securityDepositSelected}
                          onChange={(e) => {
                            const isSelected = e.target.checked
                            // Get partner type specific security deposit
                            const partnerType = formData.partnerType || 'individual'
                            const partnerTypeFees = pricingSettings?.[partnerType] || pricingSettings
                            const securityDepositAmount = isSelected ? (partnerTypeFees?.securityDeposit || 1000) : 0
                            setFormData(prev => ({
                              ...prev,
                              payment: {
                                ...prev.payment,
                                securityDepositSelected: isSelected,
                                securityDeposit: securityDepositAmount,
                                total: prev.payment.registrationFee + securityDepositAmount + (prev.toolkit.selected ? prev.toolkit.price : 0)
                              }
                            }))
                          }}
                          className="w-3 h-3 text-primary focus:ring-0 opacity-0 absolute"
                        />
                        {formData.payment.securityDepositSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <label htmlFor="securityDeposit" className="text-gray-800 font-semibold text-base cursor-pointer flex items-center gap-2">
                          Include Security Deposit
                          {formData.payment.securityDepositSelected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Selected
                            </span>
                          )}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Refundable security deposit
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {pricingSettings && (
                        <>
                          <div className={`text-2xl font-bold transition-colors duration-200 ${
                            formData.payment.securityDepositSelected ? 'text-primary' : 'text-gray-700'
                          }`}>
                            ₹{pricingSettings.securityDeposit.toLocaleString()}
                          </div>
                          {!formData.payment.securityDepositSelected && (
                            <div className="text-xs text-gray-500 mt-1">
                              Click to include
                            </div>
                          )}
                        </>
                      )}
                    </div>
              </div>
              
                  {/* Additional info when selected */}
                  {formData.payment.securityDepositSelected && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-800">Why include security deposit?</p>
                          <p className="text-xs mt-1">Builds trust with customers and partners. Fully refundable upon completion..</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Toolkit Option */}
              <div className="border-t border-gray-200 pt-6">
                <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                  formData.toolkit.selected
                    ? 'border-orange-400 bg-orange-50/50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        formData.toolkit.selected
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-300 hover:border-orange-400'
                      }`}>
                    <input
                      type="checkbox"
                      id="toolkitCheckbox"
                      checked={formData.toolkit.selected}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        toolkit: { ...prev.toolkit, selected: e.target.checked }
                      }))}
                          className="w-3 h-3 text-primary focus:ring-0 opacity-0 absolute cursor-pointer"
                        />
                        {formData.toolkit.selected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <label htmlFor="toolkitCheckbox" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                            <FaToolbox className={`text-lg transition-colors duration-200 ${
                              formData.toolkit.selected ? 'text-orange-600' : 'text-orange-500'
                            }`} />
                            <span className={`font-semibold transition-colors duration-200 ${
                              formData.toolkit.selected ? 'text-gray-800' : 'text-gray-700'
                            }`}>
                              Professional Toolkit (Optional)
                              {formData.toolkit.selected && (
                                <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Selected
                                </span>
                              )}
                            </span>
                      </div>
                          <p className="text-sm text-gray-600 mt-1">
                        Professional-grade tools and equipment to get started faster
                      </p>
                    </label>
                  </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold transition-colors duration-200 ${
                        formData.toolkit.selected ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        ₹{formData.toolkit.price.toLocaleString()}
                      </div>
                      {!formData.toolkit.selected && (
                        <div className="text-xs text-gray-500 mt-1">
                          Optional add-on
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional benefits when selected */}
                  {formData.toolkit.selected && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Quality Tools</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Faster Setup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Professional Look</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Customer Trust</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {formData.toolkit.selected && pricingSettings && pricingSettings.toolkitPriceRefundable === true && (
                  <div className="ml-8 mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    <span className="text-xs text-emerald-800 font-medium">Toolkit Price is refundable</span>
                  </div>
                )}
              </div>

              {/* Enhanced Total Section */}
              <div className="border-t-2 border-primary/30 pt-6 mt-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  {/* Total Header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-gray-800">Total Amount</span>
                    <span className="text-3xl font-bold text-primary">
                      ₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()}
                </span>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Registration Fee</span>
                      <span className="font-medium">₹{formData.payment.registrationFee.toLocaleString()}</span>
                    </div>
                    {formData.payment.securityDepositSelected && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Security Deposit</span>
                        <span className="font-medium">₹{formData.payment.securityDeposit.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.toolkit.selected && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Toolkit Price</span>
                        <span className="font-medium">₹{formData.toolkit.price.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Total</span>
                        <span className="font-bold text-lg text-primary">
                          ₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Refundable Fees Section - Always show if any fee is refundable */}
              {pricingSettings && (
                (pricingSettings.registrationFeeRefundable === true || 
                 pricingSettings.securityDepositRefundable === true || 
                 pricingSettings.toolkitPriceRefundable === true) && (
                  <div className="mt-4 pt-4 border-t border-primary/20 space-y-2">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Refundable Fees:</p>
                    {pricingSettings.registrationFeeRefundable === true && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                        <FaCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                        <span className="text-xs text-emerald-800 font-medium">Registration Fee is refundable</span>
                      </div>
                    )}
                    {pricingSettings.securityDepositRefundable === true && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                        <FaCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                        <span className="text-xs text-emerald-800 font-medium">Security Deposit is refundable</span>
                      </div>
                    )}
                    {pricingSettings.toolkitPriceRefundable === true && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                        <FaCheckCircle className="text-emerald-600 text-sm flex-shrink-0" />
                        <span className="text-xs text-emerald-800 font-medium">Toolkit Price is refundable</span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Payment Gateway Section */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Payment Gateway</h3>
                <p className="text-sm text-gray-600">Complete your payment securely using PayU payment gateway</p>
              </div>

              <div className="bg-white rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Secure & Encrypted</h4>
                    <p className="text-sm text-gray-600">Your payment information is safe with us</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Credit Card</p>
                    <svg className="w-8 h-8 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Debit Card</p>
                    <svg className="w-8 h-8 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">UPI</p>
                    <svg className="w-8 h-8 text-purple-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Net Banking</p>
                    <svg className="w-8 h-8 text-orange-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    <strong>Note:</strong> You will be redirected to PayU secure payment page to complete your transaction
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handlePayUPayment}
                disabled={processingPayment}
                whileHover={{ scale: processingPayment ? 1 : 1.05 }}
                whileTap={{ scale: processingPayment ? 1 : 0.95 }}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay ₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()} Securely
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* New Partner Registration Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t border-gray-200 pt-6 mt-6"
            >
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-center mb-3">
                  <h4 className="font-semibold text-gray-800 mb-1">Want to register a new partner?</h4>
                  <p className="text-sm text-gray-600">Clear all saved data and start fresh registration</p>
                </div>
                <motion.button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to start a new registration? This will clear all saved data from this device.')) {
                      // Clear all localStorage data
                      localStorage.removeItem('partnerOnboardingStep')
                      localStorage.removeItem('partnerOnboardingFormData')
                      localStorage.removeItem('partnerOnboardingToken')
                      localStorage.removeItem('partnerOnboardingPartnerData')
                      
                      // Reload the page to start fresh
                      window.location.href = '/partner/onboard'
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register New Partner
                </motion.button>
              </div>
            </motion.div>
          </div>
        )

      case 8:
        // Check payment status
        const hasOnlinePayment = formData.payment.payId && formData.payment.payId.length > 0
        const paymentSuccess = formData.payment.status === 'completed'
        const paymentFailed = formData.payment.status === 'failed'
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              {paymentFailed ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-red-600 mb-2">Payment Failed!</h2>
                  <p className="text-gray-600">Your payment could not be processed. Please try again.</p>
                </>
              ) : hasOnlinePayment ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <FaCheckCircle className="text-4xl text-green-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Payment Received!</h2>
                  <p className="text-gray-600">Your payment has been received and is being verified by our team</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-primary mb-2">Payment Confirmation</h2>
                  <p className="text-gray-600">Enter your payment transaction ID to complete registration</p>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 space-y-4">
              {/* Payment Summary */}
              <div className="bg-white/50 rounded-xl p-4 border border-primary/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Payment {hasOnlinePayment ? 'Completed' : 'Summary'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee</span>
                    <span className="font-medium">₹{formData.payment.registrationFee.toLocaleString()}</span>
                  </div>
                  {formData.payment.securityDepositSelected && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-medium">₹{formData.payment.securityDeposit.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.toolkit.selected && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professional Toolkit</span>
                      <span className="font-medium">₹{formData.toolkit.price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total {hasOnlinePayment ? 'Paid' : 'Amount'}</span>
                      <span className="text-primary">₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details - Show based on payment status */}
              {paymentFailed ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-lg font-semibold text-red-800">Payment Failed</h4>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      {formData.payment.payId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Transaction ID:</span>
                          <span className="font-mono font-semibold text-gray-800">{formData.payment.payId}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-semibold text-gray-800">₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Failed
                        </span>
                      </div>
                    </div>

                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3">
                      <p className="text-sm text-red-800">
                        <strong>❌ Payment Failed:</strong> {error || 'Your payment could not be processed. Please try again or contact support if the issue persists.'}
                      </p>
                    </div>

                    <motion.button
                      onClick={() => {
                        // Clear payment data and go back to step 7
                        setFormData(prev => ({
                          ...prev,
                          payment: {
                            ...prev.payment,
                            payId: '',
                            status: ''
                          }
                        }))
                        setError(null)
                        setCurrentStep(7)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition"
                    >
                      <FaArrowLeft />
                      Try Payment Again
                    </motion.button>
                  </div>
                </motion.div>
              ) : hasOnlinePayment ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 rounded-xl p-4 border-2 border-green-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCheckCircle className="text-green-600 text-xl" />
                      <h4 className="text-lg font-semibold text-green-800">Payment Details</h4>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="font-mono font-semibold text-gray-800">{formData.payment.payId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-green-600">₹{(formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="font-semibold text-gray-800">Online Payment (PayU)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          <FaClock />
                          Pending Verification
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        <strong>⏳ Payment Pending Verification:</strong> Your payment has been received successfully. Our admin team will verify it shortly. You can proceed to the next step where you'll wait for approval.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Payment Transaction ID Input - Show if manual payment */
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                      </svg>
                      <label className="text-base font-semibold text-gray-800">
                        Payment Transaction ID
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.payment.payId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment: { ...prev.payment, payId: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder="Enter payment transaction ID from WhatsApp Pay"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      Enter the transaction ID you received after completing the payment via WhatsApp Pay to complete your registration.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 9:
        // Profile Under Review - Waiting for Admin Approval
        return (
          <ProfileReviewStep
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            formData={formData}
            token={token}
          />
        )

      case 10:
        // Lead Plan Selection for leadsneed flow - redirect to case 12
        if (fromLeadsneed) {
          // Automatically proceed to lead plan selection (case 12)
          setTimeout(() => setCurrentStep(12), 100)
          return (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className="text-gray-600">Preparing lead plan selection...</p>
            </div>
          )
        }
        // For regular flow, proceed to MG plan selection (case 11)
        setTimeout(() => setCurrentStep(11), 100)
        return (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
            <p className="text-gray-600">Preparing plan selection...</p>
          </div>
        )

      case 11:
        // Show success message if plan is selected OR if user skipped OR if lead plan payment succeeded
        if (formData.selectedPlan || mgPlanSkipped || (fromLeadsneed && formData.selectedLeadPlan)) {
          return (
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <FaUserCheck className="text-4xl text-green-600" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {formData.selectedLeadPlan ? 'Lead Plan Activated!' : 
                   formData.selectedPlan ? 'Thank You!' : 'Registration Complete!'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {formData.selectedLeadPlan 
                    ? `Congratulations! Your ${formData.selectedLeadPlan} lead plan is now active. You'll start receiving quality leads based on your selected categories and location.`
                    : formData.selectedPlan 
                    ? `Thank you for subscribing to the ${formData.selectedPlan} plan! Your lead subscription is now active.`
                    : 'Your partner registration is complete! You can subscribe to an MG plan anytime from your dashboard.'
                  }
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6">
                <div className="text-sm text-gray-600 mb-2">Your Partner ID</div>
                <div className="text-3xl font-bold text-primary">{partnerId || partnerData?._id?.toString().slice(-8) || partnerData?.partnerId || 'PRT-XXXXXX'}</div>
              </div>

              {formData.categoryNames && formData.categoryNames.length > 0 && (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Selected Categories</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {formData.categoryNames.map((catName, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold">
                        {catName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Lead Plan Success */}
              {formData.selectedLeadPlan && (
                <div className="bg-white border-2 border-green-500 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Lead Plan</h3>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <div className="text-2xl font-bold text-green-600 mb-2">{formData.selectedLeadPlan} Lead Plan</div>
                    <p className="text-gray-600 mb-3">
                      Your lead plan is now active! You'll receive quality leads based on your selected categories and location.
                    </p>
                    <div className="bg-green-50 rounded-lg p-3 inline-block">
                      <p className="text-sm font-semibold text-green-700">✅ Payment Successful</p>
                      <p className="text-xs text-green-600">Plan activated and ready to receive leads</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show MG Plan Success - Only for non-leadsneed flow */}
              {formData.selectedPlan && !fromLeadsneed && (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your MG Plan</h3>
                  <div className="text-center">
                    <div className="text-4xl mb-3">
                      {formData.selectedPlan === 'Silver' ? '🥈' : formData.selectedPlan === 'Gold' ? '🥇' : '💎'}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">{formData.selectedPlan} Plan</div>
                    <p className="text-gray-600">
                      You've successfully subscribed to the {formData.selectedPlan} plan. You'll receive guaranteed leads and commission benefits.
                    </p>
                    {selectedPlanMeta && (
                      <p className="text-sm text-gray-500 mt-3">
                        Lead fee ₹{selectedPlanMeta.leadFee ?? 0} · Maintain wallet ≥ ₹{selectedPlanMeta.minWalletBalance ?? 0} to keep leads flowing.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault()
                    handleWhatsAppClick(e)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Contact Support
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to start a new registration? This will clear all saved data from this device.')) {
                      // Clear all localStorage data
                      localStorage.removeItem('partnerOnboardingStep')
                      localStorage.removeItem('partnerOnboardingFormData')
                      localStorage.removeItem('partnerOnboardingToken')
                      localStorage.removeItem('partnerOnboardingPartnerData')
                      
                      // Reload the page to start fresh
                      window.location.href = '/partner/onboard'
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  New Register
                </motion.button>
              </div>
            </div>
          )
        }

        // Show plan selection if no plan selected yet
        return (
          <div className="space-y-6">
            {/* Show Activated Plan Section if plan already selected */}
            {formData.selectedPlan && selectedPlanMeta && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Your Activated Plan</h3>
                      <p className="text-sm text-green-600">Currently active and receiving leads</p>
                    </div>
                  </div>
                  <div className="text-4xl">{selectedPlanMeta.icon}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-2xl font-bold text-primary">{formData.selectedPlan} Plan</h4>
                    <span className="text-2xl font-bold text-green-600">₹{selectedPlanMeta.price.toLocaleString('en-IN')}/mo</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Guaranteed Leads</p>
                      <p className="text-xl font-bold text-green-700">{selectedPlanMeta.leads}/month</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                      <p className="text-xl font-bold text-blue-700">{selectedPlanMeta.commission}%</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Lead Fee</p>
                      <p className="text-xl font-bold text-purple-700">₹{selectedPlanMeta.leadFee}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Min Wallet Balance</p>
                      <p className="text-xl font-bold text-orange-700">₹{selectedPlanMeta.minWalletBalance}</p>
                    </div>
                  </div>
                  
                  {selectedPlanMeta.features?.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Plan Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlanMeta.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                  <FaCheckCircle />
                  <span className="font-medium">Plan is active and you're receiving leads</span>
                </div>
              </motion.div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">
                {formData.selectedPlan ? 'Change Your MG Plan' : 'Choose Your MG Plan'}
              </h2>
              <p className="text-gray-600">
                {formData.selectedPlan 
                  ? 'Select a different plan below to upgrade or change your subscription'
                  : 'Select a Minimum Guarantee plan to get started'
                }
              </p>
              {formData.partnerType && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-2xl">{formData.partnerType === 'individual' ? '👤' : '🏢'}</span>
                  <span className="text-sm font-semibold text-blue-700">
                    Showing plans for {formData.partnerType === 'individual' ? 'Individual' : 'Franchise'} Partners
                  </span>
                </div>
              )}
            </div>

            {loadingMGPlans ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                <p className="text-gray-600">Loading available plans...</p>
              </div>
            ) : mgPlans.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <p className="text-gray-600 font-medium mb-2">No MG Plans Available</p>
                <p className="text-sm text-gray-500">
                  {formData.partnerType 
                    ? `No plans available for ${formData.partnerType === 'individual' ? 'Individual' : 'Franchise'} partners yet.`
                    : 'No Minimum Guarantee plans have been configured yet.'
                  } Please contact admin or skip this step.
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mgPlans.map((plan) => {
                const planId = plan._id || plan.id
                return (
                <motion.button
                  key={plan.name}
                  onClick={async () => {
                    setFormData(prev => ({ ...prev, selectedPlan: plan.name, selectedPlanId: planId || null }))
                    setLoading(true)
                    setError(null)
                    
                    try {
                      // Subscribe to plan
                      if (token && planId) {
                        const subscribeResponse = await partnerApi.subscribeToPlan(token, planId)
                        if (subscribeResponse.success) {
                          setFormData(prev => ({ ...prev, selectedPlanId: planId }))
                          
                          // Create lead when plan is selected (for Lead Marketplace flow)
                          // The backend subscribeToPlan will handle lead creation if fromLeads
                          // But we can also create it here as a backup
                          if (fromLeads && formData.categories && formData.categories.length > 0 && formData.city) {
                            try {
                              // Lead creation is handled by backend in subscribeToPlan
                              // when metadata indicates fromLeads
                              console.log('Plan subscribed, lead should be created by backend')
                            } catch (leadErr) {
                              console.error('Error creating lead after plan selection:', leadErr)
                              // Don't block plan subscription if lead creation fails
                            }
                          }
                        }
                      } else if (token) {
                        // Fallback: fetch plans and find by name
                        const plansResponse = await partnerApi.getMGPlans(token)
                        const selectedPlanData = plansResponse.data?.find(p => p.name === plan.name)
                        if (selectedPlanData) {
                          const subscribeResponse = await partnerApi.subscribeToPlan(token, selectedPlanData._id)
                          if (subscribeResponse.success) {
                            setFormData(prev => ({ ...prev, selectedPlanId: selectedPlanData._id }))
                          }
                        }
                      }
                      
                      // Redirect to WhatsApp for payment assistance (if not from leads)
                      if (!fromLeads) {
                        const message = "Hi, I need help with partner plan subscription payment."
                        const whatsappUrl = `https://wa.aisensy.com/+15558136145?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                      }
                      
                      // Stay on same step to show success message
                      // The UI will automatically show success content since selectedPlan is now set
                      setError(null)
                    } catch (err) {
                      console.error('Failed to subscribe to plan:', err)
                      setError('Failed to subscribe to plan. Please try again.')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  className={`${plan.color} border-2 rounded-2xl p-6 text-left transition relative ${
                    formData.selectedPlan === plan.name 
                      ? `${plan.borderColor} border-4 shadow-lg ring-4 ring-green-200` 
                      : 'border-gray-200 hover:border-primary'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {formData.selectedPlan === plan.name && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                      <FaCheckCircle />
                      Active Plan
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{plan.icon}</div>
                    {plan.partnerType === 'both' && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        All Partners
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xl text-gray-800 mb-2">{plan.name}</div>
                  <div className="text-3xl font-bold text-primary mb-3">₹{plan.price.toLocaleString('en-IN')}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-gray-700">{plan.leads} Leads/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-gray-700">{plan.commission}% Commission</span>
                    </div>
                    {plan.leadFee && (
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-gray-700">Lead Fee ₹{plan.leadFee}</span>
                      </div>
                    )}
                    {plan.minWalletBalance && (
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-gray-700">Min Wallet ₹{plan.minWalletBalance}</span>
                      </div>
                    )}
                  </div>
                  {plan.features?.length ? (
                    <ul className="mt-4 space-y-1 text-xs text-gray-600">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <FaCheckCircle className="text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {formData.selectedPlan === plan.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <FaCheckCircle className="text-primary text-2xl mx-auto" />
                    </motion.div>
                  )}
                </motion.button>
                )
              })}
            </div>
            )}

            {formData.selectedPlan ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <p className="text-green-800 font-bold text-lg">Your {formData.selectedPlan} Plan is Active</p>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  You're currently receiving leads with this plan. Click on any other plan above to upgrade or change your subscription.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-green-600">
                  <span className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    Leads Active
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    Commission Enabled
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">Please select a plan to continue</p>
            )}
          </div>
        )


      case 12:
        // Plan Selection - MG Plans for regular flow, Lead Plans for leadsneed flow
        if (fromLeadsneed) {
          // Lead Plan Selection for leadsneed flow
          
          // Show "Already Subscribed" message if partner has active lead plan
          if (existingLeadPlan && existingLeadPlan.status === 'active') {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <FaCheckCircle className="text-4xl text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-primary mb-2">Already Subscribed!</h2>
                  <p className="text-gray-600 mb-6">
                    You already have an active lead plan subscription. You're all set to receive quality leads!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <FaBullseye className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Your Active Lead Plan</h3>
                        <p className="text-sm text-green-600">Currently receiving leads</p>
                      </div>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-2xl font-bold text-primary">{existingLeadPlan.planName || 'Lead Plan'}</h4>
                      <span className="text-lg font-bold text-green-600">Active</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Leads Quota</p>
                        <p className="text-xl font-bold text-green-700">{existingLeadPlan.leadsQuota || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Leads Used</p>
                        <p className="text-xl font-bold text-blue-700">{existingLeadPlan.leadsUsed || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Subscribed</p>
                        <p className="text-sm font-bold text-purple-700">
                          {existingLeadPlan.subscribedAt ? new Date(existingLeadPlan.subscribedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Expires</p>
                        <p className="text-sm font-bold text-orange-700">
                          {existingLeadPlan.expiresAt ? new Date(existingLeadPlan.expiresAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <FaCheckCircle />
                    <span className="font-medium">Your lead plan is active and you're receiving leads</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      handleWhatsAppClick(e)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                  >
                    <FaWhatsapp className="text-lg" />
                    Contact Support
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to start a new registration? This will clear all saved data from this device.')) {
                        // Clear all localStorage data
                        localStorage.removeItem('partnerOnboardingStep')
                        localStorage.removeItem('partnerOnboardingFormData')
                        localStorage.removeItem('partnerOnboardingToken')
                        localStorage.removeItem('partnerOnboardingPartnerData')
                        
                        // Reload the page to start fresh
                        window.location.href = '/partner/onboard'
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                  >
                    New Register
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )
          }
          
          // Show lead plan selection if no active subscription
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FaBullseye className="text-4xl text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-2">Choose Your Lead Plan</h2>
                <p className="text-gray-600 mb-6">
                  Select a lead plan that matches your business needs and start receiving quality leads.
                </p>
              </div>

              {loadingLeadPlans ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading lead plans...</p>
                </div>
              ) : leadPlans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600 text-lg font-medium mb-2">No lead plans available</p>
                  <p className="text-gray-500 text-sm">Please contact admin to set up lead plans.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leadPlans.map((plan) => (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`${plan.color} border-2 rounded-2xl p-6 transition-all duration-300 ${
                        formData.selectedLeadPlan === plan.name 
                          ? `${plan.borderColor} border-4 shadow-2xl` 
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                      } ${plan.name === 'Gold' ? 'scale-105 lg:scale-105 sm:scale-100' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{plan.icon}</div>
                        {plan.name === 'Gold' && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.leads} Quality Leads/month</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>₹{plan.leadFee} per lead fee</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.leadQuality} quality leads</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.responseTime} response time</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.supportLevel} support</span>
                        </li>
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <motion.button
                        onClick={async () => {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedLeadPlan: plan.name, 
                            selectedLeadPlanId: plan._id 
                          }))
                          setLoading(true)
                          setError(null)
                          
                          try {
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
                              (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)
                            
                            const response = await fetch(`${API_BASE_URL}/api/partner/lead-plans/subscribe`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                planId: plan._id,
                                fromLeadNeed: true
                              })
                            })

                            const result = await response.json()
                            
                            if (result.success && result.data) {
                              // Create PayU form and submit
                              const paymentData = result.data
                              const form = document.createElement('form')
                              form.method = 'POST'
                              form.action = paymentData.action
                              
                              // Add all PayU parameters as hidden inputs
                              Object.keys(paymentData).forEach(key => {
                                if (key !== 'action' && key !== 'planDetails') {
                                  const input = document.createElement('input')
                                  input.type = 'hidden'
                                  input.name = key
                                  input.value = paymentData[key]
                                  form.appendChild(input)
                                }
                              })
                              
                              document.body.appendChild(form)
                              form.submit()
                            } else {
                              setError(result.message || 'Failed to initiate payment for lead plan')
                            }
                          } catch (err) {
                            console.error('Failed to initiate lead plan payment:', err)
                            setError('Failed to initiate payment. Please try again.')
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.name === 'Gold'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
                            : formData.selectedLeadPlan === plan.name
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : formData.selectedLeadPlan === plan.name ? (
                          <>
                            <FaCheckCircle />
                            Selected
                          </>
                        ) : (
                          <>
                            <FaBullseye />
                            Choose {plan.name}
                          </>
                        )}
                      </motion.button>
                      
                      {plan.name === 'Custom' && plan.customPricing && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Custom Pricing:</p>
                          <p className="text-sm font-semibold">₹{plan.customPricing.pricePerLead}/lead</p>
                          <p className="text-xs text-gray-500">Min {plan.customPricing.minimumCommitment} months</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Lead Plan Terms */}
              {leadPlans.length > 0 && leadPlans[0].termsAndConditions && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Plan Terms & Conditions</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {leadPlans[0].termsAndConditions}
                  </div>
                </div>
              )}
            </div>
          )
        } else if (fromLeads) {
          // Already Registered - for Lead Marketplace flow when registration is complete
          return (
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <FaUserCheck className="text-4xl text-green-600" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">You're Already Registered!</h2>
                <p className="text-gray-600 mb-6">
                  Your partner profile is already complete. You can proceed to subscribe to a plan or manage your account.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6">
                <div className="text-sm text-gray-600 mb-2">Your Partner ID</div>
                <div className="text-3xl font-bold text-primary">{partnerId || partnerData?._id?.toString().slice(-8) || partnerData?.partnerId || 'PRT-XXXXXX'}</div>
              </div>

              {formData.categoryNames && formData.categoryNames.length > 0 && (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Categories</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {formData.categoryNames.map((catName, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold">
                        {catName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Activated Plan Section if plan exists */}
              {formData.selectedPlan && selectedPlanMeta ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-2xl" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-green-800">Your Activated Plan</h3>
                        <p className="text-sm text-green-600">Currently active and receiving leads</p>
                      </div>
                    </div>
                    <div className="text-4xl">{selectedPlanMeta.icon}</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-2xl font-bold text-primary">{formData.selectedPlan} Plan</h4>
                      <span className="text-2xl font-bold text-green-600">₹{selectedPlanMeta.price.toLocaleString('en-IN')}/mo</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Guaranteed Leads</p>
                        <p className="text-xl font-bold text-green-700">{selectedPlanMeta.leads}/month</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                        <p className="text-xl font-bold text-blue-700">{selectedPlanMeta.commission}%</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Lead Fee</p>
                        <p className="text-xl font-bold text-purple-700">₹{selectedPlanMeta.leadFee}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Min Wallet Balance</p>
                        <p className="text-xl font-bold text-orange-700">₹{selectedPlanMeta.minWalletBalance}</p>
                      </div>
                    </div>
                    
                    {selectedPlanMeta.features?.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Plan Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlanMeta.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <FaCheckCircle />
                    <span className="font-medium">Plan is active and you're receiving leads</span>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your MG Plan</h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-6">
                        You haven't subscribed to a plan yet. Choose a plan to start receiving leads!
                      </p>
                    </div>
                    
                    {/* Static Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {defaultMGPlans.map((plan) => {
                        return (
                          <motion.button
                            key={plan.name}
                            onClick={async () => {
                              setFormData(prev => ({ ...prev, selectedPlan: plan.name, selectedPlanId: null }))
                              setLoading(true)
                              setError(null)
                              
                              try {
                                // For static plans, we need to find the matching plan from API
                                if (token) {
                                  const plansResponse = await partnerApi.getMGPlans(token)
                                  const selectedPlanData = plansResponse.data?.find(p => p.name === plan.name)
                                  if (selectedPlanData) {
                                    const subscribeResponse = await partnerApi.subscribeToPlan(token, selectedPlanData._id)
                                    if (subscribeResponse.success) {
                                      setFormData(prev => ({ ...prev, selectedPlanId: selectedPlanData._id }))
                                      
                                      // Create lead when plan is selected (for Lead Marketplace flow)
                                      if (fromLeads && formData.categories && formData.categories.length > 0 && formData.city) {
                                        console.log('Plan subscribed, lead should be created by backend')
                                      }
                                      
                                      // Go to success page with thanks message instead of reloading
                                      setCurrentStep(11)
                                      setError(null)
                                    }
                                  } else {
                                    setError(`Plan "${plan.name}" not available. Please contact support.`)
                                  }
                                } else {
                                  setError('Please login to subscribe to a plan')
                                }
                              } catch (err) {
                                console.error('Failed to subscribe to plan:', err)
                                setError('Failed to subscribe to plan. Please try again.')
                              } finally {
                                setLoading(false)
                              }
                            }}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.95 }}
                            className={`${plan.color} border-2 rounded-2xl p-6 text-left transition ${
                              formData.selectedPlan === plan.name 
                                ? `${plan.borderColor} border-4 shadow-lg` 
                                : 'border-gray-200 hover:border-primary'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="text-4xl mb-3">{plan.icon}</div>
                            <div className="font-bold text-xl text-gray-800 mb-2">{plan.name}</div>
                            <div className="text-3xl font-bold text-primary mb-3">₹{plan.price.toLocaleString('en-IN')}</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-700">{plan.leads} Leads/month</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-700">{plan.commission}% Commission</span>
                              </div>
                              {plan.leadFee && (
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span className="text-gray-700">Lead Fee ₹{plan.leadFee}</span>
                                </div>
                              )}
                              {plan.minWalletBalance && (
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span className="text-gray-700">Min Wallet ₹{plan.minWalletBalance}</span>
                                </div>
                              )}
                            </div>
                            {plan.features?.length ? (
                              <ul className="mt-4 space-y-1 text-xs text-gray-600">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <FaCheckCircle className="text-primary" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {formData.selectedPlan === plan.name && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-4"
                              >
                                <FaCheckCircle className="text-primary text-2xl mx-auto" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <motion.button
                  
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
                >
                  New Register
                </motion.button>
              </div>
            </div>
          )
        }

      case 13:
        // Plan Selection - MG Plans for regular flow, Lead Plans for leadsneed flow
        if (fromLeadsneed) {
          // Lead Plan Selection for leadsneed flow
          
          // Show "Already Subscribed" message if partner has active lead plan
          if (existingLeadPlan && existingLeadPlan.status === 'active') {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <FaCheckCircle className="text-4xl text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-primary mb-2">Already Subscribed!</h2>
                  <p className="text-gray-600 mb-6">
                    You already have an active lead plan subscription. You're all set to receive quality leads!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <FaBullseye className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Your Active Lead Plan</h3>
                        <p className="text-sm text-green-600">Currently receiving leads</p>
                      </div>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-2xl font-bold text-primary">{existingLeadPlan.planName || 'Lead Plan'}</h4>
                      <span className="text-lg font-bold text-green-600">Active</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Leads Quota</p>
                        <p className="text-xl font-bold text-green-700">{existingLeadPlan.leadsQuota || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Leads Used</p>
                        <p className="text-xl font-bold text-blue-700">{existingLeadPlan.leadsUsed || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Subscribed</p>
                        <p className="text-sm font-bold text-purple-700">
                          {existingLeadPlan.subscribedAt ? new Date(existingLeadPlan.subscribedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Expires</p>
                        <p className="text-sm font-bold text-orange-700">
                          {existingLeadPlan.expiresAt ? new Date(existingLeadPlan.expiresAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <FaCheckCircle />
                    <span className="font-medium">Your lead plan is active and you're receiving leads</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      handleWhatsAppClick(e)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                  >
                    <FaWhatsapp className="text-lg" />
                    Contact Support
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to start a new registration? This will clear all saved data from this device.')) {
                        // Clear all localStorage data
                        localStorage.removeItem('partnerOnboardingStep')
                        localStorage.removeItem('partnerOnboardingFormData')
                        localStorage.removeItem('partnerOnboardingToken')
                        localStorage.removeItem('partnerOnboardingPartnerData')
                        
                        // Reload the page to start fresh
                        window.location.href = '/partner/onboard'
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                  >
                    New Register
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )
          }
          
          // Show lead plan selection if no active subscription
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FaBullseye className="text-4xl text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-2">Choose Your Lead Plan</h2>
                <p className="text-gray-600 mb-6">
                  Select a lead plan that matches your business needs and start receiving quality leads.
                </p>
              </div>

              {loadingLeadPlans ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading lead plans...</p>
                </div>
              ) : leadPlans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600 text-lg font-medium mb-2">No lead plans available</p>
                  <p className="text-gray-500 text-sm">Please contact admin to set up lead plans.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leadPlans.map((plan) => (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`${plan.color} border-2 rounded-2xl p-6 transition-all duration-300 ${
                        formData.selectedLeadPlan === plan.name 
                          ? `${plan.borderColor} border-4 shadow-2xl` 
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                      } ${plan.name === 'Gold' ? 'scale-105 lg:scale-105 sm:scale-100' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{plan.icon}</div>
                        {plan.name === 'Gold' && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.leads} Quality Leads/month</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>₹{plan.leadFee} per lead fee</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.leadQuality} quality leads</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.responseTime} response time</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.supportLevel} support</span>
                        </li>
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <motion.button
                        onClick={async () => {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedLeadPlan: plan.name, 
                            selectedLeadPlanId: plan._id 
                          }))
                          setLoading(true)
                          setError(null)
                          
                          try {
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
                              (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)
                            
                            const response = await fetch(`${API_BASE_URL}/api/partner/lead-plans/subscribe`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                planId: plan._id,
                                fromLeadNeed: true
                              })
                            })

                            const result = await response.json()
                            
                            if (result.success && result.data) {
                              // Create PayU form and submit
                              const paymentData = result.data
                              const form = document.createElement('form')
                              form.method = 'POST'
                              form.action = paymentData.action
                              
                              // Add all PayU parameters as hidden inputs
                              Object.keys(paymentData).forEach(key => {
                                if (key !== 'action' && key !== 'planDetails') {
                                  const input = document.createElement('input')
                                  input.type = 'hidden'
                                  input.name = key
                                  input.value = paymentData[key]
                                  form.appendChild(input)
                                }
                              })
                              
                              document.body.appendChild(form)
                              form.submit()
                            } else {
                              setError(result.message || 'Failed to initiate payment for lead plan')
                            }
                          } catch (err) {
                            console.error('Failed to initiate lead plan payment:', err)
                            setError('Failed to initiate payment. Please try again.')
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.name === 'Gold'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
                            : formData.selectedLeadPlan === plan.name
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : formData.selectedLeadPlan === plan.name ? (
                          <>
                            <FaCheckCircle />
                            Selected
                          </>
                        ) : (
                          <>
                            <FaBullseye />
                            Choose {plan.name}
                          </>
                        )}
                      </motion.button>
                      
                      {plan.name === 'Custom' && plan.customPricing && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Custom Pricing:</p>
                          <p className="text-sm font-semibold">₹{plan.customPricing.pricePerLead}/lead</p>
                          <p className="text-xs text-gray-500">Min {plan.customPricing.minimumCommitment} months</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Lead Plan Terms */}
              {leadPlans.length > 0 && leadPlans[0].termsAndConditions && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Plan Terms & Conditions</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {leadPlans[0].termsAndConditions}
                  </div>
                </div>
              )}
            </div>
          )
        } else if (fromLeads) {
          // Already Registered - for Lead Marketplace flow when registration is complete
          return (
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <FaUserCheck className="text-4xl text-green-600" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">You're Already Registered!</h2>
                <p className="text-gray-600 mb-6">
                  Your partner profile is already complete. You can proceed to subscribe to a plan or manage your account.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6">
                <div className="text-sm text-gray-600 mb-2">Your Partner ID</div>
                <div className="text-3xl font-bold text-primary">{partnerId || partnerData?._id?.toString().slice(-8) || partnerData?.partnerId || 'PRT-XXXXXX'}</div>
              </div>

              {formData.categoryNames && formData.categoryNames.length > 0 && (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Categories</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {formData.categoryNames.map((catName, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold">
                        {catName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Activated Plan Section if plan exists */}
              {formData.selectedPlan && selectedPlanMeta ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-2xl" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-green-800">Your Activated Plan</h3>
                        <p className="text-sm text-green-600">Currently active and receiving leads</p>
                      </div>
                    </div>
                    <div className="text-4xl">{selectedPlanMeta.icon}</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-2xl font-bold text-primary">{formData.selectedPlan} Plan</h4>
                      <span className="text-2xl font-bold text-green-600">₹{selectedPlanMeta.price.toLocaleString('en-IN')}/mo</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Guaranteed Leads</p>
                        <p className="text-xl font-bold text-green-700">{selectedPlanMeta.leads}/month</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                        <p className="text-xl font-bold text-blue-700">{selectedPlanMeta.commission}%</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Lead Fee</p>
                        <p className="text-xl font-bold text-purple-700">₹{selectedPlanMeta.leadFee}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Min Wallet Balance</p>
                        <p className="text-xl font-bold text-orange-700">₹{selectedPlanMeta.minWalletBalance}</p>
                      </div>
                    </div>
                    
                    {selectedPlanMeta.features?.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Plan Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlanMeta.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <FaCheckCircle />
                    <span className="font-medium">Plan is active and you're receiving leads</span>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Your MG Plan</h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-6">
                        You haven't subscribed to a plan yet. Choose a plan to start receiving leads!
                      </p>
                    </div>
                    
                    {/* Static Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {defaultMGPlans.map((plan) => {
                        return (
                          <motion.button
                            key={plan.name}
                            onClick={async () => {
                              setFormData(prev => ({ ...prev, selectedPlan: plan.name, selectedPlanId: null }))
                              setLoading(true)
                              setError(null)
                              
                              try {
                                // For static plans, we need to find the matching plan from API
                                if (token) {
                                  const plansResponse = await partnerApi.getMGPlans(token)
                                  const selectedPlanData = plansResponse.data?.find(p => p.name === plan.name)
                                  if (selectedPlanData) {
                                    const subscribeResponse = await partnerApi.subscribeToPlan(token, selectedPlanData._id)
                                    if (subscribeResponse.success) {
                                      setFormData(prev => ({ ...prev, selectedPlanId: selectedPlanData._id }))
                                      
                                      // Create lead when plan is selected (for Lead Marketplace flow)
                                      if (fromLeads && formData.categories && formData.categories.length > 0 && formData.city) {
                                        console.log('Plan subscribed, lead should be created by backend')
                                      }
                                      
                                      // Go to success page with thanks message instead of reloading
                                      setCurrentStep(11)
                                      setError(null)
                                    }
                                  } else {
                                    setError(`Plan "${plan.name}" not available. Please contact support.`)
                                  }
                                } else {
                                  setError('Please login to subscribe to a plan')
                                }
                              } catch (err) {
                                console.error('Failed to subscribe to plan:', err)
                                setError('Failed to subscribe to plan. Please try again.')
                              } finally {
                                setLoading(false)
                              }
                            }}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.95 }}
                            className={`${plan.color} border-2 rounded-2xl p-6 text-left transition ${
                              formData.selectedPlan === plan.name 
                                ? `${plan.borderColor} border-4 shadow-lg` 
                                : 'border-gray-200 hover:border-primary'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="text-4xl mb-3">{plan.icon}</div>
                            <div className="font-bold text-xl text-gray-800 mb-2">{plan.name}</div>
                            <div className="text-3xl font-bold text-primary mb-3">₹{plan.price.toLocaleString('en-IN')}</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-700">{plan.leads} Leads/month</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-700">{plan.commission}% Commission</span>
                              </div>
                              {plan.leadFee && (
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span className="text-gray-700">Lead Fee ₹{plan.leadFee}</span>
                                </div>
                              )}
                              {plan.minWalletBalance && (
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <span className="text-gray-700">Min Wallet ₹{plan.minWalletBalance}</span>
                                </div>
                              )}
                            </div>
                            {plan.features?.length ? (
                              <ul className="mt-4 space-y-1 text-xs text-gray-600">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <FaCheckCircle className="text-primary" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {formData.selectedPlan === plan.name && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-4"
                              >
                                <FaCheckCircle className="text-primary text-2xl mx-auto" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <motion.button
                  
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
                >
                  New Register
                </motion.button>
              </div>
            </div>
          )
        } else {
          // Regular partner onboarding flow - MG Plan Selection
          
          // Check if partner already has an MG plan and auto-skip
          if (formData.selectedPlan && formData.selectedPlanId) {
            // Partner already has an MG plan, show success message and skip plan selection
            return (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <FaCheckCircle className="text-4xl text-green-600" />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-primary mb-2">MG Plan Already Active!</h2>
                  <p className="text-gray-600 mb-6">
                    You already have an active MG plan subscription. Your plan is working and you're receiving leads.
                  </p>
                </div>

                {/* Show Current Plan Details */}
                {selectedPlanMeta && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 max-w-md mx-auto"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-green-800">Your Active Plan</h3>
                          <p className="text-sm text-green-600">Currently receiving leads</p>
                        </div>
                      </div>
                      <div className="text-4xl">{selectedPlanMeta.icon}</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-2xl font-bold text-primary">{formData.selectedPlan} Plan</h4>
                        <span className="text-lg font-bold text-green-600">Active</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Guaranteed Leads</p>
                          <p className="text-xl font-bold text-green-700">{selectedPlanMeta.leads}/month</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                          <p className="text-xl font-bold text-blue-700">{selectedPlanMeta.commission}%</p>
                        </div>
                      </div>
                      
                      {selectedPlanMeta.features?.length > 0 && (
                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Plan Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlanMeta.features.map((feature, idx) => (
                              <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                ✓ {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                      <FaCheckCircle />
                      <span className="font-medium">Your MG plan is active and working</span>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      // Auto-skip MG plan since already subscribed
                      setMgPlanSkipped(true)
                      setCurrentStep(11)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                  >
                    Continue to Dashboard
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </motion.button>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">Need to change your plan?</div>
                      <div className="text-gray-600">You can upgrade or modify your MG plan from your partner dashboard.</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          // Show MG plan selection for partners without active plans
          return (
            <div className="space-y-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FaUserCheck className="text-4xl text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-2">Choose Your MG Plan</h2>
                <p className="text-gray-600 mb-6">
                  Select a plan that matches your business needs and start receiving leads.
                </p>
              </div>

              {loadingMGPlans ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading MG plans...</p>
                </div>
              ) : mgPlans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600 text-lg font-medium mb-2">No MG plans available</p>
                  <p className="text-gray-500 text-sm">Please contact admin to set up MG plans.</p>
                  
                  {/* Show default plans as fallback */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {defaultMGPlans.map((plan) => (
                        <motion.div
                          key={plan.name}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`${plan.color} border-2 rounded-2xl p-6 text-left transition ${plan.borderColor}`}
                        >
                          <div className="text-4xl mb-3">{plan.icon}</div>
                          <div className="font-bold text-xl text-gray-800 mb-2">{plan.name}</div>
                          <div className="text-3xl font-bold text-primary mb-3">₹{plan.price.toLocaleString('en-IN')}</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-500" />
                              <span className="text-gray-700">{plan.leads} Leads/month</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="text-green-500" />
                              <span className="text-gray-700">{plan.commission}% Commission</span>
                            </div>
                            {plan.features?.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 text-center">
                            <span className="text-sm text-gray-500">Contact admin to activate</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mgPlans.map((plan) => (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className={`${plan.color} border-2 rounded-2xl p-6 transition-all duration-300 ${
                        formData.selectedPlan === plan.name 
                          ? `${plan.borderColor} border-4 shadow-2xl` 
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                      } ${plan.name === 'Gold' ? 'scale-105 lg:scale-105 sm:scale-100' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{plan.icon}</div>
                        {plan.name === 'Gold' && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.leads} Guaranteed Leads/month</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span>{plan.commission}% Commission Rate</span>
                        </li>
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <motion.button
                        onClick={async () => {
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedPlan: plan.name, 
                            selectedPlanId: plan._id 
                          }))
                          setLoading(true)
                          setError(null)
                          
                          try {
                            const subscribeResponse = await partnerApi.subscribeToPlan(token, plan._id)
                            if (subscribeResponse.success) {
                              // Go to success page
                              setCurrentStep(11)
                              setError(null)
                            } else {
                              setError(subscribeResponse.message || 'Failed to subscribe to plan')
                            }
                          } catch (err) {
                            console.error('Failed to subscribe to plan:', err)
                            setError('Failed to subscribe to plan. Please try again.')
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.name === 'Gold'
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg'
                            : formData.selectedPlan === plan.name
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : formData.selectedPlan === plan.name ? (
                          <>
                            <FaCheckCircle />
                            Selected
                          </>
                        ) : (
                          <>
                            <FaUserCheck />
                            Choose {plan.name}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Skip Option */}
              <div className="text-center">
                <motion.button
                  onClick={() => {
                    setMgPlanSkipped(true)
                    setCurrentStep(11)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-primary transition underline"
                >
                  Skip for now - I'll choose a plan later
                </motion.button>
              </div>
            </div>
          )
        }

      default:
        return null
    }
  }

  return (
    <>
      <SEO 
        title="Partner Onboarding | NEXO"
        description="Join NEXO as a service partner. Complete your registration in simple steps."
        keywords="partner onboarding, become partner, service partner registration"
        url="/partner/onboard"
      />

      {/* PayU Payment Component */}
      {payuPaymentData && (
        <PayUPayment
          paymentData={payuPaymentData}
          onSuccess={() => {
            setPayuPaymentData(null)
            setProcessingPayment(false)
          }}
          onFailure={() => {
            setPayuPaymentData(null)
            setProcessingPayment(false)
            setError('Payment failed. Please try again.')
          }}
        />
      )}

      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-4 sm:px-6 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {currentStep < 11 && currentStep !== 12 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Step {currentStep} of {(fromLeads || fromLeadsneed) ? totalSteps - 2 : totalSteps - 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-primary">
                  {Math.round((currentStep / ((fromLeads || fromLeadsneed) ? totalSteps - 2 : totalSteps - 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className="bg-primary h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / ((fromLeads || fromLeadsneed) ? totalSteps - 2 : totalSteps - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 12 && currentStep !== 13 && (
              <div className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaArrowLeft /> Previous
                </button>

                {currentStep === 2 ? (
                  <button
                    onClick={handleCompleteProfile}
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Save & Continue'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 3 ? (
                  <button
                    onClick={handleCompleteKYC}
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Upload & Continue'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 4 ? (
                  <button
                    onClick={handleSaveCategories}
                    disabled={loading || formData.categories.length === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Save Categories & Continue'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 6 ? (
                  <button
                    onClick={async () => {
                      if (fromLeads || fromLeadsneed) {
                        // For Lead Marketplace and Lead Need flow, complete registration without payment
                        await handleCompleteRegistrationWithoutPayment()
                      } else {
                        // Regular flow - check if payment already completed
                      setLoading(true)
                      try {
                        if (token && formData.terms.signature) {
                          // You can add API call here to save terms acceptance
                          // await partnerApi.acceptTerms(token, {
                          //   signature: formData.terms.signature,
                          //   acceptedAt: new Date().toISOString()
                          // })
                        }
                        
                        // Check if payment is already completed
                        if (token) {
                          try {
                            const profileResponse = await partnerApi.getProfile(token)
                            if (profileResponse.success && profileResponse.profile) {
                              const profile = profileResponse.profile
                              const paymentCompleted = 
                                profile.paymentApproved === true || 
                                profile.registerdFee === true ||
                                profile.profile?.paymentApproved === true ||
                                profile.profile?.registerdFee === true
                              
                              if (paymentCompleted) {
                                console.log('✅ Payment already completed, skipping payment step')
                                // Skip payment step and go directly to step 8 (payment confirmation)
                                setFormData(prev => ({
                                  ...prev,
                                  payment: {
                                    ...prev.payment,
                                    status: 'completed',
                                    payId: profile.profile?.payId || profile.payId || 'COMPLETED'
                                  }
                                }))
                                setCurrentStep(9) // Go directly to profile review
                                setLoading(false)
                                return
                              }
                            }
                          } catch (checkError) {
                            console.error('Error checking payment status:', checkError)
                            // Continue to payment step if check fails
                          }
                        }
                        
                        // Payment not completed, go to payment step
                        setCurrentStep(7)
                      } catch (err) {
                        setError(err.message || 'Failed to accept terms')
                      } finally {
                        setLoading(false)
                        }
                      }
                    }}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : (fromLeads || fromLeadsneed) ? 'Complete Registration' : 'Accept & Continue'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 7 && !(fromLeads || fromLeadsneed) ? (
                  <button
                    onClick={handleCompletePayment}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Complete Payment'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 8 && formData.payment.status !== 'failed' ? (
                  <button
                    onClick={handleUpdatePaymentConfirmation}
                    disabled={loading || !formData.payment.payId}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Confirm Payment & Continue'} <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : currentStep === 9 ? (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={nextStep}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Yes, Choose MG Plan <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    </button>
                    <button
                      onClick={() => {
                        // Skip MG Plan and go to final step
                        setMgPlanSkipped(true)
                        setCurrentStep(11)
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Skip for Now
                    </button>
                  </div>
                ) : currentStep === 10 ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PartnerOnboardingForm

