import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiHome, 
  FiArrowLeft, 
  FiSearch, 
  FiAlertCircle, 
  FiCompass, 
  FiMapPin,
  FiZap,
  FiTrendingUp,
  FiHelpCircle,
  FiMail,
  FiMessageCircle
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Logo from '../components/Logo'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'

const NotFound = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const whatsappNumber = "919590926068"
  const handleWhatsAppClick = useWhatsAppClick()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [timeOnPage, setTimeOnPage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [0, -30, 0],
      x: [0, 10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const rotateVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const popularPages = [
    { path: '/', label: 'Home', icon: FiHome, color: 'from-blue-500 to-blue-600' },
    { path: '/partner', label: 'Partner Program', icon: FiTrendingUp, color: 'from-green-500 to-green-600' },
    { path: '/leads', label: 'Lead Marketplace', icon: FiZap, color: 'from-yellow-500 to-yellow-600' },
    { path: '/materials', label: 'Material Store', icon: FiCompass, color: 'from-purple-500 to-purple-600' },
    { path: '/amc', label: 'AMC Plans', icon: FiMapPin, color: 'from-pink-500 to-pink-600' },
    { path: '/emergency', label: 'Emergency Service', icon: FiZap, color: 'from-red-500 to-red-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Interactive Mouse Follow Effect */}
      <div 
        className="absolute pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30 transition-opacity duration-500" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1, duration: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 0.5, duration: 6 }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-yellow-300/10 to-orange-300/5 rounded-full blur-2xl"
          variants={rotateVariants}
          animate="animate"
        />
      </div>

      {/* Animated Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23214A73' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 60px'
        }}
      />

      <motion.div
        className="relative z-10 max-w-6xl w-full mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Section with Logo and Stats */}
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Logo className="scale-110 sm:scale-125" />
          </div>
          
          {/* Time on page indicator */}
          {timeOnPage > 5 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-slate-600 shadow-lg mb-4"
            >
              <FiHelpCircle className="text-primary" />
              <span>You've been here for {timeOnPage}s</span>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start lg:items-center">
          {/* Left Side - 404 Display */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            {/* 404 Number with Enhanced Animation */}
            <div className="relative mb-6 sm:mb-8">
              <motion.h1 
                className="text-[8rem] sm:text-[12rem] lg:text-[14rem] xl:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-primary leading-none relative select-none"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                404
              </motion.h1>
              
              {/* Floating particles around 404 */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-primary/30 rounded-full"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 12}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            {/* Error Icon with Enhanced Animation */}
            <motion.div variants={itemVariants} className="flex justify-center lg:justify-start mb-6 sm:mb-8">
              <div className="relative">
                <motion.div
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-primary via-primary-dark to-primary flex items-center justify-center shadow-2xl relative overflow-hidden"
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <FiAlertCircle className="text-white text-5xl sm:text-6xl lg:text-7xl relative z-10" />
                </motion.div>
                
                {/* Multiple pulsing rings */}
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    style={{
                      top: `-${ring * 20}px`,
                      left: `-${ring * 20}px`,
                      right: `-${ring * 20}px`,
                      bottom: `-${ring * 20}px`,
                    }}
                    animate={{
                      scale: [1, 1.5 + ring * 0.2, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2 + ring * 0.5,
                      repeat: Infinity,
                      delay: ring * 0.3
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
                Page Not Found
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-2 sm:mb-3">
                Oops! We couldn't find what you're looking for.
              </p>
              <p className="text-sm sm:text-base text-slate-500 break-words">
                The page <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded break-all">{location.pathname}</span> doesn't exist or has been moved.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Side - Actions and Links */}
          <motion.div variants={itemVariants} className="space-y-6">

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/"
                className="group flex-1 px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 hover:-translate-y-1"
              >
                <FiHome className="text-lg sm:text-xl group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Go to Home</span>
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="group flex-1 px-5 py-3 sm:px-6 sm:py-4 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-105 hover:-translate-y-1 shadow-lg"
              >
                <FiArrowLeft className="text-lg sm:text-xl group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Go Back</span>
              </button>
            </div>

            {/* Popular Pages Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FiCompass className="text-primary" />
                Popular Pages
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {popularPages.map((page, index) => {
                  const Icon = page.icon
                  return (
                    <motion.div
                      key={page.path}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={page.path}
                        className={`group block p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 hover:border-primary transition-all duration-300 shadow-md hover:shadow-xl`}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                          <Icon className="text-white text-xl" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors text-center">
                          {page.label}
                        </p>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Help Section */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm rounded-2xl border-2 border-primary/20 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FiHelpCircle className="text-primary" />
                Need Help?
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleWhatsAppClick(whatsappNumber)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>Chat on WhatsApp</span>
                </button>
                <Link
                  to="/partner"
                  className="block w-full px-4 py-3 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  <FiMessageCircle className="text-xl" />
                  <span>Become a Partner</span>
                </Link>
              </div>
            </motion.div>

            {/* Search Suggestion */}
            <motion.div
              variants={itemVariants}
              className="p-5 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-primary/30 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FiSearch className="text-primary text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Can't find what you're looking for?
                  </p>
                  <p className="text-xs text-slate-600">
                    Try using the navigation menu or contact our support team for assistance.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats/Info */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-12 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <FiZap className="text-primary" />
              <span>Fast Response</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <FiHelpCircle className="text-primary" />
              <span>24/7 Support</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <FiTrendingUp className="text-primary" />
              <span>Trusted Platform</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound

