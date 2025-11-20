import React, { useEffect, useState } from 'react'
import { useVendorAuth } from '../../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../../services/vendorApi.js'
import { FiPackage, FiUpload, FiX, FiImage, FiSmile } from 'react-icons/fi'
import { useSearchParams, useNavigate } from 'react-router-dom'

// Material Icons for spare parts
const MATERIAL_ICONS = [
  // Tools & Hardware
  { emoji: '🔧', name: 'Wrench', category: 'Tools' },
  { emoji: '🔨', name: 'Hammer', category: 'Tools' },
  { emoji: '🛠️', name: 'Tools', category: 'Tools' },
  { emoji: '⚙️', name: 'Gear', category: 'Tools' },
  { emoji: '🔩', name: 'Nut & Bolt', category: 'Tools' },
  { emoji: '⚡', name: 'Electrical', category: 'Electrical' },
  { emoji: '💡', name: 'Light Bulb', category: 'Electrical' },
  { emoji: '🔌', name: 'Plug', category: 'Electrical' },
  { emoji: '📡', name: 'Antenna', category: 'Electrical' },
  { emoji: '🔋', name: 'Battery', category: 'Electrical' },
  // Plumbing
  { emoji: '🚿', name: 'Shower', category: 'Plumbing' },
  { emoji: '🚰', name: 'Water', category: 'Plumbing' },
  { emoji: '💧', name: 'Droplet', category: 'Plumbing' },
  { emoji: '🌊', name: 'Wave', category: 'Plumbing' },
  // Painting & Decor
  { emoji: '🎨', name: 'Paint', category: 'Painting' },
  { emoji: '🖌️', name: 'Paintbrush', category: 'Painting' },
  { emoji: '🖼️', name: 'Frame', category: 'Decor' },
  { emoji: '🪟', name: 'Window', category: 'Decor' },
  { emoji: '🚪', name: 'Door', category: 'Decor' },
  // AC & Cooling
  { emoji: '❄️', name: 'Snowflake', category: 'AC' },
  { emoji: '🌡️', name: 'Thermometer', category: 'AC' },
  { emoji: '🌀', name: 'Cyclone', category: 'AC' },
  { emoji: '💨', name: 'Wind', category: 'AC' },
  // Cleaning & Maintenance
  { emoji: '🧹', name: 'Broom', category: 'Cleaning' },
  { emoji: '🧽', name: 'Sponge', category: 'Cleaning' },
  { emoji: '🧴', name: 'Bottle', category: 'Cleaning' },
  { emoji: '🧼', name: 'Soap', category: 'Cleaning' },
  { emoji: '🧯', name: 'Fire Extinguisher', category: 'Safety' },
  // Hardware & Fasteners
  { emoji: '📎', name: 'Paperclip', category: 'Hardware' },
  { emoji: '📌', name: 'Pushpin', category: 'Hardware' },
  { emoji: '🔒', name: 'Lock', category: 'Hardware' },
  { emoji: '🔑', name: 'Key', category: 'Hardware' },
  { emoji: '🪝', name: 'Hook', category: 'Hardware' },
  // Appliances
  { emoji: '📺', name: 'TV', category: 'Appliances' },
  { emoji: '📱', name: 'Phone', category: 'Appliances' },
  { emoji: '💻', name: 'Laptop', category: 'Appliances' },
  { emoji: '🖥️', name: 'Computer', category: 'Appliances' },
  { emoji: '⌨️', name: 'Keyboard', category: 'Appliances' },
  // Construction & Building
  { emoji: '🏗️', name: 'Construction', category: 'Building' },
  { emoji: '🧱', name: 'Brick', category: 'Building' },
  { emoji: '🏠', name: 'House', category: 'Building' },
  { emoji: '🏢', name: 'Building', category: 'Building' },
  { emoji: '🏭', name: 'Factory', category: 'Building' },
  // Packaging & Storage
  { emoji: '📦', name: 'Package', category: 'Storage' },
  { emoji: '📋', name: 'Clipboard', category: 'Storage' },
  { emoji: '🗂️', name: 'Card Index', category: 'Storage' },
  { emoji: '📁', name: 'Folder', category: 'Storage' },
  { emoji: '🗄️', name: 'File Cabinet', category: 'Storage' },
  // General Materials
  { emoji: '🧰', name: 'Toolbox', category: 'General' },
  { emoji: '🛒', name: 'Shopping Cart', category: 'General' },
  { emoji: '📊', name: 'Chart', category: 'General' },
  { emoji: '⭐', name: 'Star', category: 'General' },
  { emoji: '✨', name: 'Sparkle', category: 'General' },
  { emoji: '🌟', name: 'Glowing Star', category: 'General' },
  { emoji: '💎', name: 'Diamond', category: 'General' },
  { emoji: '🎯', name: 'Target', category: 'General' },
  { emoji: '✅', name: 'Check Mark', category: 'General' },
  { emoji: '🔍', name: 'Magnifying Glass', category: 'General' },
  // Specialized
  { emoji: '🪜', name: 'Ladder', category: 'Tools' },
  { emoji: '🪣', name: 'Bucket', category: 'Tools' },
  { emoji: '🧲', name: 'Magnet', category: 'Tools' },
  { emoji: '🔦', name: 'Flashlight', category: 'Tools' },
  { emoji: '🪛', name: 'Screwdriver', category: 'Tools' },
]

