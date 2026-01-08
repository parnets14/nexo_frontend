import React, { useEffect, useState } from 'react'
import { useVendorAuth } from '../../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../../services/vendorApi.js'
import { FiPackage, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi'

const SparePartsTab = () => {
  const { token } = useVendorAuth()
  const [spareParts, setSpareParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchSpareParts()
    fetchCategories()
  }, [token, selectedCategory])

  const fetchSpareParts = async () => {
    if (!token) return

    setLoading(true)
    try {
      const params = {}
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await vendorApi.getSpareParts(token, params)
      setSpareParts(response.data || [])
    } catch (error) {
      console.error('Failed to fetch spare parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!token) return

    try {
      const response = await vendorApi.getCategories(token)
      const fetchedCategories = response.data || response.categories || []
      console.log('Fetched categories:', fetchedCategories)
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      // Set empty array on error
      setCategories([])
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) return

    try {
      await vendorApi.deleteSparePart(token, id)
      fetchSpareParts()
    } catch (error) {
      alert('Failed to delete spare part')
    }
  }

  const filteredParts = spareParts.filter(part => {
    if (selectedCategory !== 'all' && part.category !== selectedCategory) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        part.name?.toLowerCase().includes(search) ||
        part.description?.toLowerCase().includes(search) ||
        part.brand?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Spare Parts</h1>
          <p className="text-slate-600">Manage your spare parts inventory</p>
        </div>
        <button
          onClick={fetchSpareParts}
          className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search spare parts..."
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[180px]"
          >
            <option value="all">All Categories</option>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available</option>
            )}
          </select>
        </div>
      </div>

      {filteredParts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
          <FiPackage className="text-4xl mx-auto mb-2 opacity-50 text-slate-400" />
          <p className="text-slate-500">No spare parts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => (
            <div
              key={part._id}
              className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition"
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                {part.image ? (
                  <>
                    <img
                      src={part.image.startsWith('http') ? part.image : (part.image.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL || 'https://nexo-backend-testing.onrender.com'}${part.image}` : part.image)}
                      alt={part.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex'
                        }
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                      {part.icon ? (
                        <span className="text-6xl">{part.icon}</span>
                      ) : (
                        <FiPackage className="w-16 h-16 text-primary/40" />
                      )}
                    </div>
                  </>
                ) : part.icon ? (
                  <span className="text-7xl">{part.icon}</span>
                ) : (
                  <FiPackage className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{part.name}</h3>
                  {part.brand && (
                    <p className="text-sm text-slate-600 mb-2">Brand: {part.brand}</p>
                  )}
                  {part.description && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{part.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-primary">
                    ₹{part.price?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-sm text-slate-500">
                    Stock: {part.stock} {part.unit}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    part.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : part.status === 'out_of_stock'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {part.status}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/vendor/dashboard/add-spare-part?id=${part._id}`}
                  className="flex-1 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition text-center"
                >
                  <FiEdit className="inline mr-2" />
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(part._id)}
                  className="py-2 px-4 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SparePartsTab

