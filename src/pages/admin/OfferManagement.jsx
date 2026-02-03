import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiRefreshCw, FiTag, FiPercent, FiCalendar, FiImage } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const OfferManagement = () => {
  const { token } = useAdminAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [formData, setFormData] = useState({
    couponCode: '',
    discount: '',
    startDate: '',
    endDate: '',
    offerTitle: '',
    promotionalImage: null,
    offerType: 'coupon',
    targetService: '',
    originalPrice: '',
    offerPrice: '',
    isPopupEnabled: false
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: offersData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchOffers(token),
    []
  )

  const offers = offersData?.data || []

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer._id)
      setFormData({
        couponCode: offer.couponCode || '',
        discount: offer.discount || '',
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
        offerTitle: offer.offerTitle || '',
        promotionalImage: null,
        offerType: offer.offerType || 'coupon',
        targetService: offer.targetService || '',
        originalPrice: offer.originalPrice || '',
        offerPrice: offer.offerPrice || '',
        isPopupEnabled: offer.isPopupEnabled || false
      })
      setImagePreview(offer.promotionalImage || null)
    } else {
      setEditingOffer(null)
      setFormData({
        couponCode: '',
        discount: '',
        startDate: '',
        endDate: '',
        offerTitle: '',
        promotionalImage: null,
        offerType: 'coupon',
        targetService: '',
        originalPrice: '',
        offerPrice: '',
        isPopupEnabled: false
      })
      setImagePreview(null)
    }
    setShowModal(true)
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOffer(null)
    setFormData({
      couponCode: '',
      discount: '',
      startDate: '',
      endDate: '',
      offerTitle: '',
      promotionalImage: null,
      offerType: 'coupon',
      targetService: '',
      originalPrice: '',
      offerPrice: '',
      isPopupEnabled: false
    })
    setImagePreview(null)
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, promotionalImage: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (editingOffer) {
        await adminApi.updateOffer(token, editingOffer, formData)
        setSuccessMsg('Offer updated successfully!')
      } else {
        await adminApi.createOffer(token, formData)
        setSuccessMsg('Offer created successfully!')
      }
      
      setTimeout(() => {
        handleCloseModal()
        refresh()
      }, 1500)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return

    try {
      await adminApi.deleteOffer(token, offerId)
      setSuccessMsg('Offer deleted successfully!')
      refresh()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete offer')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const isOfferActive = (offer) => {
    const now = new Date()
    const start = new Date(offer.startDate)
    const end = new Date(offer.endDate)
    return now >= start && now <= end
  }

  const isOfferExpired = (offer) => {
    const now = new Date()
    const end = new Date(offer.endDate)
    return now > end
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Offer Management"
        subtitle="Create and manage promotional offers and discount coupons"
        icon={FiTag}
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <FiPlus /> Create Offer
          </button>
        }
      />

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <FiRefreshCw className="animate-spin text-3xl text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Error loading offers: {error.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No offers found. Create your first offer to get started.
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
              >
                {offer.promotionalImage && (
                  <div className="h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={offer.promotionalImage}
                      alt={offer.offerTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{offer.offerTitle}</h3>
                        {offer.offerType === 'special_offer' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Special Offer
                          </span>
                        )}
                        {offer.isPopupEnabled && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Popup
                          </span>
                        )}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono font-bold">
                        <FiTag className="text-xs" />
                        {offer.couponCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleOpenModal(offer)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {offer.offerType === 'special_offer' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Original Price:</span>
                        <span className="text-sm line-through text-slate-500">₹{offer.originalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Offer Price:</span>
                        <span className="text-lg font-bold text-primary">₹{offer.offerPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">You Save:</span>
                        <span className="text-sm font-medium text-green-600">₹{offer.originalPrice - offer.offerPrice}</span>
                      </div>
                      {offer.targetService && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Service:</span> {offer.targetService.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                      <FiPercent className="text-xl" />
                      {offer.discount}% OFF
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-slate-400" />
                      <span>Start: {new Date(offer.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-slate-400" />
                      <span>End: {new Date(offer.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {isOfferExpired(offer) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Expired
                      </span>
                    ) : isOfferActive(offer) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {offer.applyOffer && offer.applyOffer.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Used by {offer.applyOffer.length} user{offer.applyOffer.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Offer Type *
                </label>
                <select
                  value={formData.offerType}
                  onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="coupon">Regular Coupon</option>
                  <option value="special_offer">Special Offer (Popup)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Offer Title *
                </label>
                <input
                  type="text"
                  value={formData.offerTitle}
                  onChange={(e) => setFormData({ ...formData, offerTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  placeholder="e.g., SUMMER2024"
                  required
                  disabled={editingOffer}
                />
                {editingOffer && (
                  <p className="mt-1 text-xs text-slate-500">Coupon code cannot be changed after creation</p>
                )}
              </div>

              {formData.offerType === 'special_offer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Target Service *
                    </label>
                    <select
                      value={formData.targetService}
                      onChange={(e) => setFormData({ ...formData, targetService: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select Service</option>
                      <option value="ac-service">AC Service</option>
                      <option value="refrigerator-service">Refrigerator Service</option>
                      <option value="washing-machine-service">Washing Machine Service</option>
                      <option value="microwave-service">Microwave Service</option>
                      <option value="geyser-service">Geyser Service</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Original Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 999"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Offer Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 499"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPopupEnabled"
                      checked={formData.isPopupEnabled}
                      onChange={(e) => setFormData({ ...formData, isPopupEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="isPopupEnabled" className="text-sm font-medium text-slate-700">
                      Enable as popup offer for first-time visitors
                    </label>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Promotional Image {!editingOffer && '*'}
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({ ...formData, promotionalImage: null })
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={!editingOffer && !imagePreview}
                  />
                  <p className="text-xs text-slate-500">
                    Recommended size: 1200x600px. Max file size: 5MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfferManagement
