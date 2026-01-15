import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaChartLine,
  FaMoneyBillWave,
  FaCheckCircle,
  FaBullseye,
  FaGraduationCap,
  FaBolt,
  FaUserCheck,
  FaFileAlt,
  FaIdCard,
  FaCreditCard,
  FaClock
} from 'react-icons/fa'

const PartnerOnboarding = () => {
  const [selectedCategory, setSelectedCategory] = useState('ac-technician')
  const [selectedPartnerType, setSelectedPartnerType] = useState('individual')
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const categories = {
    'ac-technician': { name: 'AC Technician', earnings: '₹45,000–₹75,000' },
    'electrician': { name: 'Electrician', earnings: '₹35,000–₹60,000' },
    'plumber': { name: 'Plumber', earnings: '₹30,000–₹55,000' },
    'carpenter': { name: 'Carpenter', earnings: '₹40,000–₹70,000' },
    'painter': { name: 'Painter', earnings: '₹35,000–₹65,000' },
    'cleaner': { name: 'Deep Cleaner', earnings: '₹25,000–₹50,000' },
  }

  const [mgPlans, setMgPlans] = useState([])

  // Fetch MG Plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
          (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin)
        const response = await fetch(`${API_BASE_URL}/api/partner/mg-plans/public`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && Array.isArray(result.data)) {
            const mappedPlans = result.data.map(plan => {
              const planName = plan.name || ''
              const nameLower = planName.toLowerCase()
              let icon = plan.icon || '📦'

              if (!plan.icon) {
                if (nameLower.includes('silver')) {
                  icon = '🥈'
                } else if (nameLower.includes('gold')) {
                  icon = '🥇'
                } else if (nameLower.includes('platinum') || nameLower.includes('diamond')) {
                  icon = '💎'
                } else if (nameLower.includes('bronze')) {
                  icon = '🥉'
                }
              }

              const features = plan.features && Array.isArray(plan.features) && plan.features.length > 0
                ? plan.features.filter(feature =>
                  !feature.toLowerCase().includes('leads') &&
                  !feature.toLowerCase().includes('commission')
                )
                : ['Priority Support', '24/7 Customer Support', 'Training & Onboarding']

              return {
                _id: plan._id,
                name: plan.name,
                price: plan.price || 0,
                leads: plan.leads || 0,
                commission: plan.commission || 0,
                icon: icon,
                features: features,
                partnerType: plan.partnerType || 'both'
              }
            })

            setMgPlans(mappedPlans)
          }
        }
      } catch (err) {
        console.error('Failed to fetch MG plans:', err)
        setMgPlans([])
      }
    }
    fetchPlans()
  }, [])

  const steps = [
    { 
      step: '1', 
      title: 'Complete Registration Form', 
      description: 'Fill your details and choose trade', 
      icon: FaFileAlt,
      details: [
        'Enter your full name and contact information',
        'Select your service category (AC Technician, Electrician, etc.)',
        'Provide your work experience details',
        'Choose your preferred working areas',
        'Set your availability schedule'
      ]
    },
    { 
      step: '2', 
      title: 'Upload KYC Documents', 
      description: 'Submit identity and bank documents', 
      icon: FaIdCard,
      details: [
        'Upload clear photo of Aadhaar Card (front & back)',
        'Provide PAN Card copy',
        'Submit bank account details and passbook copy',
        'Upload professional certificates (if any)',
        'Provide address proof document'
      ]
    },
    { 
      step: '3', 
      title: 'Complete Payment', 
      description: 'Pay registration fee via WhatsApp Pay', 
      icon: FaCreditCard,
      details: [
        'Choose your preferred MG Plan',
        'Make payment via WhatsApp Pay or UPI',
        'Registration fee varies by plan (₹500 - ₹2000)',
        'Get instant payment confirmation',
        'Receive digital receipt via WhatsApp'
      ]
    },
    { 
      step: '4', 
      title: 'Get Verified & Start Earning', 
      description: 'Approval and job access', 
      icon: FaUserCheck,
      details: [
        'Our team verifies your documents (24-48 hours)',
        'Receive verification confirmation via SMS/WhatsApp',
        'Get access to partner dashboard',
        'Start receiving job leads immediately',
        'Begin earning from day one'
      ]
    },
  ]

  // Auto-advance steps animation
  useEffect(() => {
    if (isAnimating) {
      if (currentStep < steps.length - 1) {
        const timer = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep])
          setCurrentStep(prev => prev + 1)
        }, 2500) // 2.5 seconds per step
        
        return () => clearTimeout(timer)
      } else {
        // Complete the last step and then restart the animation
        const timer = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep])
          
          // Restart animation after showing completion for 3 seconds
          setTimeout(() => {
            setCurrentStep(0)
            setCompletedSteps([])
          }, 3000)
        }, 2500)
        
        return () => clearTimeout(timer)
      }
    }
  }, [currentStep, isAnimating, steps.length])

  // Auto-start animation when component mounts
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      setIsAnimating(true)
    }, 1500) // Start animation after 1.5 seconds
    
    return () => clearTimeout(autoStartTimer)
  }, [])

  const benefits = [
    { 
      icon: FaChartLine, 
      text: 'High daily job volume', 
      color: 'text-[#224a73]', 
      bgColor: 'from-[#224a73]/5 to-[#224a73]/10', 
      borderColor: 'border-[#224a73]/20',
      hoverColor: 'hover:border-[#224a73]/40'
    },
    { 
      icon: FaMoneyBillWave, 
      text: 'Weekly payouts', 
      color: 'text-green-600', 
      bgColor: 'from-green-50 to-green-100', 
      borderColor: 'border-green-200',
      hoverColor: 'hover:border-green-300'
    },
    { 
      icon: FaCheckCircle, 
      text: 'Verified partner badge', 
      color: 'text-[#224a73]', 
      bgColor: 'from-[#224a73]/5 to-[#224a73]/10', 
      borderColor: 'border-[#224a73]/20',
      hoverColor: 'hover:border-[#224a73]/40'
    },
    { 
      icon: FaBullseye, 
      text: 'Priority support', 
      color: 'text-orange-600', 
      bgColor: 'from-orange-50 to-orange-100', 
      borderColor: 'border-orange-200',
      hoverColor: 'hover:border-orange-300'
    },
    // { 
    //   icon: FaGraduationCap, 
    //   text: 'Free training', 
    //   color: 'text-[#224a73]', 
    //   bgColor: 'from-[#224a73]/5 to-[#224a73]/10', 
    //   borderColor: 'border-[#224a73]/20',
    //   hoverColor: 'hover:border-[#224a73]/40'
    // },
    { 
      icon: FaBolt, 
      text: 'Early payouts (Premium)', 
      color: 'text-amber-600', 
      bgColor: 'from-amber-50 to-amber-100', 
      borderColor: 'border-amber-200',
      hoverColor: 'hover:border-amber-300'
    },
  ]

  const floatingVariants = {
    animate: {
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  // Filter plans based on selected partner type
  const getFilteredPlans = () => {
    return mgPlans.filter(plan => {
      const planType = plan.partnerType || 'both'
      
      if (selectedPartnerType === 'individual') {
        return planType === 'individual' || planType === 'both'
      } else if (selectedPartnerType === 'franchise') {
        return planType === 'franchise' || planType === 'both'
      }
      
      return true
    })
  }

  const filteredPlans = getFilteredPlans()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-[#224a73] to-[#1a3a5c] text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
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

        {/* Animated Motion Balls */}
        {/* Large Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-yellow-300/20 to-yellow-300/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1, duration: 5 }}
        />

        {/* Medium Motion Balls */}
        <motion.div
          className="absolute top-32 right-20 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#224a73]/30 to-blue-500/20 rounded-full blur-2xl"
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-20 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400/25 to-green-500/15 rounded-full blur-2xl"
          animate={{
            y: [0, 35, 0],
            x: [0, -25, 0],
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
        />

        {/* Small Floating Balls */}
        <motion.div
          className="absolute top-40 left-1/3 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400/40 to-orange-400/25 rounded-full blur-xl"
          animate={{
            y: [0, -60, 0],
            x: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/3 w-14 h-14 sm:w-18 sm:h-18 bg-gradient-to-br from-purple-400/35 to-pink-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 45, 0],
            x: [0, -20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8,
          }}
        />

        {/* Micro Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full blur-sm ${
              i % 4 === 0 ? 'bg-white/30' :
              i % 4 === 1 ? 'bg-yellow-300/40' :
              i % 4 === 2 ? 'bg-[#224a73]/35' :
              'bg-emerald-400/30'
            }`}
            style={{
              left: `${10 + (i * 11) % 80}%`,
              top: `${15 + (i * 13) % 70}%`,
            }}
            animate={{
              y: [0, -100 - (i * 10), 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 5), 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Orbiting Balls */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400/50 to-blue-500/30 rounded-full blur-lg"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: '-150px 0px',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-rose-400/45 to-red-500/25 rounded-full blur-lg"
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: '200px 100px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-block mb-4 sm:mb-6"
            >
              <FaUserCheck className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-300" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Become a Service Partner</h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 text-yellow-300">Earn ₹25,000 to ₹70,000 per month</p>
            
            <div className="flex justify-center">
              <motion.a
                href="/partner/onboard"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold shadow-2xl hover:shadow-[#224a73]/50 hover:from-[#1a3a5c] hover:to-[#224a73] transition-all duration-300 flex items-center gap-3"
              >
                <FaUserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                Register Now
              </motion.a>
            </div>

          </motion.div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#224a73] mb-3 sm:mb-4">What You Get</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className={`bg-gradient-to-br ${benefit.bgColor} p-5 sm:p-6 rounded-xl border ${benefit.borderColor} ${benefit.hoverColor} text-center transition-all duration-300 hover:shadow-lg`}
                >
                  <IconComponent className={`w-10 h-10 sm:w-12 sm:h-12 ${benefit.color} mx-auto mb-3 sm:mb-4`} />
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">{benefit.text}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#224a73] mb-3 sm:mb-4">Partner Earnings Calculator</h2>
            <p className="text-lg sm:text-xl text-gray-600">Select your category to see potential earnings</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Select your category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 sm:p-4 border-2 border-[#224a73] rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#224a73] focus:border-[#224a73] mb-6 sm:mb-8 transition-all duration-300"
              >
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>

              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white p-5 sm:p-6 rounded-xl text-center shadow-lg"
              >
                <p className="text-base sm:text-lg mb-2">Approx earnings:</p>
                <p className="text-3xl sm:text-4xl font-bold">{categories[selectedCategory].earnings}</p>
                <p className="text-base sm:text-lg mt-2">per month</p>
              </motion.div>

              <div className="mt-6 sm:mt-8 text-center">
                <motion.a
                  href="/partner/onboard"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-[#1a3a5c] hover:to-[#224a73] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <FaUserCheck className="w-5 h-5" />
                  Start Registration
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MG Plan */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#224a73] mb-3 sm:mb-4">MG Plans</h2>

            {/* Partner Type Filter */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPartnerType('individual')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all ${
                  selectedPartnerType === 'individual'
                    ? 'bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#224a73]'
                }`}
              >
                👤 Individual
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPartnerType('franchise')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all ${
                  selectedPartnerType === 'franchise'
                    ? 'bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#224a73]'
                }`}
              >
                🏢 Franchise
              </motion.button>
            </div>
          </motion.div>

          {filteredPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300"
            >
              <p className="text-gray-600 text-lg font-medium mb-2">No plans available</p>
              <p className="text-gray-500 text-sm">
                No plans found for {selectedPartnerType === 'individual' ? 'Individual' : 'Franchise'} partners.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Contact admin to add {selectedPartnerType === 'individual' ? 'Individual' : 'Franchise'} plans.
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan._id || plan.name || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                    plan.name.toLowerCase().includes('platinum') 
                      ? 'border-[#224a73] scale-105 lg:scale-105 sm:scale-100 shadow-2xl shadow-[#224a73]/20' 
                      : 'border-gray-200 hover:border-[#224a73]/30 hover:shadow-2xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{plan.icon}</div>
                    {plan.partnerType && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ml-2 ${
                          plan.partnerType === 'individual'
                            ? 'bg-[#224a73]/10 text-[#224a73]'
                            : plan.partnerType === 'franchise'
                            ? 'bg-[#224a73]/10 text-[#224a73]'
                            : 'bg-[#224a73]/10 text-[#224a73]'
                        }`}
                      >
                        {plan.partnerType === 'individual' ? '👤 Individual' :
                          plan.partnerType === 'franchise' ? '🏢 Franchise' :
                            '👥 All Partners'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#224a73] mb-2">{plan.name}</h3>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-[#224a73]">₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <span>{plan.leads} Guaranteed Leads/month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <span>{plan.commission}% Commission Rate</span>
                    </li>
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.a
                    href="/partner/onboard"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block w-full text-center py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 ${
                      plan.name.toLowerCase().includes('platinum')
                        ? 'bg-gradient-to-r from-[#224a73] to-[#1a3a5c] text-white hover:from-[#1a3a5c] hover:to-[#224a73] shadow-lg'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-[#224a73] hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Choose {plan.name} Plan
                  </motion.a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Join - Animated Steps */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#224a73] mb-3 sm:mb-4">How to Join</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6">Follow these simple steps to become a Nexo partner and start earning</p>
            

          </motion.div>

          {/* Animated Progress Steps Bar */}
          <div className="max-w-5xl mx-auto mb-8 sm:mb-12 px-4 sm:px-4">
            <div className="relative min-h-[200px] sm:min-h-[120px]">
              {/* Desktop Progress Line */}
              <div className="hidden sm:block absolute top-8 left-8 right-8 h-2 bg-gray-200 rounded-full shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#224a73] via-blue-500 to-green-500 rounded-full relative overflow-hidden"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: `${(completedSteps.length / steps.length) * 100}%` 
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>

              {/* Mobile Progress Lines */}
              <div className="sm:hidden absolute inset-0">
                {/* Horizontal line between steps 1-2 */}
                <div className="absolute top-6 left-1/4 right-1/4 h-1 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#224a73] to-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: `${completedSteps.includes(0) ? '100%' : currentStep > 0 ? '50%' : '0%'}` 
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
                
                {/* Vertical line between top and bottom rows */}
                <div className="absolute top-1/4 bottom-1/4 left-1/2 w-1 bg-gray-200 rounded-full transform -translate-x-1/2">
                  <motion.div
                    className="w-full bg-gradient-to-b from-blue-500 to-green-500 rounded-full"
                    initial={{ height: "0%" }}
                    animate={{ 
                      height: `${completedSteps.includes(1) ? '100%' : currentStep > 1 ? '50%' : '0%'}` 
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
                
                {/* Horizontal line between steps 3-4 */}
                <div className="absolute bottom-6 left-1/4 right-1/4 h-1 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: `${completedSteps.includes(2) ? '100%' : currentStep > 2 ? '50%' : '0%'}` 
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="relative grid grid-cols-2 sm:flex sm:justify-between gap-6 sm:gap-2">
                {steps.map((step, index) => {
                  const IconComponent = step.icon
                  const isCompleted = completedSteps.includes(index)
                  const isCurrent = currentStep === index
                  const isUpcoming = index > currentStep && !isCompleted

                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {/* Step Circle */}
                      <motion.div
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-green-500 to-green-600' 
                            : isCurrent 
                            ? 'bg-gradient-to-br from-[#224a73] to-[#1a3a5c] ring-2 sm:ring-4 ring-[#224a73]/20' 
                            : 'bg-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </motion.div>
                        ) : (
                          <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${isCurrent ? 'text-white' : 'text-gray-600'}`} />
                        )}
                        
                        {/* Pulse animation for current step */}
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-[#224a73]/30"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>

                      {/* Step Info */}
                      <div className="mt-2 sm:mt-4 text-center max-w-24 sm:max-w-32">
                        <h3 className={`text-xs sm:text-sm font-bold mb-1 leading-tight ${
                          isCompleted || isCurrent ? 'text-[#224a73]' : 'text-gray-500'
                        }`}>
                          {step.title.split(' ').slice(0, 2).join(' ')}
                        </h3>
                        <p className="text-xs text-gray-500 leading-tight hidden sm:block">
                          {step.description}
                        </p>
                        
                        {/* Status Badge */}
                        <motion.div
                          className={`inline-block mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700' 
                              : isCurrent 
                              ? 'bg-[#224a73]/10 text-[#224a73]' 
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center px-4"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-[#224a73] mb-3 sm:mb-4">
                Progress: {completedSteps.length}/{steps.length} Steps
              </h3>
              
              {completedSteps.length === steps.length ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FaCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">🎉 All Steps Completed!</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Ready to start your Nexo partner journey</p>
                </motion.div>
              ) : (
                <div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Current: <span className="font-semibold text-[#224a73]">{steps[currentStep]?.title}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>


        </div>
      </section>
    </div>
  )
}

export default PartnerOnboarding