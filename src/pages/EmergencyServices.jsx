import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiPhone, FiMapPin, FiArrowRight, FiAlertTriangle, FiShield, FiZap, FiRefreshCw } from 'react-icons/fi'
import { 
  FaSnowflake, FaBolt, FaTint, FaBroom, FaPaintRoller, 
  FaTools, FaHammer, FaFilter, FaPlug, FaWrench,
  FaCheckCircle, FaRupeeSign, FaCreditCard, FaMobileAlt,
  FaUserCheck, FaCommentDots, FaTimesCircle, FaHeadset,
  FaClock, FaStar, FaAward
} from 'react-icons/fa'
import { userApi } from '../services/userApi'
import { supportApi } from '../services/supportApi'

// Icon mapping
const ICON_COMPONENTS = {
  FaSnowflake, FaBolt, FaTint, FaBroom, FaPaintRoller,
  FaTools, FaHammer, FaFilter, FaPlug, FaWrench,
  FaCheckCircle, FaRupeeSign, FaCreditCard, FaMobileAlt,
  FaUserCheck, FaCommentDots, FaTimesCircle
}

const EmergencyServices = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supportSettings, setSupportSettings] = useState(null)

  useEffect(() => {
    fetchEmergencyServices()
    fetchSupportSettings()
  }, [])

  const fetchSupportSettings = async () => {
    try {
      const response = await supportApi.getSupportSettings()
      if (response.success) {
        setSupportSettings(response.data)
      }
    } catch (err) {
      console.error('Error fetching support settings:', err)
    }
  }

  const fetchEmergencyServices = async () => {
    try {
      setLoading(true)
      const response = await userApi.getEmergencyServices()
      if (response.success) {
        setServices(response.data || [])
      } else {
        setError('Failed to load emergency services')
      }
    } catch (err) {
      console.error('Error fetching emergency services:', err)
      setError('Failed to load emergency services')
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName) => {
    return ICON_COMPONENTS[iconName] || FaTools
  }

  const calculateEmergencyPrice = (service) => {
    if (!service.basePrice || service.basePrice <= 0) return 'Contact for pricing'
    
    let total = service.basePrice || 0
    
    // Apply discount
    if (service.discount > 0) {
      if (service.discountType === 'percentage') {
        total -= total * service.discount / 100
      } else {
        total -= service.discount
      }
    }
    
    // Add service charge
    if (service.serviceCharge > 0) {
      if (service.serviceChargeType === 'percentage') {
        total += (service.basePrice || 0) * service.serviceCharge / 100
      } else {
        total += service.serviceCharge
      }
    }
    
    // Add emergency service charge
    if (service.emergencyService?.enabled && service.emergencyService?.extraAmount > 0) {
      total += service.emergencyService.extraAmount
    }
    
    // Calculate GST on subtotal
    const subtotal = (service.basePrice || 0) - 
      (service.discount > 0 ? (service.discountType === 'percentage' ? (service.basePrice || 0) * service.discount / 100 : service.discount) : 0) +
      (service.serviceCharge > 0 ? (service.serviceChargeType === 'percentage' ? (service.basePrice || 0) * service.serviceCharge / 100 : service.serviceCharge) : 0) +
      (service.emergencyService?.enabled ? (service.emergencyService?.extraAmount || 0) : 0)
    
    total += (subtotal * (service.cgst || 0) / 100) + (subtotal * (service.sgst || 0) / 100)
    
    return `₹${Math.round(total)}`
  }

  const handleServiceClick = (service) => {
    navigate(`/service/${service.slug}?emergency=true`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
            <FiAlertTriangle className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Emergency Services</h3>
          <p className="text-gray-600">Preparing your emergency assistance options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <FiAlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Service Temporarily Unavailable</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <button
                onClick={fetchEmergencyServices}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              {supportSettings?.emergencyContact && (
                <a
                  href={`tel:${supportSettings.emergencyContact}`}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center"
                >
                  <FiPhone className="w-4 h-4 mr-2" />
                  Call Emergency: {supportSettings.emergencyContact}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Enhanced Header with animated background */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-1/3 w-8 h-8 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <FiAlertTriangle className="w-16 h-16 text-yellow-300 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FaBolt className="w-3 h-3 text-red-600" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
              Emergency Services
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              24/7 Emergency Home Services - Fast Response Guaranteed Within 30 Minutes
            </p>
            
            {/* Enhanced feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-red-100 mb-8">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <FiClock className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">24/7 Available</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <FiZap className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">30 Min Response</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <FiShield className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">Verified Experts</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <FiMapPin className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="font-semibold">All Locations</span>
              </div>
            </div>

            {/* Emergency hotline */}
            {supportSettings?.emergencyContact && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <FaHeadset className="w-6 h-6 text-yellow-300 mr-2" />
                  <span className="text-lg font-semibold">Emergency Hotline</span>
                </div>
                <a
                  href={`tel:${supportSettings.emergencyContact}`}
                  className="text-3xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                  {supportSettings.emergencyContact}
                </a>
                <p className="text-sm text-red-200 mt-2">Call now for immediate assistance</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <FiAlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Emergency Services Available</h3>
              <p className="text-gray-600 leading-relaxed">Emergency services are currently not available. Please check back later or contact our support team.</p>
              {supportSettings?.supportPhone && (
                <a
                  href={`tel:${supportSettings.supportPhone}`}
                  className="inline-flex items-center mt-6 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-semibold"
                >
                  <FiPhone className="w-4 h-4 mr-2" />
                  Call Support: {supportSettings.supportPhone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Emergency Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                All services include emergency response charges for immediate assistance. Our certified professionals are ready to help you 24/7.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">30min</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">24/7</div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">100%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">500+</div>
                  <div className="text-sm text-gray-600">Experts</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = getIconComponent(service.icon)
                const emergencyPrice = calculateEmergencyPrice(service)
                
                return (
                  <div
                    key={service._id}
                    className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-red-200 overflow-hidden"
                    onClick={() => handleServiceClick(service)}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative p-8">
                      {/* Emergency Badge & Icon */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="w-8 h-8 text-red-600" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <FaBolt className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
                          <FiAlertTriangle className="w-3 h-3 mr-1" />
                          EMERGENCY
                        </div>
                      </div>

                      {/* Service Info */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                        {service.name}
                      </h3>
                      
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {service.description}
                        </p>
                      )}

                      {/* Emergency Pricing Card */}
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border border-red-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-red-700 flex items-center">
                            <FaRupeeSign className="w-3 h-3 mr-1" />
                            Emergency Price:
                          </span>
                          <span className="text-2xl font-bold text-red-600">{emergencyPrice}</span>
                        </div>
                        {service.emergencyService?.extraAmount > 0 && (
                          <div className="text-xs text-red-600 bg-red-100 rounded-lg px-3 py-1">
                            Includes +₹{service.emergencyService.extraAmount} emergency charge
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {service.included && service.included.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                            <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            What's Included:
                          </h4>
                          <ul className="space-y-2">
                            {service.included.slice(0, 3).map((item, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600">
                                <FaCheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{item}</span>
                              </li>
                            ))}
                            {service.included.length > 3 && (
                              <li className="text-xs text-gray-500 pl-5">
                                +{service.included.length - 3} more benefits
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Add-ons & Trust Badge */}
                      <div className="flex items-center justify-between mb-6 text-xs text-gray-500">
                        {service.addOns && service.addOns.length > 0 && (
                          <span className="flex items-center">
                            <FaTools className="w-3 h-3 mr-1" />
                            {service.addOns.length} add-on{service.addOns.length > 1 ? 's' : ''} available
                          </span>
                        )}
                        {service.trusted && (
                          <span className="flex items-center">
                            <FaAward className="w-3 h-3 mr-1 text-yellow-500" />
                            Trusted Service
                          </span>
                        )}
                      </div>

                      {/* Enhanced Book Now Button */}
                      <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center group-hover:shadow-xl transform group-hover:-translate-y-1">
                        <FaBolt className="w-4 h-4 mr-2" />
                        <span>Book Emergency Service</span>
                        <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Emergency Contact Section */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-8">
              <FiPhone className="w-16 h-16 text-yellow-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-4xl font-bold mb-4">Need Immediate Help?</h3>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                For urgent emergencies, call our 24/7 helpline for immediate assistance. Our expert team is always ready to help you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Emergency Hotline */}
              {supportSettings?.emergencyContact && (
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <FaHeadset className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold mb-2">Emergency Hotline</h4>
                  <a
                    href={`tel:${supportSettings.emergencyContact}`}
                    className="block text-3xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors mb-2"
                  >
                    {supportSettings.emergencyContact}
                  </a>
                  <p className="text-red-200 text-sm">Available 24/7 for emergencies</p>
                  <div className="mt-4 flex items-center justify-center text-sm text-red-200">
                    <FaClock className="w-4 h-4 mr-2" />
                    <span>Average response time: 30 minutes</span>
                  </div>
                </div>
              )}

              {/* Regular Support */}
              {supportSettings?.supportPhone && (
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <FiPhone className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold mb-2">General Support</h4>
                  <a
                    href={`tel:${supportSettings.supportPhone}`}
                    className="block text-3xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors mb-2"
                  >
                    {supportSettings.supportPhone}
                  </a>
                  <p className="text-red-200 text-sm">For general inquiries and bookings</p>
                  <div className="mt-4 flex items-center justify-center text-sm text-red-200">
                    <FaClock className="w-4 h-4 mr-2" />
                    <span>Mon-Sun: 6:00 AM - 10:00 PM</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional contact options */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiZap className="w-6 h-6 text-yellow-300" />
                </div>
                <h5 className="font-semibold mb-1">Instant Response</h5>
                <p className="text-sm text-red-200">Quick acknowledgment within 2 minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUserCheck className="w-6 h-6 text-yellow-300" />
                </div>
                <h5 className="font-semibold mb-1">Verified Experts</h5>
                <p className="text-sm text-red-200">All technicians are background verified</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaStar className="w-6 h-6 text-yellow-300" />
                </div>
                <h5 className="font-semibold mb-1">Quality Assured</h5>
                <p className="text-sm text-red-200">100% satisfaction guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyServices