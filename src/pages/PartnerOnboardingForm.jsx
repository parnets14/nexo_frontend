import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, 
  FaUpload, 
  FaShoppingCart,
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
  FaUser
} from 'react-icons/fa'
import SEO from '../components/SEO'
import { partnerApi } from '../services/partnerApi'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'
import { useComingSoon } from '../contexts/ComingSoonContext'

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

const PartnerOnboardingForm = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const fromLeads = searchParams.get('from') === 'leads' || location.state?.fromLeads
  
  const [currentStep, setCurrentStep] = useState(1)
  const [token, setToken] = useState(null)
  const [partnerData, setPartnerData] = useState(null)
  const [formData, setFormData] = useState({
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
      registrationFee: 500,
      securityDeposit: 1000,
      total: 1500,
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
  const whatsappNumber = '919590926068'
  const handleWhatsAppClick = useWhatsAppClick()
  const { openDialog: openComingSoon } = useComingSoon()

  const totalSteps = 11
  const selectedPlanMeta = mgPlans.find((plan) => plan.name === formData.selectedPlan)

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

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

  // Fetch Pricing Settings when on payment step
  useEffect(() => {
    const fetchPricingSettings = async () => {
      if (currentStep === 5) {
        try {
          const response = await partnerApi.getPricingSettings()
          if (response.success && response.data) {
            // Ensure refundable fields are set (backend should always provide these, but ensure they exist)
            const pricingData = {
              ...response.data,
              registrationFeeRefundable: response.data.registrationFeeRefundable !== undefined ? Boolean(response.data.registrationFeeRefundable) : false,
              securityDepositRefundable: response.data.securityDepositRefundable !== undefined ? Boolean(response.data.securityDepositRefundable) : false,
              toolkitPriceRefundable: response.data.toolkitPriceRefundable !== undefined ? Boolean(response.data.toolkitPriceRefundable) : false
            }
            setPricingSettings(pricingData)
            // Update form data with fetched fees
            setFormData(prev => {
              const registrationFee = response.data.registrationFee || 500
              const securityDeposit = response.data.securityDeposit || 1000
              const toolkitPrice = response.data.toolkitPrice || 2499
              const toolkitSelected = prev.toolkit.selected
              
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
    }
    fetchPricingSettings()
  }, [currentStep])

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

  // Fetch MG Plans when token is available and on step 10
  useEffect(() => {
    const fetchPlans = async () => {
      if (token && currentStep === 10) {
        setLoadingMGPlans(true)
        try {
          const response = await partnerApi.getMGPlans(token)
          if (response.success && response.data && Array.isArray(response.data)) {
            // Map admin-configured plans dynamically
            setMgPlans(response.data.map(plan => {
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
                borderColor: plan.borderColor || borderColor
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
    }
    fetchPlans()
  }, [token, currentStep])

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
      alert(`OTP sent to ${formData.phone}. OTP: ${response.otp}`) // Remove in production
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
                setCurrentStep(12) // Already Registered step
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
                  setCurrentStep(8) // MG Plan selection
                }
              }
            } else {
              // Regular onboarding flow
              if (isProfileCompleted && hasPayment && hasMGPlan) {
                // Everything completed
                setCurrentStep(11) // Success page
              } else if (isProfileCompleted && hasPayment && !hasMGPlan) {
                // Payment done, need MG Plan
                setCurrentStep(8) // MG Plan selection
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
    // Show coming soon dialog instead of opening WhatsApp
    openComingSoon()
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
        id: partnerData?._id,
        registerAmount: registrationFee, // Registration fee only, not total
        payId: formData.payment.payId,
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
        
        setCurrentStep(8) // Move to MG Plan selection
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
      // Skip payment step (7) if coming from Lead Marketplace
      if (fromLeads && currentStep === 6) {
        // After terms, complete registration without payment and go to MG Plan (step 10)
        handleCompleteRegistrationWithoutPayment()
      } else if (fromLeads && currentStep === 7) {
        // Skip step 7 (payment) entirely
        setCurrentStep(8)
      } else {
      setCurrentStep(prev => prev + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      // Skip payment step (7) when going back if from Lead Marketplace
      if (fromLeads && currentStep === 8) {
        setCurrentStep(6) // Go back to terms from MG Plan
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
        // This will help track partners who registered from Lead Marketplace
        if (fromLeads && formData.categories && formData.categories.length > 0 && formData.city) {
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
              description: `Partner registration from Lead Marketplace - ${formData.name || 'New Partner'}`
            }
            
            // Call backend API to create lead (this requires admin token, so we'll create a partner endpoint)
            // For now, we'll just log it - the backend should handle this automatically
            console.log('Partner registered from Lead Marketplace:', leadData)
          } catch (leadErr) {
            console.error('Error creating lead entry:', leadErr)
            // Don't block registration if lead creation fails
          }
        }
        
        // Go to MG Plan selection (step 10 for fromLeads, step 8 for regular flow)
        if (fromLeads) {
          setCurrentStep(10) // Skip toolkit and success message, go directly to MG Plan
        } else {
          setCurrentStep(8) // Regular flow goes to toolkit first
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

  // Check if a step is already completed
  const isStepCompleted = (step) => {
    switch (step) {
      case 2:
        return !!(formData.name && formData.email && formData.address && formData.pincode && formData.city)
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
        return !!(formData.payment.payId && formData.payment.registrationFee)
      case 8:
        return !!formData.selectedPlanId
      default:
        return false
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return otpSent && formData.otp.length === 6
      case 2:
        return formData.name && formData.email && formData.address && formData.pincode && formData.city
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
        return true // Toolkit is optional
      case 9:
        return true // Success message step - always proceed
      case 10:
        return formData.selectedPlanId !== null // Plan selection required
      default:
        return false
    }
  }

  // Auto-skip step 7 if fromLeads and somehow reached step 7
  useEffect(() => {
    if (fromLeads && currentStep === 7) {
      setCurrentStep(8)
    }
  }, [currentStep, fromLeads])

  // Check if registration is complete and route accordingly (for Lead Marketplace flow)
  useEffect(() => {
    if (fromLeads && token && partnerData && currentStep !== 12 && currentStep !== 11) {
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
        setCurrentStep(12)
      }
    }
  }, [formData, fromLeads, token, partnerData, currentStep])

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
              <h2 className="text-3xl font-bold text-primary mb-2">Registration Fee & Security Deposit</h2>
              <p className="text-gray-600">Complete payment via WhatsApp Pay</p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Registration Fee</span>
                <span className="font-semibold text-lg">₹{formData.payment.registrationFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Security Deposit</span>
                <span className="font-semibold text-lg">₹{formData.payment.securityDeposit}</span>
              </div>
              
              {/* Toolkit Option */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="toolkitCheckbox"
                      checked={formData.toolkit.selected}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        toolkit: { ...prev.toolkit, selected: e.target.checked }
                      }))}
                      className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="toolkitCheckbox" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <FaToolbox className="text-primary text-lg" />
                        <span className="text-gray-700 font-semibold">Professional Toolkit (Optional)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Professional-grade tools and equipment to get started faster
                      </p>
                    </label>
                  </div>
                  <span className="font-semibold text-lg">₹{formData.toolkit.price}</span>
                </div>
                {formData.toolkit.selected && pricingSettings && pricingSettings.toolkitPriceRefundable === true && (
                  <div className="ml-8 mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    <span className="text-xs text-emerald-800 font-medium">Toolkit Price is refundable</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-primary">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{formData.payment.total + (formData.toolkit.selected ? formData.toolkit.price : 0)}
                </span>
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

            <motion.button
              onClick={handlePayment}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition"
            >
              <FaShoppingCart className="text-2xl text-current" />
              Book Now
            </motion.button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.payment.payId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, payId: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter payment transaction ID"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              After payment, enter the transaction ID above and click "Complete Payment"
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Optional Toolkit</h2>
              <p className="text-gray-600">Add professional toolkit to get started faster</p>
            </div>

            <div className={`border-2 rounded-2xl p-6 transition-all ${
              formData.toolkit.selected 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <FaToolbox className="text-3xl text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {formData.categoryNames.length > 0 ? formData.categoryNames.join(', ') : 'Professional'} Toolkit
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Professional-grade tools and equipment
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">₹{formData.toolkit.price}</div>
                </div>
              </div>

              <button
                onClick={handleToolkitToggle}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  formData.toolkit.selected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formData.toolkit.selected ? 'Remove Toolkit' : 'Add Toolkit'}
              </button>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FaCheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-primary mb-3">Profile Successfully Registered!</h2>
              <p className="text-lg text-gray-600 mb-2">Your profile is under review</p>
              <p className="text-base text-gray-500 mb-6">
                Our team will review your application and get back to you soon. In the meantime, would you like to choose an MG Plan to get started?
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border-2 border-primary/20">
              <h3 className="text-xl font-semibold text-primary mb-3 text-center">Benefits of MG Plans</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Guaranteed leads every month</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Lower commission rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>Priority support and faster payouts</span>
                </li>
              </ul>
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Choose Your MG Plan</h2>
              <p className="text-gray-600">Select a Minimum Guarantee plan to get started</p>
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
                  No Minimum Guarantee plans have been configured yet. Please contact admin or proceed without a plan.
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
                      
                      // Show coming soon dialog for payment (if not from leads)
                      if (!fromLeads) {
                        openComingSoon()
                      }
                      
                      // Go to success page with thanks message
                      setCurrentStep(11)
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
            )}

            {!formData.selectedPlanId && (
              <p className="text-sm text-gray-500 text-center">Please select a plan to continue</p>
            )}
          </div>
        )

      case 11:
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
                {formData.selectedPlan ? 'Thank You!' : 'Welcome to NEXO!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {formData.selectedPlan 
                  ? `Thank you for subscribing to the ${formData.selectedPlan} plan! Your lead subscription is now active.`
                  : 'Your partner account has been created successfully'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Your Partner ID</div>
              <div className="text-3xl font-bold text-primary">{partnerId || partnerData?._id?.toString().slice(-8) || partnerData?.partnerId || 'PRT-XXXXXX'}</div>
            </div>

            {formData.categoryNames.length > 0 && (
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

            <div className="bg-white border-2 border-primary rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your MG Plan</h3>
              {formData.selectedPlan ? (
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
              ) : (
                <p className="text-gray-600 text-center">
                  Default plan assigned. You can upgrade your plan anytime from your partner dashboard.
                </p>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <motion.a
                onClick={(e) => {
                  e.preventDefault()
                  handleWhatsAppClick(e)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                <FaShoppingCart className="text-current" /> Book Now
              </motion.a>
            </div>
          </div>
        )

      case 12:
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
                Your partner profile is already complete. You can proceed to subscribe to a lead plan or manage your account.
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

            <div className="bg-white border-2 border-primary rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your MG Plan</h3>
              {formData.selectedPlan ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {formData.selectedPlan === 'Silver' ? '🥈' : formData.selectedPlan === 'Gold' ? '🥇' : '💎'}
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">{formData.selectedPlan} Plan</div>
                  <p className="text-gray-600">
                    You're subscribed to the {formData.selectedPlan} plan. You'll receive guaranteed leads and commission benefits.
                  </p>
                  {selectedPlanMeta && (
                    <p className="text-sm text-gray-500 mt-3">
                      Lead fee ₹{selectedPlanMeta.leadFee ?? 0} · Maintain wallet ≥ ₹{selectedPlanMeta.minWalletBalance ?? 0} to keep leads flowing.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-6">
                      You haven't subscribed to a lead plan yet. Choose a plan to start receiving leads!
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
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <motion.a
                href="/partner/dashboard"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
              >
                Go to Dashboard
              </motion.a>
              <motion.a
                onClick={(e) => {
                  e.preventDefault()
                  handleWhatsAppClick(e)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                <FaShoppingCart className="text-current" /> Book Now
              </motion.a>
            </div>
          </div>
        )

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

      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-4 sm:px-6 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {currentStep < 11 && currentStep !== 12 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Step {currentStep} of {fromLeads ? totalSteps - 2 : totalSteps - 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-primary">
                  {Math.round((currentStep / (fromLeads ? totalSteps - 2 : totalSteps - 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className="bg-primary h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (fromLeads ? totalSteps - 2 : totalSteps - 1)) * 100}%` }}
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
            {currentStep < 11 && currentStep !== 12 && (
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
                    {loading ? <FaSpinner className="animate-spin" /> : 'Save & Continue'} <FaArrowRight />
                  </button>
                ) : currentStep === 3 ? (
                  <button
                    onClick={handleCompleteKYC}
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Upload & Continue'} <FaArrowRight />
                  </button>
                ) : currentStep === 4 ? (
                  <button
                    onClick={handleSaveCategories}
                    disabled={loading || formData.categories.length === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Save Categories & Continue'} <FaArrowRight />
                  </button>
                ) : currentStep === 6 ? (
                  <button
                    onClick={async () => {
                      if (fromLeads) {
                        // For Lead Marketplace flow, complete registration without payment
                        await handleCompleteRegistrationWithoutPayment()
                      } else {
                        // Regular flow - go to payment step
                      setLoading(true)
                      try {
                        if (token && formData.terms.signature) {
                          // You can add API call here to save terms acceptance
                          // await partnerApi.acceptTerms(token, {
                          //   signature: formData.terms.signature,
                          //   acceptedAt: new Date().toISOString()
                          // })
                        }
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
                    {loading ? <FaSpinner className="animate-spin" /> : fromLeads ? 'Complete Registration' : 'Accept & Continue'} <FaArrowRight />
                  </button>
                ) : currentStep === 7 && !fromLeads ? (
                  <button
                    onClick={handleCompletePayment}
                    disabled={loading || !formData.payment.payId}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : 'Complete Payment'} <FaArrowRight />
                  </button>
                ) : currentStep === 8 ? (
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <FaArrowRight />
                  </button>
                ) : currentStep === 9 ? (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={nextStep}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Yes, Choose MG Plan <FaArrowRight />
                    </button>
                    <button
                      onClick={() => {
                        // Skip MG Plan and go to final step
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
                    Next <FaArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <FaArrowRight />
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
