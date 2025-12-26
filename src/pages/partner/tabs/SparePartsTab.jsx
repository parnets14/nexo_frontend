import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiPackage, FiShoppingCart, FiSearch, FiRefreshCw, FiPlus, FiMinus, FiTruck, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

const SparePartsTab = () => {
  const { token } = usePartnerAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCart()
    fetchPartnerProfile()
  }, [token, selectedCategory])

  const fetchCart = async () => {
    if (!token) return

    try {
      const response = await partnerApi.getCart(token)
      if (response.success && Array.isArray(response.cart)) {
        setCart(response.cart)
      }
    } catch (err) {
      console.error('Fetch cart error:', err)
      // Don't show error for cart fetch failure
    }
  }

  const fetchPartnerProfile = async () => {
    if (!token) return

    setProfileLoading(true)
    try {
      // Get partner profile data
      const response = await partnerApi.getProfile(token)
      if (response.success && response.profile) {
        const profile = response.profile
        // Auto-fill delivery address from partner profile
        setDeliveryAddress({
          name: profile.name || '',
          phone: profile.phone || '',
          email: profile.email || '',
          addressLine1: profile.address || '',
          addressLine2: '',
          city: profile.city || '',
          state: '',
          pincode: profile.pincode || '',
          landmark: profile.landmark || ''
        })
        console.log('✅ Partner profile loaded and address auto-filled')
      }
    } catch (err) {
      console.error('Fetch partner profile error:', err)
      // Don't show error for profile fetch failure, just use empty form
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchProducts = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      // Fetch products by category
      if (selectedCategory !== 'all') {
        const response = await partnerApi.getProductsByCategory(token, selectedCategory)
        console.log('API Response:', response)
        
        // Handle different response structures
        let productsList = []
        let responseMessage = ''
        
        if (response && typeof response === 'object') {
          // Check if it's a success response with data array
          if (response.success !== undefined) {
            productsList = Array.isArray(response.data) ? response.data : []
            responseMessage = response.message || ''
          }
          // Check if it's a direct array response
          else if (Array.isArray(response)) {
            productsList = response
          }
          // Check if it has a data property that's an array
          else if (Array.isArray(response.data)) {
            productsList = response.data
          }
          // Check if it has a products property that's an array
          else if (Array.isArray(response.products)) {
            productsList = response.products
          }
        }
        
        setProducts(productsList)
        
        // Show message if no products found
        if (productsList.length === 0 && responseMessage) {
          console.log('No products message:', responseMessage)
        }
        
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
      console.error('Fetch products error:', err)
      
      // Handle different error types
      if (err.status === 404 || err.message?.includes('No products found')) {
        // This is not really an error, just no products available
        setProducts([])
        setError(null) // Don't show error for empty categories
      } else if (err.status === 400 && err.message?.includes('Invalid category ID')) {
        setError('Invalid category selected. Please try a different category.')
      } else if (err.status === 401 || err.message?.includes('authenticate')) {
        setError('Authentication failed. Please login again.')
      } else {
        setError(err.message || 'Failed to fetch spare parts')
      }
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
        // Refresh cart from backend to get populated product details
        await fetchCart()
      }
    } catch (err) {
      console.error('Add to cart error:', err)
      alert(err.message || 'Failed to add to cart')
    }
  }

  const updateCartQuantity = async (productId, change) => {
    if (!token) return

    try {
      // Find current item in cart
      const currentItem = cart.find(item => 
        (item.product?._id || item.product?.id || item._id || item.id) === productId
      )
      
      if (!currentItem) return

      const newQuantity = Math.max(1, (currentItem.quantity || 1) + change)
      
      const response = await partnerApi.addToCart(token, {
        productId: productId,
        quantity: newQuantity
      })
      
      if (response.success) {
        // Refresh cart from backend
        await fetchCart()
      }
    } catch (err) {
      console.error('Update cart quantity error:', err)
      alert(err.message || 'Failed to update quantity')
    }
  }

  const removeFromCart = async (productId) => {
    if (!token) return

    try {
      const response = await partnerApi.removeFromCart(token, productId)
      
      if (response.success) {
        // Refresh cart from backend
        await fetchCart()
      }
    } catch (err) {
      console.error('Remove from cart error:', err)
      alert(err.message || 'Failed to remove from cart')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const cartTotal = cart.reduce((sum, item) => {
    const product = item.product || item
    const price = product.price || 0
    const quantity = item.quantity || 1
    return sum + (price * quantity)
  }, 0)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    // Auto-fetch partner profile when opening checkout
    await fetchPartnerProfile()
    setShowCheckout(true)
  }

  const handleDeliveryAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateDeliveryAddress = () => {
    const required = ['name', 'phone', 'addressLine1', 'pincode']
    for (let field of required) {
      if (!deliveryAddress[field]?.trim()) {
        alert(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    return true
  }

  const submitOrder = async () => {
    if (!validateDeliveryAddress()) return

    setOrderLoading(true)
    try {
      // Place order
      const orderResponse = await partnerApi.placeOrder(token, {
        deliveryAddress,
        notes: 'Spare parts order from partner dashboard'
      })

      if (orderResponse.success) {
        // Initiate payment
        const paymentResponse = await partnerApi.initiateOrderPayment(token, orderResponse.order._id)
        
        if (paymentResponse.success) {
          // Create PayU form and submit
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = paymentResponse.data.action
          
          // Add all PayU parameters as hidden inputs
          Object.keys(paymentResponse.data).forEach(key => {
            if (key !== 'action') {
              const input = document.createElement('input')
              input.type = 'hidden'
              input.name = key
              input.value = paymentResponse.data[key]
              form.appendChild(input)
            }
          })
          
          document.body.appendChild(form)
          form.submit()
        } else {
          alert('Failed to initiate payment: ' + paymentResponse.message)
        }
      } else {
        alert('Failed to place order: ' + orderResponse.message)
      }
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Error placing order: ' + error.message)
    } finally {
      setOrderLoading(false)
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Spare Parts</h1>
          <p className="text-sm sm:text-base text-slate-600">Browse and order spare parts for your services</p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg sm:text-xl text-slate-600" />
        </button>
      </div>

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
              placeholder="Search spare parts..."
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Products List */}
        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
              <div className="flex items-center justify-center mb-2">
                <FiPackage className="text-2xl mr-2" />
                <span className="font-semibold">Error Loading Products</span>
              </div>
              <p>{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
              <FiPackage className="text-4xl mx-auto mb-4 opacity-50 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Products Available</h3>
              <p className="text-slate-500 mb-4">
                {selectedCategory === 'all'
                  ? 'Please select a category to view available products'
                  : `No products found in the selected category`}
              </p>
              {selectedCategory !== 'all' && (
                <div className="space-y-2 text-sm text-slate-400">
                  <p>• Products may be out of stock</p>
                  <p>• Try selecting a different category</p>
                  <p>• Contact admin to add products for this category</p>
                </div>
              )}
              <button 
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw size={16} />
                Refresh Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2 truncate">
                        {product.name || 'Spare Part'}
                      </h3>
                      {product.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                      <FiPackage className="text-primary text-lg sm:text-xl" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        ₹{product.price?.toLocaleString('en-IN') || 0}
                      </p>
                      {product.stock !== undefined && (
                        <p className="text-xs sm:text-sm text-slate-500">
                          Stock: {product.stock} {product.unit || 'units'}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart />
                    <span className="hidden sm:inline">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    <span className="sm:hidden">{product.stock === 0 ? 'Out' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Cart</h2>
              <FiShoppingCart className="text-lg sm:text-xl text-slate-600" />
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FiShoppingCart className="text-4xl mx-auto mb-2 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => {
                    const product = item.product || item
                    const productId = product._id || product.id
                    const productName = product.name || 'Product'
                    const productPrice = product.price || 0
                    const quantity = item.quantity || 1
                    
                    return (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800 text-sm">{productName}</h4>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(productId, -1)}
                              className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                            >
                              <FiMinus className="text-xs" />
                            </button>
                            <span className="px-2 font-semibold">{quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(productId, 1)}
                              className="p-1 bg-white rounded border border-slate-300 hover:bg-slate-100"
                            >
                              <FiPlus className="text-xs" />
                            </button>
                          </div>
                          <p className="font-bold text-primary">
                            ₹{(productPrice * quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-slate-200 pt-3 sm:pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg font-semibold text-slate-800">Total:</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={cart.length === 0}
                    className="w-full py-2.5 sm:py-3 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiTruck />
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Order Summary</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  {cart.map((item, index) => {
                    const product = item.product || item
                    const productName = product.name || 'Product'
                    const productPrice = product.price || 0
                    const quantity = item.quantity || 1
                    
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-slate-800">{productName}</span>
                          <span className="text-slate-500 ml-2">× {quantity}</span>
                        </div>
                        <span className="font-semibold text-primary">
                          ₹{(productPrice * quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )
                  })}
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Subtotal:</span>
                      <span className="font-semibold text-slate-800">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Tax (18% GST):</span>
                      <span>₹{Math.round(cartTotal * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Shipping:</span>
                      <span>{cartTotal > 1000 ? 'Free' : '₹50'}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-primary border-t border-slate-200 pt-2 mt-2">
                      <span>Total:</span>
                      <span>₹{(cartTotal + Math.round(cartTotal * 0.18) + (cartTotal > 1000 ? 0 : 50)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Form */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <FiMapPin />
                    Delivery Address
                    {deliveryAddress.name && (
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Auto-filled from profile
                      </span>
                    )}
                  </div>
                  <button
                    onClick={fetchPartnerProfile}
                    disabled={profileLoading}
                    className="text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw size={14} />
                        Use Profile Address
                      </>
                    )}
                  </button>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <FiUser className="inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.name}
                      onChange={(e) => handleDeliveryAddressChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <FiPhone className="inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={(e) => handleDeliveryAddressChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <FiMail className="inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={deliveryAddress.email}
                      onChange={(e) => handleDeliveryAddressChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine1}
                      onChange={(e) => handleDeliveryAddressChange('addressLine1', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="House/Flat No., Street Name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.addressLine2}
                      onChange={(e) => handleDeliveryAddressChange('addressLine2', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Area, Locality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => handleDeliveryAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => handleDeliveryAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => handleDeliveryAddressChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={(e) => handleDeliveryAddressChange('landmark', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nearby landmark"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitOrder}
                  disabled={orderLoading}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiTruck />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SparePartsTab

