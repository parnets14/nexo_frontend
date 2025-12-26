import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaFileInvoice, FaCalculator } from 'react-icons/fa'
import { FiFileText, FiX, FiCheckCircle, FiCreditCard, FiUser, FiLock, FiTool } from 'react-icons/fi'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const MaterialStore = () => {
  const { isAuthenticated, partner, isLoading } = usePartnerAuth()
  const navigate = useNavigate()
  const [materialCategories, setMaterialCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [quotationData, setQuotationData] = useState({
    name: '',
    phone: '',
    email: '',
    requirements: '',
    category: '',
    brandPreference: '', // New field for brand preference
    selectedItems: {}, // Will store category -> [items with quantities] mapping
    itemQuantities: {}, // Will store itemId -> quantity mapping
    // New fields for customer and technician details
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    technicianName: '',
    technicianPhone: '',
    technicianId: '',
    serviceType: '',
    urgency: 'normal', // normal, urgent, emergency
    notes: ''
  })
  const [submittingQuotation, setSubmittingQuotation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showRetryModal, setShowRetryModal] = useState(false)
  const [serverStatus, setServerStatus] = useState('unknown') // 'online', 'offline', 'unknown'
  const [quotationFee] = useState(99) // ₹99 quotation fee

  const handleGetQuotation = (category = null) => {
    // Check if partner is authenticated
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setSelectedCategory(category)
    setQuotationData(prev => ({
      ...prev,
      category: category?.name || '',
      name: partner?.profile?.name || partner?.name || '',
      phone: partner?.phone || '',
      email: partner?.profile?.email || partner?.email || ''
    }))
    setShowQuotationModal(true)
  }

  const handleCloseQuotation = () => {
    setShowQuotationModal(false)
    setSelectedCategory(null)
    setQuotationData({
      name: '',
      phone: '',
      email: '',
      requirements: '',
      category: '',
      brandPreference: '',
      selectedItems: {},
      itemQuantities: {}
    })
    setShowPaymentModal(false)
    setShowRetryModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuotationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryToggle = (categoryName) => {
    setQuotationData(prev => {
      const newSelectedItems = { ...prev.selectedItems }
      if (newSelectedItems[categoryName]) {
        // Remove category if already selected
        delete newSelectedItems[categoryName]
      } else {
        // Add category with empty items array
        newSelectedItems[categoryName] = []
      }
      return {
        ...prev,
        selectedItems: newSelectedItems
      }
    })
  }

  const handleItemToggle = (categoryName, item) => {
    setQuotationData(prev => {
      const newSelectedItems = { ...prev.selectedItems }
      const newItemQuantities = { ...prev.itemQuantities }
      
      if (!newSelectedItems[categoryName]) {
        newSelectedItems[categoryName] = []
      }
      
      const itemName = typeof item === 'string' ? item : item.name
      const itemId = `${categoryName}-${itemName}`
      const itemIndex = newSelectedItems[categoryName].findIndex(selectedItem => 
        (typeof selectedItem === 'string' ? selectedItem : selectedItem.name) === itemName
      )
      
      if (itemIndex > -1) {
        // Remove item if already selected
        newSelectedItems[categoryName].splice(itemIndex, 1)
        delete newItemQuantities[itemId]
        // Remove category if no items left
        if (newSelectedItems[categoryName].length === 0) {
          delete newSelectedItems[categoryName]
        }
      } else {
        // Add item to category with default quantity
        newSelectedItems[categoryName].push(item)
        newItemQuantities[itemId] = 1 // Default quantity
      }
      
      return {
        ...prev,
        selectedItems: newSelectedItems,
        itemQuantities: newItemQuantities
      }
    })
  }

  const handleQuantityChange = (categoryName, item, quantity) => {
    const itemName = typeof item === 'string' ? item : item.name
    const itemId = `${categoryName}-${itemName}`
    const parsedQuantity = parseInt(quantity) || 1
    
    setQuotationData(prev => ({
      ...prev,
      itemQuantities: {
        ...prev.itemQuantities,
        [itemId]: parsedQuantity
      }
    }))
  }

  const calculateTotalAmount = () => {
    let totalAmount = 0
    
    Object.entries(quotationData.selectedItems).forEach(([categoryName, items]) => {
      items.forEach(item => {
        const itemName = typeof item === 'string' ? item : item.name
        const itemId = `${categoryName}-${itemName}`
        const quantity = quotationData.itemQuantities[itemId] || 1
        
        // Calculate price based on item data
        let itemPrice = 0
        if (typeof item === 'object') {
          // Use average of min and max price, or just one if only one is available
          if (item.priceMin && item.priceMax) {
            itemPrice = (item.priceMin + item.priceMax) / 2
          } else if (item.priceMin) {
            itemPrice = item.priceMin
          } else if (item.priceMax) {
            itemPrice = item.priceMax
          } else {
            // Default price if no price data available
            itemPrice = 100 // Default ₹100 per unit
          }
        } else {
          // Default price for string items
          itemPrice = 100 // Default ₹100 per unit
        }
        
        totalAmount += itemPrice * quantity
      })
    })
    
    return totalAmount
  }

  const getTotalQuantity = () => {
    return Object.values(quotationData.itemQuantities).reduce((total, qty) => total + qty, 0)
  }

  const getTotalItems = () => {
    return Object.values(quotationData.selectedItems).reduce((total, items) => total + items.length, 0)
  }

  const getSelectedItemsText = () => {
    const categories = Object.keys(quotationData.selectedItems)
    if (categories.length === 0) return ''
    
    return categories.map(categoryName => {
      const items = quotationData.selectedItems[categoryName]
      const itemsWithQuantities = items.map(item => {
        const itemName = typeof item === 'string' ? item : item.name
        const itemId = `${categoryName}-${itemName}`
        const quantity = quotationData.itemQuantities[itemId] || 1
        const unit = typeof item === 'object' && item.unit ? item.unit : 'units'
        return `${itemName} (${quantity} ${unit})`
      })
      return `${categoryName}: ${itemsWithQuantities.join(', ')}`
    }).join('\n\n')
  }

  const handleSubmitQuotation = async () => {
    // Validate required fields
    if (!quotationData.name.trim()) {
      alert('Please enter your name')
      return
    }
    if (!quotationData.phone.trim()) {
      alert('Please enter your phone number')
      return
    }
    if (Object.keys(quotationData.selectedItems).length === 0) {
      alert('Please select at least one material category and items')
      return
    }

    // Show payment modal instead of submitting directly
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (retryCount = 0) => {
    setSubmittingQuotation(true)

    try {
      console.log('🔄 Submitting quotation request (attempt', retryCount + 1, ')...')
      
      // Submit quotation request after payment
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/quotations/material-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quotationData,
          type: 'material',
          requestedAt: new Date().toISOString(),
          paymentStatus: 'paid',
          quotationFee: quotationFee,
          requirements: getSelectedItemsText(), // Convert selected items to text
          brandPreference: quotationData.brandPreference, // Include brand preference
          partnerId: partner?._id || partner?.id,
          partnerName: partner?.profile?.name || partner?.name,
          partnerPhone: partner?.phone
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Quotation submitted successfully:', result)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        handleCloseQuotation()
        
        // Redirect to admin spares after successful payment and quotation submission
        setTimeout(() => {
          window.open('/admin/spares', '_blank')
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server responded with status ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error submitting quotation:', error)
      
      // Retry logic for connection errors
      if ((error.message.includes('Failed to fetch') || error.message.includes('CONNECTION_REFUSED')) && retryCount < 2) {
        console.log(`🔄 Retrying in 3 seconds... (attempt ${retryCount + 2}/3)`)
        setTimeout(() => {
          handlePaymentSuccess(retryCount + 1)
        }, 3000)
        return
      }
      
      // Show user-friendly error message
      if (retryCount >= 2) {
        // Show retry modal after all automatic retries failed
        setShowRetryModal(true)
      } else {
        const errorMessage = error.message.includes('Failed to fetch') 
          ? 'Unable to connect to server. Please check your internet connection and try again.'
          : `Failed to submit quotation request: ${error.message}`
        
        alert(errorMessage)
      }
    } finally {
      if (retryCount >= 2 || retryCount === 0) { // Reset loading state on final attempt or first attempt failure
        setSubmittingQuotation(false)
      }
    }
  }

  // Test server connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/quotations/material-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', phone: 'test', requirements: 'test' })
      })
      const isOnline = response.ok
      setServerStatus(isOnline ? 'online' : 'offline')
      return isOnline
    } catch (error) {
      setServerStatus('offline')
      return false
    }
  }

  // Check server status on component mount
  useEffect(() => {
    testConnection()
  }, [])

  // Fetch material categories from API
  useEffect(() => {
    const fetchMaterialCategories = async () => {
      try {
        console.log('🔍 Fetching material categories...');
        const apiUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:9088'
        const response = await fetch(`${apiUrl}/api/public/material-categories`)
        const data = await response.json()
        
        console.log('📡 API Response:', data);
        
        if (data?.success && data?.data && Array.isArray(data.data)) {
          console.log(`✅ Found ${data.data.length} categories`);
          // Transform backend data to match frontend format
          const transformedCategories = data.data.map((category, index) => {
            console.log(`📦 Category ${index + 1}: ${category.name} with ${category.items?.length || 0} items`);
            return {
              name: category.name,
              icon: category.icon,
              items: category.items || []
            }
          })
          setMaterialCategories(transformedCategories)
          console.log('✅ Categories set successfully:', transformedCategories.length);
        } else {
          console.log('⚠️  API returned unexpected format, using fallback');
          // Fallback to default categories if API fails
          setMaterialCategories([
            {
              name: 'Plumbing materials',
              icon: '🔧',
              items: ['Pipes', 'Fittings', 'Taps', 'Valves', 'Sealants'],
            },
            {
              name: 'Switchboards and cables',
              icon: '⚡',
              items: ['MCB', 'Wires', 'Switches', 'Sockets', 'Cable trays'],
            },
            {
              name: 'Painting supplies',
              icon: '🎨',
              items: ['Paints', 'Brushes', 'Primers', 'Thinners', 'Putty'],
            },
            {
              name: 'AC gas',
              icon: '❄️',
              items: ['R22', 'R410A', 'R32', 'Compressors', 'Filters'],
            },
            {
              name: 'Hardware items',
              icon: '🔨',
              items: ['Screws', 'Nails', 'Hinges', 'Locks', 'Handles'],
            },
          ])
        }
      } catch (error) {
        console.error('❌ Error fetching material categories:', error)
        // Fallback to default categories on error
        setMaterialCategories([
    {
      name: 'Plumbing materials',
      icon: '🔧',
      items: ['Pipes', 'Fittings', 'Taps', 'Valves', 'Sealants'],
    },
    {
      name: 'Switchboards and cables',
      icon: '⚡',
      items: ['MCB', 'Wires', 'Switches', 'Sockets', 'Cable trays'],
    },
    {
      name: 'Painting supplies',
      icon: '🎨',
      items: ['Paints', 'Brushes', 'Primers', 'Thinners', 'Putty'],
    },
    {
      name: 'AC gas',
      icon: '❄️',
      items: ['R22', 'R410A', 'R32', 'Compressors', 'Filters'],
    },
    {
      name: 'Hardware items',
      icon: '🔨',
      items: ['Screws', 'Nails', 'Hinges', 'Locks', 'Handles'],
    },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMaterialCategories()
  }, [])

  return (
    <>
      <SEO 
        title="Materials for Technicians | Get Material Quotations | Nexo"
        description="Get instant quotations for materials. Plumbing materials, switchboards, cables, painting supplies, AC gas, hardware items. Best prices, quality assured."
        keywords="technician materials, plumbing materials, electrical supplies, painting supplies, AC gas, hardware items, material quotation"
        url="/materials"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section with Professional Background Animations */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-yellow-300/20 to-yellow-300/5 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Small Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`small-${i}`}
            className="absolute bg-white/30 rounded-full"
            style={{
              width: `${6 + (i % 4) * 3}px`,
              height: `${6 + (i % 4) * 3}px`,
              left: `${3 + (i * 5) % 94}%`,
              top: `${8 + (i * 4) % 85}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, (i % 2 === 0 ? 50 : -50), 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Medium Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`medium-${i}`}
            className="absolute bg-white/20 rounded-full blur-sm"
            style={{
              width: `${14 + (i % 3) * 4}px`,
              height: `${14 + (i % 3) * 4}px`,
              left: `${5 + (i * 8) % 90}%`,
              top: `${10 + (i * 6) % 80}%`,
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, (i % 2 === 0 ? 60 : -60), 0],
              opacity: [0.15, 0.4, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 9 + (i % 3) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Large Floating Balls */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`large-${i}`}
            className="absolute bg-white/10 rounded-full blur-2xl"
            style={{
              width: `${100 + (i % 3) * 30}px`,
              height: `${100 + (i % 3) * 30}px`,
              left: `${8 + (i * 12) % 85}%`,
              top: `${12 + (i * 10) % 75}%`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, (i % 2 === 0 ? 60 : -60), 0],
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + (i % 3) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Materials for Technicians</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90">
              Get instant quotations for materials
            </p>
            
            {/* Partner Status Indicator */}
            {!isLoading && (
              <div className="mb-6 sm:mb-8">
                {isAuthenticated ? (
                  <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-full px-6 py-3">
                    <FiCheckCircle className="text-green-300" size={20} />
                    <span className="text-green-100 font-medium">
                      Welcome, {partner?.profile?.name || partner?.name || 'Partner'}!
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 bg-amber-500/20 backdrop-blur-sm border border-amber-300/30 rounded-full px-6 py-3">
                    <FiLock className="text-amber-300" size={20} />
                    <span className="text-amber-100 font-medium">
                      Partner login required for quotations
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <motion.button
                onClick={() => handleGetQuotation()}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center gap-2"
              >
                <FaCalculator className="w-5 h-5 sm:w-6 sm:h-6" />
                {isAuthenticated ? 'Get Quotation' : 'Login & Get Quotation'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Animated bottom wave with better separation */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-24 sm:h-28 bg-gradient-to-b from-gray-50 to-white pointer-events-none"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          style={{ marginBottom: 0 }}
        >
          {/* Wave SVG for smoother transition */}
          <svg 
            className="absolute bottom-0 left-0 w-full h-full" 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" 
              fill="white"
              className="animate-pulse"
            />
          </svg>
        </motion.div>
      </section>

      {/* Material Categories */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="text-6xl">{'📦'}</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Available Materials
            </h2>
            
            {/* Server Status Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 
                serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-500">
                {serverStatus === 'online' ? 'Service Online' : 
                 serverStatus === 'offline' ? 'Service Offline' : 'Checking...'}
              </span>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your service jobs - Quality materials at competitive prices
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              ></motion.div>
              <p className="mt-6 text-lg text-gray-600 font-medium">Loading materials...</p>
            </div>
          ) : materialCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-50">📦</div>
              <p className="text-xl text-gray-500 mb-4">No materials available at the moment.</p>
              <p className="text-sm text-gray-400">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {materialCategories.map((category, index) => {
                console.log(`Rendering category ${index + 1}:`, category.name, 'with', category.items?.length || 0, 'items');
                
                return (
                  <motion.div
                    key={`${category.name}-${index}`}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.12,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      transition: { duration: 0.3 } 
                    }}
                    className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Animated gradient overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/8 group-hover:to-transparent pointer-events-none"
                      initial={false}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                    
                    {/* Animated top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-primary overflow-hidden">
                      <motion.div
                        className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                        animate={{
                          x: ['-100%', '300%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    {/* Floating particles on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-primary/40 rounded-full"
                          style={{
                            left: `${25 + i * 20}%`,
                            top: `${40 + (i % 2) * 20}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.4, 0.8, 0.4],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative p-6 lg:p-7">
                      {/* Icon Container with glow */}
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="relative w-20 h-20 mx-auto mb-5"
                      >
                        {/* Glow effect */}
                        <motion.div 
                          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300">
                          <span className="text-5xl">{category.icon}</span>
                        </div>
                      </motion.div>

                      {/* Category Name & Count */}
                      <div className="text-center mb-5">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors mb-2">
                          {category.name}
                        </h3>
                        
                        {/* Price Range Summary */}
                        {category.items && category.items.length > 0 && (() => {
                          const prices = category.items
                            .filter(item => item.priceMin || item.priceMax)
                            .map(item => ({ min: item.priceMin || 0, max: item.priceMax || item.priceMin || 0 }))
                          
                          if (prices.length > 0) {
                            const minPrice = Math.min(...prices.map(p => p.min))
                            const maxPrice = Math.max(...prices.map(p => p.max))
                            
                            return (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700">
                                  💰 ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )
                          }
                          return null
                        })()}
                        
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          {category.items?.length || 0} Items Available
                        </span>
                      </div>

                      {/* Items List - Simplified and More Visible */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Available Items ({category.items?.length || 0})
                        </h4>
                        
                        {category.items && category.items.length > 0 ? (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {category.items.slice(0, 6).map((item, idx) => {
                              const itemName = typeof item === 'string' ? item : item.name;
                              const itemPrice = typeof item === 'object' && item.priceMin && item.priceMax 
                                ? `₹${item.priceMin}-₹${item.priceMax}` 
                                : typeof item === 'object' && item.priceMin 
                                ? `₹${item.priceMin}+` 
                                : '';
                              const itemStock = typeof item === 'object' && item.stock 
                                ? `${item.stock} ${item.unit || 'units'}` 
                                : '';
                              
                              return (
                                <div
                                  key={`${itemName}-${idx}`}
                                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-primary/5 rounded-lg border border-gray-100 hover:border-primary/20 transition-all duration-200"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-[9px] font-bold text-primary">
                                        {idx + 1}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-800 text-sm truncate">
                                        {itemName}
                                      </div>
                                      {typeof item === 'object' && (item.brand || item.sku) && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          {item.brand && (
                                            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                                              {item.brand}
                                            </span>
                                          )}
                                          {item.sku && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                              {item.sku}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {itemPrice && (
                                      <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        {itemPrice}
                                      </span>
                                    )}
                                    {itemStock && (
                                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        {itemStock}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {category.items.length > 6 && (
                              <div className="text-center py-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  +{category.items.length - 6} more items available
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400">
                            <div className="text-2xl mb-2 opacity-50">📦</div>
                            <p className="text-xs">No items available</p>
                          </div>
                        )}
                      </div>

                      {/* Get Quotation Button */}
                      <motion.button
                        onClick={() => handleGetQuotation(category)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                      >
                      {/* Shine effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      />
                      
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <FaFileInvoice className="w-5 h-5 relative z-10" />
                      </motion.div>
                      <span className="relative z-10">
                        {isAuthenticated ? 'Get Quotation' : 'Login & Get Quotation'}
                      </span>
                      
                      {/* Arrow animation */}
                      <motion.svg 
                        className="w-4 h-4 relative z-10"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={3}
                        animate={{
                          x: [0, 3, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </motion.button>
                  </div>

                  {/* Bottom corner decoration */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-primary via-primary-dark to-[#153a5a] text-white relative overflow-hidden">
        {/* Animated Background Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 5) % 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-20"
          >
            {/* Decorative Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20"
            >
              <span className="text-4xl">🚀</span>
            </motion.div>

            {/* Main Heading with Gradient Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
            >
              <span className="block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-pulse">
                Earn more.
              </span>
              <span className="block bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                Work faster.
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            >
              Get everything you need to complete jobs efficiently and profitably
            </motion.p>

            {/* Decorative Line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100px" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mx-auto mt-8 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent"
            />
          </motion.div>
          
          {/* Benefits Cards Grid */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Instant Delivery Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 lg:p-10 rounded-3xl text-center hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:to-yellow-400/10 transition-all duration-500 rounded-3xl"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-300/50 via-transparent to-yellow-300/50 animate-pulse"></div>
              </div>

              {/* Icon Container with Enhanced Animation */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
                className="relative mb-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-yellow-500/20 rounded-2xl flex items-center justify-center border-2 border-yellow-300/30 group-hover:border-yellow-300/50 transition-all duration-300">
                  <span className="text-6xl">⚡</span>
                </div>
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-yellow-200 transition-colors duration-300">
                Instant Delivery
              </h3>
              <p className="text-white/80 leading-relaxed text-lg relative z-10">
                Get materials delivered directly to your job site - no delays, no hassle
              </p>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
            
            {/* Best Prices Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 lg:p-10 rounded-3xl text-center hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-400/0 group-hover:from-emerald-400/20 group-hover:to-emerald-400/10 transition-all duration-500 rounded-3xl"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-300/50 via-transparent to-emerald-300/50 animate-pulse"></div>
              </div>

              {/* Icon Container */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mb-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-300/30 to-emerald-500/20 rounded-2xl flex items-center justify-center border-2 border-emerald-300/30 group-hover:border-emerald-300/50 transition-all duration-300">
                  <span className="text-6xl">💰</span>
                </div>
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-emerald-200 transition-colors duration-300">
                Best Prices
              </h3>
              <p className="text-white/80 leading-relaxed text-lg relative z-10">
                Competitive pricing for all materials - maximize your profit margins
              </p>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
            
            {/* Quality Assured Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 lg:p-10 rounded-3xl text-center hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500 rounded-3xl"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/50 via-transparent to-primary/50 animate-pulse"></div>
              </div>

              {/* Icon Container */}
              <motion.div
                animate={{ 
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 1.5,
                  ease: "easeInOut"
                }}
                className="relative mb-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/30 to-primary-dark/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 transition-all duration-300">
                  <span className="text-6xl">✅</span>
                </div>
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-primary-light transition-colors duration-300">
                Quality Assured
              </h3>
              <p className="text-white/80 leading-relaxed text-lg relative z-10">
                Verified and tested materials only - quality you can trust
              </p>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            </div>
        </div>
      </section>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <FiCheckCircle size={24} />
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm text-green-100">Payment successful! Redirecting to inventory...</p>
          </div>
        </div>
      )}

      {/* Retry Modal */}
      {showRetryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h3>
              <p className="text-gray-600 mb-6">
                Your payment was successful, but we couldn't submit your quotation request due to a connection issue. 
                Don't worry - your payment is safe!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const isConnected = await testConnection()
                    if (isConnected) {
                      setShowRetryModal(false)
                      handlePaymentSuccess(0) // Retry from the beginning
                    } else {
                      alert('Server is still not reachable. Please try again in a few moments or contact support.')
                    }
                  }}
                  disabled={submittingQuotation}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submittingQuotation ? 'Retrying...' : 'Test & Retry'}
                </button>
                <button
                  onClick={() => {
                    setShowRetryModal(false)
                    alert('Please contact support with your payment details. Your quotation will be processed manually.')
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Total Bill Indicator */}
      {Object.keys(quotationData.selectedItems).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-40 bg-white border-2 border-primary/20 rounded-2xl shadow-2xl p-4 max-w-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-700">
                🛒 {getTotalItems()} items • {getTotalQuantity()} units
              </div>
              <div className="text-xs text-gray-500">Estimated total</div>
            </div>
            <div className="text-right ml-4">
              <div className="text-lg font-bold text-primary">
                ₹{calculateTotalAmount().toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-primary/70">+ ₹{quotationFee} fee</div>
            </div>
          </div>
          <button
            onClick={() => setShowQuotationModal(true)}
            className="w-full mt-3 bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Review & Get Quotation
          </button>
        </motion.div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiLock size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Partner Login Required</h3>
                <p className="text-white/80 text-sm">Please login as a partner to access material quotations</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalculator className="text-3xl text-primary" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Access Material Quotations</h4>
                <p className="text-gray-600 leading-relaxed">
                  To request material quotations and access our inventory system, you need to be logged in as a registered partner.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <h5 className="font-semibold text-primary-dark mb-2">What you'll get:</h5>
                <ul className="text-sm text-primary space-y-1 text-left">
                  <li>• Access to complete material inventory</li>
                  <li>• Real-time pricing and stock information</li>
                  <li>• Direct quotation requests</li>
                  <li>• Partner-exclusive pricing</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false)
                    navigate('/partner/login')
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl hover:from-primary-dark hover:to-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiUser size={18} />
                  <span>Partner Login</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Don't have a partner account?{' '}
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false)
                      navigate('/partner')
                    }}
                    className="text-primary hover:text-primary-dark font-medium underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FaFileInvoice size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Get Material Quotation</h3>
                    <p className="text-white/80 text-sm">Fill details and pay ₹{quotationFee} to access inventory</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseQuotation}
                  className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Selected Category */}
              {selectedCategory && (
                <div className="bg-gradient-to-r from-primary/10 to-purple-50 rounded-2xl p-6 mb-8 border border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{selectedCategory.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        {selectedCategory.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedCategory.items.length} items available in this category
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!showPaymentModal ? (
                <>
                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={quotationData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-gray-700 placeholder-gray-400"
                        required
                        readOnly={isAuthenticated && (partner?.profile?.name || partner?.name)}
                      />
                      {isAuthenticated && (partner?.profile?.name || partner?.name) && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <FiCheckCircle size={12} />
                          Auto-filled from partner profile
                        </p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={quotationData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-gray-700 placeholder-gray-400"
                        required
                        readOnly={isAuthenticated && partner?.phone}
                      />
                      {isAuthenticated && partner?.phone && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <FiCheckCircle size={12} />
                          Auto-filled from partner profile
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={quotationData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-gray-700 placeholder-gray-400"
                        readOnly={isAuthenticated && (partner?.profile?.email || partner?.email)}
                      />
                      {isAuthenticated && (partner?.profile?.email || partner?.email) && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <FiCheckCircle size={12} />
                          Auto-filled from partner profile
                        </p>
                      )}
                    </div>

                    {/* Brand Preference Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Brand Preference (Optional)
                      </label>
                      <input
                        type="text"
                        name="brandPreference"
                        value={quotationData.brandPreference}
                        onChange={handleInputChange}
                        placeholder="e.g., Supreme, Havells, Asian Paints, Schneider..."
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-gray-700 placeholder-gray-400"
                      />
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">
                          Popular brands (click to select):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Supreme', 'Astral', 'Havells', 'Schneider', 'Asian Paints', 
                            'Berger', 'Jaquar', 'Anchor', 'Legrand', 'Godrej'
                          ].map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => setQuotationData(prev => ({
                                ...prev,
                                brandPreference: prev.brandPreference 
                                  ? (prev.brandPreference.includes(brand) 
                                      ? prev.brandPreference 
                                      : `${prev.brandPreference}, ${brand}`)
                                  : brand
                              }))}
                              className="px-3 py-1 text-xs bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary rounded-full border border-gray-200 hover:border-primary/30 transition-all duration-200"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Specify your preferred brands for materials (optional)
                      </p>
                    </div>

                    {/* Customer Details Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <FiUser className="text-blue-600" />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            name="customerName"
                            value={quotationData.customerName}
                            onChange={handleInputChange}
                            placeholder="Enter customer's full name"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-700 placeholder-gray-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Customer Phone *
                          </label>
                          <input
                            type="tel"
                            name="customerPhone"
                            value={quotationData.customerPhone}
                            onChange={handleInputChange}
                            placeholder="Enter customer's phone number"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-700 placeholder-gray-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Customer Email (Optional)
                          </label>
                          <input
                            type="email"
                            name="customerEmail"
                            value={quotationData.customerEmail}
                            onChange={handleInputChange}
                            placeholder="Enter customer's email address"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-700 placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Service Type *
                          </label>
                          <select
                            name="serviceType"
                            value={quotationData.serviceType}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-700"
                            required
                          >
                            <option value="">Select service type</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="electrical">Electrical</option>
                            <option value="ac-repair">AC Repair</option>
                            <option value="painting">Painting</option>
                            <option value="carpentry">Carpentry</option>
                            <option value="appliance-repair">Appliance Repair</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Customer Address *
                          </label>
                          <textarea
                            name="customerAddress"
                            value={quotationData.customerAddress}
                            onChange={handleInputChange}
                            placeholder="Enter customer's complete address"
                            rows="2"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-700 placeholder-gray-400 resize-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technician Details Section */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                        <FiTool className="text-green-600" />
                        Technician Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Technician Name *
                          </label>
                          <input
                            type="text"
                            name="technicianName"
                            value={quotationData.technicianName}
                            onChange={handleInputChange}
                            placeholder="Enter technician's name"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-gray-700 placeholder-gray-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Technician Phone *
                          </label>
                          <input
                            type="tel"
                            name="technicianPhone"
                            value={quotationData.technicianPhone}
                            onChange={handleInputChange}
                            placeholder="Enter technician's phone number"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-gray-700 placeholder-gray-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Technician ID (Optional)
                          </label>
                          <input
                            type="text"
                            name="technicianId"
                            value={quotationData.technicianId}
                            onChange={handleInputChange}
                            placeholder="Enter technician's ID or employee number"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-gray-700 placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Urgency Level *
                          </label>
                          <select
                            name="urgency"
                            value={quotationData.urgency}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-gray-700"
                            required
                          >
                            <option value="normal">Normal (2-3 days)</option>
                            <option value="urgent">Urgent (Same day)</option>
                            <option value="emergency">Emergency (Within 2 hours)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            value={quotationData.notes}
                            onChange={handleInputChange}
                            placeholder="Any additional notes or special requirements..."
                            rows="2"
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-gray-700 placeholder-gray-400 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Material Requirements - Category & Item Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Material Requirements *
                      </label>
                      <div className="border-2 border-gray-200 rounded-2xl p-4 max-h-96 overflow-y-auto">
                        <p className="text-sm text-gray-600 mb-4">
                          Select categories and specific items you need:
                        </p>
                        
                        <div className="space-y-4">
                          {materialCategories.map((category, categoryIndex) => {
                            const isCategorySelected = quotationData.selectedItems[category.name]
                            const selectedItemsInCategory = isCategorySelected ? quotationData.selectedItems[category.name] : []
                            
                            return (
                              <div key={`${category.name}-${categoryIndex}`} className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Category Header */}
                                <div 
                                  className={`p-4 cursor-pointer transition-all ${
                                    isCategorySelected 
                                      ? 'bg-primary/10 border-b border-primary/30' 
                                      : 'bg-gray-50 hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleCategoryToggle(category.name)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">{category.icon}</span>
                                      <div>
                                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                        <p className="text-sm text-gray-500">
                                          {category.items.length} items available
                                          {selectedItemsInCategory.length > 0 && (
                                            <span className="text-primary font-medium ml-2">
                                              • {selectedItemsInCategory.length} selected
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isCategorySelected 
                                        ? 'bg-primary border-primary' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isCategorySelected && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Category Items */}
                                {isCategorySelected && (
                                  <div className="p-4 bg-white">
                                    <div className="grid grid-cols-1 gap-2">
                                      {category.items.map((item, itemIndex) => {
                                        const itemName = typeof item === 'string' ? item : item.name
                                        const itemId = `${category.name}-${itemName}`
                                        const isItemSelected = selectedItemsInCategory.some(selectedItem => 
                                          (typeof selectedItem === 'string' ? selectedItem : selectedItem.name) === itemName
                                        )
                                        const currentQuantity = quotationData.itemQuantities[itemId] || 1
                                        const itemUnit = typeof item === 'object' && item.unit ? item.unit : 'units'
                                        const minOrderQty = typeof item === 'object' && item.minOrderQuantity ? item.minOrderQuantity : 1
                                        
                                        return (
                                          <div
                                            key={`${itemName}-${itemIndex}`}
                                            className={`p-3 rounded-lg border transition-all ${
                                              isItemSelected 
                                                ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex-1">
                                                <div 
                                                  className="font-medium text-gray-800 cursor-pointer"
                                                  onClick={() => handleItemToggle(category.name, item)}
                                                >
                                                  {itemName}
                                                </div>
                                                {typeof item === 'object' && (
                                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    {item.sku && (
                                                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {item.sku}
                                                      </span>
                                                    )}
                                                    {item.brand && (
                                                      <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                                                        {item.brand}
                                                      </span>
                                                    )}
                                                    {item.priceMin && item.priceMax && (
                                                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                                                        ₹{item.priceMin} - ₹{item.priceMax} per {itemUnit}
                                                      </span>
                                                    )}
                                                    {item.stock !== undefined && (
                                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                        item.stock > 0 
                                                          ? 'text-emerald-600 bg-emerald-50' 
                                                          : 'text-amber-600 bg-amber-50'
                                                      }`}>
                                                        {item.stock > 0 ? `${item.stock} ${itemUnit} available` : 'Out of stock'}
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                                {typeof item === 'object' && item.description && (
                                                  <div className="text-xs text-gray-500 mt-1 italic">
                                                    {item.description}
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="flex items-center gap-2">
                                                {/* Quantity Input */}
                                                {isItemSelected && (
                                                  <div className="flex items-center gap-1">
                                                    <input
                                                      type="number"
                                                      min={minOrderQty}
                                                      value={currentQuantity}
                                                      onChange={(e) => handleQuantityChange(category.name, item, e.target.value)}
                                                      onClick={(e) => e.stopPropagation()}
                                                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 text-center"
                                                      placeholder="Qty"
                                                    />
                                                    <span className="text-xs text-gray-500">{itemUnit}</span>
                                                  </div>
                                                )}
                                                
                                                {/* Selection Checkbox */}
                                                <div 
                                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                    isItemSelected 
                                                      ? 'bg-primary border-primary' 
                                                      : 'border-gray-300 hover:border-primary/50'
                                                  }`}
                                                  onClick={() => handleItemToggle(category.name, item)}
                                                >
                                                  {isItemSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Min Order Quantity Notice */}
                                            {isItemSelected && minOrderQty > 1 && (
                                              <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                Minimum order: {minOrderQty} {itemUnit}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Selection Summary */}
                        {Object.keys(quotationData.selectedItems).length > 0 && (
                          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                            <h5 className="font-semibold text-primary-dark mb-2">Selected Items Summary:</h5>
                            <div className="space-y-2">
                              {Object.entries(quotationData.selectedItems).map(([categoryName, items]) => (
                                <div key={categoryName} className="text-sm">
                                  <span className="font-medium text-primary">{categoryName}:</span>
                                  <div className="text-primary-dark ml-2 mt-1">
                                    {items.map(item => {
                                      const itemName = typeof item === 'string' ? item : item.name
                                      const itemId = `${categoryName}-${itemName}`
                                      const quantity = quotationData.itemQuantities[itemId] || 1
                                      const unit = typeof item === 'object' && item.unit ? item.unit : 'units'
                                      
                                      // Calculate item total cost
                                      let itemPrice = 0
                                      if (typeof item === 'object') {
                                        if (item.priceMin && item.priceMax) {
                                          itemPrice = (item.priceMin + item.priceMax) / 2
                                        } else if (item.priceMin) {
                                          itemPrice = item.priceMin
                                        } else if (item.priceMax) {
                                          itemPrice = item.priceMax
                                        } else {
                                          itemPrice = 100
                                        }
                                      } else {
                                        itemPrice = 100
                                      }
                                      const itemTotal = itemPrice * quantity
                                      
                                      return (
                                        <div key={itemName} className="flex items-center justify-between mb-2 p-2 bg-white rounded border border-primary/20">
                                          <div>
                                            <span className="font-medium">{itemName}</span>
                                            <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary-dark rounded text-xs font-semibold">
                                              {quantity} {unit}
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-sm font-bold text-green-600">
                                              ₹{itemTotal.toLocaleString('en-IN')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ₹{itemPrice} × {quantity}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-primary/30">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm text-green-700">
                                    <span className="font-semibold">📊 Order Summary</span>
                                  </div>
                                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    {getTotalItems()} items • {getTotalQuantity()} units
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-green-700">
                                    <div className="text-sm font-medium">Estimated Material Cost</div>
                                    <div className="text-xs text-green-600">Prices may vary based on final quotation</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-green-700">
                                      ₹{calculateTotalAmount().toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-green-600">+ ₹{quotationFee} access fee</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select categories first, then choose specific items from each category
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleCloseQuotation}
                      disabled={submittingQuotation}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitQuotation}
                      disabled={submittingQuotation || 
                        !quotationData.name.trim() || 
                        !quotationData.phone.trim() || 
                        !quotationData.customerName.trim() || 
                        !quotationData.customerPhone.trim() || 
                        !quotationData.customerAddress.trim() || 
                        !quotationData.technicianName.trim() || 
                        !quotationData.technicianPhone.trim() || 
                        !quotationData.serviceType || 
                        Object.keys(quotationData.selectedItems).length === 0}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl hover:from-primary-dark hover:to-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <FiCreditCard size={20} />
                      <span>
                        Proceed to Payment 
                        {Object.keys(quotationData.selectedItems).length > 0 && (
                          <span className="ml-1 font-bold">
                            (₹{quotationFee} + ₹{calculateTotalAmount().toLocaleString('en-IN')} materials)
                          </span>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Info Note */}
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <FiFileText className="text-primary mt-0.5" size={20} />
                      <div>
                        <h5 className="font-semibold text-primary-dark mb-1">How it works</h5>
                        <p className="text-sm text-primary">
                          Pay ₹{quotationFee} to access our complete inventory with real-time pricing, stock levels, and supplier information. After payment, you'll get instant access to place orders directly.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Payment Section
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCreditCard size={40} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment Summary</h3>
                  <p className="text-gray-600 mb-6">
                    Review your order and complete payment to access inventory
                  </p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                    {/* Order Summary */}
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 mb-3">Order Summary:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span className="font-medium">{getTotalItems()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Quantity:</span>
                          <span className="font-medium">{getTotalQuantity()} units</span>
                        </div>
                        {quotationData.brandPreference && (
                          <div className="flex justify-between">
                            <span>Brand Preference:</span>
                            <span className="font-medium text-purple-600">{quotationData.brandPreference}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-semibold text-green-600 pt-2 border-t border-gray-200">
                          <span>Estimated Material Cost:</span>
                          <span>₹{calculateTotalAmount().toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Payment Breakdown */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        💳 Payment Breakdown
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-700">Quotation Access Fee</span>
                            <div className="text-xs text-gray-500">Pay now to access inventory</div>
                          </div>
                          <span className="font-bold text-primary">₹{quotationFee}</span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-700">Estimated Material Cost</span>
                              <div className="text-xs text-gray-500">Pay after quotation approval</div>
                            </div>
                            <span className="font-bold text-green-600">₹{calculateTotalAmount().toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        
                        <div className="border-t-2 border-primary/20 pt-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-primary-dark">Total Project Cost</span>
                              <div className="text-xs text-primary">Estimated total investment</div>
                            </div>
                            <span className="font-bold text-xl text-primary-dark">
                              ₹{(quotationFee + calculateTotalAmount()).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary-dark">Pay Now</span>
                            <span className="font-bold text-xl text-primary-dark">₹{quotationFee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-left">
                    <h5 className="font-semibold text-primary-dark mb-2">Payment Process:</h5>
                    <div className="text-sm text-primary space-y-1">
                      <p>1. Pay ₹{quotationFee} now to access our inventory system</p>
                      <p>2. Get detailed quotation with final pricing</p>
                      <p>3. Pay material cost (₹{calculateTotalAmount().toLocaleString('en-IN')}) after quotation approval</p>
                      <p>4. Materials will be delivered to your location</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold transition-all"
                    >
                      Back to Selection
                    </button>
                    <button
                      onClick={handlePaymentSuccess}
                      disabled={submittingQuotation}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {submittingQuotation ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={20} />
                          <span>Pay ₹{quotationFee} & Get Quotation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default MaterialStore

