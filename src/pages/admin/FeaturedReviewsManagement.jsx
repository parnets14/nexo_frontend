import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiX } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const FeaturedReviewsManagement = () => {
  const { token } = useAdminAuth()
  const { data: reviewsData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchFeaturedReviews(token),
    []
  )
  const [showModal, setShowModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    rating: 5,
    authorRole: '',
    authorLocation: '',
    serviceType: '',
    isActive: true,
    displayOrder: 0,
    featured: false
  })
  const [submitting, setSubmitting] = useState(false)

  // Extract reviews - handle different response structures
  const reviews = React.useMemo(() => {
    if (!reviewsData) return []
    
    if (typeof reviewsData === 'string' && reviewsData.trim().startsWith('<!')) {
      return []
    }
    
    if (typeof reviewsData !== 'object' || reviewsData === null) {
      return []
    }
    
    if (Array.isArray(reviewsData)) {
      return reviewsData
    }
    
    if (reviewsData.success && Array.isArray(reviewsData.data)) {
      return reviewsData.data
    }
    
    if (Array.isArray(reviewsData.data)) {
      return reviewsData.data
    }
    
    return []
  }, [reviewsData])

  const handleCreate = () => {
    setEditingReview(null)
    setFormData({
      text: '',
      author: '',
      rating: 5,
      authorRole: '',
      authorLocation: '',
      serviceType: '',
      isActive: true,
      displayOrder: reviews.length,
      featured: false
    })
    setShowModal(true)
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setFormData({
      text: review.text || '',
      author: review.author || '',
      rating: review.rating || 5,
      authorRole: review.authorRole || '',
      authorLocation: review.authorLocation || '',
      serviceType: review.serviceType || '',
      isActive: review.isActive !== undefined ? review.isActive : true,
      displayOrder: review.displayOrder || 0,
      featured: review.featured || false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submitData = {
        ...formData,
        rating: Number(formData.rating),
        displayOrder: Number(formData.displayOrder) || 0
      }

      if (editingReview) {
        await adminApi.updateFeaturedReview(token, editingReview._id, submitData)
      } else {
        await adminApi.createFeaturedReview(token, submitData)
      }
      
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to save review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      await adminApi.deleteFeaturedReview(token, reviewId)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to delete review')
    }
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ))
  }

  return (
    <div>
      <ModuleHeader
        title="Featured Reviews Management"
        subtitle="Manage customer reviews displayed on the home page."
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {reviews.length > 0 && (
            <span>Total Reviews: <strong>{reviews.length}</strong></span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
          >
            <FiPlus /> Add New Review
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          <p className="font-semibold mb-2">Error loading reviews</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-slate-700 mb-2">No reviews found</p>
          <p className="text-slate-600 mb-6">Add your first customer review to get started</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
          >
            <FiPlus /> Add First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition ${
                review.featured ? 'border-primary border-l-4' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    {review.featured && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">Featured</span>
                    )}
                    {!review.isActive && (
                      <span className="text-xs text-rose-600 font-semibold">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 italic mb-3 line-clamp-3">"{review.text}"</p>
                  <div>
                    <p className="text-primary font-semibold">— {review.author}</p>
                    {review.authorLocation && (
                      <p className="text-xs text-gray-500">{review.authorLocation}</p>
                    )}
                    {review.serviceType && (
                      <p className="text-xs text-gray-500">{review.serviceType}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <FiEdit2 className="text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 hover:bg-rose-50 rounded-lg transition"
                  >
                    <FiTrash2 className="text-rose-600" />
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 text-xs text-gray-500">
                Order: {review.displayOrder}
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
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Review Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  required
                  rows="4"
                  placeholder="Enter the customer review text..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Author Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    required
                    placeholder="e.g., Rajesh K."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rating <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Author Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value }))}
                    placeholder="e.g., Homeowner, Business Owner"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.authorLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorLocation: e.target.value }))}
                    placeholder="e.g., Mumbai, Delhi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Service Type (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                    placeholder="e.g., AC Service, Plumbing"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

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
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-slate-700">Featured</span>
                </label>
              </div>

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
                  {submitting ? 'Saving...' : editingReview ? 'Update Review' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeaturedReviewsManagement

