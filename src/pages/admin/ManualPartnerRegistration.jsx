import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiPhone, FiMail, FiMapPin, FiFileText, FiCreditCard, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiUpload, FiX, FiCamera, FiEdit } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { adminApi } from '../../services/adminApi.js'

const ManualPartnerRegistration = () => {
  const { token } = useAdminAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState([])
  const [hubs, setHubs] = useState([])
  const [mgPlans, setMgPlans] = useState([])
  const [pricingSettings, setPricingSettings] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const signatureCanvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000000'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    phone: '',
    whatsappNumber: '',
    name: '',
    email: '',
    qualification: '',
    experience: '',
    partnerType: 'individual',
    
    // Address Information
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    
    // Service Information
    category: [],
    categoryNames: [],
    modeOfService: 'both',
    selectedHubs: [],
    
    // MG Plan
    selectedPlan: null,
    selectedPlanId: null,
    
    // Profile Picture
    profilePicture: null,
    profilePicturePreview: null,
    
    // KYC Documents (files)
    kycDocuments: {
      panCard: null,
      aadhaar: null,
      aadhaarback: null,
      drivingLicence: null,
      bill: null,
      chequeImage: null
    },
    
    // Bank Details
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: ''
    },
    
    // Payment Information
    registerAmount: 0,
    securityDeposit: 0,
    toolkitPrice: 0,
    paymentApproved: false,
    registerdFee: false,
    paidBy: 'Admin',
    
    // Terms & Signature
    terms: {
      accepted: false,
      signature: null
    },
    
    // Additional
    agentName: '',
    gstNumber: '',
    referralCode: '',
    profileStatus: 'active'
  })

  // Fetch categories, hubs, fees, and MG plans on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log('No token available')
        setLoadingData(false)
        return
      }

      setLoadingData(true)
      try {
        console.log('Fetching categories, hubs, fees, and MG plans...')
        
        // Fetch categories using adminApi
        try {
          const categoriesData = await adminApi.fetchCategories(token)
          console.log('Categories response:', categoriesData)
          const cats = categoriesData.categories || categoriesData.data || []
          setCategories(cats)
          console.log('Categories set:', cats.length)
        } catch (catError) {
          console.error('Error fetching categories:', catError)
          setError('Failed to load categories. Please refresh the page.')
        }

        // Fetch hubs using adminApi
        try {
          const hubsData = await adminApi.fetchHubs(token)
          console.log('Hubs response:', hubsData)
          const hubsList = hubsData.hubs || hubsData.data || []
          setHubs(hubsList)
          console.log('Hubs set:', hubsList.length)
        } catch (hubError) {
          console.error('Error fetching hubs:', hubError)
          setError('Failed to load hubs. Please refresh the page.')
        }

        // Fetch fees using adminApi
        try {
          const feesData = await adminApi.fetchFees(token)
          console.log('Fees response:', feesData)
          setPricingSettings(feesData.data || feesData)
          
          // Set initial fees based on default partner type (individual)
          const partnerTypeFees = feesData.data?.individual || feesData.individual || feesData.data || feesData
          setFormData(prev => ({
            ...prev,
            registerAmount: partnerTypeFees.registrationFee || 0,
            securityDeposit: partnerTypeFees.securityDeposit || 0,
            toolkitPrice: partnerTypeFees.toolkitPrice || 0
          }))
        } catch (feeError) {
          console.error('Error fetching fees:', feeError)
        }

        // Note: MG plans are fetched separately based on partner type in another useEffect
      } catch (err) {
        console.error('Error in fetchData:', err)
        setError('Failed to load data. Please refresh the page.')
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [token])

  // Update fees and filter MG plans when partner type changes
  useEffect(() => {
    if (pricingSettings && formData.partnerType) {
      const partnerTypeFees = pricingSettings[formData.partnerType] || pricingSettings
      setFormData(prev => ({
        ...prev,
        registerAmount: partnerTypeFees.registrationFee || 0,
        securityDeposit: partnerTypeFees.securityDeposit || 0,
        toolkitPrice: partnerTypeFees.toolkitPrice || 0,
        // Clear MG plan selection when partner type changes
        selectedPlanId: null,
        selectedPlan: null
      }))
    }
  }, [formData.partnerType, pricingSettings])

  // Fetch and filter MG plans when partner type changes
  useEffect(() => {
    const fetchMGPlans = async () => {
      if (!token) return

      try {
        console.log('Fetching MG plans for partner type:', formData.partnerType)
        const mgPlansData = await adminApi.fetchMGPlans(token)
        console.log('MG Plans response:', mgPlansData)
        const allPlans = mgPlansData.plans || mgPlansData.data || []
        
        // Filter plans by partner type
        const filteredPlans = allPlans.filter(plan => {
          if (!plan.partnerType || plan.partnerType === 'both') return true
          return plan.partnerType === formData.partnerType
        })
        
        console.log('Filtered MG Plans:', filteredPlans.length, 'for type:', formData.partnerType)
        setMgPlans(filteredPlans)
      } catch (mgError) {
        console.error('Error fetching MG plans:', mgError)
        setMgPlans([])
      }
    }

    if (formData.partnerType) {
      fetchMGPlans()
    }
  }, [formData.partnerType, token])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }))
  }

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const isSelected = prev.category.includes(categoryId)
      const newCategories = isSelected
        ? prev.category.filter(id => id !== categoryId)
        : [...prev.category, categoryId]
      
      // Update category names
      const selectedCats = categories.filter(cat => newCategories.includes(cat._id))
      const categoryNames = selectedCats.map(cat => cat.name)
      
      return { 
        ...prev, 
        category: newCategories,
        categoryNames: categoryNames
      }
    })
  }

  const handleHubChange = (hubId) => {
    setFormData(prev => {
      const isSelected = prev.selectedHubs.some(h => h.hubId === hubId)
      const hub = hubs.find(h => h._id === hubId)
      
      if (isSelected) {
        return {
          ...prev,
          selectedHubs: prev.selectedHubs.filter(h => h.hubId !== hubId)
        }
      } else {
        return {
          ...prev,
          selectedHubs: [
            ...prev.selectedHubs,
            {
              hubId: hub._id,
              name: hub.name,
              pinCodes: hub.areas?.flatMap(area => area.pinCodes || []) || []
            }
          ]
        }
      }
    })
  }

  const handleFileUpload = (field, file) => {
    if (!file) return
    
    setFormData(prev => ({
      ...prev,
      kycDocuments: {
        ...prev.kycDocuments,
        [field]: file
      }
    }))
  }

  const handleProfilePictureUpload = (file) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeFile = (field) => {
    setFormData(prev => ({
      ...prev,
      kycDocuments: {
        ...prev.kycDocuments,
        [field]: null
      }
    }))
  }

  const removeProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null,
      profilePicturePreview: null
    }))
  }

  // Signature canvas functions
  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = signatureCanvasRef.current
      if (canvas) {
        const signatureData = canvas.toDataURL('image/png')
        setFormData(prev => ({
          ...prev,
          terms: {
            ...prev.terms,
            signature: signatureData
          }
        }))
      }
    }
    setIsDrawing(false)
  }

  // Touch event handlers for mobile support
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    startDrawing(mouseEvent)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    draw(mouseEvent)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    stopDrawing()
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Reset canvas properties and fill with white background
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    setFormData(prev => ({
      ...prev,
      terms: {
        ...prev.terms,
        signature: null
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Create FormData for file uploads
      const submitData = new FormData()
      
      // Add basic fields
      submitData.append('phone', formData.phone)
      submitData.append('whatsappNumber', formData.whatsappNumber || formData.phone)
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('qualification', formData.qualification)
      submitData.append('experience', formData.experience)
      submitData.append('partnerType', formData.partnerType)
      submitData.append('address', formData.address)
      submitData.append('landmark', formData.landmark)
      submitData.append('pincode', formData.pincode)
      submitData.append('city', formData.city)
      submitData.append('modeOfService', formData.modeOfService)
      submitData.append('agentName', formData.agentName)
      submitData.append('gstNumber', formData.gstNumber)
      submitData.append('referralCode', formData.referralCode)
      submitData.append('profileStatus', formData.profileStatus)
      
      // Add arrays as JSON strings
      submitData.append('category', JSON.stringify(formData.category))
      submitData.append('categoryNames', JSON.stringify(formData.categoryNames))
      console.log('Selected Hubs being sent:', formData.selectedHubs)
      submitData.append('selectedHubs', JSON.stringify(formData.selectedHubs))
      
      // Add bank details as JSON
      submitData.append('bankDetails', JSON.stringify(formData.bankDetails))
      
      // Add payment info
      submitData.append('registerAmount', formData.registerAmount)
      submitData.append('securityDeposit', formData.securityDeposit)
      submitData.append('toolkitPrice', formData.toolkitPrice)
      submitData.append('paymentApproved', formData.paymentApproved)
      submitData.append('registerdFee', formData.registerdFee)
      submitData.append('paidBy', formData.paidBy)
      
      // Add terms
      submitData.append('termsAccepted', formData.terms.accepted)
      if (formData.terms.signature) {
        submitData.append('signature', formData.terms.signature)
      }
      
      // Add MG Plan (if selected)
      if (formData.selectedPlanId) {
        submitData.append('selectedPlanId', formData.selectedPlanId)
        submitData.append('selectedPlan', formData.selectedPlan)
      }
      
      // Add profile picture
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture)
      }
      
      // Add KYC documents
      Object.keys(formData.kycDocuments).forEach(key => {
        if (formData.kycDocuments[key]) {
          submitData.append(key, formData.kycDocuments[key])
        }
      })

      console.log('Submitting partner registration...')
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:9088'
      console.log('API URL:', apiUrl)
      
      const response = await fetch(`${apiUrl}/api/admin/partners/manual-register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: submitData
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers.get('content-type'))

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned invalid response. Please check server logs.')
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register partner')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate(`/admin/partners/${data.partner._id}`)
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Manual Partner Registration"
        subtitle="Register a new partner with complete details manually"
      />

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/partners')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-primary transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Partners
        </button>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-emerald-800 font-semibold">Partner registered successfully!</p>
              <p className="text-emerald-600 text-sm">Redirecting to partner details...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-rose-600" />
            <p className="text-rose-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="WhatsApp number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Partner's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Educational qualification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Partner Type <span className="text-rose-500">*</span>
                </label>
                <select
                  name="partnerType"
                  value={formData.partnerType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="franchise">Franchise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Referring agent name"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-primary" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Landmark <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nearby landmark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="6-digit pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="City name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="GST number (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-primary" />
              Service Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Categories <span className="text-rose-500">*</span>
                </label>
                {loadingData ? (
                  <div className="flex items-center justify-center p-8 border border-slate-200 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-3 text-slate-600">Loading categories...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 text-sm">
                    No categories available. Please add categories first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(category => (
                      <label key={category._id} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.category.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mode of Service <span className="text-rose-500">*</span>
                </label>
                <select
                  name="modeOfService"
                  value={formData.modeOfService}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiCamera className="w-5 h-5 text-primary" />
              Profile Picture
            </h3>
            <div className="flex items-center gap-6">
              {formData.profilePicturePreview ? (
                <div className="relative">
                  <img
                    src={formData.profilePicturePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-rose-600 transition"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <FiCamera className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                  <FiUpload className="w-4 h-4" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfilePictureUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-slate-500 mt-2">Recommended: Square image, at least 400x400px</p>
              </div>
            </div>
          </div>

          {/* Hub Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-primary" />
              Service Hubs
            </h3>
            <p className="text-sm text-slate-600 mb-4">Select the service hubs where this partner will operate</p>
            {loadingData ? (
              <div className="flex items-center justify-center p-8 border border-slate-200 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-3 text-slate-600">Loading hubs...</span>
              </div>
            ) : hubs.length === 0 ? (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 text-sm">
                No hubs available. Please create hubs first in Hub Management.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hubs.map(hub => {
                  const isSelected = formData.selectedHubs.some(h => h.hubId === hub._id)
                  const pinCodesCount = hub.areas?.reduce((acc, area) => acc + (area.pinCodes?.length || 0), 0) || 0
                  return (
                    <label
                      key={hub._id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleHubChange(hub._id)}
                        className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{hub.name}</div>
                        <div className="text-sm text-slate-600">{hub.city || 'N/A'}</div>
                        <div className="text-xs text-slate-500 mt-1">{pinCodesCount} pin codes</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {formData.selectedHubs.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Selected Hubs: {formData.selectedHubs.length}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedHubs.map(hub => (
                    <span key={hub.hubId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {hub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KYC Document Uploads */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-primary" />
              KYC Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'panCard', label: 'PAN Card' },
                { key: 'aadhaar', label: 'Aadhaar Front' },
                { key: 'aadhaarback', label: 'Aadhaar Back' },
                { key: 'drivingLicence', label: 'Driving Licence' },
                { key: 'bill', label: 'Utility Bill' },
                { key: 'chequeImage', label: 'Cancelled Cheque' }
              ].map(({ key, label }) => (
                <div key={key} className="border border-slate-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                  {formData.kycDocuments[key] ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{formData.kycDocuments[key].name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(key)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-slate-50 transition">
                      <FiUpload className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Upload {label}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(key, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-primary" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Bank account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleBankDetailsChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="IFSC code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleBankDetailsChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="As per bank records"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleBankDetailsChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Bank name"
                />
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiEdit className="w-5 h-5 text-primary" />
              Terms & Conditions
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.terms.accepted}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    terms: { ...prev.terms, accepted: e.target.checked }
                  }))}
                  className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  I confirm that the partner has accepted all terms and conditions
                </span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Partner Signature
                </label>
                <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={signatureCanvasRef}
                    width={600}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="w-full cursor-crosshair bg-white block"
                    style={{ 
                      touchAction: 'none',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">
                    Draw your signature above using mouse or touch
                  </p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    Clear Signature
                  </button>
                </div>
                {formData.terms.signature && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Signature captured successfully
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MG Plan Selection (Optional) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-primary" />
              MG Plan Selection (Optional)
            </h3>
            <p className="text-sm text-slate-600 mb-2">Select an MG plan for the partner (can be done later)</p>
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                Showing plans for: <strong className="capitalize">{formData.partnerType}</strong> partners
              </p>
            </div>
            {loadingData ? (
              <div className="flex items-center justify-center p-8 border border-slate-200 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-3 text-slate-600">Loading MG plans...</span>
              </div>
            ) : mgPlans.length === 0 ? (
              <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 text-sm">
                No MG plans available. Partner can select a plan later.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mgPlans.map(plan => (
                  <label
                    key={plan._id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.selectedPlanId === plan._id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedPlanId"
                      value={plan._id}
                      checked={formData.selectedPlanId === plan._id}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        selectedPlanId: e.target.value,
                        selectedPlan: plan.name
                      }))}
                      className="absolute top-4 right-4 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="pr-8">
                      <div className="text-lg font-bold text-slate-900">{plan.name}</div>
                      <div className="text-2xl font-bold text-primary mt-2">₹{plan.price}</div>
                      <div className="text-sm text-slate-600 mt-2 space-y-1">
                        <div>• {plan.leads} leads/month</div>
                        <div>• {plan.commission}% commission</div>
                        <div>• ₹{plan.leadFee} per lead</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-primary" />
              Payment Information
            </h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Fees are automatically set based on partner type ({formData.partnerType}). You can override them if needed.
              </p>
            </div>
            
            {/* Total Amount Summary */}
            {(() => {
              const registrationFee = Number(formData.registerAmount) || 0
              const securityDeposit = Number(formData.securityDeposit) || 0
              const toolkitPrice = Number(formData.toolkitPrice) || 0
              const selectedPlan = mgPlans.find(p => p._id === formData.selectedPlanId)
              const mgPlanPrice = selectedPlan ? Number(selectedPlan.price) : 0
              const totalAmount = registrationFee + securityDeposit + toolkitPrice + mgPlanPrice
              
              return totalAmount > 0 ? (
                <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">Total Amount Breakdown:</span>
                    <span className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {registrationFee > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Registration Fee:</span>
                        <span className="font-semibold">₹{registrationFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {securityDeposit > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Security Deposit:</span>
                        <span className="font-semibold">₹{securityDeposit.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {toolkitPrice > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Toolkit Price:</span>
                        <span className="font-semibold">₹{toolkitPrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {mgPlanPrice > 0 && (
                      <div className="flex justify-between text-primary font-semibold">
                        <span>MG Plan ({selectedPlan.name}):</span>
                        <span>₹{mgPlanPrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            })()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registration Amount (₹) <span className="text-xs text-slate-500">(Auto-fetched)</span>
                </label>
                <input
                  type="number"
                  name="registerAmount"
                  value={formData.registerAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Security Deposit (₹) <span className="text-xs text-slate-500">(Auto-fetched)</span>
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Toolkit Price (₹) <span className="text-xs text-slate-500">(Auto-fetched)</span>
                </label>
                <input
                  type="number"
                  name="toolkitPrice"
                  value={formData.toolkitPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paid By
                </label>
                <input
                  type="text"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Admin/Self/Agent"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="registerdFee"
                      checked={formData.registerdFee}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Registration Fee Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="paymentApproved"
                      checked={formData.paymentApproved}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Payment Approved</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/partners')}
              className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Registering...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Register Partner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualPartnerRegistration
