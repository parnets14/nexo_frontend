import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiRefreshCw, FiStar, FiArrowUp, FiArrowDown, FiEye, FiExternalLink } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { 
  FaSnowflake, FaBolt, FaTint, FaBroom, FaPaintRoller, 
  FaTools, FaHammer, FaFilter, FaPlug, FaWrench,
  FaCheckCircle, FaRupeeSign, FaCreditCard, FaMobileAlt,
  FaUserCheck, FaCommentDots, FaTimesCircle
} from 'react-icons/fa'

// Icon mapping for selection
const ICON_OPTIONS = [
  { name: 'FaSnowflake', label: 'AC Service', icon: FaSnowflake },
  { name: 'FaBolt', label: 'Electrical', icon: FaBolt },
  { name: 'FaTint', label: 'Plumbing', icon: FaTint },
  { name: 'FaBroom', label: 'Cleaning', icon: FaBroom },
  { name: 'FaPaintRoller', label: 'Painting', icon: FaPaintRoller },
  { name: 'FaTools', label: 'Tools/Repair', icon: FaTools },
  { name: 'FaHammer', label: 'Carpentry', icon: FaHammer },
  { name: 'FaFilter', label: 'Water Filter', icon: FaFilter },
  { name: 'FaPlug', label: 'Plug/Outlet', icon: FaPlug },
  { name: 'FaWrench', label: 'Wrench', icon: FaWrench },
  { name: 'FaCheckCircle', label: 'Check Circle', icon: FaCheckCircle },
  { name: 'FaRupeeSign', label: 'Rupee', icon: FaRupeeSign },
  { name: 'FaCreditCard', label: 'Credit Card', icon: FaCreditCard },
  { name: 'FaMobileAlt', label: 'Mobile', icon: FaMobileAlt },
  { name: 'FaUserCheck', label: 'User Check', icon: FaUserCheck },
  { name: 'FaCommentDots', label: 'Comment', icon: FaCommentDots },
]

const PopularServicesManagement = () => {
  const { token } = useAdminAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'FaTools',
    description: '',
    shortNotes: '',
    price: '',
    basePrice: 0,
    discount: 0,
    discountType: 'percentage',
    cgst: 0,
    sgst: 0,
    serviceCharge: 0,
    serviceChargeType: 'amount',
    visitingCharge: 0,
    trusted: 'Trusted by thousands of homes',
    included: [],
    excluded: [],
    addOns: [],
    cities: [],
    order: 0,
    isActive: true,
    emergencyService: {
      enabled: false,
      extraAmount: 0
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: '',
      structuredData: {},
      focusKeyword: '',
      altText: ''
    }
  })
  const [addOnForm, setAddOnForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    discount: 0,
    cgst: 0,
    sgst: 0,
    serviceCharge: 0,
    price: '',
    icon: 'FaTools',
    included: [],
    excluded: [],
    subServices: []
  })
  const [addOnIncludedItem, setAddOnIncludedItem] = useState('')
  const [addOnExcludedItem, setAddOnExcludedItem] = useState('')
  const [seoKeywordInput, setSeoKeywordInput] = useState('')
  const [ogImageFile, setOgImageFile] = useState(null)
  const [ogImagePreview, setOgImagePreview] = useState(null)
  const [subServiceForm, setSubServiceForm] = useState({
    name: '',
    shortDescription: '',
    price: '',
    icon: 'FaTools'
  })
  const [editingAddOnIndex, setEditingAddOnIndex] = useState(null)
  const [editingSubServiceIndex, setEditingSubServiceIndex] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [viewingService, setViewingService] = useState(null)
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)

  const { data: servicesData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchPopularServices(token),
    []
  )

  const services = servicesData?.data || []

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const response = await adminApi.fetchAllCities(token)
        if (response.success) {
          setCities(response.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err)
      } finally {
        setLoadingCities(false)
      }
    }
    
    if (token) {
      fetchCities()
    }
  }, [token])

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service._id)
      setFormData({
        name: service.name || '',
        slug: service.slug || '',
        icon: service.icon || 'FaTools',
        description: service.description || '',
        shortNotes: service.shortNotes || '',
        price: service.price || '',
        basePrice: service.basePrice || 0,
        discount: service.discount || 0,
        discountType: service.discountType || 'percentage',
        cgst: service.cgst || 0,
        sgst: service.sgst || 0,
        serviceCharge: service.serviceCharge || 0,
        serviceChargeType: service.serviceChargeType || 'amount',
        visitingCharge: service.visitingCharge || 0,
        trusted: service.trusted || 'Trusted by thousands of homes',
        included: service.included || [],
        excluded: service.excluded || [],
        addOns: service.addOns?.map(addOn => ({
          ...addOn,
          included: addOn.included || [],
          excluded: addOn.excluded || [],
          subServices: addOn.subServices || []
        })) || [],
        cities: service.cities?.map(city => typeof city === 'string' ? city : city._id) || [],
        order: service.order || 0,
        isActive: service.isActive !== undefined ? service.isActive : true,
        emergencyService: {
          enabled: service.emergencyService?.enabled || false,
          extraAmount: service.emergencyService?.extraAmount || 0
        },
        seo: service.seo || {
          metaTitle: service.name || '',
          metaDescription: service.description || '',
          metaKeywords: [],
          ogTitle: service.name || '',
          ogDescription: service.description || '',
          ogImage: '',
          canonicalUrl: '',
          structuredData: {},
          focusKeyword: '',
          altText: service.name || ''
        }
      })
      setOgImageFile(null)
      setOgImagePreview(service.seo?.ogImage || null)
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        slug: '',
        icon: 'FaTools',
        description: '',
        shortNotes: '',
        price: '',
        basePrice: 0,
        discount: 0,
        discountType: 'percentage',
        cgst: 0,
        sgst: 0,
        serviceCharge: 0,
        serviceChargeType: 'amount',
        visitingCharge: 0,
        trusted: 'Trusted by thousands of homes',
        included: [],
        excluded: [],
        addOns: [],
        cities: [],
        order: services.length > 0 ? Math.max(...services.map(s => s.order || 0)) + 1 : 0,
        isActive: true,
        emergencyService: {
          enabled: false,
          extraAmount: 0
        },
        seo: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: [],
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          canonicalUrl: '',
          structuredData: {},
          focusKeyword: '',
          altText: ''
        }
      })
      setOgImageFile(null)
      setOgImagePreview(null)
    }
    setAddOnForm({
      name: '',
      description: '',
      basePrice: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      serviceCharge: 0,
      price: '',
      icon: 'FaTools',
      included: [],
      excluded: [],
      subServices: []
    })
    setAddOnIncludedItem('')
    setAddOnExcludedItem('')
    setSubServiceForm({
      name: '',
      shortDescription: '',
      price: '',
      icon: 'FaTools'
    })
    setEditingAddOnIndex(null)
    setEditingSubServiceIndex(null)
    setShowModal(true)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingService(null)
      setFormData({
        name: '',
        slug: '',
        icon: 'FaTools',
        description: '',
        shortNotes: '',
        price: '',
        basePrice: 0,
        discount: 0,
        discountType: 'percentage',
        cgst: 0,
        sgst: 0,
        serviceCharge: 0,
        serviceChargeType: 'amount',
        visitingCharge: 0,
        trusted: 'Trusted by thousands of homes',
        included: [],
        excluded: [],
        addOns: [],
        cities: [],
        order: 0,
        isActive: true,
        emergencyService: {
          enabled: false,
          extraAmount: 0
        }
      })
    setAddOnIncludedItem('')
    setAddOnExcludedItem('')
    setSubServiceForm({
      name: '',
      shortDescription: '',
      price: '',
      icon: 'FaTools'
    })
    setOgImageFile(null)
    setOgImagePreview(null)
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Add-On Included/Excluded handlers
  const handleAddAddOnIncluded = () => {
    if (addOnIncludedItem.trim()) {
      setAddOnForm(prev => ({
        ...prev,
        included: [...prev.included, addOnIncludedItem.trim()]
      }))
      setAddOnIncludedItem('')
    }
  }

  const handleRemoveAddOnIncluded = (index) => {
    setAddOnForm(prev => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index)
    }))
  }

  const handleAddAddOnExcluded = () => {
    if (addOnExcludedItem.trim()) {
      setAddOnForm(prev => ({
        ...prev,
        excluded: [...prev.excluded, addOnExcludedItem.trim()]
      }))
      setAddOnExcludedItem('')
    }
  }

  const handleRemoveAddOnExcluded = (index) => {
    setAddOnForm(prev => ({
      ...prev,
      excluded: prev.excluded.filter((_, i) => i !== index)
    }))
  }

  // Sub-Service handlers
  const handleAddSubService = () => {
    if (subServiceForm.name.trim() && subServiceForm.price.trim()) {
      if (editingSubServiceIndex !== null) {
        setAddOnForm(prev => ({
          ...prev,
          subServices: prev.subServices.map((sub, i) => 
            i === editingSubServiceIndex ? { ...subServiceForm } : sub
          )
        }))
        setEditingSubServiceIndex(null)
      } else {
        setAddOnForm(prev => ({
          ...prev,
          subServices: [...prev.subServices, { ...subServiceForm }]
        }))
      }
      setSubServiceForm({
        name: '',
        shortDescription: '',
        price: ''
      })
    }
  }

  const handleEditSubService = (index) => {
    const subService = addOnForm.subServices[index]
    setSubServiceForm({
      name: subService.name || '',
      shortDescription: subService.shortDescription || '',
      price: subService.price || '',
      icon: subService.icon || 'FaTools'
    })
    setEditingSubServiceIndex(index)
  }

  const handleRemoveSubService = (index) => {
    setAddOnForm(prev => ({
      ...prev,
      subServices: prev.subServices.filter((_, i) => i !== index)
    }))
    if (editingSubServiceIndex === index) {
      setEditingSubServiceIndex(null)
      setSubServiceForm({
        name: '',
        shortDescription: '',
        price: ''
      })
    }
  }

  const handleCancelEditSubService = () => {
    setEditingSubServiceIndex(null)
    setSubServiceForm({
      name: '',
      shortDescription: '',
      price: '',
      icon: 'FaTools'
    })
  }

  // Calculate addOn display price
  const calculateAddOnPrice = (addOn) => {
    if (!addOn.basePrice || addOn.basePrice <= 0) return ''
    
    let total = addOn.basePrice || 0
    // Apply discount
    if (addOn.discount > 0) {
      total -= total * addOn.discount / 100
    }
    // Add service charge
    if (addOn.serviceCharge > 0) {
      total += addOn.serviceCharge
    }
    // Add emergency service charge if enabled
    if (formData.emergencyService?.enabled && formData.emergencyService?.extraAmount > 0) {
      total += formData.emergencyService.extraAmount
    }
    // Calculate GST on subtotal
    const subtotal = (addOn.basePrice || 0) - 
      (addOn.discount > 0 ? (addOn.basePrice || 0) * addOn.discount / 100 : 0) +
      (addOn.serviceCharge || 0) +
      (formData.emergencyService?.enabled ? (formData.emergencyService?.extraAmount || 0) : 0)
    total += (subtotal * (addOn.cgst || 0) / 100) + (subtotal * (addOn.sgst || 0) / 100)
    return `₹${Math.round(total)}`
  }

  // Auto-update addOn price when fields change
  useEffect(() => {
    if (addOnForm.basePrice > 0) {
      const calculatedPrice = calculateAddOnPrice(addOnForm)
      if (!addOnForm.price || addOnForm.price.startsWith('₹') || addOnForm.price === '') {
        setAddOnForm(prev => ({
          ...prev,
          price: calculatedPrice
        }))
      }
    }
  }, [addOnForm.basePrice, addOnForm.discount, addOnForm.cgst, addOnForm.sgst, addOnForm.serviceCharge, formData.emergencyService.enabled, formData.emergencyService.extraAmount])

  const handleAddAddOn = () => {
    if (addOnForm.name.trim() && addOnForm.basePrice > 0) {
      const newAddOn = {
        ...addOnForm,
        price: addOnForm.price || calculateAddOnPrice(addOnForm),
        included: addOnForm.included || [],
        excluded: addOnForm.excluded || [],
        subServices: addOnForm.subServices || []
      }
      
      if (editingAddOnIndex !== null) {
        // Update existing addOn
      setFormData(prev => ({
        ...prev,
          addOns: prev.addOns.map((addon, i) => i === editingAddOnIndex ? newAddOn : addon)
        }))
        setEditingAddOnIndex(null)
      } else {
        // Add new addOn
        setFormData(prev => ({
          ...prev,
          addOns: [...prev.addOns, newAddOn]
        }))
      }
      
      // Reset form
      setAddOnForm({
        name: '',
        description: '',
        basePrice: 0,
        discount: 0,
        cgst: 0,
        sgst: 0,
        serviceCharge: 0,
        price: '',
        icon: 'FaTools',
        included: [],
        excluded: [],
        subServices: []
      })
      setAddOnIncludedItem('')
      setAddOnExcludedItem('')
      setSubServiceForm({
        name: '',
        shortDescription: '',
        price: ''
      })
      setEditingSubServiceIndex(null)
    }
  }

  const handleEditAddOn = (index) => {
    const addOn = formData.addOns[index]
    setAddOnForm({
      name: addOn.name || '',
      description: addOn.description || '',
      basePrice: addOn.basePrice || 0,
      discount: addOn.discount || 0,
      cgst: addOn.cgst || 0,
      sgst: addOn.sgst || 0,
      serviceCharge: addOn.serviceCharge || 0,
      price: addOn.price || '',
      icon: addOn.icon || 'FaTools',
      included: addOn.included || [],
      excluded: addOn.excluded || [],
      subServices: addOn.subServices || []
    })
    setEditingAddOnIndex(index)
    setAddOnIncludedItem('')
    setAddOnExcludedItem('')
    setSubServiceForm({
      name: '',
      shortDescription: '',
      price: '',
      icon: 'FaTools'
    })
    setEditingSubServiceIndex(null)
  }

  const handleRemoveAddOn = (index) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index)
    }))
    if (editingAddOnIndex === index) {
      setEditingAddOnIndex(null)
      setAddOnForm({
        name: '',
        description: '',
        basePrice: 0,
        discount: 0,
        cgst: 0,
        sgst: 0,
        serviceCharge: 0,
        price: '',
        icon: 'FaTools',
        included: [],
        excluded: [],
        subServices: []
      })
    }
  }

  const handleCancelEditAddOn = () => {
    setEditingAddOnIndex(null)
    setAddOnForm({
      name: '',
      description: '',
      basePrice: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      serviceCharge: 0,
      price: '',
      icon: 'FaTools',
      included: [],
      excluded: [],
      subServices: []
    })
    setAddOnIncludedItem('')
    setAddOnExcludedItem('')
    setSubServiceForm({
      name: '',
      shortDescription: '',
      price: '',
      icon: 'FaTools'
    })
    setEditingSubServiceIndex(null)
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingService ? prev.slug : generateSlug(name)
    }))
  }

  const handleOgImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setOgImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setOgImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveOgImage = () => {
    setOgImageFile(null)
    setOgImagePreview(null)
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        ogImage: ''
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const submitData = {
        ...formData,
        ogImageFile: ogImageFile
      }

      if (editingService) {
        // Update service
        await adminApi.updatePopularService(token, editingService, submitData)
        setSuccessMsg('Popular service updated successfully!')
      } else {
        // Create service
        await adminApi.createPopularService(token, submitData)
        setSuccessMsg('Popular service created successfully!')
      }

      refresh()
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save popular service')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this popular service?')) {
      return
    }

    try {
      await adminApi.deletePopularService(token, serviceId)
      setSuccessMsg('Popular service deleted successfully!')
      refresh()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete popular service')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const handleMoveOrder = async (serviceId, direction) => {
    const service = services.find(s => s._id === serviceId)
    if (!service) return

    const currentOrder = service.order || 0
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

    // Find service at new position
    const targetService = services.find(s => (s.order || 0) === newOrder)
    
    try {
      const updates = [{ id: serviceId, order: newOrder }]
      if (targetService) {
        updates.push({ id: targetService._id, order: currentOrder })
      }

      await adminApi.updatePopularServicesOrder(token, updates)
      refresh()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update order')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const getIconComponent = (iconName) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.name === iconName)
    return iconOption ? iconOption.icon : FaTools
  }

  const handleViewDetails = (service) => {
    setViewingService(service)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setViewingService(null)
  }

  const calculateTotalPrice = (service) => {
    if (!service || !service.basePrice) return 0
    let total = service.basePrice || 0
    // Apply discount
    if (service.discount > 0) {
      if (service.discountType === 'percentage') {
        total -= total * service.discount / 100
      } else {
        total -= service.discount
      }
    }
    // Add service charge
    if (service.serviceCharge > 0) {
      if (service.serviceChargeType === 'percentage') {
        total += (service.basePrice || 0) * service.serviceCharge / 100
      } else {
        total += service.serviceCharge
      }
    }
    // Calculate GST on subtotal
    const subtotal = (service.basePrice || 0) - 
      (service.discount > 0 ? (service.discountType === 'percentage' ? (service.basePrice || 0) * service.discount / 100 : service.discount) : 0) +
      (service.serviceCharge > 0 ? (service.serviceChargeType === 'percentage' ? (service.basePrice || 0) * service.serviceCharge / 100 : service.serviceCharge) : 0)
    total += (subtotal * (service.cgst || 0) / 100) + (subtotal * (service.sgst || 0) / 100)
    return total
  }

  // Calculate display price from form data
  const calculateDisplayPrice = (data = formData) => {
    if (!data.basePrice || data.basePrice <= 0) return ''
    
    const total = calculateTotalPrice(data)
    return `Starting at ₹${Math.round(total)}`
  }

  // Auto-update display price when pricing fields change
  useEffect(() => {
    if (formData.basePrice > 0) {
      const calculatedPrice = calculateDisplayPrice(formData)
      // Only auto-update if user hasn't manually edited it or if it's empty
      if (!formData.price || formData.price.startsWith('Starting at ₹') || formData.price === '') {
        setFormData(prev => ({
          ...prev,
          price: calculatedPrice
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.basePrice, formData.discount, formData.discountType, formData.cgst, formData.sgst, formData.serviceCharge, formData.serviceChargeType])

  const handleMigrateServices = async () => {
    if (!window.confirm('This will update all existing services in the database with new fields (basePrice, discount, CGST, SGST, serviceCharge, excluded, etc.). This ensures all services have the required fields. Continue?')) {
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      await adminApi.migratePopularServices(token)
      setSuccessMsg('Migration completed successfully! All existing services have been updated with new fields.')
      refresh()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to migrate services')
      setTimeout(() => setErrorMsg(''), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Popular Services Management"
        subtitle="Manage popular services displayed on the homepage. Control order, icons, and visibility."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleMigrateServices}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              title="Update existing services with new fields"
            >
              <FiRefreshCw className="w-5 h-5" />
              Migrate Data
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
            >
              <FiPlus className="w-5 h-5" />
              Add Service
            </button>
          </div>
        }
      />

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg mb-6">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search popular services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          Error loading popular services: {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cities</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No popular services found. Click "Add Service" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredServices
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((service, index) => {
                      const IconComponent = getIconComponent(service.icon)
                      return (
                        <tr key={service._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">{service.order || 0}</span>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMoveOrder(service._id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <FiArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(service._id, 'down')}
                                  disabled={index === filteredServices.length - 1}
                                  className="p-1 text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <FiArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">{service.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-500 font-mono">{service.slug}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600">
                              {!service.cities || service.cities.length === 0 ? (
                                <span className="text-slate-400">All cities</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {service.cities.slice(0, 2).map((city, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                      {typeof city === 'string' ? city : city.name}
                                    </span>
                                  ))}
                                  {service.cities.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                      +{service.cities.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                service.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  if (service?.slug) {
                                    navigate(`/service/${service.slug}`)
                                  }
                                }}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Service on Website"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewDetails(service)}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenModal(service)}
                                className="p-2 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(service._id)}
                                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingService ? 'Edit Popular Service' : 'Add Popular Service'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="e.g., AC Service"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary font-mono"
                  placeholder="e.g., ac-service"
                />
                <p className="mt-1 text-xs text-slate-500">URL-friendly identifier (auto-generated from name)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {ICON_OPTIONS.map((option) => {
                    const IconComponent = option.icon
                    const isSelected = formData.icon === option.name
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: option.name }))}
                        className={`p-4 rounded-xl border-2 transition ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-200 hover:border-primary/50'
                        }`}
                        title={option.label}
                      >
                        <IconComponent className={`w-6 h-6 mx-auto ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                        <p className="mt-2 text-xs text-center text-slate-600">{option.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Service description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Short Notes
                </label>
                <textarea
                  value={formData.shortNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortNotes: e.target.value }))}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Brief notes about the service..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Visiting Charge (₹)
                </label>
                <input
                  type="number"
                  value={formData.visitingCharge}
                  onChange={(e) => setFormData(prev => ({ ...prev, visitingCharge: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <p className="mt-1 text-xs text-slate-500">Additional charge for visiting the customer location</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Trusted Text
                </label>
                <input
                  type="text"
                  value={formData.trusted}
                  onChange={(e) => setFormData(prev => ({ ...prev, trusted: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="e.g., Trusted by thousands of homes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                   Services
                </label>
                
                {/* Add-On Form */}
                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    {editingAddOnIndex !== null ? 'Edit Service' : 'Add New Service'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                  <input
                    type="text"
                        value={addOnForm.name}
                        onChange={(e) => setAddOnForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        placeholder="Add-on service name..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                      <textarea
                        value={addOnForm.description}
                        onChange={(e) => setAddOnForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        placeholder="Service description..."
                        rows="2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Base Price (₹) *</label>
                        <input
                          type="number"
                          value={addOnForm.basePrice}
                          onChange={(e) => setAddOnForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          value={addOnForm.discount}
                          onChange={(e) => setAddOnForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">CGST (%)</label>
                        <input
                          type="number"
                          value={addOnForm.cgst}
                          onChange={(e) => setAddOnForm(prev => ({ ...prev, cgst: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">SGST (%)</label>
                        <input
                          type="number"
                          value={addOnForm.sgst}
                          onChange={(e) => setAddOnForm(prev => ({ ...prev, sgst: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Service Charge (₹)</label>
                      <input
                        type="number"
                        value={addOnForm.serviceCharge}
                        onChange={(e) => setAddOnForm(prev => ({ ...prev, serviceCharge: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Display Price (Text) <span className="text-slate-400">(Auto-calculated)</span>
                      </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                          value={addOnForm.price}
                          onChange={(e) => setAddOnForm(prev => ({ ...prev, price: e.target.value }))}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="e.g., ₹299"
                        />
                        {addOnForm.basePrice > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const calculatedPrice = calculateAddOnPrice(addOnForm)
                              setAddOnForm(prev => ({ ...prev, price: calculatedPrice }))
                            }}
                            className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-xs font-semibold whitespace-nowrap"
                          >
                            Auto Calculate
                          </button>
                        )}
                      </div>
                      {addOnForm.basePrice > 0 && (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-emerald-600">
                            💡 Calculated: {calculateAddOnPrice(addOnForm)}
                          </p>
                          {formData.emergencyService?.enabled && formData.emergencyService?.extraAmount > 0 && (
                            <p className="text-xs text-orange-600">
                              ⚡ Includes emergency service charge: +₹{formData.emergencyService.extraAmount}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Icon</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {ICON_OPTIONS.map((option) => {
                          const IconComponent = option.icon
                          const isSelected = addOnForm.icon === option.name
                          return (
                            <button
                              key={option.name}
                              type="button"
                              onClick={() => setAddOnForm(prev => ({ ...prev, icon: option.name }))}
                              className={`p-2 rounded-lg border-2 transition ${
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-slate-200 hover:border-primary/50'
                              }`}
                              title={option.label}
                            >
                              <IconComponent className={`w-4 h-4 mx-auto ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Included Items */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Included Items</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={addOnIncludedItem}
                          onChange={(e) => setAddOnIncludedItem(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddOnIncluded())}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="Add included item..."
                        />
                        <button
                          type="button"
                          onClick={handleAddAddOnIncluded}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-1">
                        {addOnForm.included.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                            <span className="text-xs text-slate-700">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAddOnIncluded(index)}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Excluded Items */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Excluded Items</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={addOnExcludedItem}
                          onChange={(e) => setAddOnExcludedItem(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddOnExcluded())}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                          placeholder="Add excluded item..."
                        />
                        <button
                          type="button"
                          onClick={handleAddAddOnExcluded}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-1">
                        {addOnForm.excluded.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                            <span className="text-xs text-slate-700">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAddOnExcluded(index)}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-Services */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Sub-Services</label>
                      <div className="bg-white p-3 rounded-lg border-2 border-slate-200 space-y-2 mb-2">
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Service Name *</label>
                            <input
                              type="text"
                              value={subServiceForm.name}
                              onChange={(e) => setSubServiceForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-xs"
                              placeholder="Sub-service name..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Short Description</label>
                            <input
                              type="text"
                              value={subServiceForm.shortDescription}
                              onChange={(e) => setSubServiceForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-xs"
                              placeholder="Brief description..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Price *</label>
                            <input
                              type="text"
                              value={subServiceForm.price}
                              onChange={(e) => setSubServiceForm(prev => ({ ...prev, price: e.target.value }))}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-primary text-xs"
                              placeholder="e.g., ₹299"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Icon</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded">
                            {ICON_OPTIONS.map((option) => {
                              const IconComponent = option.icon
                              const isSelected = subServiceForm.icon === option.name
                              return (
                                <button
                                  key={option.name}
                                  type="button"
                                  onClick={() => setSubServiceForm(prev => ({ ...prev, icon: option.name }))}
                                  className={`p-1.5 rounded border transition ${
                                    isSelected
                                      ? 'border-primary bg-primary/10'
                                      : 'border-slate-200 hover:border-primary/50'
                                  }`}
                                  title={option.label}
                                >
                                  <IconComponent className={`w-3 h-3 mx-auto ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddSubService}
                            className="flex-1 px-3 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition text-xs font-semibold"
                          >
                            {editingSubServiceIndex !== null ? 'Update Sub-Service' : 'Add Sub-Service'}
                          </button>
                          {editingSubServiceIndex !== null && (
                            <button
                              type="button"
                              onClick={handleCancelEditSubService}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {addOnForm.subServices.map((subService, index) => {
                          const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')
                          return (
                          <div key={index} className="flex items-start justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                            <div className="flex items-start gap-2 flex-1">
                              <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <SubServiceIcon className="w-3 h-3 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-slate-900">{subService.name}</div>
                                {subService.shortDescription && (
                                  <div className="text-xs text-slate-600 mt-0.5">{subService.shortDescription}</div>
                                )}
                                <div className="text-xs text-primary font-semibold mt-0.5">{subService.price}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                type="button"
                                onClick={() => handleEditSubService(index)}
                                className="p-1 text-primary hover:bg-primary/10 rounded transition"
                                title="Edit"
                              >
                                <FiEdit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubService(index)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Remove"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleAddAddOn}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold text-sm"
                    >
                        {editingAddOnIndex !== null ? 'Update Service' : 'Add Service'}
                    </button>
                      {editingAddOnIndex !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditAddOn}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
                </div>

                {/* Add-Ons List */}
                <div className="space-y-2">
                  {formData.emergencyService?.enabled && formData.emergencyService?.extraAmount > 0 && formData.addOns.length > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-700">
                        ⚡ Emergency service charge (+₹{formData.emergencyService.extraAmount}) will be applied to all services and their sub-services
                      </p>
                    </div>
                  )}
                  {formData.addOns.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No services added yet</p>
                  ) : (
                    formData.addOns.map((addon, index) => {
                      const AddOnIcon = getIconComponent(addon.icon || 'FaTools')
                      return (
                        <div key={index} className="flex items-start justify-between bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AddOnIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-900">{addon.name}</div>
                              {addon.description && (
                                <div className="text-xs text-slate-600 mt-1">{addon.description}</div>
                              )}
                              <div className="text-xs text-slate-500 mt-1">
                                Base: ₹{addon.basePrice || 0} | 
                                {addon.discount > 0 && ` Discount: ${addon.discount}% |`}
                                {addon.cgst > 0 && ` CGST: ${addon.cgst}% |`}
                                {addon.sgst > 0 && ` SGST: ${addon.sgst}% |`}
                                {addon.serviceCharge > 0 && ` Charge: ₹${addon.serviceCharge} |`}
                                {' '}Price: {addon.price || 'N/A'}
                              </div>
                              {addon.included && addon.included.length > 0 && (
                                <div className="text-xs text-slate-600 mt-1">
                                  <span className="font-semibold">Included:</span> {addon.included.join(', ')}
                                </div>
                              )}
                              {addon.excluded && addon.excluded.length > 0 && (
                                <div className="text-xs text-slate-600 mt-1">
                                  <span className="font-semibold">Excluded:</span> {addon.excluded.join(', ')}
                                </div>
                              )}
                              {addon.subServices && addon.subServices.length > 0 && (
                                <div className="text-xs text-slate-600 mt-1">
                                  <span className="font-semibold">Sub-Services:</span> {addon.subServices.length} item(s)
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEditAddOn(index)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOn(index)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Remove"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Available Cities
                </label>
                {loadingCities ? (
                  <div className="text-sm text-slate-500">Loading cities...</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const allCityIds = cities.map(c => c._id)
                          setFormData(prev => ({ ...prev, cities: allCityIds }))
                        }}
                        className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-semibold"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cities: [] }))}
                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-semibold"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border-2 border-slate-200 rounded-xl">
                      {cities.length === 0 ? (
                        <div className="col-span-full text-sm text-slate-400 text-center py-4">
                          No cities available. Please add cities first.
                        </div>
                      ) : (
                        cities.map((city) => (
                          <label
                            key={city._id}
                            className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition ${
                              formData.cities.includes(city._id)
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50'
                            } ${!city.isEnabled ? 'opacity-50' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.cities.includes(city._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    cities: [...prev.cities, city._id]
                                  }))
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    cities: prev.cities.filter(id => id !== city._id)
                                  }))
                                }
                              }}
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-sm text-slate-700 flex-1">{city.name}</span>
                            {!city.isEnabled && (
                              <span className="text-xs text-slate-400">(Disabled)</span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formData.cities.length === 0 
                        ? 'No cities selected - service will be available in all cities' 
                        : `Selected ${formData.cities.length} ${formData.cities.length === 1 ? 'city' : 'cities'}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">Lower numbers appear first</p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-slate-700">Active (visible on homepage)</span>
                </label>
              </div>

              {/* Emergency Service Section */}
              <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Emergency Service</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emergencyService.enabled}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyService: { 
                          ...prev.emergencyService, 
                          enabled: e.target.checked 
                        } 
                      }))}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700">Enable Emergency Service</span>
                  </label>
                  
                  {formData.emergencyService.enabled && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Extra Amount for Emergency Service (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.emergencyService.extraAmount}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          emergencyService: { 
                            ...prev.emergencyService, 
                            extraAmount: parseFloat(e.target.value) || 0 
                          } 
                        }))}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <p className="mt-1 text-xs text-slate-500">Additional amount charged for emergency service</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FiStar className="text-blue-600" />
                  SEO Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Meta Title <span className="text-xs text-slate-500">(Max 60 characters)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.metaTitle || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          metaTitle: e.target.value.slice(0, 60)
                        } 
                      }))}
                      maxLength={60}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Professional AC Service in Your City | Nexo"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {(formData.seo?.metaTitle || '').length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Meta Description <span className="text-xs text-slate-500">(Max 160 characters)</span>
                    </label>
                    <textarea
                      value={formData.seo?.metaDescription || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          metaDescription: e.target.value.slice(0, 160)
                        } 
                      }))}
                      maxLength={160}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="Brief description for search engines..."
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {(formData.seo?.metaDescription || '').length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Meta Keywords
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={seoKeywordInput}
                        onChange={(e) => setSeoKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (seoKeywordInput.trim()) {
                              setFormData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo,
                                  metaKeywords: [...(prev.seo?.metaKeywords || []), seoKeywordInput.trim()]
                                }
                              }))
                              setSeoKeywordInput('')
                            }
                          }
                        }}
                        className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                        placeholder="Add keyword and press Enter..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (seoKeywordInput.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              seo: {
                                ...prev.seo,
                                metaKeywords: [...(prev.seo?.metaKeywords || []), seoKeywordInput.trim()]
                              }
                            }))
                            setSeoKeywordInput('')
                          }
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.seo?.metaKeywords || []).map((keyword, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo,
                                  metaKeywords: prev.seo?.metaKeywords?.filter((_, i) => i !== index) || []
                                }
                              }))
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.focusKeyword || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          focusKeyword: e.target.value
                        } 
                      }))}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g., ac service, plumbing repair"
                    />
                    <p className="mt-1 text-xs text-slate-500">Primary keyword to target for SEO</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        OG Title <span className="text-xs text-slate-500">(Social Media)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.seo?.ogTitle || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          seo: { 
                            ...prev.seo, 
                            ogTitle: e.target.value.slice(0, 60)
                          } 
                        }))}
                        maxLength={60}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                        placeholder="Title for social media sharing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        OG Image <span className="text-xs text-slate-500">(Social Media)</span>
                      </label>
                      
                      {/* Image Preview */}
                      {ogImagePreview && (
                        <div className="mb-3 relative">
                          <img 
                            src={ogImagePreview} 
                            alt="OG Image Preview" 
                            className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveOgImage}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                            title="Remove image"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* File Upload */}
                      <div className="space-y-2">
                        <label className="block">
                          <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 cursor-pointer transition bg-slate-50 hover:bg-blue-50">
                            <div className="text-center">
                              <FiPlus className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                              <span className="text-sm text-slate-600">
                                {ogImageFile ? 'Change Image' : 'Upload Image'}
                              </span>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleOgImageChange}
                            className="hidden"
                          />
                        </label>
                        
                        {/* URL Input (Alternative) */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">OR</span>
                          <input
                            type="text"
                            value={formData.seo?.ogImage || ''}
                            onChange={(e) => {
                              setFormData(prev => ({ 
                                ...prev, 
                                seo: { 
                                  ...prev.seo, 
                                  ogImage: e.target.value
                                } 
                              }))
                              if (e.target.value) {
                                setOgImagePreview(e.target.value)
                                setOgImageFile(null)
                              }
                            }}
                            className="w-full pl-12 pr-4 py-2 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <p className="text-xs text-slate-500">Upload an image or enter a URL</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      OG Description <span className="text-xs text-slate-500">(Social Media, Max 160 chars)</span>
                    </label>
                    <textarea
                      value={formData.seo?.ogDescription || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          ogDescription: e.target.value.slice(0, 160)
                        } 
                      }))}
                      maxLength={160}
                      rows="2"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="Description for social media sharing..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.canonicalUrl || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          canonicalUrl: e.target.value
                        } 
                      }))}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/service/ac-service"
                    />
                    <p className="mt-1 text-xs text-slate-500">Preferred URL for search engines (prevents duplicate content)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.seo?.altText || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          altText: e.target.value
                        } 
                      }))}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Professional AC service technician"
                    />
                    <p className="mt-1 text-xs text-slate-500">Alternative text for service images (improves accessibility & SEO)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      {editingService ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && viewingService && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetailsModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                Service Details: {viewingService.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (viewingService?.slug) {
                      navigate(`/service/${viewingService.slug}`)
                      handleCloseDetailsModal()
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2"
                  title="View service on website"
                >
                  <FiExternalLink className="w-4 h-4" />
                  View Service
                </button>
                <button
                  onClick={() => {
                    handleCloseDetailsModal()
                    handleOpenModal(viewingService)
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-semibold flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleCloseDetailsModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Service Name</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Slug</label>
                    <p className="text-base text-slate-900 font-mono mt-1">{viewingService.slug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Icon</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {React.createElement(getIconComponent(viewingService.icon), { className: "w-5 h-5 text-primary" })}
                      </div>
                      <span className="text-base text-slate-900">{viewingService.icon}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Display Order</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.order || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingService.isActive
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {viewingService.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Display Price</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.price || 'Not set'}</p>
                  </div>
                </div>
                {viewingService.description && (
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-600">Description</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.description}</p>
                  </div>
                )}
                {viewingService.shortNotes && (
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-600">Short Notes</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.shortNotes}</p>
                  </div>
                )}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-600">Visiting Charge</label>
                  <p className="text-base text-slate-900 mt-1">₹{viewingService.visitingCharge || 0}</p>
                </div>
                {viewingService.trusted && (
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-600">Trusted Text</label>
                    <p className="text-base text-slate-900 mt-1">{viewingService.trusted}</p>
                  </div>
                )}
                {viewingService.emergencyService && (
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-600">Emergency Service</label>
                    <div className="mt-1">
                      {viewingService.emergencyService.enabled ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                            Enabled
                          </span>
                          <span className="text-base text-slate-900">+₹{viewingService.emergencyService.extraAmount || 0}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Available Cities */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Available Cities</h4>
                {!viewingService.cities || viewingService.cities.length === 0 ? (
                  <p className="text-slate-600">Available in all cities</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {viewingService.cities.map((city, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold"
                      >
                        {typeof city === 'string' ? city : city.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Included Items */}
              {viewingService.included && viewingService.included.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Included Items</h4>
                  <ul className="space-y-2">
                    {viewingService.included.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-900">
                        <FaCheckCircle className="text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Excluded Items */}
              {viewingService.excluded && viewingService.excluded.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Excluded Items</h4>
                  <ul className="space-y-2">
                    {viewingService.excluded.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-900">
                        <FaTimesCircle className="text-rose-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add-Ons */}
              {viewingService.addOns && viewingService.addOns.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Services</h4>
                  <div className="grid sm:grid-cols-1 gap-4">
                    {viewingService.addOns.map((addon, index) => {
                      const AddOnIcon = getIconComponent(addon.icon || 'FaTools')
                      // Calculate add-on price breakdown
                      const calculateAddOnTotal = (addon) => {
                        if (!addon.basePrice || addon.basePrice <= 0) return 0
                        let total = addon.basePrice || 0
                        // Apply discount
                        if (addon.discount > 0) {
                          total -= total * addon.discount / 100
                        }
                        // Add service charge
                        if (addon.serviceCharge > 0) {
                          total += addon.serviceCharge
                        }
                        // Add emergency service charge if enabled
                        if (viewingService.emergencyService?.enabled && viewingService.emergencyService?.extraAmount > 0) {
                          total += viewingService.emergencyService.extraAmount
                        }
                        // Calculate GST on subtotal
                        const subtotal = (addon.basePrice || 0) - 
                          (addon.discount > 0 ? (addon.basePrice || 0) * addon.discount / 100 : 0) +
                          (addon.serviceCharge || 0) +
                          (viewingService.emergencyService?.enabled ? (viewingService.emergencyService?.extraAmount || 0) : 0)
                        total += (subtotal * (addon.cgst || 0) / 100) + (subtotal * (addon.sgst || 0) / 100)
                        return total
                      }
                      const addOnTotal = calculateAddOnTotal(addon)
                      
                      return (
                        <div key={index} className="bg-white p-5 rounded-lg border-2 border-slate-200 hover:border-primary/30 transition">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <AddOnIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 text-lg">{addon.name}</p>
                              {addon.description && (
                                <p className="text-sm text-slate-600 mt-1">{addon.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Base Price:</span>
                              <span className="font-semibold text-slate-900">₹{(addon.basePrice || 0).toFixed(2)}</span>
                            </div>
                            {addon.discount > 0 && (
                              <div className="flex justify-between text-rose-600">
                                <span>Discount ({addon.discount}%):</span>
                                <span>-₹{((addon.basePrice || 0) * addon.discount / 100).toFixed(2)}</span>
                              </div>
                            )}
                            {addon.serviceCharge > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Service Charge:</span>
                                <span className="font-semibold text-slate-900">+₹{(addon.serviceCharge || 0).toFixed(2)}</span>
                              </div>
                            )}
                            {viewingService.emergencyService?.enabled && viewingService.emergencyService?.extraAmount > 0 && (
                              <div className="flex justify-between text-orange-600">
                                <span>Emergency Service:</span>
                                <span className="font-semibold">+₹{(viewingService.emergencyService.extraAmount || 0).toFixed(2)}</span>
                              </div>
                            )}
                            {(addon.cgst > 0 || addon.sgst > 0) && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">GST ({(addon.cgst || 0) + (addon.sgst || 0)}%):</span>
                                <span className="font-semibold text-slate-900">
                                  +₹{(() => {
                                    const subtotal = (addon.basePrice || 0) - 
                                      (addon.discount > 0 ? (addon.basePrice || 0) * addon.discount / 100 : 0) +
                                      (addon.serviceCharge || 0) +
                                      (viewingService.emergencyService?.enabled ? (viewingService.emergencyService?.extraAmount || 0) : 0)
                                    return ((subtotal * (addon.cgst || 0) / 100) + (subtotal * (addon.sgst || 0) / 100)).toFixed(2)
                                  })()}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 mt-2 border-t border-slate-200">
                              <span className="font-bold text-slate-900">Total Price:</span>
                              <span className="text-lg font-bold text-primary">₹{addOnTotal.toFixed(2)}</span>
                            </div>
                            {addon.price && (
                              <div className="text-xs text-slate-500 mt-1">
                                Display Price: {addon.price}
                              </div>
                            )}
                          </div>

                          {/* Included Items */}
                          {addon.included && addon.included.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Included Items</h5>
                              <ul className="space-y-1">
                                {addon.included.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                    <FaCheckCircle className="text-primary flex-shrink-0 text-xs" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Excluded Items */}
                          {addon.excluded && addon.excluded.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Excluded Items</h5>
                              <ul className="space-y-1">
                                {addon.excluded.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                    <FaTimesCircle className="text-rose-600 flex-shrink-0 text-xs" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Sub-Services */}
                          {addon.subServices && addon.subServices.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Sub-Services</h5>
                              {viewingService.emergencyService?.enabled && viewingService.emergencyService?.extraAmount > 0 && (
                                <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-xs text-orange-700">
                                    ⚡ Emergency service charge (+₹{viewingService.emergencyService.extraAmount}) applies to all sub-services
                                  </p>
                                </div>
                              )}
                              <div className="space-y-2">
                                {addon.subServices.map((subService, idx) => {
                                  const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')
                                  return (
                                    <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex items-start gap-2">
                                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <SubServiceIcon className="w-4 h-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-900">{subService.name}</div>
                                        {subService.shortDescription && (
                                          <div className="text-xs text-slate-600 mt-0.5">{subService.shortDescription}</div>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-primary font-semibold">{subService.price}</span>
                                          {viewingService.emergencyService?.enabled && viewingService.emergencyService?.extraAmount > 0 && (
                                            <span className="text-xs text-orange-600 font-semibold">
                                              (+₹{viewingService.emergencyService.extraAmount} emergency)
                                            </span>
                                          )}
                                        </div>
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
                </div>
              )}

              {/* Metadata */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Metadata</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-slate-600 font-semibold">Created At</label>
                    <p className="text-slate-900 mt-1">
                      {viewingService.createdAt ? new Date(viewingService.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold">Last Updated</label>
                    <p className="text-slate-900 mt-1">
                      {viewingService.updatedAt ? new Date(viewingService.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PopularServicesManagement

