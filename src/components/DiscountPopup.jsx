import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaTag, FaPercent, FaGift, FaClock, FaCheckCircle } from 'react-icons/fa'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)

const DiscountPopup = ({ onClose }) => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  useEffect(() => {
    fetchActiveOffers()
  }, [])

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [offers.length])

  const fetchActiveOffers = async () => {
    try {
      console.log('🎁 Fetching offers from:', `${API_BASE_URL}/api/user/offers`)
      const response = await fetch(`${API_BASE_URL}/api/user/offers`)
      const result = await response.json()
      
      console.log('🎁 Offers response:', result)
      
      if (result.success && result.data) {
        // Filter active offers (current date between start and end date)
        const now = new Date()
        const activeOffers = result.data.filter(offer => {
          const startDate = new Date(offer.startDate)
          const endDate = new Date(offer.endDate)
          const isActive = now >= startDate && now <= endDate
          console.log(`🎁 Offer "${offer.offerTitle}": ${isActive ? '✅ Active' : '❌ Inactive'}`, {
            now: now.toISOString(),
            start: startDate.toISOString(),
            end: endDate.toISOString()
          })
          return isActive
        })
        console.log('🎁 Active offers count:', activeOffers.length)
        setOffers(activeOffers)
      }
    } catch (error) {
      console.error('🎁 Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeLeft = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
    return 'Ending soon'
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    setShowCopiedToast(true)
    setTimeout(() => setShowCopiedToast(false), 2000)
  }

  if (loading || offers.length === 0) return null

  const currentOffer = offers[currentOfferIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute -top-3 -right-3 z-[100] bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors hover:scale-110 active:scale-95"
            aria-label="Close popup"
          >
            <FaTimes className="w-5 h-5 text-gray-700" />
          </button>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Floating Icons */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-4 left-4 text-white/30"
            >
              <FaGift className="w-12 h-12" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-4 right-4 text-white/30"
            >
              <FaTag className="w-10 h-10" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-lg"
              >
                <FaPercent className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-gray-800">Special Offer</span>
              </motion.div>

              {/* Offer Image */}
              {currentOffer.promotionalImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 rounded-2xl overflow-hidden shadow-xl"
                >
                  <img
                    src={currentOffer.promotionalImage}
                    alt={currentOffer.offerTitle}
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg"
              >
                {currentOffer.offerTitle}
              </motion.h2>

              {/* Discount Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="inline-block bg-white rounded-2xl px-6 py-3 mb-6 shadow-xl relative"
              >
                {/* Pulsing ring effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-orange-400 rounded-2xl"
                />
                <div className="relative flex items-center gap-2">
                  <span className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {currentOffer.discount}%
                  </span>
                  <span className="text-xl font-bold text-gray-700">OFF</span>
                </div>
              </motion.div>

              {/* Coupon Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg"
              >
                <p className="text-sm text-gray-600 mb-2 font-medium">Use Coupon Code:</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl px-4 py-3 border-2 border-dashed border-orange-400">
                    <code className="text-2xl font-black text-gray-800 tracking-wider">
                      {currentOffer.couponCode}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentOffer.couponCode)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Copy
                  </button>
                </div>
              </motion.div>

              {/* Time Left */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 text-white/90 mb-4"
              >
                <FaClock className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {calculateTimeLeft(currentOffer.endDate)}
                </span>
              </motion.div>

              {/* View All Offers Link (Optional) */}
              {offers.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  className="text-center mb-4"
                >
                  <span className="text-white/80 text-sm">
                    {offers.length} active offers available
                  </span>
                </motion.div>
              )}

              {/* Offer Indicators */}
              {offers.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-center gap-2 mt-6"
                >
                  {offers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentOfferIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentOfferIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Shine Effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            style={{ transform: 'skewX(-20deg)' }}
          />

          {/* Copied Toast Notification */}
          <AnimatePresence>
            {showCopiedToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
              >
                <FaCheckCircle className="w-5 h-5" />
                <span className="font-semibold">Coupon code copied!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DiscountPopup
