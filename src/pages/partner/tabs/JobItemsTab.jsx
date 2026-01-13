import React, { useState, useEffect } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiPlus, FiMinus, FiTrash2, FiSave, FiPackage, FiSearch, FiFilter, FiShoppingCart, FiEdit2 } from 'react-icons/fi'

const JobItemsTab = () => {
  const { token } = usePartnerAuth()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobItems, setJobItems] = useState([])
  const [materialCategories, setMaterialCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availableItems, setAvailableItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualItem, setManualItem] = useState({
    name: '',
    quantity: 1,
    unitPrice: 0,
    description: ''
  })

  useEffect(() => {
    fetchJobs()
    fetchMaterialCategories()
  }, [token])

  useEffect(() => {
    if (selectedJob) {
      fetchJobItems(selectedJob._id)
    }
  }, [selectedJob])

  useEffect(() => {
    if (selectedCategory !== 'all') {
      fetchCategoryItems(selectedCategory)
    }
  }, [selectedCategory])

  const fetchJobs = async () => {
    if (!token) return
    try {
      const response = await partnerApi.getBookings(token)
      let bookingsList = []
      if (response?.bookings) {
        Object.values(response.bookings).forEach(statusBookings => {
          if (Array.isArray(statusBookings)) {
            bookingsList = bookingsList.concat(statusBookings)
          }
        })
      } else if (Array.isArray(response)) {
        bookingsList = response
      } else if (Array.isArray(response?.data)) {
        bookingsList = response.data
      }
      
      // Filter active jobs only
      const activeJobs = bookingsList.filter(job => 
        ['confirmed', 'accepted', 'in_progress', 'paused'].includes(job.status)
      )
      setJobs(activeJobs)
      
      if (activeJobs.length > 0 && !selectedJob) {
        setSelectedJob(activeJobs[0])
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterialCategories = async () => {
    try {
      const response = await fetch('/api/public/material-categories')
      const data = await response.json()
      if (data.success) {
        setMaterialCategories(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch material categories:', err)
    }
  }

  const fetchJobItems = async (jobId) => {
    if (!token || !jobId) return
    try {
      const response = await partnerApi.getJobItems(token, jobId)
      setJobItems(response.data || [])
    } catch (err) {
      console.error('Failed to fetch job items:', err)
      setJobItems([])
    }
  }

  const fetchCategoryItems = async (categoryId) => {
    try {
      const response = await partnerApi.getProductsByCategory(token, categoryId)
      let itemsList = []
      if (Array.isArray(response)) {
        itemsList = response
      } else if (Array.isArray(response?.data)) {
        itemsList = response.data
      } else if (Array.isArray(response?.products)) {
        itemsList = response.products
      }
      setAvailableItems(itemsList)
    } catch (err) {
      console.error('Failed to fetch category items:', err)
      setAvailableItems([])
    }
  }

  const addItemToJob = async (item) => {
    if (!selectedJob || !token) return

    const existingItem = jobItems.find(ji => ji.itemId === item._id)
    
    if (existingItem) {
      updateItemQuantity(existingItem._id, 1)
    } else {
      const newJobItem = {
        jobId: selectedJob._id,
        itemId: item._id,
        itemName: item.name,
        quantity: 1,
        unitPrice: item.sellingPrice || item.priceMin || 0,
        totalPrice: item.sellingPrice || item.priceMin || 0,
        description: item.description || '',
        category: item.category
      }

      try {
        setSaving(true)
        const response = await partnerApi.addJobItem(token, newJobItem)
        if (response.success) {
          setJobItems([...jobItems, response.data])
        }
      } catch (err) {
        alert('Failed to add item to job')
      } finally {
        setSaving(false)
      }
    }
  }

  const addManualItem = async () => {
    if (!selectedJob || !token || !manualItem.name) return

    const newJobItem = {
      jobId: selectedJob._id,
      itemName: manualItem.name,
      quantity: manualItem.quantity,
      unitPrice: manualItem.unitPrice,
      totalPrice: manualItem.quantity * manualItem.unitPrice,
      description: manualItem.description,
      isManual: true
    }

    try {
      setSaving(true)
      const response = await partnerApi.addJobItem(token, newJobItem)
      if (response.success) {
        setJobItems([...jobItems, response.data])
        setManualItem({ name: '', quantity: 1, unitPrice: 0, description: '' })
        setShowManualAdd(false)
      }
    } catch (err) {
      alert('Failed to add manual item')
    } finally {
      setSaving(false)
    }
  }

  const updateItemQuantity = async (jobItemId, change) => {
    const item = jobItems.find(ji => ji._id === jobItemId)
    if (!item || !token) return

    const newQuantity = Math.max(1, item.quantity + change)
    const newTotalPrice = newQuantity * item.unitPrice

    try {
      setSaving(true)
      const response = await partnerApi.updateJobItem(token, jobItemId, {
        quantity: newQuantity,
        totalPrice: newTotalPrice
      })
      
      if (response.success) {
        setJobItems(jobItems.map(ji => 
          ji._id === jobItemId 
            ? { ...ji, quantity: newQuantity, totalPrice: newTotalPrice }
            : ji
        ))
      }
    } catch (err) {
      alert('Failed to update item quantity')
    } finally {
      setSaving(false)
    }
  }

  const removeJobItem = async (jobItemId) => {
    if (!token) return

    try {
      setSaving(true)
      const response = await partnerApi.deleteJobItem(token, jobItemId)
      if (response.success) {
        setJobItems(jobItems.filter(ji => ji._id !== jobItemId))
      }
    } catch (err) {
      alert('Failed to remove item')
    } finally {
      setSaving(false)
    }
  }

  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalJobCost = jobItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Job Items Management</h1>
          <p className="text-sm text-slate-500 mt-2">Add and manage items for your jobs</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowManualAdd(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Manual Item
          </button>
        </div>
      </div>

      {/* Job Selection */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Job</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const isEmergency = job.isEmergency === true;
            return (
            <div
              key={job._id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedJob?._id === job._id
                  ? 'border-blue-500 bg-blue-50'
                  : isEmergency
                  ? 'border-red-500 bg-red-50 border-l-4'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-slate-900">
                    {job.serviceType || 'Service'}
                  </span>
                  {isEmergency && (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      URGENT
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  job.status === 'confirmed' ? 'bg-cyan-100 text-cyan-800' :
                  job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {job.status === 'confirmed' ? 'Assigned' :
                   job.status === 'in_progress' ? 'In Progress' :
                   job.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {job.customerName || 'Customer'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          )})}
        </div>
      </div>

      {selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Items */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Items</h2>
            
            {/* Category Filter */}
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {materialCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailableItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-600">₹{item.sellingPrice || item.priceMin || 0}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addItemToJob(item)}
                    disabled={saving}
                    className="ml-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Job Items */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Job Items</h2>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Cost</p>
                <p className="text-xl font-bold text-blue-600">₹{totalJobCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{item.itemName}</h3>
                    <p className="text-sm text-slate-600">₹{item.unitPrice} per unit</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(item._id, -1)}
                        disabled={saving || item.quantity <= 1}
                        className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item._id, 1)}
                        disabled={saving}
                        className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₹{item.totalPrice}</p>
                    </div>
                    
                    <button
                      onClick={() => removeJobItem(item._id)}
                      disabled={saving}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {jobItems.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items added to this job yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showManualAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Manual Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={manualItem.name}
                  onChange={(e) => setManualItem({...manualItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualItem.quantity}
                    onChange={(e) => setManualItem({...manualItem, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualItem.unitPrice}
                    onChange={(e) => setManualItem({...manualItem, unitPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total (₹)
                </label>
                <input
                  type="text"
                  value={`₹${(manualItem.quantity * manualItem.unitPrice).toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={manualItem.description}
                  onChange={(e) => setManualItem({...manualItem, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowManualAdd(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addManualItem}
                disabled={!manualItem.name || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobItemsTab