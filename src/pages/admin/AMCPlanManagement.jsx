import React, { useState, useEffect } from 'react'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiRefreshCw,
  FiSettings,
  FiUsers,
  FiTarget,
  FiTrendingUp,
  FiHome,
  FiLayers
} from 'react-icons/fi'
import { 
  FaTools, 
  FaBolt, 
  FaSnowflake, 
  FaTint, 
  FaBroom, 
  FaPaintRoller, 
  FaHammer, 
  FaFilter, 
  FaPlug, 
  FaWrench,
  FaCheckCircle as FaCheck,
  FaRupeeSign
} from 'react-icons/fa'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const AMCPlanManagement = () => {
  const { token } = useAdminAuth()
  const { data: plansData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchAMCPlans(token),
    []
  )
  const [activeTab, setActiveTab] = useState('plans') // 'plans' or 'subscribers'
  const [subscribers, setSubscribers] = useState([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priceDisplay: '',
    features: '',
    description: '',
    isActive: true,
    displayOrder: 0,
    highlight: false,
    highlightText: '',
    whatsappNumber: '',
    planType: 'business',
    targetCustomer: '',
    includedServices: [],
    serviceFrequency: {},
    duration: 12,
    durationUnit: 'months'
  })
  const [popularServices, setPopularServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [planTypeFilter, setPlanTypeFilter] = useState('all')

  // Fetch popular services on component mount
  useEffect(() => {
    const fetchPopularServices = async () => {
      setLoadingServices(true)
      try {
        const response = await adminApi.fetchPopularServices(token)
        if (response.success) {
          setPopularServices(response.data || [])
          console.log('✅ Loaded popular services:', response.data?.length || 0)
        }
      } catch (err) {
        console.error('❌ Failed to fetch popular services:', err)
      } finally {
        setLoadingServices(false)
      }
    }
    
    if (token) {
      fetchPopularServices()
    }
  }, [token])

  // Extract plans - handle different response structures
  const plans = React.useMemo(() => {
    if (!plansData) {
      return []
    }
    
    if (typeof plansData === 'string' && plansData.trim().startsWith('<!')) {
      console.error('❌ API returned HTML instead of JSON')
      return []
    }
    
    if (typeof plansData !== 'object' || plansData === null) {
      return []
    }
    
    if (Array.isArray(plansData)) {
      return plansData
    }
    
    if (plansData.success && Array.isArray(plansData.data)) {
      return plansData.data
    }
    
    if (Array.isArray(plansData.data)) {
      return plansData.data
    }
    
    return []
  }, [plansData])

  // Debug: Log when plans or services change
  useEffect(() => {
    if (plans.length > 0 && popularServices.length > 0) {
      console.log('📊 Plans with services:', plans.length, 'Popular services:', popularServices.length)
      
      // Check for missing services
      plans.forEach(plan => {
        if (plan.includedServices && plan.includedServices.length > 0) {
          plan.includedServices.forEach(serviceItem => {
            const serviceId = typeof serviceItem === 'object' ? serviceItem._id : serviceItem
            const found = popularServices.find(s => s._id === serviceId)
            if (!found && typeof serviceItem === 'string') {
              console.warn('⚠️ Service not found in popular services:', serviceId)
            }
          })
        }
      })
    }
  }, [plans, popularServices])

  const handleCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      priceDisplay: '',
      features: '',
      description: '',
      isActive: true,
      displayOrder: plans.length,
      highlight: false,
      highlightText: '',
      whatsappNumber: '',
      planType: 'business',
      targetCustomer: '',
      includedServices: [],
      serviceFrequency: {},
      duration: 12,
      durationUnit: 'months'
    })
    setShowModal(true)
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      price: plan.price || '',
      priceDisplay: plan.priceDisplay || `₹${plan.price || ''}`,
      features: plan.features?.join('\n') || '',
      description: plan.description || '',
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      displayOrder: plan.displayOrder || 0,
      highlight: plan.highlight || false,
      highlightText: plan.highlightText || '',
      whatsappNumber: plan.whatsappNumber || '',
      planType: plan.planType || 'business',
      targetCustomer: plan.targetCustomer || '',
      includedServices: plan.includedServices || [],
      serviceFrequency: plan.serviceFrequency || {},
      duration: plan.duration || 12,
      durationUnit: plan.durationUnit || 'months'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        priceDisplay: formData.priceDisplay || `₹${Number(formData.price).toLocaleString('en-IN')}`,
        features: formData.features.split('\n').filter(f => f.trim()),
        displayOrder: Number(formData.displayOrder) || 0,
        duration: Number(formData.duration) || 12,
        durationUnit: formData.durationUnit || 'months',
        planType: formData.planType || 'business',
        targetCustomer: formData.targetCustomer || '',
        includedServices: formData.includedServices || [],
        serviceFrequency: formData.serviceFrequency || {}
      }

      if (editingPlan) {
        await adminApi.updateAMCPlan(token, editingPlan._id, submitData)
      } else {
        await adminApi.createAMCPlan(token, submitData)
      }
      
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to save plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await adminApi.deleteAMCPlan(token, planId)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to delete plan')
    }
  }

  const handleGenerateFromServices = async () => {
    if (!confirm('This will generate AMC plans based on your popular services. Existing plans with the same names will not be overwritten. Continue?')) {
      return
    }

    setSubmitting(true)
    try {
      const result = await adminApi.generateAMCPlansFromServices(token)
      alert(`Successfully generated ${result.data.createdPlans} AMC plans from ${result.data.totalServices} popular services!`)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to generate AMC plans from services')
    } finally {
      setSubmitting(false)
    }
  }

  const refreshServices = async () => {
    setLoadingServices(true)
    try {
      const response = await adminApi.fetchPopularServices(token)
      if (response.success) {
        setPopularServices(response.data || [])
        console.log('🔄 Refreshed popular services:', response.data?.length || 0)
      }
    } catch (err) {
      console.error('❌ Failed to refresh popular services:', err)
      alert('Failed to refresh services. Please try again.')
    } finally {
      setLoadingServices(false)
    }
  }

  // Fetch AMC subscribers
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true)
    try {
      const data = await adminApi.fetchAMCSubscribers(token)
      if (data.success) {
        setSubscribers(data.data || [])
      } else {
        setSubscribers([])
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      setSubscribers([])
    } finally {
      setLoadingSubscribers(false)
    }
  }

  // Fetch subscribers when switching to subscribers tab
  React.useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers()
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <ModuleHeader
            title="AMC Plans Management"
            subtitle="Create and manage service-based AMC plans for different customer segments"
          />

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiLayers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{plans.length}</div>
                  <div className="text-xs text-gray-600">Total Plans</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiSettings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{popularServices.length}</div>
                  <div className="text-xs text-gray-600">Services</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {plans.filter(p => p.isActive).length}
                  </div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiTarget className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {plans.filter(p => p.includedServices && p.includedServices.length > 0).length}
                  </div>
                  <div className="text-xs text-gray-600">Service-Based</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                activeTab === 'plans'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              Plans Management
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                activeTab === 'subscribers'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FiUsers className="w-4 h-4" />
              Plan Subscribers
            </button>
          </div>
        </div>

      {activeTab === 'plans' ? (
        <>
            {/* Compact Plan Type Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPlanTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  planTypeFilter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiLayers className="w-3 h-3" />
                All Plans
              </button>
              <button
                onClick={() => setPlanTypeFilter('individual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  planTypeFilter === 'individual' 
                    ? 'bg-primary text-white' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <FiHome className="w-3 h-3" />
                Individual
              </button>
              <button
                onClick={() => setPlanTypeFilter('business')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  planTypeFilter === 'business' 
                    ? 'bg-primary text-white' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <FiTarget className="w-3 h-3" />
                Business
              </button>
              <button
                onClick={() => setPlanTypeFilter('corporate')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  planTypeFilter === 'corporate' 
                    ? 'bg-primary text-white' 
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <FiLayers className="w-3 h-3" />
                Corporate
              </button>
            </div>
          </div>
        </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          {plans.length > 0 && (
            <span>
              Total Plans: <strong>{plans.length}</strong>
              {planTypeFilter !== 'all' && (
                <span className="ml-2 text-xs text-slate-500">
                  (Showing {plans.filter(p => p.planType === planTypeFilter).length} {planTypeFilter} plans)
                </span>
              )}
            </span>
          )}
          <span className={popularServices.length > 0 ? 'text-green-600' : 'text-red-600'}>
            Available Services: <strong>{popularServices.length}</strong>
            {popularServices.length === 0 && (
              <span className="ml-2 text-xs">(⚠️ No services loaded)</span>
            )}
          </span>
          {plans.length > 0 && (
            <div className="flex items-center gap-4">
              <span>🏠 Individual: <strong>{plans.filter(p => p.planType === 'individual').length}</strong></span>
              <span>🏢 Business: <strong>{plans.filter(p => p.planType === 'business').length}</strong></span>
              <span>🏭 Corporate: <strong>{plans.filter(p => p.planType === 'corporate').length}</strong></span>
            </div>
          )}
          {loadingServices && (
            <span className="text-blue-600">
              <span className="animate-spin inline-block mr-1">⟳</span>
              Loading services...
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          
          <button
            onClick={refreshServices}
            disabled={loadingServices}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50"
          >
            <FiSettings className={`w-4 h-4 ${loadingServices ? 'animate-spin' : ''}`} />
            Services
          </button>
          
          <button
            onClick={handleGenerateFromServices}
            disabled={submitting || loadingServices || popularServices.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrendingUp className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
            {submitting ? 'Generating...' : 'Auto-Generate'}
          </button>
          
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm hover:shadow-md transition-all"
          >
            <FiPlus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          <p className="font-semibold mb-2">Error loading plans</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-slate-700 mb-2">No AMC plans found</p>
          <p className="text-slate-600 mb-6">Create your first AMC plan to get started.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
            >
              <FiPlus /> Create First Plan
            </button>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition inline-flex items-center gap-2"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans
            .filter(plan => planTypeFilter === 'all' || plan.planType === planTypeFilter)
            .map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative border ${
                plan.highlight 
                  ? 'border-primary shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Plan Type Badge */}
              <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-xs font-medium ${
                plan.planType === 'individual' ? 'bg-blue-500 text-white' :
                plan.planType === 'business' ? 'bg-green-500 text-white' :
                plan.planType === 'corporate' ? 'bg-purple-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {plan.planType === 'individual' ? (
                  <div className="flex items-center gap-1">
                    <FiHome className="w-3 h-3" />
                    <span>Individual</span>
                  </div>
                ) : plan.planType === 'business' ? (
                  <div className="flex items-center gap-1">
                    <FiTarget className="w-3 h-3" />
                    <span>Business</span>
                  </div>
                ) : plan.planType === 'corporate' ? (
                  <div className="flex items-center gap-1">
                    <FiLayers className="w-3 h-3" />
                    <span>Corporate</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <FiLayers className="w-3 h-3" />
                    <span>General</span>
                  </div>
                )}
              </div>

              {/* Highlight Badge */}
              {plan.highlight && (
                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
                  {plan.highlightText || 'Featured'}
                </div>
              )}

              <div className="p-4 pt-8">
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{plan.name}</h3>
                    {plan.targetCustomer && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{plan.targetCustomer}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        plan.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="Edit Plan"
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Delete Plan"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-primary/5 rounded-lg p-3 mb-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaRupeeSign className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {plan.price?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    per {plan.durationUnit === 'years' ? 'year' : `${plan.duration || 12} months`}
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                      {plan.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3 text-green-600" />
                    Features ({plan.features?.length || 0})
                  </h4>
                  <div className="space-y-1">
                    {plan.features?.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <FaCheck className="text-green-600 flex-shrink-0 mt-0.5 w-2 h-2" />
                        <span className="line-clamp-2">{feature}</span>
                      </div>
                    ))}
                    {plan.features?.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Included Services */}
                {plan.includedServices && plan.includedServices.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <FiSettings className="w-3 h-3 text-primary" />
                        Services
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-medium">
                          {plan.includedServices.length}
                        </span>
                      </h4>
                      {popularServices.length === 0 && (
                        <button
                          onClick={refreshServices}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Load
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {plan.includedServices.slice(0, 4).map((serviceItem, idx) => {
                        // Handle both populated service objects and service IDs
                        let service = null
                        let serviceId = null
                        
                        if (typeof serviceItem === 'object' && serviceItem !== null) {
                          // Service is populated from backend
                          service = serviceItem
                          serviceId = serviceItem._id
                        } else {
                          // Service is just an ID, find it in popularServices
                          serviceId = serviceItem
                          service = popularServices.find(s => s._id === serviceId)
                        }
                        
                        const frequency = plan.serviceFrequency?.[serviceId]
                        
                        const getServiceIcon = (iconName) => {
                          const iconMap = {
                            FaSnowflake, FaBolt, FaTint, FaBroom, FaPaintRoller,
                            FaTools, FaHammer, FaFilter, FaPlug, FaWrench
                          }
                          return iconMap[iconName] || FaTools
                        }

                        if (service) {
                          const IconComponent = getServiceIcon(service.icon)
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/10">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                                  <IconComponent className="w-3 h-3 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium text-gray-800 truncate">{service.name}</div>
                                  {service.price && (
                                    <div className="text-xs text-gray-500">{service.price}</div>
                                  )}
                                </div>
                              </div>
                              {frequency && (
                                <div className="text-right ml-2">
                                  <div className="text-xs font-semibold text-primary">
                                    {frequency === 'unlimited' ? '∞' : `${frequency}x`}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        } else {
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                                  <FiX className="w-3 h-3 text-yellow-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium text-yellow-800">Unavailable</div>
                                  <div className="text-xs text-yellow-600 font-mono">
                                    {serviceId?.slice(-6) || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      })}
                      {plan.includedServices.length > 3 && (
                        <div className="text-center mt-2">
                          <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                            <FiLayers className="w-3 h-3 mr-1" />
                            +{plan.includedServices.length - 3} more
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plan Metadata */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-gray-500 mb-0.5">Duration</div>
                      <div className="font-medium text-gray-700">
                        {plan.duration || 12} {plan.durationUnit || 'months'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-gray-500 mb-0.5">Order</div>
                      <div className="font-medium text-gray-700">{plan.displayOrder}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlan ? 'Edit AMC Plan' : 'Create AMC Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Basic, Standard, Premium"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      const price = e.target.value
                      setFormData(prev => ({ 
                        ...prev, 
                        price,
                        priceDisplay: prev.priceDisplay || `₹${Number(price).toLocaleString('en-IN')}`
                      }))
                    }}
                    required
                    min="0"
                    step="0.01"
                    placeholder="2500"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price Display
                  </label>
                  <input
                    type="text"
                    value={formData.priceDisplay}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceDisplay: e.target.value }))}
                    placeholder="₹2,500 (auto-generated if empty)"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData(prev => ({ ...prev, planType: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="individual">🏠 Individual (Homeowners)</option>
                    <option value="business">🏢 Business (Small-Medium)</option>
                    <option value="corporate">🏭 Corporate (Large Enterprise)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Customer Description
                </label>
                <input
                  type="text"
                  value={formData.targetCustomer}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetCustomer: e.target.value }))}
                  placeholder="e.g., Small businesses with 10-50 employees, Homeowners with 2-3 BHK"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Optional description of who this plan is designed for
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="flex items-end">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Plan Category
                    </label>
                    <div className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
                      formData.planType === 'individual' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                      formData.planType === 'business' ? 'border-green-200 bg-green-50 text-green-700' :
                      'border-purple-200 bg-purple-50 text-purple-700'
                    }`}>
                      {formData.planType === 'individual' ? '🏠 Individual Plan' :
                       formData.planType === 'business' ? '🏢 Business Plan' :
                       '🏭 Corporate Plan'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Features <span className="text-rose-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(One per line)</span>
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  required
                  rows="6"
                  placeholder="Monthly inspection&#10;Basic repairs included&#10;Electrical maintenance&#10;Plumbing maintenance&#10;AC service (quarterly)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan Duration
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration Unit
                  </label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  🔧 Select Services for AMC Plan
                  <span className="text-xs text-slate-500 ml-2 block mt-1">
                    Choose which services to include in this AMC plan and configure their frequencies
                  </span>
                </label>
                {loadingServices ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-slate-500">Loading available services...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="text-xs font-semibold text-slate-700 mr-2">Quick Select:</div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const essentialServices = popularServices
                            .filter(s => ['ac', 'electrical', 'plumbing'].some(keyword => 
                              s.name.toLowerCase().includes(keyword)
                            ))
                            .map(s => s._id)
                          setFormData(prev => ({ 
                            ...prev, 
                            includedServices: essentialServices,
                            serviceFrequency: essentialServices.reduce((freq, id) => ({
                              ...freq,
                              [id]: '4' // Quarterly for essential services
                            }), {})
                          }))
                        }}
                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
                      >
                        🏠 Essential (AC, Electrical, Plumbing)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const maintenanceServices = popularServices
                            .filter(s => ['cleaning', 'maintenance', 'repair'].some(keyword => 
                              s.name.toLowerCase().includes(keyword)
                            ))
                            .map(s => s._id)
                          setFormData(prev => ({ 
                            ...prev, 
                            includedServices: maintenanceServices,
                            serviceFrequency: maintenanceServices.reduce((freq, id) => ({
                              ...freq,
                              [id]: '6' // Bi-monthly for maintenance
                            }), {})
                          }))
                        }}
                        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-semibold"
                      >
                        🧹 Maintenance & Cleaning
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const allServiceIds = popularServices.map(s => s._id)
                          setFormData(prev => ({ 
                            ...prev, 
                            includedServices: allServiceIds,
                            serviceFrequency: allServiceIds.reduce((freq, id) => ({
                              ...freq,
                              [id]: '2' // Bi-annual for comprehensive
                            }), {})
                          }))
                        }}
                        className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-semibold"
                      >
                        ⭐ All Services
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          includedServices: [],
                          serviceFrequency: {}
                        }))}
                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-semibold"
                      >
                        🗑️ Clear All
                      </button>
                    </div>
                    <div className="border-2 border-slate-200 rounded-xl bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Available Services ({popularServices.length})
                        </span>
                        <span className="text-xs text-slate-500">
                          {formData.includedServices.length} selected
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                        {popularServices.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
                            <div className="text-4xl mb-3">🔧</div>
                            <div className="text-sm font-medium text-slate-600 mb-1">No services available</div>
                            <div className="text-xs text-slate-500">Please add popular services first to include them in AMC plans</div>
                          </div>
                        ) : (
                          popularServices.map((service) => {
                            const isSelected = formData.includedServices.includes(service._id)
                            const getServiceIcon = (iconName) => {
                              const iconMap = {
                                FaSnowflake: '❄️', FaBolt: '⚡', FaTint: '💧', FaBroom: '🧹',
                                FaPaintRoller: '🎨', FaTools: '🔧', FaHammer: '🔨', FaFilter: '🔍',
                                FaPlug: '🔌', FaWrench: '🔧'
                              }
                              return iconMap[iconName] || '🔧'
                            }
                            
                            return (
                              <div key={service._id} className={`bg-white rounded-lg border-2 transition-all duration-200 ${
                                isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                              }`}>
                                {/* Service Selection Header */}
                                <div className={`p-4 ${isSelected ? 'bg-primary/5' : ''}`}>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({
                                            ...prev,
                                            includedServices: [...prev.includedServices, service._id],
                                            serviceFrequency: {
                                              ...prev.serviceFrequency,
                                              [service._id]: '4' // Default to quarterly
                                            }
                                          }))
                                        } else {
                                          setFormData(prev => ({
                                            ...prev,
                                            includedServices: prev.includedServices.filter(id => id !== service._id),
                                            serviceFrequency: {
                                              ...prev.serviceFrequency,
                                              [service._id]: undefined
                                            }
                                          }))
                                        }
                                      }}
                                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                                    />
                                    
                                    <div className="flex items-center gap-3 flex-1">
                                      <span className="text-2xl">{getServiceIcon(service.icon)}</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-semibold text-slate-900">{service.name}</h4>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                          }`}>
                                            {service.isActive ? '✓ Active' : '✗ Inactive'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                          {service.price && (
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                              {service.price}
                                            </span>
                                          )}
                                          {service.basePrice && (
                                            <span className="text-xs text-slate-500">
                                              Base: ₹{service.basePrice}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                                
                                {/* Service Configuration (shown when selected) */}
                                {isSelected && (
                                  <div className="px-4 pb-4 border-t border-slate-200 bg-slate-50/50">
                                    <div className="pt-4 space-y-3">
                                      {/* Frequency Selection */}
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                                          🗓️ Service Frequency (per {formData.durationUnit === 'years' ? 'year' : formData.duration + ' months'})
                                        </label>
                                        <select
                                          value={formData.serviceFrequency[service._id] || '4'}
                                          onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            serviceFrequency: {
                                              ...prev.serviceFrequency,
                                              [service._id]: e.target.value
                                            }
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                        >
                                          <option value="1">1 time (Annual) - Basic maintenance</option>
                                          <option value="2">2 times (Bi-annual) - Standard care</option>
                                          <option value="4">4 times (Quarterly) - Regular maintenance</option>
                                          <option value="6">6 times (Bi-monthly) - Frequent care</option>
                                          <option value="12">12 times (Monthly) - Premium maintenance</option>
                                          <option value="unlimited">Unlimited visits - On-demand</option>
                                        </select>
                                      </div>

                                      {/* Cost Calculation */}
                                      {service.basePrice && (
                                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-green-800">💰 Estimated Cost</span>
                                            <span className="text-sm font-bold text-green-700">
                                              ₹{formData.serviceFrequency[service._id] === 'unlimited' 
                                                ? (service.basePrice * 12).toLocaleString('en-IN')
                                                : ((service.basePrice || 0) * parseInt(formData.serviceFrequency[service._id] || 4)).toLocaleString('en-IN')
                                              }
                                            </span>
                                          </div>
                                          <div className="text-xs text-green-600 mt-1">
                                            {formData.serviceFrequency[service._id] === 'unlimited' 
                                              ? `Unlimited visits (calculated as 12x base price)`
                                              : `₹${service.basePrice} × ${formData.serviceFrequency[service._id] || 4} visits`
                                            }
                                          </div>
                                        </div>
                                      )}

                                      {/* Service Recommendations */}
                                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-blue-800 mb-1">💡 Recommendation</div>
                                        <div className="text-xs text-blue-700">
                                          {service.name.toLowerCase().includes('ac') && "AC services work best with quarterly maintenance for optimal performance"}
                                          {service.name.toLowerCase().includes('electrical') && "Electrical systems should be inspected bi-annually for safety"}
                                          {service.name.toLowerCase().includes('plumbing') && "Plumbing maintenance prevents major issues when done annually"}
                                          {service.name.toLowerCase().includes('cleaning') && "Regular cleaning maintains hygiene and professional appearance"}
                                          {!service.name.toLowerCase().match(/(ac|electrical|plumbing|cleaning)/) && "Configure frequency based on your business requirements"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })
                      )}
                    </div>
                    
                      {/* Service Selection Summary */}
                      {formData.includedServices.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              📋 AMC Plan Summary
                            </h4>
                            <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                              {formData.includedServices.length} Services
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 mb-4">
                            {formData.includedServices.map((serviceId) => {
                              const service = popularServices.find(s => s._id === serviceId)
                              const frequency = formData.serviceFrequency[serviceId] || '4'
                              const baseCost = service?.basePrice || 0
                              const totalCost = frequency === 'unlimited' ? baseCost * 12 : baseCost * parseInt(frequency)
                              
                              return service ? (
                                <div key={serviceId} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">
                                      {service.icon === 'FaSnowflake' ? '❄️' : 
                                       service.icon === 'FaBolt' ? '⚡' : 
                                       service.icon === 'FaTint' ? '💧' : 
                                       service.icon === 'FaBroom' ? '🧹' : '🔧'}
                                    </span>
                                    <div>
                                      <span className="text-sm font-medium text-slate-800">{service.name}</span>
                                      <div className="text-xs text-slate-500">
                                        {frequency === 'unlimited' ? 'Unlimited visits' : `${frequency} visits per ${formData.durationUnit === 'years' ? 'year' : formData.duration + ' months'}`}
                                      </div>
                                    </div>
                                  </div>
                                  {baseCost > 0 && (
                                    <div className="text-right">
                                      <div className="text-sm font-semibold text-primary">
                                        ₹{totalCost.toLocaleString('en-IN')}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        ₹{baseCost} × {frequency === 'unlimited' ? '12' : frequency}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null
                            })}
                          </div>

                          {/* Total Cost Summary */}
                          <div className="border-t border-primary/20 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-800">
                                💰 Total Estimated Cost
                              </span>
                              <span className="text-xl font-bold text-primary">
                                ₹{formData.includedServices.reduce((total, serviceId) => {
                                  const service = popularServices.find(s => s._id === serviceId)
                                  const frequency = formData.serviceFrequency[serviceId] || '4'
                                  const baseCost = service?.basePrice || 0
                                  const serviceCost = frequency === 'unlimited' ? baseCost * 12 : baseCost * parseInt(frequency)
                                  return total + serviceCost
                                }, 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mb-3">
                              Per {formData.durationUnit === 'years' ? 'year' : formData.duration + ' months'} • Based on service base prices
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                              <div className="text-xs font-medium text-yellow-800 mb-1">💡 Pricing Tip</div>
                              <div className="text-xs text-yellow-700">
                                Set your plan price above to add profit margin or offer customer discounts. 
                                Consider market rates and competitor pricing.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="text-xs text-slate-500 text-center">
                          {formData.includedServices.length === 0 
                            ? 'No services selected - Select services above to include in this AMC plan' 
                            : `✅ ${formData.includedServices.length} service${formData.includedServices.length === 1 ? '' : 's'} selected for this AMC plan`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Optional description for the plan"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="919590926068"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.highlight}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight: e.target.checked }))}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700">Highlight</span>
                  </label>
                </div>
              </div>

              {formData.highlight && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Highlight Text
                  </label>
                  <input
                    type="text"
                    value={formData.highlightText}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlightText: e.target.value }))}
                    placeholder="e.g., Most Popular, Recommended"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Subscribers Tab */
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-slate-600">
              {subscribers.length > 0 && (
                <span>Total Subscribers: <strong>{subscribers.length}</strong></span>
              )}
            </div>
            <button
              onClick={fetchSubscribers}
              disabled={loadingSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition disabled:opacity-50"
            >
              {loadingSubscribers ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingSubscribers ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <p className="text-lg font-semibold text-slate-700 mb-2">No subscribers yet</p>
              <p className="text-slate-600">Users who purchase AMC plans will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Subscribed On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subscribers.map((subscriber, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {subscriber.userName || 'N/A'}
                            </div>
                            <div className="text-sm text-slate-600">
                              {subscriber.userEmail || subscriber.userPhone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {subscriber.planName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">
                            ₹{subscriber.amount?.toLocaleString('en-IN') || '0'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-slate-600">
                            {subscriber.txnid || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            subscriber.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : subscriber.status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscriber.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {subscriber.subscribedAt
                            ? new Date(subscriber.subscribedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

export default AMCPlanManagement

