import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaWhatsapp,
  FaCheckCircle,
  FaSnowflake,
  FaBolt,
  FaTint,
  FaTools,
  FaHammer,
  FaBroom,
  FaPaintRoller,
  FaFilter,
  FaPlug,
  FaWrench,
  FaSpinner,
  FaStar,
  FaTimesCircle,
  FaShieldAlt,
  FaClock,
  FaUserCheck,
  FaAward,
  FaRupeeSign,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaChevronRight,
  FaChevronDown,
  FaPercentage,
  FaCreditCard,
  FaMobileAlt,
  FaCommentDots
} from 'react-icons/fa'
import SEO from '../components/SEO'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'
import { useUserAuth } from '../context/UserAuthContext'

import '../styles/modal-layers.css'

// Custom scrollbar styles
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 640px) {
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }
`

// Icon mapping utility
const iconMap = {
  FaSnowflake,
  FaBolt,
  FaTint,
  FaBroom,
  FaPaintRoller,
  FaTools,
  FaHammer,
  FaFilter,
  FaPlug,
  FaWrench,
  FaCheckCircle,
  FaCreditCard,
  FaMobileAlt,
  FaCommentDots
}

const getIconComponent = (iconName) => {
  return iconMap[iconName] || FaTools // Default icon if not found
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)

const ServiceDetail = () => {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEmergency = searchParams.get('emergency') === 'true'
  const whatsappNumber = "+15558136145"
  const handleWhatsAppClick = useWhatsAppClick()
  const { isAuthenticated, loading: authLoading, user } = useUserAuth()

  const [service, setService] = useState(null)
  const [popularServices, setPopularServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubServices, setSelectedSubServices] = useState({}) // { subServiceId: quantity }
  const [selectedAddOns, setSelectedAddOns] = useState({}) // { addonIndex: quantity } - for backward compatibility
  const [selectedAddOnSubServices, setSelectedAddOnSubServices] = useState({}) // { 'addonIndex-subServiceIndex': quantity }
  const [selectedAddOnModal, setSelectedAddOnModal] = useState(null) // { index, addon } - for modal display
  const [showCartModal, setShowCartModal] = useState(false) // Cart modal visibility
  const [selectedCity, setSelectedCity] = useState(null) // User's selected city
  const [showAvailableServices, setShowAvailableServices] = useState(false) // Toggle for available services in cart
  const [amcPlans, setAmcPlans] = useState([]) // AMC plans for the service
  const [amcLoading, setAmcLoading] = useState(false) // AMC plans loading state


  // Load selected city from localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity')
    if (savedCity) {
      try {
        setSelectedCity(JSON.parse(savedCity))
      } catch (error) {
        console.error('Error parsing selected city:', error)
      }
    }
  }, [])

  // Check if service is available in selected city
  const isServiceAvailableInCity = () => {
    // If no city is selected, service is available
    if (!selectedCity) return true

    // If service has no cities assigned, it's available in all cities
    if (!service?.cities || service.cities.length === 0) return true

    // Check if selected city is in the service's cities list
    return service.cities.some(city => {
      const cityId = typeof city === 'string' ? city : city._id
      return cityId === selectedCity._id
    })
  }

  // Get localStorage key for current service
  const getCartStorageKey = () => `nexo_cart_${serviceName || 'default'}`

  // Load cart data from localStorage
  const loadCartFromStorage = () => {
    if (!serviceName) return
    try {
      const storageKey = getCartStorageKey()
      const savedCart = localStorage.getItem(storageKey)
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setSelectedSubServices(cartData.selectedSubServices || {})
        setSelectedAddOns(cartData.selectedAddOns || {})
        setSelectedAddOnSubServices(cartData.selectedAddOnSubServices || {})
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }

  // Save cart data to localStorage
  const saveCartToStorage = (subServices, addOns, addOnSubServices) => {
    if (!serviceName) return
    try {
      const storageKey = getCartStorageKey()
      const cartData = {
        selectedSubServices: subServices || selectedSubServices,
        selectedAddOns: addOns || selectedAddOns,
        selectedAddOnSubServices: addOnSubServices || selectedAddOnSubServices
      }
      localStorage.setItem(storageKey, JSON.stringify(cartData))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }
  const [subService, setSubServices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch service data by slug
  useEffect(() => {
    const fetchService = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/service-by-slug/${serviceName}`)
        const result = await response.json()

        if (result.success && result.data) {
          // Validate and clean service data
          const cleanedData = {
            ...result.data,
            icon: getIconComponent(result.data.icon),
            subServices: result.data.subServices || [],
            // Clean addOns data to prevent malformed pricing
            addOns: (result.data.addOns || []).map(addon => ({
              ...addon,
              basePrice: Math.max(0, parseFloat(addon.basePrice) || 0),
              discount: Math.max(0, Math.min(100, parseFloat(addon.discount) || 0)),
              cgst: Math.max(0, parseFloat(addon.cgst) || 0),
              sgst: Math.max(0, parseFloat(addon.sgst) || 0),
              serviceCharge: Math.max(0, parseFloat(addon.serviceCharge) || 0)
            }))
          }

          // Debug log for malformed data
          if (result.data.addOns) {
            result.data.addOns.forEach((addon, index) => {
              if (addon.discount && (isNaN(addon.discount) || addon.discount > 100)) {
                console.warn(`Malformed discount in addon ${index}:`, addon.discount, 'for service:', serviceName)
              }
            })
          }
          
          // Extract sub-services from addons if they exist with addon index
          const allAddonSubServices = []
          if (cleanedData.addOns && cleanedData.addOns.length > 0) {
            cleanedData.addOns.forEach((addon, addonIndex) => {
              if (addon.subServices && addon.subServices.length > 0) {
                addon.subServices.forEach((subService, subServiceIndex) => {
                  allAddonSubServices.push({
                    ...subService,
                    addonIndex,
                    subServiceIndex,
                    addonName: addon.name
                  })
                })
              }
            })
          }
          setSubServices(allAddonSubServices)
          setService(cleanedData)
          // Load cart data from localStorage after service is loaded
          loadCartFromStorage()
        } else {
          setError('Service not found')
        }
      } catch (err) {
        console.error('Error fetching service:', err)
        setError('Failed to load service. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (serviceName) {
      fetchService()
    }
  }, [serviceName])

  // Fetch AMC plans for the service
  useEffect(() => {
    const fetchAMCPlans = async () => {
      if (!service) return
      
      try {
        setAmcLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/amc-plans`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // Filter plans that include this service
          const servicePlans = result.data.filter(plan => {
            if (!plan.includedServices || plan.includedServices.length === 0) return false
            
            return plan.includedServices.some(includedService => {
              const includedServiceName = (includedService.name || '').toLowerCase().trim()
              const currentServiceName = (service.name || '').toLowerCase().trim()
              
              return includedServiceName.includes(currentServiceName) || 
                     currentServiceName.includes(includedServiceName)
            })
          })
          
          setAmcPlans(servicePlans)
        }
      } catch (error) {
        console.error('Error fetching AMC plans:', error)
      } finally {
        setAmcLoading(false)
      }
    }

    fetchAMCPlans()
  }, [service])

  // Log authentication status for debugging
  useEffect(() => {
    // ✅ SECURITY FIX: Don't log token
    console.log('ServiceDetail Auth Status:', { isAuthenticated, authLoading, hasUser: !!user })
  }, [isAuthenticated, authLoading, user])

  // Auto-carousel effect for sub-services
  useEffect(() => {
    if (subService && subService.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % subService.length)
      }, 4000) // Change slide every 4 seconds
      return () => clearInterval(interval)
    }
  }, [subService])

  // Save cart to localStorage whenever cart state changes (backup safety net)
  useEffect(() => {
    if (serviceName && service) {
      const storageKey = getCartStorageKey()
      const cartData = {
        selectedSubServices,
        selectedAddOns,
        selectedAddOnSubServices
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(cartData))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [selectedSubServices, selectedAddOns, selectedAddOnSubServices, serviceName, service])



  // Fetch popular services
  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/popular`)
        const result = await response.json()

        if (result.success && result.data) {
          // Filter out current service and map icons
          const servicesWithIcons = result.data
            .filter(s => s.slug !== serviceName)
            .slice(0, 6) // Show max 6 services
            .map(s => ({
              ...s,
              icon: getIconComponent(s.icon)
            }))
          setPopularServices(servicesWithIcons)
        }
      } catch (err) {
        console.error('Error fetching popular services:', err)
      }
    }

    fetchPopularServices()
  }, [serviceName])

  // Default service data for fallback
  const defaultService = {
    name: 'Service',
    price: '₹0',
    description: 'Professional service for all your needs.',
    trusted: 'Trusted by thousands of homes',
    icon: FaTools,
    included: [],
    excluded: [],
    addOns: [],
    reviews: [],
    averageRating: null,
    totalReviews: 0
  }

  const currentService = service || defaultService
  const IconComponent = currentService.icon || FaTools

  // Parse price from string (handles "₹500", "500", etc.)
  const parsePrice = (priceString) => {
    if (!priceString) return 0
    const numericValue = priceString.toString().replace(/[₹,\s]/g, '')
    return parseFloat(numericValue) || 0
  }

  // Calculate total subservice price
  const calculateSubServiceTotal = () => {
    if (!currentService.subServices || currentService.subServices.length === 0) return 0
    
    // Check if this is AC service to exclude GST from pricing
    const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
    
    return currentService.subServices.reduce((total, subService) => {
      const quantity = selectedSubServices[subService._id] || 0
      // For AC service, use basePrice (without GST), otherwise use finalPrice
      const price = isACService 
        ? (subService.basePrice || subService.price || 0)
        : (subService.finalPrice || subService.basePrice || subService.price || 0)
      return total + (price * quantity)
    }, 0)
  }

  // Calculate addon price breakdown
  const calculateAddOnPriceBreakdown = (addon) => {
    // Debug logging to identify malformed data
    if (addon.discount && (isNaN(addon.discount) || addon.discount > 100 || addon.discount < 0)) {
      console.warn('Invalid discount value detected:', addon.discount, 'for addon:', addon.name)
    }

    // Check if this is AC service to exclude GST
    const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'

    // Ensure all values are valid numbers
    const basePrice = Math.max(0, parseFloat(addon.basePrice) || 0)
    const discount = Math.max(0, Math.min(100, parseFloat(addon.discount) || 0)) // Clamp between 0-100
    const cgst = isACService ? 0 : Math.max(0, parseFloat(addon.cgst) || 0)
    const sgst = isACService ? 0 : Math.max(0, parseFloat(addon.sgst) || 0)
    const serviceCharge = Math.max(0, parseFloat(addon.serviceCharge) || 0)

    // Calculate original total price (without discount, for display purposes)
    const originalSubtotalWithCharge = basePrice + serviceCharge
    const originalGstAmount = originalSubtotalWithCharge * ((cgst + sgst) / 100)
    const originalTotalPrice = originalSubtotalWithCharge + originalGstAmount

    // Calculate subtotal after discount
    const discountAmount = basePrice * (discount / 100)
    const subtotalAfterDiscount = basePrice - discountAmount

    // Add service charge
    const subtotalWithCharge = subtotalAfterDiscount + serviceCharge

    // NOTE: GST calculation is for display purposes only
    // The actual GST will be calculated once in the backend during booking
    const gstAmount = subtotalWithCharge * ((cgst + sgst) / 100)

    // Final price WITHOUT GST (GST will be added in backend)
    // This ensures GST is only applied once during booking creation
    const finalPrice = subtotalWithCharge // Removed: + gstAmount

    return {
      basePrice,
      discount,
      discountAmount,
      subtotalAfterDiscount,
      serviceCharge,
      subtotalWithCharge,
      cgst,
      sgst,
      gstAmount, // For display purposes only
      finalPrice, // Price after discount and service charge, but BEFORE GST
      originalTotalPrice // This is basePrice + serviceCharge + GST (without discount)
    }
  }

  // Calculate total add-on price (for backward compatibility)
  const calculateAddOnTotal = () => {
    if (!currentService.addOns || currentService.addOns.length === 0) return 0
    return currentService.addOns.reduce((total, addon, index) => {
      const quantity = selectedAddOns[index] || 0
      if (quantity > 0) {
        const breakdown = calculateAddOnPriceBreakdown(addon)
        return total + (breakdown.finalPrice * quantity)
      }
      return total
    }, 0)
  }

  // Calculate add-on sub-services total
  const calculateAddOnSubServicesTotal = () => {
    if (!currentService.addOns || currentService.addOns.length === 0) return 0
    let total = 0
    currentService.addOns.forEach((addon, addonIndex) => {
      if (addon.subServices && addon.subServices.length > 0) {
        addon.subServices.forEach((subService, subServiceIndex) => {
          const key = `${addonIndex}-${subServiceIndex}`
          const quantity = selectedAddOnSubServices[key] || 0
          if (quantity > 0) {
            // Extract price from string like "₹299" or "299"
            const priceStr = subService.price || '0'
            const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
            total += price * quantity
          }
        })
      }
    })
    return total
  }

  // Calculate total cart value (includes all items)
  const calculateCartTotal = () => {
    let total = calculateSubServiceTotal() + calculateAddOnTotal() + calculateAddOnSubServicesTotal()
    
    // Exclude visiting charge for AC service
    const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
    
    // Add visiting charge if applicable and cart has items (but not for AC service)
    if (!isACService && getTotalItemCount() > 0 && currentService.visitingCharge && currentService.visitingCharge > 0) {
      total += currentService.visitingCharge
    }
    
    // Add emergency service charge if applicable
    if (isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0) {
      // Count total items to apply emergency charge per item
      const totalItems = getTotalItemCount()
      if (totalItems > 0) {
        total += service.emergencyService.extraAmount * totalItems
      }
    }
    
    return total
  }

  // Get total item count
  const getTotalItemCount = () => {
    const subServiceCount = Object.values(selectedSubServices).reduce((sum, qty) => sum + qty, 0)
    const addOnCount = Object.values(selectedAddOns).reduce((sum, qty) => sum + qty, 0)
    const addOnSubServiceCount = Object.values(selectedAddOnSubServices).reduce((sum, qty) => sum + qty, 0)
    return subServiceCount + addOnCount + addOnSubServiceCount
  }

  // Subservice quantity handlers
  const handleAddSubService = (subServiceId) => {
    setSelectedSubServices(prev => {
      const newState = {
        ...prev,
        [subServiceId]: (prev[subServiceId] || 0) + 1
      }
      saveCartToStorage(newState, selectedAddOns, selectedAddOnSubServices)
      return newState
    })
  }

  const handleRemoveSubService = (subServiceId) => {
    setSelectedSubServices(prev => {
      const newState = { ...prev }
      if (newState[subServiceId] > 1) {
        newState[subServiceId] = newState[subServiceId] - 1
      } else {
        delete newState[subServiceId]
      }
      saveCartToStorage(newState, selectedAddOns, selectedAddOnSubServices)
      return newState
    })
  }

  const handleRemoveSubServiceCompletely = (subServiceId) => {
    setSelectedSubServices(prev => {
      const newState = { ...prev }
      delete newState[subServiceId]
      saveCartToStorage(newState, selectedAddOns, selectedAddOnSubServices)
      return newState
    })
  }

  // Add-on Sub-Service handlers
  const handleAddAddOnSubService = (addonIndex, subServiceIndex) => {
    const key = `${addonIndex}-${subServiceIndex}`
    setSelectedAddOnSubServices(prev => {
      const newState = {
        ...prev,
        [key]: (prev[key] || 0) + 1
      }
      saveCartToStorage(selectedSubServices, selectedAddOns, newState)
      return newState
    })
  }

  const handleRemoveAddOnSubService = (addonIndex, subServiceIndex) => {
    const key = `${addonIndex}-${subServiceIndex}`
    setSelectedAddOnSubServices(prev => {
      const newState = { ...prev }
      if (newState[key] > 1) {
        newState[key] = newState[key] - 1
      } else {
        delete newState[key]
      }
      saveCartToStorage(selectedSubServices, selectedAddOns, newState)
      return newState
    })
  }

  // Add-on quantity handlers (for backward compatibility)
  const handleAddAddOn = (index) => {
    setSelectedAddOns(prev => {
      const newState = {
        ...prev,
        [index]: (prev[index] || 0) + 1
      }
      saveCartToStorage(selectedSubServices, newState, selectedAddOnSubServices)
      return newState
    })
  }

  const handleRemoveAddOn = (index) => {
    setSelectedAddOns(prev => {
      const newState = { ...prev }
      if (newState[index] > 1) {
        newState[index] = newState[index] - 1
      } else {
        delete newState[index]
      }
      saveCartToStorage(selectedSubServices, newState, selectedAddOnSubServices)
      return newState
    })
  }

  const handleRemoveAddOnCompletely = (index) => {
    setSelectedAddOns(prev => {
      const newState = { ...prev }
      delete newState[index]
      saveCartToStorage(selectedSubServices, newState, selectedAddOnSubServices)
      return newState
    })
  }

  // Add all add-ons to cart and then book
  const handleBookAllServices = () => {
    if (currentService.addOns && currentService.addOns.length > 0) {
      // Add all add-ons to cart with quantity 1 if not already added
      const updatedAddOns = { ...selectedAddOns }
      currentService.addOns.forEach((_, index) => {
        if (!updatedAddOns[index] || updatedAddOns[index] === 0) {
          updatedAddOns[index] = 1
        }
      })
      setSelectedAddOns(updatedAddOns)
      saveCartToStorage(selectedSubServices, updatedAddOns, selectedAddOnSubServices)

      // Small delay to show the update, then open WhatsApp
      setTimeout(() => {
        handleWhatsAppClick()
      }, 300)
    } else {
      // If no add-ons, just open WhatsApp
      handleWhatsAppClick()
    }
  }

  // Handle Book Now - Direct to checkout or login
  const handleBookNow = () => {
    // Check if service is available in selected city
    if (!isServiceAvailableInCity()) {
      alert(`This service is not available in ${selectedCity?.name || 'your city'}. Please select a different city or service.`)
      return
    }

    // Check if cart has items
    if (getTotalItemCount() === 0) {
      alert('Please add at least one service to your cart')
      return
    }

    // Debug logging
    // ✅ SECURITY FIX: Don't log token or user data
    console.log('Auth Status:', { isAuthenticated, authLoading, hasUser: !!user })

    // Check if user is logged in
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login')
      // Store the checkout URL for redirect after login
      localStorage.setItem('redirectAfterLogin', `/service/${serviceName}/checkout`)
      // Redirect to login with return URL
      navigate('/user/login', {
        state: { from: `/service/${serviceName}` }
      })
      return
    }

    console.log('User authenticated, proceeding to checkout')

    // Prepare cart data
    const cartItems = []

    // Add subservices to cart
    if (currentService.subServices) {
      // Check if this is AC service
      const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
      
      currentService.subServices.forEach(subService => {
        const quantity = selectedSubServices[subService._id]
        if (quantity > 0) {
          // For AC service, use basePrice (without GST), otherwise use finalPrice
          const finalPrice = isACService
            ? (subService.basePrice || subService.price || 0)
            : (subService.finalPrice || subService.basePrice || subService.price || 0)
          cartItems.push({
            type: 'subservice',
            id: subService._id,
            name: subService.name,
            quantity: quantity,
            price: finalPrice,
            total: finalPrice * quantity
          })
        }
      })
    }

    // Add add-ons to cart
    if (currentService.addOns) {
      currentService.addOns.forEach((addon, index) => {
        const quantity = selectedAddOns[index]
        if (quantity > 0) {
          const breakdown = calculateAddOnPriceBreakdown(addon)
          cartItems.push({
            type: 'addon',
            id: addon._id || index,
            name: addon.name,
            quantity: quantity,
            price: breakdown.finalPrice,
            total: breakdown.finalPrice * quantity
          })
        }
      })
    }

    // Add add-on subservices to cart
    if (currentService.addOns) {
      currentService.addOns.forEach((addon, addonIndex) => {
        if (addon.subServices) {
          addon.subServices.forEach((subService, subServiceIndex) => {
            const key = `${addonIndex}-${subServiceIndex}`
            const quantity = selectedAddOnSubServices[key]
            if (quantity > 0) {
              const priceStr = subService.price || '0'
              const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
              cartItems.push({
                type: 'addon-subservice',
                id: subService._id || key,
                name: `${subService.name} (${addon.name})`,
                quantity: quantity,
                price: price,
                total: price * quantity
              })
            }
          })
        }
      })
    }

    const cartData = {
      items: cartItems,
      total: calculateCartTotal()
    }

    // Create serializable service data (remove icon component)
    // Exclude GST for AC service but include visiting charge (it will be added in checkout)
    const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
    
    const serializableServiceData = {
      _id: currentService._id,
      name: currentService.name,
      description: currentService.description,
      slug: currentService.slug,
      price: currentService.price,
      averageRating: currentService.averageRating,
      totalReviews: currentService.totalReviews,
      cgst: isACService ? 0 : (currentService.cgst || 9), // No GST for AC service
      sgst: isACService ? 0 : (currentService.sgst || 9), // No GST for AC service
      visitingCharge: currentService.visitingCharge || 0, // Include visiting charge - will be added in checkout
      serviceCharge: currentService.serviceCharge || 0,
      isEmergency: isEmergency,
      emergencyCharge: isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0 
        ? service.emergencyService.extraAmount * getTotalItemCount() 
        : 0
    }

    // Navigate directly to checkout
    proceedToCheckout(cartData, serializableServiceData)
  }



  // Function to proceed to checkout
  const proceedToCheckout = (cartData, serviceData) => {
    navigate(`/service/${serviceName}/checkout`, {
      state: {
        cartData: cartData,
        serviceData: serviceData
      }
    })
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading service details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{customScrollbarStyles}</style>
      <SEO
        title={`${currentService.name} | Nexo`}
        description={`${currentService.description} ${currentService.trusted}. Book ${currentService.name} on WhatsApp with verified technicians.`}
        keywords={`${currentService.name}, home services, ${currentService.name.toLowerCase()} near me, WhatsApp booking, verified technicians`}
        url={`/service/${serviceName}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Modern Hero Section */}
        <section className="relative bg-white border-b border-gray-200 py-4 sm:py-6 lg:py-8 overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Top Row: Icon, Title & WhatsApp Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Icon & Title */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-1 sm:mb-2">
                      <span className="block sm:inline">{currentService.name}</span>
                      {isEmergency && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-600 text-white ml-0 sm:ml-2 mt-2 sm:mt-0">
                          <FaBolt className="w-3 h-3 mr-1" />
                          EMERGENCY
                        </span>
                      )}
                    </h1>
                    {currentService.trusted && (
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{currentService.trusted}</p>
                    )}
                  </div>
                </div>

                {/* WhatsApp Button - Desktop */}
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hidden sm:flex bg-[#25D366] text-white px-6 lg:px-8 py-3 lg:py-3.5 rounded-lg lg:rounded-xl text-sm lg:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 items-center gap-2 flex-shrink-0"
                >
                  <FaWhatsapp className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span>Book on WhatsApp</span>
                </motion.button>
              </div>

              {/* Bottom Row: Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {currentService.averageRating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg"
                  >
                    <FaStar className="text-yellow-500 text-sm flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-900">{currentService.averageRating}</span>
                    <span className="text-xs text-gray-600 whitespace-nowrap">({currentService.totalReviews})</span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-2 rounded-lg"
                >
                  <FaShieldAlt className="text-green-600 text-sm flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">Verified</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg"
                >
                  <FaClock className="text-blue-600 text-sm flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">Quick</span>
                </motion.div>
              </div>

              {/* WhatsApp Button - Mobile (Full Width) */}
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="sm:hidden w-full bg-[#25D366] text-white px-6 py-3.5 rounded-lg text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Book on WhatsApp</span>
              </motion.button>
            </motion.div>

            {/* City availability warning */}
            {!isServiceAvailableInCity() && selectedCity && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-300 px-4 py-3 rounded-lg mt-4"
              >
                <p className="text-sm text-yellow-800 font-semibold flex items-center gap-2">
                  <FaTimesCircle className="flex-shrink-0" />
                  ⚠️ This service is not available in {selectedCity.name}
                </p>
              </motion.div>
            )}

         
          </div>
        </section>

        {/* Main Content Layout: Service Info | Add-ons | Cart */}
        <section className="pt-6 pb-5 sm:pt-8 sm:pb-8 lg:pb-12 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* First Column: Service Description & Add-On Services */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6 order-1">
                {/* Service Description Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{currentService.name}</h2>
                      {currentService.averageRating && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                          <FaStar className="text-yellow-500 fill-yellow-500 text-xs sm:text-sm" />
                          <span className="font-bold text-gray-900">{currentService.averageRating}</span>
                          <span className="text-gray-600 text-xs">({(currentService.totalReviews || 0).toLocaleString('en-IN')} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {currentService.description && (
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">{currentService.description}</p>
                  )}
                  {currentService.shortNotes && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 mb-3 sm:mb-4 rounded-r-lg">
                      <div className="flex items-start gap-2">
                        <FaCommentDots className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Service Notes</h4>
                          <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">{currentService.shortNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* {currentService.visitingCharge && currentService.visitingCharge > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 mb-3 sm:mb-4 rounded-r-lg">
                      <div className="flex items-start gap-2">
                        <FaRupeeSign className="text-amber-500 text-sm mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-amber-800 mb-1">Visiting Charge</h4>
                          <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                            Additional ₹{currentService.visitingCharge} will be charged for visiting your location
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}
                  {/* Nexo COVER Section */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-200/50 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaCheckCircle className="text-white text-sm sm:text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-gray-900">Nexo COVER</div>
                          <div className="text-xs text-gray-700 font-medium">Upto 30 days warranty on repairs</div>
                        </div>
                      </div>
                      <FaChevronRight className="text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </motion.div>

                {/* Add-On Services */}
                {currentService.addOns && currentService.addOns.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/5"></div>
                        <div className="relative flex items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FaAward className="text-white text-lg sm:text-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white truncate">Services</h2>
                            <p className="text-white/90 text-xs font-medium">Enhance your service</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {currentService.addOns.map((addon, index) => {
                          const quantity = selectedAddOns[index] || 0
                          const isSelected = quantity > 0
                          const breakdown = calculateAddOnPriceBreakdown(addon)
                          const AddOnIcon = getIconComponent(addon.icon || 'FaTools')

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -4 }}
                              onClick={() => setSelectedAddOnModal({ index, addon })}
                              className={`bg-gradient-to-br ${isSelected
                                ? 'from-primary/5 to-primary/10 border-2 border-primary shadow-lg'
                                : 'from-white to-gray-50/50 border border-gray-200 hover:border-primary/40 hover:shadow-md'
                                } p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer`}
                            >
                              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isSelected ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-gradient-to-br from-primary/10 to-primary/20'
                                  }`}>
                                  <AddOnIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-white' : 'text-primary'}`} />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-1">{addon.name}</h3>
                                  {addon.description && (
                                    <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">{addon.description}</p>
                                  )}

                                  {/* Price Display - Show Base Price as Main Price */}
                                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-black text-primary">
                                      ₹{Math.round(breakdown.basePrice).toLocaleString('en-IN')}
                                    </span>
                                    {/* <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                      (Base Price)
                                    </span> */}
                                    {/* {breakdown.finalPrice > breakdown.basePrice && (
                                      <span className="text-xs sm:text-sm text-gray-500">
                                     ₹{Math.round(breakdown.finalPrice).toLocaleString('en-IN')}
                                      </span>
                                    )} */}
                                    {breakdown.discount > 0 && breakdown.originalTotalPrice > 0 && breakdown.originalTotalPrice !== breakdown.finalPrice && (
                                      <span className="text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                                        {Math.round(breakdown.discount)}% OFF
                                      </span>
                                    )}
                                  </div>
                                  {/* Emergency Service Charge Display */}
                                  {isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0 && (
                                    <div className="flex items-center gap-1 mb-2">
                                      <FaBolt className="text-red-500 text-xs" />
                                      <span className="text-xs font-semibold text-red-600">
                                        +₹{service.emergencyService.extraAmount} Emergency Charge
                                      </span>
                                    </div>
                                  )}

                                  {isSelected && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary-dark px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">
                                      <FaShoppingCart className="text-xs" />
                                      {quantity} in cart
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {!isSelected ? (
                                <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedAddOnModal({ index, addon })
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-all text-xs sm:text-sm flex items-center justify-center min-h-[44px] sm:min-h-[48px] shadow-sm hover:shadow"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddAddOn(index)
                                    }}
                                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-primary-dark hover:to-primary transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-[48px] shadow-md hover:shadow-lg"
                                    aria-label={`Add ${addon.name} to cart`}
                                  >
                                    <FaPlus className="text-xs sm:text-sm" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center sm:justify-start" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedAddOnModal({ index, addon })
                                    }}
                                    className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-all text-xs sm:text-sm flex items-center justify-center min-h-[44px] sm:min-h-[48px] shadow-sm hover:shadow flex-1 sm:flex-none"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveAddOn(index)
                                    }}
                                    className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-all text-xs sm:text-sm flex items-center justify-center min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px] shadow-sm hover:shadow"
                                    aria-label="Decrease quantity"
                                  >
                                    <FaMinus className="text-xs sm:text-sm" />
                                  </button>
                                  <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base min-w-[3rem] sm:min-w-[3.5rem] text-center min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-md">
                                    {quantity}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddAddOn(index)
                                    }}
                                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-primary-dark hover:to-primary transition-all text-xs sm:text-sm flex items-center justify-center min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px] shadow-md hover:shadow-lg"
                                    aria-label="Increase quantity"
                                  >
                                    <FaPlus className="text-xs sm:text-sm" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveAddOnCompletely(index)
                                    }}
                                    className="bg-red-50 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-red-100 transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-[48px] min-w-[44px] sm:min-w-[48px] flex items-center justify-center shadow-sm hover:shadow"
                                    aria-label={`Remove ${addon.name} from cart`}
                                    title="Remove"
                                  >
                                    <FaTimesCircle className="text-xs sm:text-sm" />
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-500">No services available</p>
                  </div>
                )}
              </div>

              {/* Second Column: Cart with Price Breakdown */}
              <div className="lg:col-span-4 order-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 p-4 sm:p-6 lg:p-8 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-100">
                    <button
                      onClick={() => setShowCartModal(true)}
                      className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">Shopping Cart</h2>
                    </button>
                    {getTotalItemCount() > 0 && (
                      <button
                        onClick={() => setShowCartModal(true)}
                        className="bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md hover:shadow-lg transition-all flex-shrink-0 ml-2"
                      >
                        {getTotalItemCount()} items
                      </button>
                    )}
                  </div>

                  {/* Quick Add Main Service Button */}
                  {currentService.subServices && currentService.subServices.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          // Add the first sub-service or a default one
                          if (currentService.subServices[0]) {
                            handleAddSubService(currentService.subServices[0]._id)
                          }
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <FaPlus className="text-sm" />
                        <span>Quick Add Main Service</span>
                      </button>
                    </div>
                  )}

                  {getTotalItemCount() === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FaShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-gray-700 mb-1">Your cart is empty</p>
                      <p className="text-xs sm:text-sm text-gray-500">Add services to get started</p>
                    </div>
                  ) : (
                    <>
                      {/* Comprehensive Cart Items Display */}
                      <div className="space-y-3 mb-6 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">

                        {/* Subservices in Cart */}
                        {currentService.subServices && currentService.subServices
                          .filter(sub => selectedSubServices[sub._id] > 0)
                          .map((sub) => {
                            const quantity = selectedSubServices[sub._id]
                            const finalPrice = sub.finalPrice || sub.basePrice || sub.price || 0
                            const originalPrice = sub.originalPrice || sub.price || 0
                            const hasDiscount = originalPrice > finalPrice

                            return (
                              <div key={`sub-${sub._id}`} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1">{sub.name}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                                        <button
                                          onClick={() => handleRemoveSubService(sub._id)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-primary transition rounded-l-lg"
                                        >
                                          <FaMinus className="text-xs" />
                                        </button>
                                        <span className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm text-gray-900">{quantity}</span>
                                        <button
                                          onClick={() => handleAddSubService(sub._id)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-primary transition rounded-r-lg"
                                        >
                                          <FaPlus className="text-xs" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-sm sm:text-base font-bold text-primary">₹{Math.round(finalPrice * quantity).toLocaleString('en-IN')}</p>
                                    {hasDiscount && (
                                      <p className="text-xs text-gray-400 line-through">₹{Math.round(originalPrice * quantity).toLocaleString('en-IN')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                        {/* Add-Ons in Cart */}
                        {currentService.addOns && currentService.addOns
                          .map((addon, index) => {
                            const quantity = selectedAddOns[index] || 0
                            if (quantity === 0) return null

                            const breakdown = calculateAddOnPriceBreakdown(addon)

                            return (
                              <div key={`addon-${index}`} className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1">{addon.name}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 bg-white border-2 border-primary/30 rounded-lg shadow-sm">
                                        <button
                                          onClick={() => handleRemoveAddOn(index)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-primary/10 hover:text-primary transition rounded-l-lg"
                                        >
                                          <FaMinus className="text-xs" />
                                        </button>
                                        <span className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm text-primary">{quantity}</span>
                                        <button
                                          onClick={() => handleAddAddOn(index)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-primary/10 hover:text-primary transition rounded-r-lg"
                                        >
                                          <FaPlus className="text-xs" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-sm sm:text-base font-bold text-primary">₹{Math.round(breakdown.finalPrice * quantity).toLocaleString('en-IN')}</p>
                                    {breakdown.originalTotalPrice > 0 && breakdown.originalTotalPrice !== breakdown.finalPrice && (
                                      <p className="text-xs text-gray-400 line-through">₹{Math.round(breakdown.originalTotalPrice * quantity).toLocaleString('en-IN')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                          .filter(item => item !== null)}

                        {/* Add-On Sub-Services in Cart */}
                        {currentService.addOns && currentService.addOns.map((addon, addonIndex) => {
                          if (!addon.subServices || addon.subServices.length === 0) return null
                          
                          const subServicesInCart = addon.subServices.filter((_, subServiceIndex) => {
                            const key = `${addonIndex}-${subServiceIndex}`
                            return selectedAddOnSubServices[key] > 0
                          })

                          if (subServicesInCart.length === 0) return null

                          return (
                            <div key={`addon-subservices-${addonIndex}`} className="space-y-2">
                              <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-1 px-2">
                                {addon.name} - Sub Services
                              </div>
                              {addon.subServices.map((subService, subServiceIndex) => {
                                const key = `${addonIndex}-${subServiceIndex}`
                                const quantity = selectedAddOnSubServices[key] || 0
                                if (quantity === 0) return null

                                const priceStr = subService.price || '0'
                                const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
                                const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')

                                return (
                                  <div key={key} className="bg-gradient-to-br from-primary/5 to-white border border-primary/10 rounded-lg p-3 ml-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <SubServiceIcon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-gray-900 mb-1">{subService.name}</p>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleRemoveAddOnSubService(addonIndex, subServiceIndex)}
                                              className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition"
                                            >
                                              <FaMinus className="text-xs text-gray-700" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-xs text-gray-900">{quantity}</span>
                                            <button
                                              onClick={() => handleAddAddOnSubService(addonIndex, subServiceIndex)}
                                              className="w-6 h-6 flex items-center justify-center bg-primary/10 hover:bg-primary/20 rounded transition"
                                            >
                                              <FaPlus className="text-xs text-primary" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-primary">₹{Math.round(price * quantity).toLocaleString('en-IN')}</p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>

                      {/* Available Services Section - Collapsible */}
                      {currentService.subServices && currentService.subServices.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setShowAvailableServices(!showAvailableServices)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all border border-blue-200"
                          >
                            <div className="flex items-center gap-2">
                              <FaPlus className="text-blue-600 text-sm" />
                              <span className="text-sm font-bold text-blue-900">Add More Services</span>
                            </div>
                            <motion.div
                              animate={{ rotate: showAvailableServices ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-blue-600 text-sm" />
                            </motion.div>
                          </button>

                          {showAvailableServices && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-2 space-y-2 max-h-64 overflow-y-auto custom-scrollbar"
                            >
                              {currentService.subServices.map((subService) => {
                                const quantity = selectedSubServices[subService._id] || 0
                                // For AC service, use basePrice (without GST), otherwise use finalPrice
                                const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
                                const finalPrice = isACService
                                  ? (subService.basePrice || subService.price || 0)
                                  : (subService.finalPrice || subService.basePrice || subService.price || 0)
                                const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')

                                return (
                                  <div
                                    key={`available-${subService._id}`}
                                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-primary/50 transition-all"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <SubServiceIcon className="w-5 h-5 text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">{subService.name}</h4>
                                        {subService.shortDescription && (
                                          <p className="text-xs text-gray-600 mb-2">{subService.shortDescription}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-bold text-primary">₹{Math.round(finalPrice).toLocaleString('en-IN')}</p>
                                          {quantity === 0 ? (
                                            <button
                                              onClick={() => handleAddSubService(subService._id)}
                                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-all flex items-center gap-1"
                                            >
                                              <FaPlus className="text-xs" />
                                              Add
                                            </button>
                                          ) : (
                                            <div className="flex items-center gap-1 bg-white border-2 border-primary/30 rounded-lg shadow-sm">
                                              <button
                                                onClick={() => handleRemoveSubService(subService._id)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-primary/10 hover:text-primary transition rounded-l-lg"
                                              >
                                                <FaMinus className="text-xs" />
                                              </button>
                                              <span className="w-8 text-center font-bold text-xs text-primary">{quantity}</span>
                                              <button
                                                onClick={() => handleAddSubService(subService._id)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-primary/10 hover:text-primary transition rounded-r-lg"
                                              >
                                                <FaPlus className="text-xs" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </motion.div>
                          )}
                        </div>
                      )}

                        {/* Visiting Charge Display - Hidden for AC service */}
                        {(() => {
                          const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
                          return !isACService && getTotalItemCount() > 0 && currentService.visitingCharge && currentService.visitingCharge > 0 && (
                            <div className="flex items-center justify-between pt-2 pb-2 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <FaRupeeSign className="text-amber-500 text-sm" />
                                <span className="text-sm font-semibold text-gray-700">Visiting Charge</span>
                              </div>
                              <span className="text-sm font-bold text-amber-600">+₹{currentService.visitingCharge}</span>
                            </div>
                          )
                        })()}

                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-gray-300 bg-gradient-to-r from-primary/5 to-transparent -mx-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg">
                          <span className="text-base sm:text-lg font-bold text-gray-900">Grand Total</span>
                          <div className="text-right">
                            <p className="text-xl sm:text-2xl font-black text-primary">
                              ₹{Math.round(calculateCartTotal()).toLocaleString('en-IN')}
                            </p>
                            {(() => {
                              let originalTotal = 0
                              currentService.subServices && currentService.subServices
                                .filter(sub => selectedSubServices[sub._id] > 0)
                                .forEach((sub) => {
                                  const quantity = selectedSubServices[sub._id]
                                  const originalPrice = sub.originalPrice || sub.price || 0
                                  originalTotal += originalPrice * quantity
                                })
                              if (currentService.addOns) {
                                currentService.addOns.forEach((addon, index) => {
                                  const quantity = selectedAddOns[index] || 0
                                  if (quantity > 0) {
                                    originalTotal += (addon.basePrice || 0) * quantity
                                  }
                                })
                              }
                              // Add add-on sub-services original total
                              if (currentService.addOns) {
                                currentService.addOns.forEach((addon, addonIndex) => {
                                  if (addon.subServices) {
                                    addon.subServices.forEach((subService, subServiceIndex) => {
                                      const key = `${addonIndex}-${subServiceIndex}`
                                      const quantity = selectedAddOnSubServices[key] || 0
                                      if (quantity > 0) {
                                        const priceStr = subService.price || '0'
                                        const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
                                        originalTotal += price * quantity
                                      }
                                    })
                                  }
                                })
                              }
                              const total = calculateCartTotal()
                              if (originalTotal > total) {
                                return (
                                  <p className="text-xs text-gray-400 line-through">₹{Math.round(originalTotal).toLocaleString('en-IN')}</p>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </div>

                      {isServiceAvailableInCity() ? (
                        <div className="space-y-3">
                          <button
                            onClick={handleBookNow}
                            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold hover:shadow-xl transition-all text-sm sm:text-base mb-3 flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] shadow-lg transform hover:-translate-y-0.5"
                          >
                            <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Book Now</span>
                          </button>
                         
                        </div>
                      ) : (
                        <div className="w-full bg-gray-400 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base mb-4 flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] shadow-lg cursor-not-allowed">
                          <FaTimesCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Service Not Available in {selectedCity?.name || 'Your City'}</span>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>

                {/* Sub-Services Carousel - Moved here after cart */}
                {subService && subService.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xl transition-shadow duration-300 p-3 sm:p-6 lg:p-8 mt-4"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaAward className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <h2 className="text-sm sm:text-lg font-bold text-gray-900 truncate">Sub-Services</h2>
                      </div>
                      {subService && subService.length > 0 && (
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          {subService.length}
                        </span>
                      )}
                    </div>

                    {/* Auto-Carousel for Sub-Services */}
                    {subService && subService.length > 0 ? (
                      <div className="relative w-full">
                        {/* Carousel Container */}
                        <div className="overflow-hidden rounded-lg">
                          <div 
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                          >
                            {subService.map((ele, index) => {
                              const SubServiceIcon = getIconComponent(ele.icon || 'FaTools')
                              const priceStr = ele.price || '0'
                              const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
                              const cartKey = `${ele.addonIndex}-${ele.subServiceIndex}`
                              const quantity = selectedAddOnSubServices[cartKey] || 0
                              const isInCart = quantity > 0

                              return (
                                <div
                                  key={`addon-sub-${index}`}
                                  className="w-full flex-shrink-0 box-border"
                                >
                                  <div className={`${isInCart ? 'bg-primary/5 border-primary' : 'bg-gray-50 border-gray-200'} border-2 rounded-lg p-2.5 sm:p-4`}>
                                    {/* Header */}
                                    <div className="flex gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isInCart ? 'bg-primary' : 'bg-primary/10'}`}>
                                        <SubServiceIcon className={`w-4 h-4 sm:w-6 sm:h-6 ${isInCart ? 'text-white' : 'text-primary'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
                                          {ele.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-sm sm:text-lg font-black text-primary">
                                            ₹{Math.round(price).toLocaleString('en-IN')}
                                          </span>
                                          {isInCart && (
                                            <span className="text-xs font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">
                                              {quantity}x
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    {ele.description && (
                                      <p className="text-xs text-gray-600 mb-1.5 sm:mb-2 line-clamp-2 leading-snug">
                                        {ele.description}
                                      </p>
                                    )}

                                    {/* Features */}
                                    {ele.includes && ele.includes.length > 0 && (
                                      <div className="mb-1.5 sm:mb-2 pb-1.5 sm:pb-2 border-t border-gray-200 pt-1.5 sm:pt-2">
                                        <ul className="space-y-0.5">
                                          {ele.includes.slice(0, 2).map((item, idx) => (
                                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                                              <FaCheckCircle className="text-green-500 text-xs mt-0.5 flex-shrink-0" />
                                              <span className="line-clamp-1 leading-tight">{item}</span>
                                            </li>
                                          ))}
                                          {ele.includes.length > 2 && (
                                            <li className="text-xs text-primary font-semibold ml-3.5">
                                              +{ele.includes.length - 2} more
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex items-center justify-end gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-gray-200">
                                      {isInCart ? (
                                        <>
                                          <button
                                            onClick={() => handleRemoveAddOnSubService(ele.addonIndex, ele.subServiceIndex)}
                                            className="bg-gray-200 text-gray-700 w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-gray-300"
                                          >
                                            <FaMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                          <span className="text-xs sm:text-sm font-bold text-primary w-5 sm:w-6 text-center">{quantity}</span>
                                          <button
                                            onClick={() => handleAddAddOnSubService(ele.addonIndex, ele.subServiceIndex)}
                                            className="bg-primary text-white w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-primary-dark"
                                          >
                                            <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            if (ele.addonIndex !== undefined && ele.subServiceIndex !== undefined) {
                                              handleAddAddOnSubService(ele.addonIndex, ele.subServiceIndex)
                                            }
                                          }}
                                          className="bg-primary text-white px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-dark flex items-center gap-1 text-xs"
                                        >
                                          <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        {subService.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentSlide((prev) => (prev - 1 + subService.length) % subService.length)}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary z-10 border border-gray-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setCurrentSlide((prev) => (prev + 1) % subService.length)}
                              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary z-10 border border-gray-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Slide Indicators */}
                        {subService.length > 1 && (
                          <div className="flex justify-center gap-1.5 mt-3">
                            {subService.map((_, index) => (
                              <button
                                key={`indicator-${index}`}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all rounded-full ${
                                  index === currentSlide
                                    ? 'w-6 h-1.5 bg-primary'
                                    : 'w-1.5 h-1.5 bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FaAward className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No add-on sub-services available</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Services Horizontal Slider Section - Mobile First */}
        {currentService.subServices && currentService.subServices.length > 0 && (
          <section className="py-8 sm:py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Available Packages</h2>
                <p className="text-sm text-gray-600">Choose from our service packages</p>
              </div>
            </div>
          </section>
        )}

        {/* Additional Services Section */}
        {currentService.subServices && currentService.subServices.length > 0 && (
        <section className="py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 sm:mb-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                    <FaAward className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Available Service Packages</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Choose from our curated service packages</p>
                  </div>
                </div>
              </motion.div>

              {/* Horizontal Scrollable Cards */}
              <div className="relative overflow-hidden">
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {currentService.subServices.map((subService, index) => {
                    const quantity = selectedSubServices[subService._id] || 0
                    const isSelected = quantity > 0
                    // For AC service, use basePrice (without GST), otherwise use finalPrice
                    const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
                    const finalPrice = isACService
                      ? (subService.basePrice || subService.price || 0)
                      : (subService.finalPrice || subService.basePrice || subService.price || 0)
                    const originalPrice = subService.originalPrice || subService.price || 0
                    const hasDiscount = originalPrice > finalPrice
                    const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')

                    // Handle icon - can be string URL or array
                    const iconUrl = Array.isArray(subService.icon) && subService.icon.length > 0
                      ? subService.icon[0]
                      : (subService.icon || '')

                    // Calculate per unit price if name contains numbers
                    const unitMatch = subService.name.match(/(\d+)\s*(AC|unit|item)/i)
                    const unitCount = unitMatch ? parseInt(unitMatch[1]) : 1
                    const perUnitPrice = finalPrice / unitCount

                    return (
                      <motion.div
                        key={subService._id}
                        initial={{ opacity: 0, x: -100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.15,
                          ease: "easeOut"
                        }}
                        className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[400px] snap-start"
                      >
                        <div className={`bg-white rounded-2xl border-2 ${isSelected ? 'border-primary shadow-xl' : 'border-gray-200 hover:border-primary/50'
                          } shadow-lg hover:shadow-xl transition-all h-full flex flex-col`}>
                          {/* Badge at top */}
                          {unitMatch && (
                            <div className="absolute top-0 left-0 z-10">
                              <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-br-lg">
                                {unitMatch[1]} {unitMatch[2]?.toUpperCase() || 'UNIT'} PACK
                              </span>
                            </div>
                          )}

                          {/* Card Header with Image */}
                          {iconUrl && (
                            <div className="w-full h-48 overflow-hidden rounded-t-2xl">
                              <img
                                src={iconUrl}
                                alt={subService.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}

                          {/* Card Content */}
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{subService.name}</h3>

                            {subService.description && (
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{subService.description}</p>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              <FaStar className="text-yellow-400 text-sm" />
                              <span className="text-sm font-semibold">{subService.rating > 0 ? subService.rating.toFixed(2) : '4.77'}</span>
                              <span className="text-xs text-gray-500">({subService.reviews?.length || 0} reviews)</span>
                            </div>

                            {/* Price Section */}
                            <div className="mb-3">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-2xl font-black text-gray-900">₹{Math.round(finalPrice).toLocaleString('en-IN')}</span>
                                {hasDiscount && (
                                  <span className="text-sm text-gray-500 line-through">₹{Math.round(originalPrice).toLocaleString('en-IN')}</span>
                                )}
                              </div>
                              {/* Emergency Service Charge Display */}
                              {isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0 && (
                                <div className="flex items-center gap-1 mb-1">
                                  <FaBolt className="text-red-500 text-xs" />
                                  <span className="text-xs font-semibold text-red-600">
                                    +₹{service.emergencyService.extraAmount} Emergency Charge
                                  </span>
                                </div>
                              )}
                              {unitCount > 1 && (
                                <p className="text-xs text-emerald-600 font-semibold">₹{Math.round(perUnitPrice)} per {unitMatch?.[2] || 'unit'}</p>
                              )}
                            </div>

                            {/* Duration */}
                            {subService.duration && (
                              <div className="flex items-center gap-1 mb-3 text-xs text-gray-600">
                                <FaClock className="text-xs" />
                                <span>{subService.duration}</span>
                              </div>
                            )}

                            {/* Features */}
                            {subService.includes && subService.includes.length > 0 && (
                              <div className="mb-4 flex-1">
                                <p className="text-xs font-bold text-gray-700 mb-2">What's Included:</p>
                                <ul className="space-y-1">
                                  {subService.includes.slice(0, 3).map((item, idx) => (
                                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                                      <FaCheckCircle className="text-green-500 text-xs mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-1">{item}</span>
                                    </li>
                                  ))}
                                  {subService.includes.length > 3 && (
                                    <li className="text-xs text-gray-500 italic">+{subService.includes.length - 3} more</li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Add to Cart Button */}
                            <div className="mt-auto">
                              {!isSelected ? (
                                <button
                                  onClick={() => handleAddSubService(subService._id)}
                                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <FaPlus className="w-4 h-4" />
                                  Add to Cart
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-3 bg-primary/10 rounded-xl p-2">
                                    <button
                                      onClick={() => handleRemoveSubService(subService._id)}
                                      className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-bold transition-all flex items-center justify-center shadow-sm"
                                    >
                                      <FaMinus />
                                    </button>
                                    <span className="text-xl font-black text-primary min-w-[40px] text-center">{quantity}</span>
                                    <button
                                      onClick={() => handleAddSubService(subService._id)}
                                      className="w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all flex items-center justify-center shadow-sm"
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>
                                  <p className="text-xs text-center text-gray-600">
                                    Total: ₹{Math.round(finalPrice * quantity).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Scroll Indicator */}
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <FaChevronRight className="animate-pulse" />
                    Scroll to see more packages
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Included and Excluded Section */}
        {((currentService.included && currentService.included.length > 0) ||
          (currentService.excluded && currentService.excluded.length > 0)) && (
            <section className="py-12 sm:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* What's Included */}
                  {currentService.included && currentService.included.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6 }}
                      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="bg-emerald-500 px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-lg p-2">
                            <FaCheckCircle className="text-white text-lg" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">What's Included</h2>
                            <p className="text-white/80 text-xs">Everything you get</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-2.5">
                        {currentService.included.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center gap-3 bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all group"
                          >
                            <div className="bg-emerald-500 rounded-full p-1.5 flex-shrink-0">
                              <FaCheckCircle className="text-white text-xs" />
                            </div>
                            <span className="text-gray-800 font-medium text-sm flex-1 leading-relaxed">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* What's Excluded */}
                  {currentService.excluded && currentService.excluded.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="bg-rose-500 px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-lg p-2">
                            <FaTimesCircle className="text-white text-lg" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">What's Not Included</h2>
                            <p className="text-white/80 text-xs">Items not covered</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-2.5">
                        {currentService.excluded.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center gap-3 bg-rose-50 p-3.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-all group"
                          >
                            <div className="bg-rose-500 rounded-full p-1.5 flex-shrink-0">
                              <FaTimesCircle className="text-white text-xs" />
                            </div>
                            <span className="text-gray-800 font-medium text-sm flex-1 leading-relaxed">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Service Packages Section */}
        {currentService.subServices && currentService.subServices.length > 0 && (
          <section data-packages-section className="py-8 sm:py-12 bg-gradient-to-b from-white via-gray-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                {/* Packages Column */}
                <div className="lg:col-span-8 order-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Packages</h2>
                      <p className="text-gray-600">Choose from our curated service packages</p>
                    </div>

                    <div className="space-y-6">
                      {currentService.subServices.map((subService) => {
                        const quantity = selectedSubServices[subService._id] || 0
                        const isSelected = quantity > 0
                        // For AC service, use basePrice (without GST), otherwise use finalPrice
                        const isACService = serviceName === 'ac-service' || serviceName === 'ac-service-repair'
                        const finalPrice = isACService
                          ? (subService.basePrice || subService.price || 0)
                          : (subService.finalPrice || subService.basePrice || subService.price || 0)
                        const originalPrice = subService.originalPrice || subService.price || 0
                        const hasDiscount = originalPrice > finalPrice
                        // Handle icon - can be string URL or array
                        const iconUrl = Array.isArray(subService.icon) && subService.icon.length > 0
                          ? subService.icon[0]
                          : (subService.icon || '')

                        // Calculate per unit price if name contains numbers
                        const unitMatch = subService.name.match(/(\d+)\s*(AC|unit|item)/i)
                        const unitCount = unitMatch ? parseInt(unitMatch[1]) : 1
                        const perUnitPrice = finalPrice / unitCount

                        // Format reviews count
                        const reviewsCount = subService.reviews?.length || 0
                        const formattedReviews = reviewsCount >= 1000000
                          ? `${(reviewsCount / 1000000).toFixed(1)}M`
                          : reviewsCount >= 1000
                            ? `${(reviewsCount / 1000).toFixed(1)}K`
                            : reviewsCount.toString()

                        return (
                          <motion.div
                            key={subService._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                            className={`bg-white rounded-xl border-2 ${isSelected ? 'border-primary shadow-lg' : 'border-gray-200 hover:border-primary/30'
                              } overflow-hidden transition-all relative`}
                          >
                            {/* Badge at top left */}
                            {unitMatch && (
                              <div className="absolute top-0 left-0 z-10">
                                <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-br-lg">
                                  {unitMatch[1]} {unitMatch[2]?.toUpperCase() || 'UNIT'} PACK
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5">
                              {/* Package Details - Left Side */}
                              <div className="flex-1 min-w-0 order-2 sm:order-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{subService.name}</h3>

                                {subService.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{subService.description}</p>
                                )}

                                {/* Rating and Reviews */}
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                  <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                                  <span className="text-xs sm:text-sm font-semibold">{subService.rating > 0 ? subService.rating.toFixed(2) : '4.77'}</span>
                                  <span className="text-xs text-gray-500">({formattedReviews} reviews)</span>
                                </div>

                                {/* Price Section */}
                                <div className="mb-2 sm:mb-3">
                                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-black text-gray-900">₹{Math.round(finalPrice).toLocaleString('en-IN')}</span>
                                    {hasDiscount && (
                                      <span className="text-sm sm:text-base text-gray-500 line-through">₹{Math.round(originalPrice).toLocaleString('en-IN')}</span>
                                    )}
                                  </div>
                                  {/* Emergency Service Charge Display */}
                                  {isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0 && (
                                    <div className="flex items-center gap-1 mb-1">
                                      <FaBolt className="text-red-500 text-xs" />
                                      <span className="text-xs font-semibold text-red-600">
                                        +₹{service.emergencyService.extraAmount} Emergency Charge
                                      </span>
                                    </div>
                                  )}
                                  {unitCount > 1 && (
                                    <p className="text-xs sm:text-sm text-emerald-600 font-semibold">₹{Math.round(perUnitPrice)} per {unitMatch?.[2] || 'unit'}</p>
                                  )}
                                </div>

                                {/* Duration */}
                                {subService.duration && (
                                  <div className="flex items-center gap-1 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                                    <FaClock className="text-xs" />
                                    <span>{subService.duration}</span>
                                  </div>
                                )}

                                {/* Features */}
                                {subService.includes && subService.includes.length > 0 && (
                                  <ul className="space-y-1 mb-2 sm:mb-3">
                                    {subService.includes.slice(0, 2).map((item, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5 sm:gap-2">
                                        <span className="text-gray-400 mt-0.5 sm:mt-1">•</span>
                                        <span className="line-clamp-1">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {/* View Details Link */}
                                <button className="text-xs text-primary hover:text-primary-dark font-semibold">
                                  View details →
                                </button>
                              </div>

                              {/* Package Image - Right Side */}
                              {iconUrl && (
                                <div className="flex-shrink-0 w-full sm:w-32 md:w-40 h-32 sm:h-32 md:h-40 lg:h-48 order-1 sm:order-2">
                                  <img
                                    src={iconUrl}
                                    alt={subService.name}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}

                              {/* Quantity Selector - Bottom on Mobile, Right on Desktop */}
                              <div className="flex-shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 order-3 sm:order-3 w-full sm:w-auto">
                                {!isSelected ? (
                                  <button
                                    onClick={() => handleAddSubService(subService._id)}
                                    className="w-full sm:w-auto bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all text-xs sm:text-sm whitespace-nowrap min-h-[44px]"
                                  >
                                    Add to Cart
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto">
                                    <button
                                      onClick={() => handleRemoveSubService(subService._id)}
                                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                                    >
                                      <FaMinus className="text-xs sm:text-sm" />
                                    </button>
                                    <span className="w-10 sm:w-12 text-center font-bold text-gray-900 text-base sm:text-lg">{quantity}</span>
                                    <button
                                      onClick={() => handleAddSubService(subService._id)}
                                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                                    >
                                      <FaPlus className="text-xs sm:text-sm" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar: Quick Info & Nexo Promise */}
                <div className="lg:col-span-4 order-2">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Quick Info Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 sm:p-5 lg:sticky lg:top-24">
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{currentService.name}</h3>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Instant
                          </div>
                          <span className="text-xs text-gray-500 mt-0.5">In 33 mins</span>
                        </div>
                      </div>
                      {currentService.averageRating && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm mb-3 sm:mb-4 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                          <FaStar className="text-yellow-500 fill-yellow-500 text-xs sm:text-sm" />
                          <span className="font-bold text-gray-900">{currentService.averageRating}</span>
                          <span className="text-gray-600 text-xs">({(currentService.totalReviews || 0).toLocaleString('en-IN')} reviews)</span>
                        </div>
                      )}

                      {/* Nexo Promise Section */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900">Nexo Promise</h3>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
                            <div className="text-center">
                              <div className="text-xs font-bold text-primary leading-tight">QUALITY</div>
                              <div className="text-xs font-bold text-primary leading-tight">ASSURED</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                            <span className="text-xs text-gray-700">Verified Professionals</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                            <span className="text-xs text-gray-700">Hassle Free Booking</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                            <span className="text-xs text-gray-700">Transparent Pricing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        {currentService.reviews && currentService.reviews.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
                  {currentService.averageRating && (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-6 h-6 sm:w-7 sm:h-7 ${i < Math.floor(currentService.averageRating)
                              ? 'text-yellow-400'
                              : i < currentService.averageRating
                                ? 'text-yellow-300'
                                : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-left">
                        <p className="text-3xl sm:text-4xl font-black text-gray-900">{currentService.averageRating}</p>
                        <p className="text-sm text-gray-600">Based on {currentService.totalReviews} reviews</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentService.reviews.slice(0, 6).map((review, index) => (
                    <motion.div
                      key={review._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-600 ml-1">{review.rating}/5</span>
                      </div>
                      <p className="text-gray-700 mb-3 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {(review.user?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {review.user?.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Verified Customer
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Popular Services Section */}
        {popularServices.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Explore Other Popular Services
                  </h2>
                  <p className="text-base text-gray-600">
                    Discover more services we offer
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularServices.map((popularService, index) => {
                    const PopularIcon = popularService.icon || FaTools
                    return (
                      <motion.div
                        key={popularService._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => navigate(`/service/${popularService.slug}`)}
                        className="bg-white p-5 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all group"
                      >
                        <div className="text-center">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="inline-block mb-4"
                          >
                            <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                              <PopularIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                            </div>
                          </motion.div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                            {popularService.name}
                          </h3>
                          {popularService.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                              {popularService.description}
                            </p>
                          )}
                          {/* {popularService.price && (
                            <p className="text-lg font-bold text-primary mb-3">
                              {popularService.price}
                            </p>
                          )} */}
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all text-sm"
                          >
                            View Details
                            <span className="text-base">→</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Why Book on WhatsApp */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-primary via-primary-dark to-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Why Book on WhatsApp</h2>
                <p className="text-base text-white/90">Experience the easiest way to book services</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
                >
                  <div className="bg-yellow-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBolt className="text-xl text-yellow-300" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Instant Response</h3>
                  <p className="text-xs text-white/80">Get immediate confirmation</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
                >
                  <div className="bg-green-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUserCheck className="text-xl text-green-300" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Verified Experts</h3>
                  <p className="text-xs text-white/80">Background-checked professionals</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
                >
                  <div className="bg-blue-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaShieldAlt className="text-xl text-blue-300" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Pay First, Relax Later</h3>
                  <p className="text-xs text-white/80">No upfront payment required</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
                >
                  <div className="bg-purple-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaAward className="text-xl text-purple-300" />
                  </div>
                  <h3 className="text-base font-bold mb-1">Full Transparency</h3>
                  <p className="text-xs text-white/80">Clear pricing & terms</p>
                </motion.div>
              </div>
              <div className="text-center">
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-8 py-4 rounded-full text-base font-bold hover:bg-[#20BA5A] transition-all duration-300 shadow-xl hover:shadow-[#25D366]/50 flex items-center gap-2 mx-auto"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Book Now on WhatsApp
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Back to Services */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to="/#services"
              className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-base sm:text-lg transition-colors"
            >
              ← Back to All Services
            </Link>
          </div>
        </section>
      </div>

      {/* Add-On Service Detail Modal - Compact View */}
      {selectedAddOnModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay addon-modal" style={{ zIndex: 10100 }}
          onClick={() => setSelectedAddOnModal(null)}
        >
          <div className="relative max-w-3xl w-full mx-4 sm:mx-6 lg:mx-8">
            {/* Close Button - Outside Modal, Near Top */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAddOnModal(null)
              }}
              className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-gray-900 shadow-lg z-[9998]"
              aria-label="Close modal"
            >
              <FaTimesCircle className="text-xl" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Enhanced Modal Header with Icon, Name, Description, Add to Cart */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 z-20">
                <div className="flex-1">
                  {/* Icon - Top Line */}
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                      {React.createElement(getIconComponent(selectedAddOnModal.addon.icon || 'FaTools'), {
                        className: "text-white text-xl"
                      })}
                    </div>
                  </div>
                  {/* Service Name - Second Line */}
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{selectedAddOnModal.addon.name}</h2>
                  {/* Description - Third Line */}
                  {selectedAddOnModal.addon.description && (
                    <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">{selectedAddOnModal.addon.description}</p>
                  )}
                  {/* Add to Cart Button - Fourth Line */}
                  {(() => {
                    const quantity = selectedAddOns[selectedAddOnModal.index] || 0
                    const isInCart = quantity > 0
                    return (
                      <button
                        onClick={() => {
                          if (!isInCart) {
                            handleAddAddOn(selectedAddOnModal.index)
                          }
                          setSelectedAddOnModal(null)
                        }}
                        className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${isInCart
                          ? 'bg-green-500 text-white hover:bg-green-600 cursor-default'
                          : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                      >
                        {isInCart ? (
                          <>
                            <FaCheckCircle className="text-sm" />
                            <span>Already in Cart ({quantity})</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="text-sm" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )
                  })()}
                </div>
              </div>

              {/* Simple Effective Modal Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-6">

                {/* Sub-Services */}
                {selectedAddOnModal.addon.subServices && selectedAddOnModal.addon.subServices.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <FaAward className="text-primary text-base" />
                      <h3 className="text-base font-semibold text-gray-900">Sub-Services</h3>
                      <span className="text-xs text-gray-500 ml-auto">({selectedAddOnModal.addon.subServices.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                      {selectedAddOnModal.addon.subServices.map((subService, idx) => {
                        const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')
                        const key = `${selectedAddOnModal.index}-${idx}`
                        const quantity = selectedAddOnSubServices[key] || 0
                        const isInCart = quantity > 0

                        return (
                          <div
                            key={idx}
                            className={`bg-white p-3 rounded-lg border transition-all ${isInCart
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/30'
                              }`}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isInCart
                                ? 'bg-primary text-white'
                                : 'bg-primary/10 text-primary'
                                }`}>
                                <SubServiceIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{subService.name}</h4>
                                <p className="text-sm font-bold text-primary">{subService.price}</p>
                                {isInCart && (
                                  <span className="text-xs text-primary font-medium">({quantity} in cart)</span>
                                )}
                              </div>
                            </div>

                            {/* Simple Add to Cart Controls */}
                            {!isInCart ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddAddOnSubService(selectedAddOnModal.index, idx)
                                }}
                                className="w-full bg-primary text-white px-3 py-1.5 rounded-md font-medium text-xs hover:bg-primary-dark transition-all flex items-center justify-center gap-1"
                              >
                                <FaPlus className="text-xs" />
                                <span>Add</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveAddOnSubService(selectedAddOnModal.index, idx)
                                  }}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 transition-all text-xs flex items-center justify-center min-w-[28px]"
                                  aria-label="Decrease"
                                >
                                  <FaMinus className="text-xs" />
                                </button>
                                <div className="bg-primary text-white px-3 py-1 rounded-md font-semibold text-sm min-w-[2rem] text-center">
                                  {quantity}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddAddOnSubService(selectedAddOnModal.index, idx)
                                  }}
                                  className="bg-primary text-white px-2 py-1 rounded-md hover:bg-primary-dark transition-all text-xs flex items-center justify-center min-w-[28px]"
                                  aria-label="Increase"
                                >
                                  <FaPlus className="text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Included and Excluded Items */}
                {(selectedAddOnModal.addon.included && selectedAddOnModal.addon.included.length > 0) ||
                  (selectedAddOnModal.addon.excluded && selectedAddOnModal.addon.excluded.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Included Items */}
                    {selectedAddOnModal.addon.included && selectedAddOnModal.addon.included.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FaCheckCircle className="text-green-500 text-sm" />
                          <span>Included</span>
                        </h3>
                        <ul className="space-y-1.5">
                          {selectedAddOnModal.addon.included.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-gray-700"
                            >
                              <FaCheckCircle className="text-green-500 text-xs mt-0.5 flex-shrink-0" />
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Excluded Items */}
                    {selectedAddOnModal.addon.excluded && selectedAddOnModal.addon.excluded.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FaTimesCircle className="text-red-500 text-sm" />
                          <span>Not Included</span>
                        </h3>
                        <ul className="space-y-1.5">
                          {selectedAddOnModal.addon.excluded.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-gray-700"
                            >
                              <FaTimesCircle className="text-red-500 text-xs mt-0.5 flex-shrink-0" />
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}

              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay cart-modal" style={{ zIndex: 10200 }}
          onClick={() => setShowCartModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 sm:mx-6 lg:mx-8 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary via-primary-dark to-primary px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                  <p className="text-white/90 text-sm">{getTotalItemCount()} items</p>
                </div>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {getTotalItemCount() === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Add services to get started</p>
                </div>
              ) : (
                <>
                  {/* Main Service Sub-Services */}
                  {currentService.subServices && currentService.subServices
                    .filter(sub => selectedSubServices[sub._id] > 0)
                    .map((sub) => {
                      const quantity = selectedSubServices[sub._id]
                      const finalPrice = sub.finalPrice || sub.basePrice || sub.price || 0
                      const originalPrice = sub.originalPrice || sub.price || 0
                      const hasDiscount = originalPrice > finalPrice
                      const SubIcon = getIconComponent(sub.icon || 'FaTools')

                      // Find AMC plans for this sub-service
                      const relevantAMCPlans = amcPlans.filter(plan => {
                        if (!plan.includedServices || plan.includedServices.length === 0) return false
                        
                        return plan.includedServices.some(service => {
                          const serviceName = (service.name || '').toLowerCase().trim()
                          const subServiceName = (sub.name || '').toLowerCase().trim()
                          
                          return serviceName.includes(subServiceName) || subServiceName.includes(serviceName)
                        })
                      })

                      return (
                        <div key={`sub-${sub._id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <SubIcon className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-gray-900 mb-1">{sub.name}</h4>
                                {sub.description && (
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{sub.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleRemoveSubService(sub._id)}
                                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                      <FaMinus className="text-xs text-gray-700" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-sm text-gray-900">{quantity}</span>
                                    <button
                                      onClick={() => handleAddSubService(sub._id)}
                                      className="w-8 h-8 flex items-center justify-center bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                                    >
                                      <FaPlus className="text-xs text-primary" />
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-black text-primary">₹{Math.round(finalPrice * quantity).toLocaleString('en-IN')}</p>
                                    {hasDiscount && (
                                      <p className="text-xs text-gray-400 line-through">₹{Math.round(originalPrice * quantity).toLocaleString('en-IN')}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* AMC Plans for this service */}
                          {relevantAMCPlans.length > 0 && (
                            <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FaShieldAlt className="text-blue-600 text-sm" />
                                <span className="text-xs font-bold text-blue-800">
                                  💰 Save with AMC Plans for {sub.name}
                                </span>
                              </div>
                              
                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {relevantAMCPlans.map((plan, planIndex) => {
                                  // Get frequency for this service
                                  const serviceFrequency = plan.serviceFrequency && plan.includedServices
                                    ? plan.includedServices.reduce((freq, service) => {
                                        const serviceName = (service.name || '').toLowerCase().trim()
                                        const subServiceName = (sub.name || '').toLowerCase().trim()
                                        if (serviceName.includes(subServiceName) || subServiceName.includes(serviceName)) {
                                          return plan.serviceFrequency[service._id] || plan.serviceFrequency[service] || 'included'
                                        }
                                        return freq
                                      }, 'included')
                                    : 'included'
                                  
                                  return (
                                    <div 
                                      key={planIndex}
                                      className="bg-white rounded-lg p-2.5 border border-blue-100 hover:border-blue-300 transition"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <h5 className="text-xs font-bold text-gray-900 truncate">
                                              {plan.name}
                                            </h5>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                              plan.planType === 'corporate' 
                                                ? 'bg-purple-100 text-purple-700'
                                                : plan.planType === 'business'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                              {plan.planType?.charAt(0).toUpperCase() + plan.planType?.slice(1)}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 text-xs mb-1.5">
                                            <span className="text-primary font-bold">
                                              ₹{plan.price.toLocaleString('en-IN')}/yr
                                            </span>
                                            {serviceFrequency && serviceFrequency !== 'included' && (
                                              <span className="text-green-600 font-medium">
                                                {serviceFrequency === 'unlimited' 
                                                  ? '∞ Unlimited' 
                                                  : `${serviceFrequency}x/year`}
                                              </span>
                                            )}
                                          </div>
                                          
                                          {plan.features && plan.features.length > 0 && (
                                            <div className="space-y-0.5">
                                              {plan.features.slice(0, 2).map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                                                  <FaCheckCircle className="text-green-500 text-xs mt-0.5 flex-shrink-0" />
                                                  <span className="line-clamp-1">{feature}</span>
                                                </div>
                                              ))}
                                              {plan.features.length > 2 && (
                                                <span className="text-xs text-gray-500 ml-3">
                                                  +{plan.features.length - 2} more
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <button
                                          onClick={() => {
                                            // Navigate to checkout with AMC plan selected
                                            navigate('/amc-plans', { state: { selectedPlan: plan } })
                                          }}
                                          className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded hover:bg-blue-700 transition font-medium flex-shrink-0"
                                        >
                                          View
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                  {/* Add-On Services */}
                  {currentService.addOns && currentService.addOns
                    .map((addon, index) => {
                      const quantity = selectedAddOns[index] || 0
                      if (quantity === 0) return null

                      const breakdown = calculateAddOnPriceBreakdown(addon)
                      const AddOnIcon = getIconComponent(addon.icon || 'FaTools')

                      return (
                        <motion.div
                          key={`addon-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-xl p-4 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <AddOnIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-bold text-gray-900 mb-1">{addon.name}</h4>
                              {addon.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{addon.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleRemoveAddOn(index)}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-lg transition border border-primary/20"
                                  >
                                    <FaMinus className="text-xs text-gray-700" />
                                  </button>
                                  <span className="w-12 text-center font-bold text-sm text-primary">{quantity}</span>
                                  <button
                                    onClick={() => handleAddAddOn(index)}
                                    className="w-8 h-8 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-lg transition text-white"
                                  >
                                    <FaPlus className="text-xs" />
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-primary">₹{Math.round(breakdown.finalPrice * quantity).toLocaleString('en-IN')}</p>
                                  {breakdown.originalTotalPrice > 0 && breakdown.originalTotalPrice !== breakdown.finalPrice && (
                                    <p className="text-xs text-gray-400 line-through">₹{Math.round(breakdown.originalTotalPrice * quantity).toLocaleString('en-IN')}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                    .filter(item => item !== null)}

                  {/* Add-On Sub-Services */}
                  {currentService.addOns && currentService.addOns.map((addon, addonIndex) => {
                    const subServicesInCart = addon.subServices?.filter((_, subServiceIndex) => {
                      const key = `${addonIndex}-${subServiceIndex}`
                      return selectedAddOnSubServices[key] > 0
                    }) || []

                    if (subServicesInCart.length === 0) return null

                    return (
                      <div key={`addon-subservices-${addonIndex}`} className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wide px-3">
                            {addon.name} - Sub Services
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        </div>
                        {subServicesInCart.map((subService, subServiceIndex) => {
                          const key = `${addonIndex}-${subServiceIndex}`
                          const quantity = selectedAddOnSubServices[key] || 0
                          if (quantity === 0) return null

                          const priceStr = subService.price || '0'
                          const price = parseFloat(priceStr.replace(/[₹,\s]/g, '')) || 0
                          const SubServiceIcon = getIconComponent(subService.icon || 'FaTools')

                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/10 rounded-xl p-4 hover:shadow-md transition-all ml-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <SubServiceIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-bold text-gray-900 mb-1">{subService.name}</h5>
                                  {subService.shortDescription && (
                                    <p className="text-xs text-gray-600 mb-2">{subService.shortDescription}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleRemoveAddOnSubService(addonIndex, subServiceIndex)}
                                        className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                      >
                                        <FaMinus className="text-xs text-gray-700" />
                                      </button>
                                      <span className="w-10 text-center font-bold text-xs text-gray-900">{quantity}</span>
                                      <button
                                        onClick={() => handleAddAddOnSubService(addonIndex, subServiceIndex)}
                                        className="w-7 h-7 flex items-center justify-center bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                                      >
                                        <FaPlus className="text-xs text-primary" />
                                      </button>
                                    </div>
                                    <p className="text-base font-black text-primary">₹{Math.round(price * quantity).toLocaleString('en-IN')}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {getTotalItemCount() > 0 && (
              <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
                {/* Emergency Service Breakdown */}
                {isEmergency && service?.emergencyService?.enabled && service?.emergencyService?.extraAmount > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBolt className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm font-semibold text-red-700">Emergency Service Charge</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        +₹{(service.emergencyService.extraAmount * getTotalItemCount()).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      ₹{service.emergencyService.extraAmount} × {getTotalItemCount()} items
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">Grand Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">
                      ₹{Math.round(calculateCartTotal()).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{getTotalItemCount()} items</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all order-2 sm:order-1"
                  >
                    Continue Shopping
                  </button>
                  {isServiceAvailableInCity() ? (
                    <button
                      onClick={() => {
                        setShowCartModal(false)
                        handleBookNow()
                      }}
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg order-1 sm:order-2"
                    >
                      <FaShoppingCart className="w-5 h-5" />
                      <span>Book Now</span>
                    </button>
                  ) : (
                    <div className="flex-1 bg-gray-400 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-not-allowed order-1 sm:order-2">
                      <FaTimesCircle className="w-5 h-5" />
                      <span className="hidden sm:inline">Not Available in {selectedCity?.name || 'Your City'}</span>
                      <span className="sm:hidden">Not Available</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Cart Summary - Fixed at bottom */}
      {getTotalItemCount() > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-900">
                  {getTotalItemCount()} items in cart
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  ₹{Math.round(calculateCartTotal()).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCartModal(true)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FaShoppingCart className="w-4 h-4" />
                View Cart
              </button>
              {isServiceAvailableInCity() ? (
                <button
                  onClick={handleBookNow}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  Book Now
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-400 text-white px-4 py-2.5 rounded-lg font-semibold cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  <FaTimesCircle className="w-4 h-4" />
                  Not Available
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add bottom padding when mobile cart is visible */}
      {getTotalItemCount() > 0 && (
        <div className="lg:hidden h-20"></div>
      )}


    </>
  )
}

export default ServiceDetail