import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaShoppingCart,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
  FaCreditCard,
  FaLocationArrow,
  FaWallet,
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa'
import { useUserAuth } from '../context/UserAuthContext'
import axios from 'axios'
import CustomAlert from '../components/CustomAlert'



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)

// Custom scrollbar styles for cart items
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  @media (max-width: 640px) {
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }
`

const ServiceCheckout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { serviceName } = useParams()
  const { user, isAuthenticated } = useUserAuth()
  
  // Get cart data from location state or sessionStorage
  const getCartData = () => {
    const stateData = location.state?.cartData
    if (stateData) {
      // Save to sessionStorage for persistence on reload
      sessionStorage.setItem('checkoutCartData', JSON.stringify(stateData))
      return stateData
    }
    // Try to get from sessionStorage
    const savedData = sessionStorage.getItem('checkoutCartData')
    return savedData ? JSON.parse(savedData) : {}
  }
  
  const getServiceData = () => {
    const stateData = location.state?.serviceData
    if (stateData) {
      sessionStorage.setItem('checkoutServiceData', JSON.stringify(stateData))
      return stateData
    }
    const savedData = sessionStorage.getItem('checkoutServiceData')
    return savedData ? JSON.parse(savedData) : {}
  }
  
  const [cartData] = useState(getCartData())
  const [serviceData] = useState(getServiceData())
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmount, setWalletAmount] = useState(0)
  const [customWalletAmount, setCustomWalletAmount] = useState('')
  const [showWalletInput, setShowWalletInput] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const [amcPlans, setAmcPlans] = useState([])
  const [selectedAMCPlan, setSelectedAMCPlan] = useState(null)
  const [amcLoading, setAmcLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [confirmationDialog, setConfirmationDialog] = useState({ isOpen: false, plan: null, addressData: null })

  // Offer/Coupon state
  const [offers, setOffers] = useState([])
  const [offerCode, setOfferCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [offerLoading, setOfferLoading] = useState(false)
  const [showOfferInput, setShowOfferInput] = useState(false)

  // Helper function to validate individual fields
  const validateField = (name, value) => {
    const errors = { ...formErrors }
    
    switch (name) {
      case 'name':
        if (!value?.trim()) {
          errors.name = 'Full name is required'
        } else {
          delete errors.name
        }
        break
      case 'phone':
        if (!value?.trim()) {
          errors.phone = 'Phone number is required'
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          errors.phone = 'Enter a valid 10-digit mobile number'
        } else {
          delete errors.phone
        }
        break
      case 'address':
        if (!value?.trim()) {
          errors.address = 'Service address is required'
        } else {
          delete errors.address
        }
        break
      case 'pincode':
        if (!value?.trim()) {
          errors.pincode = 'Pincode is required'
        } else if (!/^\d{6}$/.test(value.trim())) {
          errors.pincode = 'Enter a valid 6-digit pincode'
        } else {
          delete errors.pincode
        }
        break
      case 'bookingDate':
        if (!value?.trim()) {
          errors.bookingDate = 'Booking date is required'
        } else {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          selectedDate.setHours(0, 0, 0, 0)
          
          if (selectedDate < today) {
            errors.bookingDate = 'Date cannot be in the past'
          } else {
            delete errors.bookingDate
          }
        }
        break
      case 'bookingTime':
        if (!value?.trim()) {
          errors.bookingTime = 'Time slot is required'
        } else {
          delete errors.bookingTime
        }
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Helper function to get input field styling based on validation state
  const getInputClassName = (fieldName, baseClassName) => {
    const hasError = formErrors[fieldName]
    if (hasError) {
      return `${baseClassName} border-red-300 focus:ring-red-500 focus:border-red-500`
    }
    return `${baseClassName} border-gray-300 focus:ring-primary focus:border-transparent`
  }
  
  // Form state - restore from sessionStorage if available
  const getInitialFormData = () => {
    const savedFormData = sessionStorage.getItem('checkoutFormData')
    if (savedFormData) {
      return JSON.parse(savedFormData)
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bookingDate: '',
      bookingTime: '',
      address: '',
      landmark: '',
      pincode: '',
      specialInstructions: ''
    }
  }
  
  const [formData, setFormData] = useState(getInitialFormData())

  // Fetch user addresses, wallet balance, and offers
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses()
      fetchWalletBalance()
      fetchAMCPlans()
      fetchActiveOffers()
    }
  }, [isAuthenticated, user])
  
  // Update formData when user data becomes available
  useEffect(() => {
    if (user && !formData.name && !formData.email && !formData.phone) {
      setFormData(prev => {
        const newData = {
          ...prev,
          name: prev.name || user.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || ''
        }
        sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
        return newData
      })
    }
  }, [user])
  
  // Validate existing form data on component mount
  useEffect(() => {
    if (formData.name || formData.phone || formData.address || formData.pincode || formData.bookingDate || formData.bookingTime) {
      // Validate all fields that have values
      Object.entries(formData).forEach(([field, value]) => {
        if (value && ['name', 'phone', 'address', 'pincode', 'bookingDate', 'bookingTime'].includes(field)) {
          validateField(field, value)
        }
      })
    }
  }, []) // Run only on mount
  
  // Clear sessionStorage when leaving checkout successfully
  useEffect(() => {
    return () => {
      // Only clear if navigating away (not on refresh)
      if (performance.navigation.type !== 1) {
        sessionStorage.removeItem('checkoutCartData')
        sessionStorage.removeItem('checkoutServiceData')
        sessionStorage.removeItem('checkoutFormData')
      }
    }
  }, [])

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('userToken')
      const response = await axios.get(`${API_BASE_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setAddresses(response.data.data || [])
        // Auto-select first address if available and no address is already set
        const savedFormData = sessionStorage.getItem('checkoutFormData')
        const hasExistingAddress = savedFormData && JSON.parse(savedFormData).address
        
        if (response.data.data && response.data.data.length > 0 && !hasExistingAddress) {
          const firstAddr = response.data.data[0]
          setSelectedAddress(firstAddr)
          setFormData(prev => {
            const newData = {
              ...prev,
              address: firstAddr.address || '',
              landmark: firstAddr.landmark || '',
              pincode: firstAddr.pincode || ''
            }
            sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
            return newData
          })
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('userToken')
      console.log('🔍 Fetching wallet balance for user:', user._id)
      console.log('🔍 API URL:', `${API_BASE_URL}/api/user/wallet/${user._id}`)
      
      const response = await axios.get(`${API_BASE_URL}/api/user/wallet/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('✅ Wallet response:', response.data)
      
      if (response.data.success) {
        const balance = response.data.data.balance || 0
        console.log('💰 Wallet balance:', balance)
        setWalletBalance(balance)
      } else {
        console.warn('⚠️ Wallet fetch unsuccessful:', response.data)
        setWalletBalance(0)
      }
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error)
      console.error('❌ Error details:', error.response?.data)
      // Set balance to 0 but still show wallet section
      setWalletBalance(0)
    }
  }

  // Fetch active offers
  const fetchActiveOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/offers`)
      if (response.data.success) {
        // Filter active offers (within date range)
        const now = new Date()
        const activeOffers = response.data.data.filter(offer => {
          const startDate = new Date(offer.startDate)
          const endDate = new Date(offer.endDate)
          return now >= startDate && now <= endDate
        })
        setOffers(activeOffers)
        console.log('✅ Active offers loaded:', activeOffers.length)
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error)
    }
  }

  // Apply offer code
  const handleApplyOffer = async () => {
    if (!offerCode.trim()) {
      showAlert('warning', 'Enter Offer Code', 'Please enter a valid offer code')
      return
    }

    setOfferLoading(true)
    try {
      // Find matching offer
      const matchingOffer = offers.find(
        offer => offer.couponCode.toLowerCase() === offerCode.trim().toLowerCase()
      )

      if (!matchingOffer) {
        showAlert('error', 'Invalid Offer Code', 'The offer code you entered is not valid or has expired')
        setOfferLoading(false)
        return
      }

      // Check if offer is still valid
      const now = new Date()
      const startDate = new Date(matchingOffer.startDate)
      const endDate = new Date(matchingOffer.endDate)

      if (now < startDate || now > endDate) {
        showAlert('error', 'Offer Expired', 'This offer is no longer valid')
        setOfferLoading(false)
        return
      }

      // Apply the offer
      setAppliedOffer(matchingOffer)
      showAlert('success', 'Offer Applied!', `${matchingOffer.offerTitle} - ${matchingOffer.discount}% discount applied successfully`)
      setShowOfferInput(false)
      setOfferLoading(false)
    } catch (error) {
      console.error('Error applying offer:', error)
      showAlert('error', 'Error', 'Failed to apply offer code')
      setOfferLoading(false)
    }
  }

  // Remove applied offer
  const handleRemoveOffer = () => {
    setAppliedOffer(null)
    setOfferCode('')
    showAlert('info', 'Offer Removed', 'Offer code has been removed from your order')
  }

  // Fetch AMC plans
  const fetchAMCPlans = async () => {
    try {
      setAmcLoading(true)
      
      // Debug: Log service data to understand structure
      console.log('🔍 [Checkout] Service Data:', serviceData)
      console.log('🔍 [Checkout] Service Name from URL:', serviceName)
      console.log('🔍 [Checkout] Cart Data:', cartData)
      
      const response = await fetch(`${API_BASE_URL}/api/amc-plans`)
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('🔍 [Checkout] All AMC Plans:', result.data.map(p => ({
          name: p.name,
          includedServices: p.includedServices?.map(s => s.name)
        })))
        
        // Filter plans based on user type and service
        const filteredPlans = filterPlansForUser(result.data)
        setAmcPlans(filteredPlans)
      }
    } catch (error) {
      console.error('Error fetching AMC plans:', error)
    } finally {
      setAmcLoading(false)
    }
  }

  // Filter plans based on service category and user type
  const filterPlansForUser = (plans) => {
    if (!user) return plans.slice(0, 2) // Show first 2 plans for non-authenticated users

    const userType = user.userType || 'home'
    
    // Get all service names from cart items
    const cartServiceNames = cartData?.items?.map(item => 
      (item.name || '').toLowerCase().trim()
    ) || []
    
    // Also get main service name
    const mainServiceName = (serviceData?.name || serviceName || '').toLowerCase().trim()
    
    // Combine all service names
    const allServiceNames = [...new Set([mainServiceName, ...cartServiceNames])].filter(Boolean)
    
    console.log('🔍 [Checkout] Filtering AMC plans')
    console.log('🔍 [Checkout] All services:', allServiceNames)
    console.log('🔍 [Checkout] Available plans:', plans.length)
    console.log('🔍 [Checkout] User type:', userType)
    
    // First filter by service - match AMC plans to cart services
    let servicePlans = plans.filter(plan => {
      // If plan has no includedServices, skip it (don't show)
      if (!plan.includedServices || plan.includedServices.length === 0) {
        console.log(`  Plan "${plan.name}": ❌ No includedServices defined`)
        return false
      }
      
      // Check if ANY cart service matches ANY included service in the plan
      const hasMatchingService = plan.includedServices.some(includedService => {
        const includedServiceName = (includedService.name || '').toLowerCase().trim()
        
        // Check against all cart services
        return allServiceNames.some(cartServiceName => {
          // Exact match
          if (includedServiceName === cartServiceName) {
            console.log(`    ✅ Exact match: "${includedServiceName}" === "${cartServiceName}"`)
            return true
          }
          
          // Partial match (one contains the other)
          if (includedServiceName.includes(cartServiceName) || cartServiceName.includes(includedServiceName)) {
            console.log(`    ✅ Partial match: "${includedServiceName}" ~ "${cartServiceName}"`)
            return true
          }
          
          return false
        })
      })
      
      console.log(`  Plan "${plan.name}": ${hasMatchingService ? '✅ Matches' : '❌ No match'}`)
      return hasMatchingService
    })
    
    console.log('🔍 [Checkout] Plans after service filter:', servicePlans.length)
    
    // Then filter by user type
    let filteredPlans = servicePlans.filter(plan => {
      if (userType === 'company') {
        return plan.planType === 'business' || plan.planType === 'corporate'
      } else if (userType === 'pg') {
        return plan.planType === 'business' || plan.planType === 'individual'
      } else {
        return plan.planType === 'individual' || plan.planType === 'business'
      }
    })
    
    console.log('🔍 [Checkout] Plans after user type filter:', filteredPlans.length)
    console.log('🔍 [Checkout] Final plans:', filteredPlans.map(p => p.name))

    // Return ALL matching plans (no limit)
    return filteredPlans
  }

  // Check if AMC should be offered
  const shouldOfferAMCPlan = () => {
    // Don't show if user already has an active AMC subscription
    if (user?.amcSubscription?.isActive) return false
    
    // Show AMC if there are any matching plans
    return amcPlans.length > 0
  }

  // Calculate AMC savings
  const calculateAMCSavings = (plan) => {
    const cartTotal = calculateTotalBeforeTax()
    if (!cartTotal || cartTotal === 0) return 0
    
    // Estimate annual service cost without AMC
    const estimatedAnnualCost = cartTotal * 4 // Assuming 4 services per year
    const savings = estimatedAnnualCost - plan.price
    return Math.max(0, savings)
  }

  // Handle AMC plan selection
  const handleAMCPlanSelect = (plan) => {
    setSelectedAMCPlan(plan)
  }

  // Enhanced AMC subscription with address collection
  const handleAMCSubscription = async (plan, paymentResult) => {
    console.log('AMC subscribed in checkout:', plan, paymentResult)
    
    try {
      const token = localStorage.getItem('userToken')
      
      // Prepare AMC subscription data with current address
      const amcSubscriptionData = {
        userId: user._id,
        planId: plan._id,
        planName: plan.name,
        planPrice: plan.price,
        planDuration: plan.duration || 12,
        planType: plan.planType,
        paymentResult: paymentResult,
        serviceAddress: {
          address: formData.address,
          landmark: formData.landmark,
          pincode: formData.pincode,
          city: user.city || 'Not specified',
          state: user.state || 'Not specified'
        },
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        subscriptionDate: new Date().toISOString(),
        features: plan.features || [],
        includedServices: plan.includedServices || []
      }

      // Save AMC subscription to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/user/amc-subscription`,
        amcSubscriptionData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        setSelectedAMCPlan(plan)
        setShowAMCModal(false)
        showAlert('success', 'AMC Subscribed!', `You've successfully subscribed to ${plan.name}. Your service address has been saved for future AMC services.`)
      } else {
        showAlert('error', 'Subscription Failed', response.data.message || 'Failed to subscribe to AMC plan')
      }
    } catch (error) {
      console.error('Error subscribing to AMC:', error)
      showAlert('error', 'Subscription Failed', error.response?.data?.message || 'Failed to subscribe to AMC plan')
    }
  }

  // Direct AMC subscription without modal
  const handleDirectAMCSubscription = async (plan) => {
    // Debug logging to check form data
    console.log('🔍 Form Data:', formData)
    console.log('🔍 Selected Address:', selectedAddress)
    
    // Enhanced validation for required fields with specific field names
    const missingFields = []
    
    // Get pincode from either formData or selectedAddress
    const currentPincode = formData.pincode?.trim() || selectedAddress?.pincode?.trim() || ''
    const currentAddress = formData.address?.trim() || selectedAddress?.address?.trim() || ''
    const currentLandmark = formData.landmark?.trim() || selectedAddress?.landmark?.trim() || ''
    
    if (!formData.name?.trim()) missingFields.push('Full Name')
    if (!formData.phone?.trim()) missingFields.push('Phone Number')
    if (!currentAddress) missingFields.push('Service Address')
    if (!currentPincode) missingFields.push('Pincode')
    
    // Validate phone number format
    if (formData.phone?.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      showAlert('warning', 'Invalid Phone Number', 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9')
      return
    }
    
    // Validate pincode format
    if (currentPincode && !/^\d{6}$/.test(currentPincode)) {
      showAlert('warning', 'Invalid Pincode', 'Please enter a valid 6-digit pincode')
      return
    }
    
    if (missingFields.length > 0) {
      showAlert('warning', 'Missing Required Information', `Please fill in the following required fields before subscribing to AMC plan: ${missingFields.join(', ')}`)
      return
    }

    // Check if address is properly selected (not just typed)
    if (!selectedAddress && !formData.address) {
      showAlert('warning', 'Address Required', 'Please select or add a complete service address before subscribing to AMC plan')
      return
    }

    if (!isAuthenticated || !user) {
      showAlert('error', 'Authentication Required', 'Please login to subscribe to AMC plans')
      return
    }

    // Show custom confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      plan: plan,
      addressData: {
        address: currentAddress,
        landmark: currentLandmark,
        pincode: currentPincode,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email
      }
    })
  }

  // Handle AMC subscription confirmation
  const handleAMCConfirmation = async () => {
    const { plan, addressData } = confirmationDialog
    
    // Close confirmation dialog
    setConfirmationDialog({ isOpen: false, plan: null, addressData: null })
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('userToken')
      
      // Create AMC subscription using existing service booking endpoint
      const amcSubscriptionData = {
        userId: user._id,
        serviceName: 'AMC Subscription',
        serviceData: {
          name: `${plan.name} - AMC Plan`,
          description: plan.description || 'Annual Maintenance Contract',
          price: plan.price
        },
        cartData: {
          items: [{
            type: 'amc-plan',
            id: plan._id,
            name: plan.name,
            quantity: 1,
            price: plan.price,
            total: plan.price
          }],
          total: plan.price
        },
        customerDetails: {
          name: addressData.customerName,
          email: addressData.customerEmail,
          phone: addressData.customerPhone
        },
        address: {
          address: addressData.address,
          landmark: addressData.landmark,
          pincode: addressData.pincode
        },
        scheduledDate: new Date().toISOString().split('T')[0], // Today's date
        scheduledTime: '10:00 AM', // Default time for AMC setup
        specialInstructions: `AMC Plan Subscription: ${plan.name}. Address: ${addressData.address}, ${addressData.landmark}, ${addressData.pincode}. Plan Features: ${plan.features?.join(', ') || 'Standard AMC benefits'}`,
        amount: plan.price,
        useWallet: false,
        walletAmount: 0,
        isAMCSubscription: true, // Flag to identify AMC subscriptions
        amcPlanDetails: {
          planId: plan._id,
          planName: plan.name,
          planType: plan.planType,
          duration: plan.duration || 12,
          features: plan.features || [],
          includedServices: plan.includedServices || []
        }
      }

      // Create AMC subscription order using existing service booking endpoint
      const response = await axios.post(
        `${API_BASE_URL}/api/user/service-booking/create`,
        amcSubscriptionData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        console.log('✅ AMC subscription order created, initiating PayU payment...')
        console.log('PayU Data:', response.data.payuData)
        
        // Redirect to PayU payment page
        const payuData = response.data.payuData
        
        if (!payuData || !payuData.action || !payuData.params) {
          console.error('❌ Invalid PayU data received:', payuData)
          showAlert('error', 'Payment Error', 'Invalid payment data received. Please try again.')
          setLoading(false)
          return
        }
        
        // Select the plan and show confirmation
        setSelectedAMCPlan(plan)
        showAlert('success', 'AMC Subscription Processing!', `${plan.name} subscription initiated. Redirecting to payment...`)
        
        // Create form and submit to PayU
        setTimeout(() => {
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = payuData.action
          
          console.log('PayU Action URL:', payuData.action)
          console.log('PayU Params:', payuData.params)
          
          Object.keys(payuData.params).forEach(key => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = payuData.params[key]
            form.appendChild(input)
            console.log(`  ${key}: ${payuData.params[key]}`)
          })
          
          document.body.appendChild(form)
          console.log('🚀 Submitting PayU form for AMC subscription...')
          form.submit()
        }, 1500)
        
      } else {
        console.error('❌ AMC subscription order creation failed:', response.data)
        showAlert('error', 'Subscription Failed', response.data.message || 'Failed to create AMC subscription order')
        setLoading(false)
      }
    } catch (error) {
      console.error('AMC subscription error:', error)
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        showAlert('error', 'Service Unavailable', 'AMC subscription service is currently unavailable. Please try again later or contact support.')
      } else if (error.response?.status === 401) {
        showAlert('error', 'Authentication Error', 'Please login again to subscribe to AMC plans.')
      } else {
        showAlert('error', 'Subscription Failed', error.response?.data?.message || 'Failed to process AMC subscription. Please try again.')
      }
      
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      // Save to sessionStorage on every change
      sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
      return newData
    })
    
    // Validate field in real-time
    validateField(name, value)
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    setFormData(prev => {
      const newData = {
        ...prev,
        address: address.address || '',
        landmark: address.landmark || '',
        pincode: address.pincode || ''
      }
      // Save to sessionStorage
      sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
      return newData
    })
    setShowAddressForm(false)
    
    // Clear validation errors for address fields
    validateField('address', address.address || '')
    validateField('pincode', address.pincode || '')
  }

  const handleSaveAddress = async () => {
    // Enhanced validation for address fields
    const missingFields = []
    
    if (!formData.address?.trim()) missingFields.push('Complete Address')
    if (!formData.pincode?.trim()) missingFields.push('Pincode')
    
    // Validate pincode format
    if (formData.pincode?.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      showAlert('warning', 'Invalid Pincode', 'Please enter a valid 6-digit pincode')
      return
    }
    
    if (missingFields.length > 0) {
      showAlert('warning', 'Missing Required Information', `Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }

    setSavingAddress(true)
    try {
      const token = localStorage.getItem('userToken')
      const addressData = {
        address: formData.address,
        landmark: formData.landmark,
        pincode: formData.pincode
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/user/addresses`,
        addressData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        showAlert('success', 'Address Saved!', 'Your address has been saved successfully')
        // Refresh addresses list
        await fetchAddresses()
        setShowAddressForm(false)
      }
    } catch (error) {
      console.error('Error saving address:', error)
      showAlert('error', 'Save Failed', error.response?.data?.message || 'Failed to save address')
    } finally {
      setSavingAddress(false)
    }
  }

  const showAlert = (type, title, message) => {
    setAlert({ isOpen: true, type, title, message })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert('error', 'Not Supported', 'Geolocation is not supported by your browser')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Use reverse geocoding to get address from coordinates
          // Using OpenStreetMap Nominatim API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          )
          const data = await response.json()
          
          if (data && data.display_name) {
            const address = data.display_name
            const pincode = data.address?.postcode || ''
            const landmark = data.address?.suburb || data.address?.neighbourhood || ''
            
            setFormData(prev => {
              const newData = {
                ...prev,
                address: address,
                landmark: landmark,
                pincode: pincode
              }
              sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
              return newData
            })
            
            setSelectedAddress(null)
            setShowAddressForm(true)
            
            showAlert('success', 'Location Detected!', 'Please verify and update the address if needed.')
          } else {
            showAlert('warning', 'Address Not Found', 'Could not get address from your location. Please enter manually.')
          }
        } catch (error) {
          console.error('Error getting address:', error)
          showAlert('error', 'Location Error', 'Failed to get address from location. Please enter manually.')
        } finally {
          setLoadingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLoadingLocation(false)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showAlert('error', 'Permission Denied', 'Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            showAlert('error', 'Location Unavailable', 'Location information is unavailable.')
            break
          case error.TIMEOUT:
            showAlert('error', 'Request Timeout', 'Location request timed out.')
            break
          default:
            showAlert('error', 'Location Error', 'An error occurred while getting your location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }



  const calculateTotal = () => {
    return cartData.total || 0
  }

  const calculateSubtotal = () => {
    // Calculate subtotal without visiting charge and service charge
    let subtotal = 0
    if (cartData.items) {
      cartData.items.forEach(item => {
        subtotal += item.total || 0
      })
    }
    return subtotal
  }

  const getVisitingCharge = () => {
    const charge = serviceData.visitingCharge || 0
    console.log('🔍 [Checkout] Visiting Charge:', charge, 'Service Data:', serviceData)
    return charge
  }

  const getServiceCharge = () => {
    return serviceData.serviceCharge || 0
  }

  const getEmergencyCharge = () => {
    const charge = serviceData.emergencyCharge || 0
    console.log('🔍 [Checkout] Emergency Charge:', charge, 'Is Emergency:', serviceData.isEmergency)
    return charge
  }

  const calculateTotalBeforeTax = () => {
    const subtotal = calculateSubtotal()
    const visiting = getVisitingCharge()
    const service = getServiceCharge()
    const emergency = getEmergencyCharge()
    const total = subtotal + visiting + service + emergency
    
    console.log('🔍 [Checkout] Total Before Tax Calculation:', {
      subtotal,
      visiting,
      service,
      emergency,
      total
    })
    
    return total
  }

  const calculateOfferDiscount = () => {
    if (!appliedOffer) return 0
    const totalBeforeTax = calculateTotalBeforeTax()
    return Math.round(totalBeforeTax * appliedOffer.discount / 100)
  }

  const calculateTotalAfterDiscount = () => {
    const totalBeforeTax = calculateTotalBeforeTax()
    const discount = calculateOfferDiscount()
    return totalBeforeTax - discount
  }

  const calculateFinalAmount = () => {
    const totalAfterDiscount = calculateTotalAfterDiscount()
    const cgst = serviceData.cgst || 9 // Default CGST 9%
    const sgst = serviceData.sgst || 9 // Default SGST 9%
    const totalGstRate = cgst + sgst
    const gst = Math.round(totalAfterDiscount * totalGstRate / 100)
    const total = totalAfterDiscount + gst
    
    if (useWallet && walletAmount > 0) {
      return Math.max(0, total - walletAmount)
    }
    
    return total
  }

  const handleWalletToggle = () => {
    const newUseWallet = !useWallet
    setUseWallet(newUseWallet)
    
    if (newUseWallet) {
      const totalAfterDiscount = calculateTotalAfterDiscount()
      const cgst = serviceData.cgst || 9
      const sgst = serviceData.sgst || 9
      const totalGstRate = cgst + sgst
      const total = Math.round(totalAfterDiscount * (1 + totalGstRate / 100))
      const maxWalletUse = Math.min(walletBalance, total)
      setWalletAmount(maxWalletUse)
      setCustomWalletAmount('')
      setShowWalletInput(false)
    } else {
      setWalletAmount(0)
      setCustomWalletAmount('')
      setShowWalletInput(false)
    }
  }

  const handleCustomWalletAmount = (value) => {
    const amount = parseFloat(value) || 0
    const totalAfterDiscount = calculateTotalAfterDiscount()
    const cgst = serviceData.cgst || 9
    const sgst = serviceData.sgst || 9
    const totalGstRate = cgst + sgst
    const total = Math.round(totalAfterDiscount * (1 + totalGstRate / 100))
    const maxWalletUse = Math.min(walletBalance, total)
    
    if (amount > maxWalletUse) {
      setCustomWalletAmount(maxWalletUse.toString())
      setWalletAmount(maxWalletUse)
    } else if (amount < 0) {
      setCustomWalletAmount('0')
      setWalletAmount(0)
    } else {
      setCustomWalletAmount(value)
      setWalletAmount(amount)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Enhanced validation with specific field names
    const missingFields = []
    
    if (!formData.name?.trim()) missingFields.push('Full Name')
    if (!formData.phone?.trim()) missingFields.push('Phone Number')
    if (!formData.bookingDate?.trim()) missingFields.push('Booking Date')
    if (!formData.bookingTime?.trim()) missingFields.push('Time Slot')
    if (!formData.address?.trim()) missingFields.push('Service Address')
    if (!formData.pincode?.trim()) missingFields.push('Pincode')
    
    // Validate phone number format
    if (formData.phone?.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      showAlert('warning', 'Invalid Phone Number', 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9')
      return
    }
    
    // Validate pincode format
    if (formData.pincode?.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      showAlert('warning', 'Invalid Pincode', 'Please enter a valid 6-digit pincode')
      return
    }
    
    // Validate booking date (should not be in the past)
    if (formData.bookingDate) {
      const selectedDate = new Date(formData.bookingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        showAlert('warning', 'Invalid Date', 'Booking date cannot be in the past')
        return
      }
    }
    
    if (missingFields.length > 0) {
      showAlert('warning', 'Missing Required Information', `Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }

    const finalAmount = calculateFinalAmount()
    
    // If using wallet and it covers full amount
    if (useWallet && finalAmount === 0) {
      showAlert('info', 'Wallet Payment', 'Full payment will be deducted from wallet')
      // Handle wallet-only payment
      await handleWalletOnlyPayment()
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('userToken')
      const bookingPayload = {
        userId: user._id,
        serviceName: serviceName,
        serviceData: serviceData,
        cartData: cartData,
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          address: formData.address,
          landmark: formData.landmark,
          pincode: formData.pincode
        },
        scheduledDate: formData.bookingDate,
        scheduledTime: formData.bookingTime,
        specialInstructions: formData.specialInstructions,
        amount: calculateTotalBeforeTax(),
        visitingCharge: getVisitingCharge(),
        serviceCharge: getServiceCharge(),
        emergencyCharge: getEmergencyCharge(),
        isEmergency: serviceData.isEmergency || false,
        useWallet: useWallet,
        walletAmount: walletAmount,
        // Offer information
        appliedOffer: appliedOffer ? {
          offerId: appliedOffer._id,
          couponCode: appliedOffer.couponCode,
          discount: appliedOffer.discount,
          discountAmount: calculateOfferDiscount()
        } : null
      }

      // Create booking and initiate PayU payment
      const response = await axios.post(
        `${API_BASE_URL}/api/user/service-booking/create`,
        bookingPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        console.log('✅ Booking created, initiating PayU payment...')
        console.log('PayU Data:', response.data.payuData)
        
        // Redirect to PayU payment page
        const payuData = response.data.payuData
        
        if (!payuData || !payuData.action || !payuData.params) {
          console.error('❌ Invalid PayU data received:', payuData)
          showAlert('error', 'Payment Error', 'Invalid payment data received. Please try again.')
          setLoading(false)
          return
        }
        
        // Create form and submit to PayU
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = payuData.action
        
        console.log('PayU Action URL:', payuData.action)
        console.log('PayU Params:', payuData.params)
        
        Object.keys(payuData.params).forEach(key => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = payuData.params[key]
          form.appendChild(input)
          console.log(`  ${key}: ${payuData.params[key]}`)
        })
        
        document.body.appendChild(form)
        console.log('🚀 Submitting PayU form...')
        form.submit()
      } else {
        console.error('❌ Booking creation failed:', response.data)
        showAlert('error', 'Booking Failed', response.data.message || 'Failed to create booking')
        setLoading(false)
      }
    } catch (error) {
      console.error('Booking error:', error)
      showAlert('error', 'Booking Failed', error.response?.data?.message || 'Failed to create booking. Please try again.')
      setLoading(false)
    }
  }

  const handleWalletOnlyPayment = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('userToken')
      const bookingPayload = {
        userId: user._id,
        serviceName: serviceName,
        serviceData: serviceData,
        cartData: cartData,
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          address: formData.address,
          landmark: formData.landmark,
          pincode: formData.pincode
        },
        scheduledDate: formData.bookingDate,
        scheduledTime: formData.bookingTime,
        specialInstructions: formData.specialInstructions,
        amount: calculateTotalBeforeTax(),
        visitingCharge: getVisitingCharge(),
        serviceCharge: getServiceCharge(),
        emergencyCharge: getEmergencyCharge(),
        isEmergency: serviceData.isEmergency || false,
        useWallet: true,
        walletAmount: walletAmount,
        paymentMode: 'wallet',
        // Offer information
        appliedOffer: appliedOffer ? {
          offerId: appliedOffer._id,
          couponCode: appliedOffer.couponCode,
          discount: appliedOffer.discount,
          discountAmount: calculateOfferDiscount()
        } : null
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/user/service-booking/create-wallet-payment`,
        bookingPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        // Clear sessionStorage on successful booking
        sessionStorage.removeItem('checkoutCartData')
        sessionStorage.removeItem('checkoutServiceData')
        sessionStorage.removeItem('checkoutFormData')
        showAlert('success', 'Booking Confirmed!', 'Your booking has been confirmed and payment deducted from wallet.')
        setTimeout(() => {
          navigate('/user/dashboard/bookings')
        }, 2000)
      }
    } catch (error) {
      console.error('Wallet payment error:', error)
      showAlert('error', 'Payment Failed', error.response?.data?.message || 'Failed to process wallet payment.')
      setLoading(false)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    // Store the checkout URL for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname)
    navigate('/user/login', { state: { from: location.pathname } })
    return null
  }

  // Redirect if no cart data
  if (!cartData.items || cartData.items.length === 0) {
    navigate(`/service/${serviceName}`)
    return null
  }

  return (
    <>
      {/* Inject custom scrollbar styles */}
      <style>{customScrollbarStyles}</style>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition mb-4"
          >
            <FaArrowLeft />
            <span>Back to Service</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your booking details</p>
          
          {/* Form Progress Indicator */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Completion</span>
              <span className="text-sm text-gray-500">
                {(() => {
                  const requiredFields = ['name', 'phone', 'address', 'pincode', 'bookingDate', 'bookingTime']
                  const completedFields = requiredFields.filter(field => formData[field]?.trim())
                  return `${completedFields.length}/${requiredFields.length} completed`
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(() => {
                    const requiredFields = ['name', 'phone', 'address', 'pincode', 'bookingDate', 'bookingTime']
                    const completedFields = requiredFields.filter(field => formData[field]?.trim())
                    return (completedFields.length / requiredFields.length) * 100
                  })()}%`
                }}
              ></div>
            </div>
            {Object.keys(formErrors).length > 0 ? (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {Object.keys(formErrors).length} field{Object.keys(formErrors).length > 1 ? 's' : ''} need{Object.keys(formErrors).length === 1 ? 's' : ''} attention
              </p>
            ) : (
              (() => {
                const requiredFields = ['name', 'phone', 'address', 'pincode', 'bookingDate', 'bookingTime']
                const completedFields = requiredFields.filter(field => formData[field]?.trim())
                const isComplete = completedFields.length === requiredFields.length
                
                return isComplete ? (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <FaCheckCircle />
                    All required fields completed! Ready to proceed.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                    <FaInfoCircle />
                    Fill all required fields marked with * to proceed
                  </p>
                )
              })()
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-primary" />
                Customer Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={getInputClassName('name', "w-full px-4 py-2 border rounded-lg focus:ring-2")}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={getInputClassName('phone', "w-full px-4 py-2 border rounded-lg focus:ring-2")}
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Address Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  Service Address
                </h2>
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={loadingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingLocation ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <FaLocationArrow />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Saved Addresses */}
              {addresses.length > 0 && !showAddressForm && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Saved Addresses ({addresses.length})
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
                    >
                      <span className="text-lg">+</span>
                      <span>Add New</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {addresses.map((addr, index) => (
                      <div
                        key={addr._id}
                        onClick={() => handleAddressSelect(addr)}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAddress?._id === addr._id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        {/* Address Type Badge */}
                        <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            addr.addressType === 'Home' ? 'bg-blue-100 text-blue-800' :
                            addr.addressType === 'Work' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {addr.addressType || 'Other'}
                          </span>
                          
                          {selectedAddress?._id === addr._id && (
                            <FaCheckCircle className="text-primary text-lg" />
                          )}
                        </div>
                        
                        {/* Address Details */}
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 leading-snug">
                            {addr.address}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            {addr.landmark && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-xs text-gray-400" />
                                <span>{addr.landmark}</span>
                              </div>
                            )}
                            
                            {addr.pincode && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="font-medium">PIN:</span>
                                <span>{addr.pincode}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Selected Indicator */}
                        {selectedAddress?._id === addr._id && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-lg"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form */}
              {(showAddressForm || addresses.length === 0) && (
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Add New Address</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="House/Flat No., Building Name, Street, Area, City"
                      className={getInputClassName('address', "w-full px-4 py-2 border rounded-lg focus:ring-2 resize-none")}
                      required
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="e.g., Near City Mall"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="e.g., 123456"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        className={getInputClassName('pincode', "w-full px-4 py-2 border rounded-lg focus:ring-2")}
                        required
                      />
                      {formErrors.pincode && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span>
                          {formErrors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={savingAddress || !formData.address || !formData.pincode}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      {savingAddress ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Save Address</span>
                        </>
                      )}
                    </button>
                    
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {addresses.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                        <FaInfoCircle className="text-blue-500" />
                        <span>Save this address for faster checkout next time</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Booking Date & Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-primary" />
                Schedule Service
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={getInputClassName('bookingDate', "w-full px-4 py-2 border rounded-lg focus:ring-2")}
                    required
                  />
                  {formErrors.bookingDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {formErrors.bookingDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Time Slot *
                  </label>
                  {formErrors.bookingTime && (
                    <p className="mb-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {formErrors.bookingTime}
                    </p>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {[
                      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
                      '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
                      '6:00 PM', '6:30 PM', '7:00 PM'
                    ].map((time) => {
                      const isDisabled = (() => {
                        if (!formData.bookingDate) return false
                        
                        const selectedDate = new Date(formData.bookingDate)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        selectedDate.setHours(0, 0, 0, 0)
                        
                        // Only validate if selected date is today
                        if (selectedDate.getTime() !== today.getTime()) return false
                        
                        // Parse time slot
                        const [timeStr, period] = time.split(' ')
                        let [hours, minutes] = timeStr.split(':').map(Number)
                        
                        // Convert to 24-hour format
                        if (period === 'PM' && hours !== 12) hours += 12
                        if (period === 'AM' && hours === 12) hours = 0
                        
                        // Create date object for the time slot
                        const slotTime = new Date()
                        slotTime.setHours(hours, minutes, 0, 0)
                        
                        // Get current time + 1 hour
                        const currentTime = new Date()
                        const minTime = new Date(currentTime.getTime() + 60 * 60 * 1000)
                        
                        return slotTime <= minTime
                      })()
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => !isDisabled && setFormData(prev => {
                            const newData = { ...prev, bookingTime: time }
                            sessionStorage.setItem('checkoutFormData', JSON.stringify(newData))
                            // Clear time slot error when selected
                            validateField('bookingTime', time)
                            return newData
                          })}
                          disabled={isDisabled}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : formData.bookingTime === time
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                  {formData.bookingTime && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <FaCheckCircle />
                      Selected: {formData.bookingTime}
                    </p>
                  )}
                  {formData.bookingDate && new Date(formData.bookingDate).toDateString() === new Date().toDateString() && (
                    <p className="mt-2 text-sm text-amber-600">
                      ⚠️ Time slots before {new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} are disabled
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any specific requirements or instructions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaShoppingCart className="text-primary" />
                Order Summary
              </h2>

              {/* Cart Items with AMC Details */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto custom-scrollbar">
                {cartData.items?.map((item, index) => {
                  // Find AMC plans that include this service
                  const relevantAMCPlans = amcPlans.filter(plan => {
                    // If no includedServices, show all plans (backward compatibility)
                    if (!plan.includedServices || plan.includedServices.length === 0) return true
                    
                    // Check if this cart item's service is included in the AMC plan
                    return plan.includedServices.some(service => {
                      const serviceName = (service.name || '').toLowerCase().trim()
                      const itemName = (item.name || '').toLowerCase().trim()
                      
                      // Match by name similarity
                      return serviceName.includes(itemName) || itemName.includes(serviceName)
                    })
                  })
                  
                  return (
                    <div key={index} className="border-b border-gray-100 pb-3">
                      {/* Cart Item */}
                      <div className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{item.total}</p>
                      </div>
                      
                      {/* AMC Details for this service */}
                      {relevantAMCPlans.length > 0 && (
                        <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                          <div className="flex items-center gap-1 mb-1">
                            <FaShieldAlt className="text-blue-600 text-xs" />
                            <span className="text-xs font-semibold text-blue-800">
                              Available AMC Plans for this service
                            </span>
                          </div>
                          
                          {/* Scrollable AMC Plans */}
                          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {relevantAMCPlans.map((plan, planIndex) => {
                              // Get frequency for this service
                              const serviceFrequency = plan.serviceFrequency && plan.includedServices
                                ? plan.includedServices.reduce((freq, service) => {
                                    const serviceName = (service.name || '').toLowerCase().trim()
                                    const itemName = (item.name || '').toLowerCase().trim()
                                    if (serviceName.includes(itemName) || itemName.includes(serviceName)) {
                                      return plan.serviceFrequency[service._id] || plan.serviceFrequency[service] || 'included'
                                    }
                                    return freq
                                  }, 'included')
                                : 'included'
                              
                              return (
                                <div 
                                  key={planIndex}
                                  className="bg-white rounded-md p-2 border border-blue-100 hover:border-blue-300 transition"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <h5 className="text-xs font-bold text-gray-900 truncate">
                                          {plan.name}
                                        </h5>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                          plan.planType === 'corporate' 
                                            ? 'bg-purple-100 text-purple-700'
                                            : plan.planType === 'business'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                          {plan.planType?.charAt(0).toUpperCase() + plan.planType?.slice(1)}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-primary font-bold">
                                          ₹{plan.price.toLocaleString('en-IN')}/yr
                                        </span>
                                        {serviceFrequency && serviceFrequency !== 'included' && (
                                          <span className="text-green-600 font-medium">
                                            {serviceFrequency === 'unlimited' 
                                              ? '∞ Unlimited' 
                                              : `${serviceFrequency}x/year`}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Quick Features */}
                                      {plan.features && plan.features.length > 0 && (
                                        <div className="mt-1 space-y-0.5">
                                          {plan.features.slice(0, 2).map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                                              <FaCheckCircle className="text-green-500 text-xs mt-0.5 flex-shrink-0" />
                                              <span className="line-clamp-1">{feature}</span>
                                            </div>
                                          ))}
                                          {plan.features.length > 2 && (
                                            <span className="text-xs text-gray-500 ml-3">
                                              +{plan.features.length - 2} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAMCPlanSelect(plan)
                                      }}
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition font-medium flex-shrink-0"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Enhanced AMC Plans Section */}
              {shouldOfferAMCPlan() && amcPlans.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  {/* AMC Header with Savings Highlight */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-green-600 text-lg" />
                        <h3 className="text-sm font-bold text-gray-900">💰 Save with AMC Plans</h3>
                      </div>
                      <span className="text-xs text-green-700 font-medium">
                        Available Plans
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      Subscribe to annual maintenance contracts with your service address
                    </p>
                  </div>
                  
                  {/* AMC Plans Grid - Scrollable */}
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {amcPlans.map((plan, index) => {
                      const savings = calculateAMCSavings(plan)
                      const savingsPercentage = savings > 0 ? Math.round((savings / (calculateTotalBeforeTax() * 4)) * 100) : 0
                      const isSelected = selectedAMCPlan?._id === plan._id
                      
                      return (
                        <div
                          key={plan._id || index}
                          onClick={() => handleAMCPlanSelect(plan)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-lg transform scale-[1.02]' 
                              : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                          }`}
                        >
                          {/* Plan Badge */}
                          {plan.highlight && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              ⭐ POPULAR
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-gray-900">{plan.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  plan.planType === 'corporate' 
                                    ? 'bg-purple-100 text-purple-700'
                                    : plan.planType === 'business'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {plan.planType?.charAt(0).toUpperCase() + plan.planType?.slice(1) || 'Standard'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{plan.description}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-lg font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-gray-500">/year</p>
                              {savings > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-green-600 font-bold">Save ₹{savings.toLocaleString('en-IN')}</p>
                                  <p className="text-xs text-green-600">({savingsPercentage}% off)</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Features Preview */}
                          <div className="mb-3">
                            <div className="grid grid-cols-1 gap-1">
                              {plan.features?.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                  <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                                  <span className="truncate">{feature}</span>
                                </div>
                              ))}
                              {plan.features?.length > 3 && (
                                <div className="text-xs text-gray-500 ml-4">
                                  +{plan.features.length - 3} more benefits
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Area */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            {isSelected ? (
                              <div className="flex items-center gap-2 text-sm text-primary font-bold">
                                <FaCheckCircle className="text-green-500" />
                                <span>Selected for Subscription</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Click to select this plan</span>
                              </div>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDirectAMCSubscription(plan)
                              }}
                              className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition font-medium"
                            >
                              Subscribe Now
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Selected Plan Confirmation */}
                  {selectedAMCPlan && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaCheckCircle className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-green-800 mb-1">
                              {selectedAMCPlan.name} Selected
                            </h4>
                            <p className="text-xs text-green-700 mb-2">
                              Annual maintenance contract with service address registration
                            </p>
                            <div className="flex items-center gap-4 text-xs text-green-700">
                              <span>💰 Save ₹{calculateAMCSavings(selectedAMCPlan).toLocaleString('en-IN')} annually</span>
                              <span>🏠 Address included</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDirectAMCSubscription(selectedAMCPlan)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-md"
                        >
                          Subscribe Now
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* AMC Benefits Footer */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaInfoCircle className="text-blue-500" />
                        <span>AMC subscription includes your service address for future maintenance</span>
                      </div>
                      <span className="text-xs text-primary font-medium">
                        Select plan above to subscribe
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  {/* Visiting Charge */}
                  {getVisitingCharge() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Visiting Charge</span>
                      <span className="font-medium text-amber-600">+₹{getVisitingCharge().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Service Charge */}
                  {getServiceCharge() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium text-blue-600">+₹{getServiceCharge().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Emergency Charge */}
                  {getEmergencyCharge() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span className="text-red-500">🚨</span>
                        Emergency Service Charge
                      </span>
                      <span className="font-medium text-red-600">+₹{getEmergencyCharge().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Subtotal Before Tax */}
                  {(getVisitingCharge() > 0 || getServiceCharge() > 0 || getEmergencyCharge() > 0) && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-700 font-medium">Subtotal (Before Tax)</span>
                      <span className="font-semibold text-gray-900">₹{calculateTotalBeforeTax().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Offer/Discount Section */}
                  {appliedOffer && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-medium">Offer Discount ({appliedOffer.discount}%)</span>
                        <button
                          onClick={handleRemoveOffer}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Remove offer"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="font-semibold text-green-600">-₹{calculateOfferDiscount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Total After Discount */}
                  {appliedOffer && (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-700 font-medium">Total After Discount</span>
                      <span className="font-semibold text-gray-900">₹{calculateTotalAfterDiscount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {/* Tax Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">CGST ({serviceData.cgst || 9}%)</span>
                      <span className="font-medium text-gray-700">₹{(calculateTotalAfterDiscount() * (serviceData.cgst || 9) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">SGST ({serviceData.sgst || 9}%)</span>
                      <span className="font-medium text-gray-700">₹{(calculateTotalAfterDiscount() * (serviceData.sgst || 9) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-medium">Total GST</span>
                      <span className="font-semibold text-gray-900">₹{(calculateTotalAfterDiscount() * ((serviceData.cgst || 9) + (serviceData.sgst || 9)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  {/* Total Before Wallet */}
                  <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span>₹{(calculateTotalAfterDiscount() * (1 + ((serviceData.cgst || 9) + (serviceData.sgst || 9)) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                {/* Offer Code Section */}
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <span className="text-sm font-semibold text-gray-800">Have an Offer Code?</span>
                      </div>
                      {!appliedOffer && (
                        <button
                          onClick={() => setShowOfferInput(!showOfferInput)}
                          className="text-primary hover:text-primary-dark font-medium text-xs"
                        >
                          {showOfferInput ? 'Hide' : 'Apply'}
                        </button>
                      )}
                    </div>
                    
                    {appliedOffer ? (
                      <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-green-600 font-bold text-sm">{appliedOffer.couponCode}</span>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {appliedOffer.discount}% OFF
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{appliedOffer.offerTitle}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">
                              You save ₹{calculateOfferDiscount().toLocaleString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={handleRemoveOffer}
                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : showOfferInput ? (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={offerCode}
                            onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                            placeholder="Enter offer code"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyOffer()
                              }
                            }}
                          />
                          <button
                            onClick={handleApplyOffer}
                            disabled={offerLoading || !offerCode.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {offerLoading ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </button>
                        </div>
                        
                        {/* Available Offers */}
                        {offers.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Available Offers:</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {offers.map((offer) => (
                                <div
                                  key={offer._id}
                                  onClick={() => {
                                    setOfferCode(offer.couponCode)
                                  }}
                                  className="bg-white rounded-lg p-2 border border-gray-200 hover:border-primary cursor-pointer transition"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary font-bold text-xs">{offer.couponCode}</span>
                                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                          {offer.discount}% OFF
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600">{offer.offerTitle}</p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOfferCode(offer.couponCode)
                                        handleApplyOffer()
                                      }}
                                      className="text-xs text-primary hover:text-primary-dark font-medium"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        Click "Apply" to enter your offer code and save on your order
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Wallet Section - Always show if user is authenticated */}
                {isAuthenticated && (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaWallet className="text-green-600 text-lg" />
                          <span className="text-sm font-semibold text-gray-800">Wallet Balance</span>
                        </div>
                        <span className={`text-base font-bold ${walletBalance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          ₹{walletBalance.toFixed(2)}
                        </span>
                      </div>
                      
                      {walletBalance > 0 ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="useWallet"
                            checked={useWallet}
                            onChange={handleWalletToggle}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor="useWallet" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                            Apply wallet balance to this order
                          </label>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-2">No balance available. Add money to your wallet!</p>
                          <button
                            type="button"
                            onClick={() => navigate('/user/dashboard/wallet')}
                            className="text-xs text-primary hover:text-primary-dark font-medium underline"
                          >
                            Add Money to Wallet
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {useWallet && (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount to use:</span>
                          <button
                            onClick={() => setShowWalletInput(!showWalletInput)}
                            className="text-xs text-primary hover:text-primary-dark font-medium"
                          >
                            {showWalletInput ? 'Use Maximum' : 'Use Custom Amount'}
                          </button>
                        </div>
                        
                        {showWalletInput ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">₹</span>
                            <input
                              type="number"
                              value={customWalletAmount}
                              onChange={(e) => handleCustomWalletAmount(e.target.value)}
                              placeholder="Enter amount"
                              min="0"
                              max={Math.min(walletBalance, Math.round(calculateTotalBeforeTax() * (1 + ((serviceData.cgst || 9) + (serviceData.sgst || 9)) / 100)))}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                            <span className="text-sm font-medium text-green-700">Wallet Deduction</span>
                            <span className="text-base font-bold text-green-600">-₹{walletAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {walletAmount >= Math.round(calculateTotalBeforeTax() * (1 + ((serviceData.cgst || 9) + (serviceData.sgst || 9)) / 100)) && (
                          <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2">
                            <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                              Your wallet balance covers the full amount. No additional payment needed!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Final Amount to Pay */}
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                  <span className="text-gray-900">Amount to Pay</span>
                  <span className="text-primary text-xl">₹{calculateFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                {/* Payment Method Info */}
                {useWallet && walletAmount > 0 && calculateFinalAmount() > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <div className="flex items-center gap-2 mb-1">
                      <FaInfoCircle className="text-blue-500" />
                      <span className="font-semibold">Payment Split:</span>
                    </div>
                    <div className="ml-5 space-y-1">
                      <div className="flex justify-between">
                        <span>Wallet Payment:</span>
                        <span className="font-medium">₹{walletAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Online Payment:</span>
                        <span className="font-medium">₹{calculateFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {calculateFinalAmount() === 0 && useWallet && (
                  <div className="bg-green-50 rounded-lg p-3 text-xs text-green-700 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>Full payment will be deducted from your wallet balance</span>
                  </div>
                )}
              </div>

              {/* Validation Summary */}
              {Object.keys(formErrors).length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 mb-2">
                        Please fix the following issues:
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {Object.entries(formErrors).map(([field, error]) => (
                          <li key={field} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(formErrors).length > 0}
                className={`w-full mt-6 text-white py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  calculateFinalAmount() === 0 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-primary to-primary-dark'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : calculateFinalAmount() === 0 ? (
                  <>
                    <FaWallet />
                    Confirm Booking (Pay via Wallet)
                  </>
                ) : useWallet && walletAmount > 0 ? (
                  <>
                    <FaCreditCard />
                    Pay ₹{calculateFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Wallet: ₹{walletAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Proceed to Payment - ₹{calculateFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaShieldAlt className="text-green-500" />
                <span>
                  {calculateFinalAmount() === 0 
                    ? '100% payment via Wallet - Secure & Instant' 
                    : useWallet && walletAmount > 0
                    ? `₹${walletAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} from wallet + ₹${calculateFinalAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })} via PayU`
                    : 'Secure payment powered by PayU'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>

      {/* Custom Alert */}
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        <div className={`${alert.isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <CustomAlert
            isOpen={alert.isOpen}
            onClose={() => setAlert({ ...alert, isOpen: false })}
            type={alert.type}
            title={alert.title}
            message={alert.message}
          />
        </div>
      </div>

      {/* AMC Subscription Confirmation Dialog */}
      {confirmationDialog.isOpen && (
        <div className="fixed inset-0 confirmation-dialog z-[10001]">
          <CustomAlert
            isOpen={confirmationDialog.isOpen}
            onClose={() => setConfirmationDialog({ isOpen: false, plan: null, addressData: null })}
            type="info"
            title="Confirm AMC Subscription"
            message={
              confirmationDialog.plan && confirmationDialog.addressData ? (
                <div className="space-y-4">
                  {/* Subscription Details */}
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📋</span>
                      </div>
                      <h4 className="font-bold text-primary">Subscription Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Plan:</span>
                        <p className="font-semibold text-primary">{confirmationDialog.plan.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <p className="font-semibold text-primary">₹{confirmationDialog.plan.price.toLocaleString('en-IN')}/year</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Type:</span>
                        <p className="font-semibold text-primary">{confirmationDialog.plan.planType?.charAt(0).toUpperCase() + confirmationDialog.plan.planType?.slice(1) || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Address */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🏠</span>
                      </div>
                      <h4 className="font-bold text-green-700">Service Address</h4>
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium text-green-800">{confirmationDialog.addressData.address}</p>
                      </div>
                      {confirmationDialog.addressData.landmark && (
                        <div>
                          <span className="text-gray-600">Landmark:</span>
                          <p className="font-medium text-green-800">{confirmationDialog.addressData.landmark}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Pincode:</span>
                        <p className="font-medium text-green-800">{confirmationDialog.addressData.pincode}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Details */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">👤</span>
                      </div>
                      <h4 className="font-bold text-slate-700">Customer Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium text-slate-800">{confirmationDialog.addressData.customerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-slate-800">{confirmationDialog.addressData.customerPhone}</p>
                      </div>
                      {confirmationDialog.addressData.customerEmail && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium text-slate-800">{confirmationDialog.addressData.customerEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Notice */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-800 mb-1">Payment Gateway Redirect</h4>
                        <p className="text-amber-700 text-sm">
                          You will be redirected to our secure payment gateway to complete the subscription payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : 'Loading subscription details...'
            }
            confirmText="Subscribe Now"
            cancelText="Cancel"
            showCancel={true}
            onConfirm={handleAMCConfirmation}
          />
        </div>
      )}

    </>
  )
}

export default ServiceCheckout