const AddSparePartTab = () => {
  const { token } = useVendorAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    stock: '',
    unit: 'units',
    specifications: '',
    hsnCode: '',
    gstPercentage: '0',
    image: null,
    icon: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [imageType, setImageType] = useState('icon') // 'image' or 'icon'
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearchTerm, setIconSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
    if (editId) {
      fetchSparePart()
    }
  }, [token, editId])

  const fetchCategories = async () => {
    if (!token) return
    try {
      const response = await vendorApi.getCategories(token)
      const fetchedCategories = response.data || response.categories || []
      console.log('Fetched categories for form:', fetchedCategories)
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const fetchSparePart = async () => {
    if (!token || !editId) return
    try {
      const response = await vendorApi.getSparePart(token, editId)
      const part = response.data
      setFormData({
        name: part.name || '',
        description: part.description || '',
        category: part.category || '',
        brand: part.brand || '',
        price: part.price || '',
        stock: part.stock || '',
        unit: part.unit || 'units',
        specifications: part.specifications || '',
        hsnCode: part.hsnCode || '',
        gstPercentage: part.gstPercentage || '0',
        image: null,
        icon: part.icon || ''
      })
      if (part.image) {
        setImagePreview(part.image)
        setImageType('image')
      } else if (part.icon) {
        setImageType('icon')
      }
    } catch (error) {
      console.error('Failed to fetch spare part:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file, icon: '' }))
      setImageType('image')
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIconSelect = (iconEmoji) => {
    setFormData(prev => ({ ...prev, icon: iconEmoji, image: null }))
    setImageType('icon')
    setImagePreview(null)
    setShowIconPicker(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formDataToSend = new FormData()
      
      // Add all fields except image and icon first
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'icon' && formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })
      
      // Handle image or icon - only one should be added
      if (imageType === 'image' && formData.image) {
        formDataToSend.append('image', formData.image)
        // Explicitly set icon to empty string to clear it
        formDataToSend.append('icon', '')
      } else if (imageType === 'icon' && formData.icon) {
        // Ensure icon is a string, not an array
        const iconValue = Array.isArray(formData.icon) ? formData.icon[0] : formData.icon
        if (iconValue && iconValue.trim() !== '') {
          formDataToSend.append('icon', iconValue.trim())
        }
        // Don't append image field at all if using icon
      } else {
        // Neither image nor icon - clear both
        formDataToSend.append('icon', '')
      }

      if (editId) {
        await vendorApi.updateSparePart(token, editId, formDataToSend)
        setSuccess(true)
        setTimeout(() => {
          navigate('/vendor/dashboard/spare-parts')
        }, 1500)
      } else {
        await vendorApi.addSparePart(token, formDataToSend)
        setSuccess(true)
        setFormData({
          name: '',
          description: '',
          category: '',
          brand: '',
          price: '',
          stock: '',
          unit: 'units',
          specifications: '',
          hsnCode: '',
          gstPercentage: '0',
          image: null,
          icon: ''
        })
        setImagePreview(null)
        setImageType('icon')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to save spare part')
    } finally {
      setLoading(false)
    }
  }

  const filteredIcons = MATERIAL_ICONS.filter(icon =>
    iconSearchTerm === '' ||
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
    icon.category.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
    icon.emoji.includes(iconSearchTerm)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          {editId ? 'Edit Spare Part' : 'Add New Spare Part'}
        </h1>
        <p className="text-slate-600">Add or update spare part information</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          Spare part {editId ? 'updated' : 'added'} successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                list="categories"
                placeholder={categories.length > 0 ? "Select existing or enter new category" : "Enter category name (e.g., Engine Parts, Brake Parts)"}
                required
              />
              {categories.length > 0 && (
                <datalist id="categories">
                  {categories.map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              )}
            </div>
            {categories.length > 0 ? (
              <p className="text-xs text-slate-500 mt-1">
                {categories.length} existing categor{categories.length === 1 ? 'y' : 'ies'} available. Type to see suggestions or enter a new one.
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <FiPackage className="w-3 h-3" />
                No existing categories. This will create your first category.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Unit
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              HSN Code
            </label>
            <input
              type="text"
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              GST Percentage (%)
            </label>
            <input
              type="number"
              name="gstPercentage"
              value={formData.gstPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Specifications
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Image/Icon Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Visual Representation
            </label>
            
            {/* Toggle between Image and Icon */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setImageType('icon')
                  setFormData(prev => ({ ...prev, image: null }))
                  setImagePreview(null)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  imageType === 'icon'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FiSmile className="w-4 h-4" />
                Select Icon
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageType('image')
                  setFormData(prev => ({ ...prev, icon: '' }))
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  imageType === 'image'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FiImage className="w-4 h-4" />
                Upload Image
              </button>
            </div>

            {imageType === 'image' ? (
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition">
                    <FiUpload className="text-2xl text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </p>
                  </div>
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData(prev => ({ ...prev, image: null }))
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                  >
                    <FiSmile className="w-4 h-4" />
                    {formData.icon ? 'Change Icon' : 'Select Icon'}
                  </button>
                  {formData.icon && (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center text-4xl">
                        {formData.icon}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>

                {showIconPicker && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search icons..."
                        value={iconSearchTerm}
                        onChange={(e) => setIconSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                      {filteredIcons.map((iconOption, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleIconSelect(iconOption.emoji)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 ${
                            formData.icon === iconOption.emoji
                              ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 scale-110'
                              : 'bg-white hover:bg-primary/10 hover:scale-105 border border-slate-200'
                          }`}
                          title={`${iconOption.name} (${iconOption.category})`}
                        >
                          {iconOption.emoji}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : editId ? 'Update Spare Part' : 'Add Spare Part'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/vendor/dashboard/spare-parts')}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddSparePartTab
