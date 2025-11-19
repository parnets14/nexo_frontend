import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiRefreshCw, FiTag } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

// Static icon options - commonly used service category icons
const STATIC_ICONS = [
  { emoji: '🔧', name: 'Tools' },
  { emoji: '🏠', name: 'Home' },
  { emoji: '🚿', name: 'Plumbing' },
  { emoji: '⚡', name: 'Electrical' },
  { emoji: '🧹', name: 'Cleaning' },
  { emoji: '🎨', name: 'Painting' },
  { emoji: '🔨', name: 'Carpentry' },
  { emoji: '🛠️', name: 'Repair' },
  { emoji: '🌿', name: 'Gardening' },
  { emoji: '🚗', name: 'Automotive' },
  { emoji: '💻', name: 'Tech' },
  { emoji: '🏢', name: 'Commercial' },
  { emoji: '🔒', name: 'Security' },
  { emoji: '❄️', name: 'AC/Heating' },
  { emoji: '🚚', name: 'Moving' },
  { emoji: '🧰', name: 'Maintenance' },
  { emoji: '📱', name: 'Mobile' },
  { emoji: '💡', name: 'Lighting' },
  { emoji: '🚪', name: 'Doors' },
  { emoji: '🪟', name: 'Windows' },
  { emoji: '🏗️', name: 'Construction' },
  { emoji: '🧯', name: 'Fire Safety' },
  { emoji: '💧', name: 'Water' },
  { emoji: '🌐', name: 'Internet' },
  { emoji: '📺', name: 'TV/Media' },
  { emoji: '🔌', name: 'Appliances' },
  { emoji: '🛡️', name: 'Protection' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '💎', name: 'Premium' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🔥', name: 'Hot' },
  { emoji: '✨', name: 'Sparkle' },
  { emoji: '🌟', name: 'Shining' },
  { emoji: '🎪', name: 'Event' },
  { emoji: '🏥', name: 'Medical' },
  { emoji: '🍽️', name: 'Kitchen' },
  { emoji: '🛋️', name: 'Furniture' },
  { emoji: '🚿', name: 'Bathroom' },
  { emoji: '🛏️', name: 'Bedroom' },
  { emoji: '📦', name: 'Package' },
  { emoji: '🎨', name: 'Design' },
  { emoji: '📸', name: 'Photography' },
  { emoji: '🎬', name: 'Video' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '🏋️', name: 'Fitness' },
  { emoji: '💆', name: 'Beauty' },
  { emoji: '✂️', name: 'Hair' },
  { emoji: '💅', name: 'Nails' },
  { emoji: '👔', name: 'Professional' },
  { emoji: '🎓', name: 'Education' },
  { emoji: '📚', name: 'Learning' },
  { emoji: '🖥️', name: 'Computer' },
  { emoji: '⌨️', name: 'Keyboard' },
  { emoji: '🖨️', name: 'Printer' },
  { emoji: '📱', name: 'Phone' },
  { emoji: '⌚', name: 'Watch' },
  { emoji: '🎧', name: 'Audio' },
  { emoji: '📷', name: 'Camera' },
  { emoji: '🎮', name: 'Gaming' },
  { emoji: '🚲', name: 'Bicycle' },
  { emoji: '🛵', name: 'Scooter' },
  { emoji: '✈️', name: 'Travel' },
  { emoji: '🏨', name: 'Hotel' },
  { emoji: '🍕', name: 'Food' },
  { emoji: '☕', name: 'Coffee' },
  { emoji: '🍰', name: 'Bakery' },
  { emoji: '🌮', name: 'Restaurant' },
  { emoji: '🛒', name: 'Shopping' },
  { emoji: '💳', name: 'Payment' },
  { emoji: '🏦', name: 'Bank' },
  { emoji: '📊', name: 'Analytics' },
  { emoji: '📈', name: 'Growth' },
  { emoji: '💼', name: 'Business' },
  { emoji: '🤝', name: 'Partnership' },
  { emoji: '🌍', name: 'Global' },
  { emoji: '📍', name: 'Location' },
  { emoji: '🗺️', name: 'Map' },
  { emoji: '⏰', name: 'Time' },
  { emoji: '📅', name: 'Calendar' },
  { emoji: '✅', name: 'Check' },
  { emoji: '❌', name: 'Cross' },
  { emoji: '⚠️', name: 'Warning' },
  { emoji: 'ℹ️', name: 'Info' },
  { emoji: '🔍', name: 'Search' },
  { emoji: '💬', name: 'Chat' },
  { emoji: '📞', name: 'Call' },
  { emoji: '📧', name: 'Email' },
  { emoji: '📝', name: 'Document' },
  { emoji: '📋', name: 'Clipboard' },
  { emoji: '📄', name: 'File' },
  { emoji: '📑', name: 'Pages' },
  { emoji: '🔖', name: 'Bookmark' },
  { emoji: '🏷️', name: 'Label' },
  { emoji: '🎫', name: 'Ticket' },
  { emoji: '🎟️', name: 'Voucher' },
  { emoji: '🎲', name: 'Dice' },
  { emoji: '🎰', name: 'Casino' },
  { emoji: '🎭', name: 'Theater' },
  { emoji: '🎨', name: 'Art' },
  { emoji: '🖼️', name: 'Frame' },
  { emoji: '🖌️', name: 'Paintbrush' },
  { emoji: '🖍️', name: 'Crayon' },
  { emoji: '✏️', name: 'Pencil' },
  { emoji: '✒️', name: 'Pen' },
  { emoji: '🖊️', name: 'Ballpoint' },
  { emoji: '🖋️', name: 'Fountain Pen' },
  { emoji: '📏', name: 'Ruler' },
  { emoji: '📐', name: 'Triangle' },
  { emoji: '✂️', name: 'Scissors' },
  { emoji: '📌', name: 'Pin' },
  { emoji: '📍', name: 'Pushpin' },
  { emoji: '📎', name: 'Paperclip' },
  { emoji: '🖇️', name: 'Linked Clips' },
  { emoji: '📏', name: 'Straight Ruler' },
  { emoji: '📐', name: 'Triangular Ruler' },
  { emoji: '🗂️', name: 'Card Index' },
  { emoji: '📁', name: 'Folder' },
  { emoji: '📂', name: 'Open Folder' },
  { emoji: '🗂️', name: 'Card File' },
  { emoji: '🗄️', name: 'File Cabinet' },
  { emoji: '📊', name: 'Bar Chart' },
  { emoji: '📈', name: 'Chart Increasing' },
  { emoji: '📉', name: 'Chart Decreasing' },
  { emoji: '📋', name: 'Clipboard' },
  { emoji: '📌', name: 'Pushpin' },
  { emoji: '📍', name: 'Round Pushpin' },
  { emoji: '📎', name: 'Paperclip' },
  { emoji: '🖇️', name: 'Linked Paperclips' },
  { emoji: '📏', name: 'Straightedge Ruler' },
  { emoji: '📐', name: 'Triangular Ruler' },
  { emoji: '✂️', name: 'Scissors' },
  { emoji: '🗃️', name: 'Card File Box' },
  { emoji: '🗄️', name: 'File Cabinet' },
  { emoji: '🗑️', name: 'Wastebasket' },
]

const CategoryManagement = () => {
  const { token } = useAdminAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subtitle: '',
    icon: '',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: categoriesData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchCategories(token),
    []
  )

  const categories = categoriesData?.data || []

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category._id)
      setFormData({
        name: category.name || '',
        description: category.description || '',
        subtitle: category.subtitle || '',
        icon: category.icon || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        subtitle: '',
        icon: '',
        isActive: true
      })
    }
    setShowModal(true)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      subtitle: '',
      icon: '',
      isActive: true
    })
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (editingCategory) {
        // Update category
        await adminApi.updateCategory(token, editingCategory, {
          name: formData.name,
          description: formData.description,
          subtitle: formData.subtitle,
          icon: formData.icon,
          isActive: formData.isActive
        })
        setSuccessMsg('Category updated successfully!')
      } else {
        // Create category
        await adminApi.createCategory(token, {
          name: formData.name,
          description: formData.description,
          subtitle: formData.subtitle,
          icon: formData.icon,
          isActive: formData.isActive
        })
        setSuccessMsg('Category created successfully!')
      }

      refresh()
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await adminApi.deleteCategory(token, categoryId)
      setSuccessMsg('Category deleted successfully!')
      refresh()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete category')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const isEmoji = (str) => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    return emojiRegex.test(str)
  }

  return (
    <div>
      <ModuleHeader
        title="Category Management"
        subtitle="Manage service categories with icons, descriptions, and status."
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
          >
            <FiPlus className="w-5 h-5" />
            Add Category
          </button>
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
          placeholder="Search categories..."
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
          Error loading categories: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
                    {isEmoji(category.icon) ? (
                      category.icon
                    ) : (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                    )}
                    <span style={{ display: 'none' }}>📦</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-500">{category.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{category.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="e.g., Plumbing, Electrical, Cleaning"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Short description or tagline"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Detailed description of the category"
                  rows="3"
                  required
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon <span className="text-red-500">*</span>
                </label>
                <div className="mb-4">
                  <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border-2 border-slate-200 rounded-xl">
                    {STATIC_ICONS.map((iconOption, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.emoji }))}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition ${
                          formData.icon === iconOption.emoji
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                        title={iconOption.name}
                      >
                        {iconOption.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Selected: {formData.icon || 'None'}
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Active (Category will be visible to partners)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement

