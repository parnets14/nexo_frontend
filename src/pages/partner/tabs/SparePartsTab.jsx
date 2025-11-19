import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiPackage, FiShoppingCart, FiSearch, FiRefreshCw, FiPlus, FiMinus } from 'react-icons/fi'

const SparePartsTab = () => {
  const { token } = usePartnerAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [token, selectedCategory])

  const fetchProducts = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      // Fetch products by category
      if (selectedCategory !== 'all') {
        const response = await partnerApi.getProductsByCategory(token, selectedCategory)
        // Handle different response structures
        let productsList = []
        if (Array.isArray(response)) {
          productsList = response
        } else if (Array.isArray(response?.data)) {
          productsList = response.data
        } else if (Array.isArray(response?.products)) {
          productsList = response.products
        }
        setProducts(productsList)
      } else {
        // Fetch all categories first, then products
        const cats = await partnerApi.getCategories(token)
        // Handle different response structures
        let categoriesList = []
        if (Array.isArray(cats)) {
          categoriesList = cats
        } else if (Array.isArray(cats?.data)) {
          categoriesList = cats.data
        } else if (Array.isArray(cats?.categories)) {
          categoriesList = cats.categories
        }
        setCategories(categoriesList)
        
        // For now, show empty or fetch from first category
        setProducts([])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch spare parts')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    if (!token) return

    try {
      const response = await partnerApi.addToCart(token, {
        productId: product._id || product.id,
        quantity: 1
      })
      
      if (response.success) {
        setCart([...cart, { ...product, quantity: 1 }])
      }
    } catch (err) {
      alert(err.message || 'Failed to add to cart')
    }
  }

  const updateCartQuantity = (productId, change) => {
    setCart(
      cart.map((item) =>
        item._id === productId || item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId && item.id !== productId))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Spare Parts</h1>
          <p className="text-slate-600">Browse and order spare parts for your services</p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
        >
          <FiRefreshCw className="text-xl text-slate-600" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
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
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {Array.isArray(categories) && categories.map((cat, index) => (
              <option key={index} value={cat._id || cat.id || cat.name}>
                {cat.name || 'Category'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
              <FiPackage className="text-4xl mx-auto mb-2 opacity-50 text-slate-400" />
              <p className="text-slate-500">No spare parts found</p>
              <p className="text-sm text-slate-400 mt-2">
                {selectedCategory === 'all'
                  ? 'Please select a category to view products'
                  : 'Try a different category or search term'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {product.name || 'Spare Part'}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-slate-600 mb-2">{product.description}</p>
                      )}
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <FiPackage className="text-primary text-xl" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ₹{product.price?.toLocaleString('en-IN') || 0}
                      </p>
                      {product.stock !== undefined && (
                        <p className="text-sm text-slate-500">
                          Stock: {product.stock} {product.unit || 'units'}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Cart</h2>
              <FiShoppingCart className="text-xl text-slate-600" />
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiShoppingCart className="text-4xl mx-auto mb-2 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(item._id || item.id, -1)
                            }
                            className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="px-2 font-semibold">{item.quantity || 1}</span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item._id || item.id, 1)
                            }
                            className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                        <p className="font-bold text-primary">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-slate-800">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SparePartsTab

