import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiPackage, FiSearch, FiRefreshCw, FiEye, FiCalendar, FiUser, FiPhone, FiTool, FiPlus, FiSend, FiX, FiMinus } from 'react-icons/fi'
import SendQuotationModal from '../../../components/SendQuotationModal.jsx'

const SparePartsTab = () => {
  const { token } = usePartnerAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [summary, setSummary] = useState({})
  
  // New quotation functionality
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [availableBookings, setAvailableBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    fetchQuotationMaterials()
  }, [token])

  const fetchQuotationMaterials = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      console.log('[SparePartsTab] Fetching quotation materials...')
      const response = await partnerApi.getQuotationMaterials(token)
      console.log('[SparePartsTab] API Response:', response)
      
      if (response.success) {
        console.log('[SparePartsTab] Materials received:', response.data?.length || 0)
        console.log('[SparePartsTab] Summary:', response.summary)
        setMaterials(response.data || [])
        setSummary(response.summary || {})
      } else {
        console.error('[SparePartsTab] API Error:', response.message)
        throw new Error(response.message || 'Failed to fetch quotation materials')
      }
    } catch (err) {
      console.error('[SparePartsTab] Fetch Error:', err)
      setError(err.message || 'Failed to fetch quotation materials')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableBookings = async () => {
    if (!token) return

    setLoadingBookings(true)
    try {
      const response = await partnerApi.getAvailableBookings(token)
      if (response.success) {
        setAvailableBookings(response.data || [])
      } else {
        throw new Error(response.message || 'Failed to fetch available bookings')
      }
    } catch (err) {
      console.error('Failed to fetch available bookings:', err)
      alert(err.message || 'Failed to fetch available bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleCreateQuotation = () => {
    fetchAvailableBookings()
    setShowQuotationModal(true)
  }

  const handleSelectMaterial = (material) => {
    const existingIndex = selectedMaterials.findIndex(m => m.materialId === material.materialId && m.name === material.name)
    
    if (existingIndex !== -1) {
      // Update quantity
      const updated = [...selectedMaterials]
      updated[existingIndex].quantity += 1
      setSelectedMaterials(updated)
    } else {
      // Add new material
      setSelectedMaterials([...selectedMaterials, {
        materialId: material.materialId,
        name: material.name,
        description: material.description,
        category: material.category,
        unitPrice: Math.round(material.averagePrice),
        quantity: 1,
        total: Math.round(material.averagePrice)
      }])
    }
  }

  const handleUpdateMaterialQuantity = (index, change) => {
    const updated = [...selectedMaterials]
    const newQuantity = Math.max(1, updated[index].quantity + change)
    updated[index].quantity = newQuantity
    updated[index].total = updated[index].unitPrice * newQuantity
    setSelectedMaterials(updated)
  }

  const handleRemoveMaterial = (index) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index))
  }

  const handleSendQuotation = async (bookingId, quotationData) => {
    try {
      const response = await partnerApi.createQuotation(token, bookingId, quotationData)
      if (response.success) {
        alert('Quotation sent successfully!')
        setShowQuotationModal(false)
        setSelectedBooking(null)
        setSelectedMaterials([])
        // Refresh materials to update usage statistics
        fetchQuotationMaterials()
        return response
      } else {
        throw new Error(response.message || 'Failed to create quotation')
      }
    } catch (err) {
      console.error('Failed to create quotation:', err)
      throw err
    }
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(materials.map(m => m.category).filter(Boolean))]
    return categories.sort()
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSelectedMaterialQuantity = (material) => {
    const selected = selectedMaterials.find(m => m.materialId === material.materialId && m.name === material.name)
    return selected ? selected.quantity : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Quotation Materials</h1>
          <p className="text-sm sm:text-base text-slate-600">Materials you've included in your quotations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateQuotation}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <FiSend className="w-4 h-4" />
            Create Quotation
          </button>
          <button
            onClick={fetchQuotationMaterials}
            className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
          >
            <FiRefreshCw className="text-lg sm:text-xl text-slate-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Materials</p>
                <p className="text-2xl font-bold text-primary">{summary.totalMaterials || 0}</p>
              </div>
              <FiPackage className="text-2xl text-primary opacity-60" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Quotations</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalQuotations || 0}</p>
              </div>
              <FiCalendar className="text-2xl text-blue-600 opacity-60" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{(summary.totalValue || 0).toLocaleString('en-IN')}</p>
              </div>
              <FiTool className="text-2xl text-green-600 opacity-60" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Quantity</p>
                <p className="text-2xl font-bold text-purple-600">{summary.totalQuantity || 0}</p>
              </div>
              <FiPackage className="text-2xl text-purple-600 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              placeholder="Search materials..."
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
              {error}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
              <FiPackage className="text-4xl mx-auto mb-2 opacity-50 text-slate-400" />
              <p className="text-slate-500">No materials found</p>
              <p className="text-sm text-slate-400 mt-2">
                {materials.length === 0 
                  ? 'You haven\'t included any materials in your quotations yet. Materials added from the material catalog in quotations will appear here.'
                  : 'Try a different search term or category'}
              </p>
              {materials.length === 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                  <p className="text-sm text-blue-800 font-semibold mb-2">How to add materials:</p>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Go to Jobs tab</li>
                    <li>2. Create a quotation for a booking</li>
                    <li>3. Click "Add from Materials" in the quotation modal</li>
                    <li>4. Select items from the material catalog</li>
                    <li>5. Send the quotation</li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-2">
                    Note: Only items selected from the material catalog will appear here. Manual items won't be tracked.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredMaterials.map((material, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                          {material.name}
                        </h3>
                        {material.category && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {material.category}
                          </span>
                        )}
                        {material.isFromCatalog ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Catalog
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            Manual
                          </span>
                        )}
                      </div>
                      {material.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">{material.description}</p>
                      )}
                    </div>
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                      <FiPackage className="text-primary text-lg sm:text-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Total Quantity</p>
                      <p className="text-lg font-bold text-slate-800">{material.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Avg. Price</p>
                      <p className="text-lg font-bold text-primary">₹{Math.round(material.averagePrice).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Value</p>
                      <p className="text-lg font-bold text-green-600">₹{material.totalValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Quotations</p>
                      <p className="text-lg font-bold text-blue-600">{material.quotations.length}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMaterial(material)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                    >
                      <FiEye />
                      View Details
                    </button>
                    <button
                      onClick={() => handleSelectMaterial(material)}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2"
                    >
                      <FiPlus />
                      Add to Quote
                      {getSelectedMaterialQuantity(material) > 0 && (
                        <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {getSelectedMaterialQuantity(material)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quotation Cart / Material Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 lg:sticky lg:top-6">
            {selectedMaterials.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Selected Materials</h2>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {selectedMaterials.length}
                    </span>
                    <button
                      onClick={() => setSelectedMaterials([])}
                      className="text-slate-400 hover:text-slate-600"
                      title="Clear all"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {selectedMaterials.map((material, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{material.name}</h4>
                        <button
                          onClick={() => handleRemoveMaterial(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateMaterialQuantity(index, -1)}
                            className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-semibold">{material.quantity}</span>
                          <button
                            onClick={() => handleUpdateMaterialQuantity(index, 1)}
                            className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">₹{material.unitPrice}/unit</div>
                          <div className="font-semibold text-primary">₹{material.total.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-slate-800">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{selectedMaterials.reduce((sum, m) => sum + m.total, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={handleCreateQuotation}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2"
                  >
                    <FiSend />
                    Send Quotation
                  </button>
                </div>
              </>
            ) : selectedMaterial ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Material Details</h2>
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{selectedMaterial.name}</h3>
                    {selectedMaterial.description && (
                      <p className="text-sm text-slate-600">{selectedMaterial.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Total Quantity</p>
                      <p className="text-lg font-bold text-slate-800">{selectedMaterial.totalQuantity}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Total Value</p>
                      <p className="text-lg font-bold text-primary">₹{selectedMaterial.totalValue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Quotation History</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedMaterial.quotations.map((quotation, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-primary">#{quotation.quotationNumber}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              quotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {quotation.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <FiUser className="w-3 h-3" />
                              <span>{quotation.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiPhone className="w-3 h-3" />
                              <span>{quotation.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiTool className="w-3 h-3" />
                              <span>{quotation.service}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              <span>{formatDate(quotation.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Qty: {quotation.quantity}</span>
                            <span className="font-semibold text-sm text-primary">₹{quotation.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FiPackage className="text-4xl mx-auto mb-2 opacity-50" />
                <p>Select materials to create a quotation</p>
                <p className="text-sm mt-2">Click "Add to Quote" on materials to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Create Quotation</h2>
              <button
                onClick={() => {
                  setShowQuotationModal(false)
                  setSelectedBooking(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {!selectedBooking ? (
                <>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Select a Job</h3>
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : availableBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <FiCalendar className="text-4xl mx-auto mb-4 opacity-50" />
                      <p>No available jobs found</p>
                      <p className="text-sm mt-2">You need accepted or in-progress bookings to send quotations</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {availableBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-primary cursor-pointer transition"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-primary">#{booking.bookingId}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <FiUser className="w-4 h-4 text-slate-400" />
                              <span>{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiPhone className="w-4 h-4 text-slate-400" />
                              <span>{booking.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiTool className="w-4 h-4 text-slate-400" />
                              <span>{booking.serviceName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4 text-slate-400" />
                              <span>{formatDate(booking.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SendQuotationModal
                  booking={selectedBooking}
                  onClose={() => {
                    setShowQuotationModal(false)
                    setSelectedBooking(null)
                  }}
                  onCreate={handleSendQuotation}
                  token={token}
                  preSelectedItems={selectedMaterials}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SparePartsTab

