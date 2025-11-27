import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaWhatsapp, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaBullseye, 
  FaGraduationCap, 
  FaBolt,
  FaUserCheck,
  FaFileAlt,
  FaCertificate,
  FaIdCard,
  FaCreditCard
} from 'react-icons/fa'
import SEO from '../components/SEO'
import { partnerApi } from '../services/partnerApi'

const PartnerOnboarding = () => {
  const [selectedCategory, setSelectedCategory] = useState('ac-technician')
  const [selectedPartnerType, setSelectedPartnerType] = useState('all')
  const whatsappNumber = "919590926068"

  const categories = {
    'ac-technician': { name: 'AC Technician', earnings: '₹45,000–₹75,000' },
    'electrician': { name: 'Electrician', earnings: '₹35,000–₹60,000' },
    'plumber': { name: 'Plumber', earnings: '₹30,000–₹55,000' },
    'carpenter': { name: 'Carpenter', earnings: '₹40,000–₹70,000' },
    'painter': { name: 'Painter', earnings: '₹35,000–₹65,000' },
    'cleaner': { name: 'Deep Cleaner', earnings: '₹25,000–₹50,000' },
  }

  const [mgPlans, setMgPlans] = useState([
   
  ])

  // Fetch MG Plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
          (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)
        const response = await fetch(`${API_BASE_URL}/api/partner/mg-plans/public`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && Array.isArray(result.data)) {
            // Map admin-configured plans dynamically
            const mappedPlans = result.data.map(plan => {
              // Determine icon based on plan name
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
              
              // Build features array
              const features = plan.features && Array.isArray(plan.features) && plan.features.length > 0
                ? plan.features
                : [
                    `${plan.leads || 0} Guaranteed Leads/month`,
                    `${plan.commission || 0}% Commission Rate`,
                    'Priority Support'
                  ]
              
              return {
                name: plan.name,
                price: plan.price || 0,
                leads: plan.leads || 0,
                commission: plan.commission || 0,
                icon: icon,
                features: features,
                partnerType: plan.partnerType || 'both'
              }
            })
            
            if (mappedPlans.length > 0) {
              setMgPlans(mappedPlans)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch MG plans:', err)
        // Use default plans if fetch fails
      }
    }
    fetchPlans()
  }, [])

  const benefits = [
    { icon: FaChartLine, text: 'High daily job volume', color: 'text-blue-500' },
    { icon: FaMoneyBillWave, text: 'Weekly payouts', color: 'text-green-500' },
    { icon: FaCheckCircle, text: 'Verified partner badge', color: 'text-purple-500' },
    { icon: FaBullseye, text: 'Priority support', color: 'text-orange-500' },
    { icon: FaGraduationCap, text: 'Free training', color: 'text-indigo-500' },
    { icon: FaBolt, text: 'Early payouts (Premium)', color: 'text-yellow-500' },
  ]

  const steps = [
    { step: '1', title: 'Complete Registration Form', description: 'Fill your details and choose trade', icon: FaFileAlt },
    { step: '2', title: 'Upload KYC Documents', description: 'Submit identity and bank documents', icon: FaIdCard },
    { step: '3', title: 'Complete Payment', description: 'Pay registration fee via WhatsApp Pay', icon: FaCreditCard },
    { step: '4', title: 'Get Verified & Start Earning', description: 'Approval and job access', icon: FaUserCheck },
  ]

  // Animation variants for background
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

  const particleVariants = {
    animate: {
      y: [0, -100, 0],
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <>
      <SEO 
        title="Become a Service Partner | Earn ₹25,000-₹70,000/month | Nexo"
        description="Join Nexo as a service partner. Earn ₹25,000 to ₹70,000 per month. High job volume, weekly payouts, verified badge, priority support, and free training. Start your partner journey today."
        keywords="service partner, technician jobs, partner program, earn money, service provider, home services partner, technician registration"
        url="/partner"
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
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-yellow-300/20 to-yellow-300/5 rounded-full blur-3xl"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1, duration: 5 }}
          />
          <motion.div
            className="absolute top-1/2 right-20 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2, duration: 6 }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-300/15 to-transparent rounded-full blur-xl"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 0.5, duration: 4.5 }}
          />

          {/* Small Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`small-${i}`}
              className="absolute rounded-full z-0"
              style={{
                width: `${6 + (i % 4) * 3}px`,
                height: `${6 + (i % 4) * 3}px`,
                left: `${3 + (i * 5) % 94}%`,
                top: `${8 + (i * 4) % 85}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
              }}
              animate={{
                y: [0, -150, 0],
                x: [0, (i % 2 === 0 ? 50 : -50), 0],
                opacity: [0.4, 0.8, 0.4],
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
              className="absolute rounded-full blur-sm z-0"
              style={{
                width: `${14 + (i % 3) * 4}px`,
                height: `${14 + (i % 3) * 4}px`,
                left: `${5 + (i * 8) % 90}%`,
                top: `${10 + (i * 6) % 80}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                y: [0, -120, 0],
                x: [0, (i % 2 === 0 ? 60 : -60), 0],
                opacity: [0.3, 0.6, 0.3],
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
              className="absolute rounded-full blur-2xl z-0"
              style={{
                width: `${100 + (i % 3) * 30}px`,
                height: `${100 + (i % 3) * 30}px`,
                left: `${8 + (i * 12) % 85}%`,
                top: `${12 + (i * 10) % 75}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, (i % 2 === 0 ? 60 : -60), 0],
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10 + (i % 3) * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}

          {/* Animated Wave Background */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-64 opacity-20"
            style={{
              background: 'linear-gradient(to top, rgba(255,255,255,0.1) 0%, transparent 100%)',
            }}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
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
                  className="bg-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center gap-3"
                >
                  <FaUserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                  Start Partner Registration
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Animated bottom wave */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-20 sm:h-24 bg-gray-50 pointer-events-none"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            style={{ marginBottom: 0 }}
          />
        </section>

        {/* What You Get */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
          {/* Subtle background animation */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(33, 74, 115, 0.1) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 80%, rgba(33, 74, 115, 0.1) 0%, transparent 50%)`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">What You Get</h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 sm:p-6 rounded-xl border border-primary/20 text-center"
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
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(33, 74, 115, 0.05) 50%, transparent 70%)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">Partner Earnings Calculator</h2>
              <p className="text-lg sm:text-xl text-gray-600">Select your category to see potential earnings</p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Select your category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 sm:p-4 border-2 border-primary rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary mb-6 sm:mb-8"
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
                  className="bg-gradient-to-r from-primary to-primary-dark text-white p-5 sm:p-6 rounded-xl text-center"
                >
                  <p className="text-base sm:text-lg mb-2">Approx earnings:</p>
                  <p className="text-3xl sm:text-4xl font-bold">{categories[selectedCategory].earnings}</p>
                  <p className="text-base sm:text-lg mt-2">per month</p>
                </motion.div>

                <div className="mt-6 sm:mt-8 text-center">
                  <div className="flex justify-center">
                    <motion.a
                      href="/partner/onboard"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <FaUserCheck className="w-5 h-5" />
                      Start Registration
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MG Plan */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(33, 74, 115, 0.1) 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">MG Plan</h2>
              
              {/* Partner Type Filter */}
              <div className="flex justify-center gap-2 sm:gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPartnerType('all')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all ${
                    selectedPartnerType === 'all'
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
                  }`}
                >
                  👥 All Plans
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPartnerType('individual')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all ${
                    selectedPartnerType === 'individual'
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
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
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
                  }`}
                >
                  🏢 Franchise
                </motion.button>
              </div>
            </motion.div>

            {mgPlans.filter(plan => {
              if (selectedPartnerType === 'all') return true
              return plan.partnerType === selectedPartnerType || plan.partnerType === 'both'
            }).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300"
              >
                <p className="text-gray-600 text-lg font-medium mb-2">No plans available</p>
                <p className="text-gray-500 text-sm">
                  No plans found for {selectedPartnerType === 'individual' ? 'Individual' : 'Franchise'} partners.
                </p>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {mgPlans
                  .filter(plan => {
                    if (selectedPartnerType === 'all') return true
                    return plan.partnerType === selectedPartnerType || plan.partnerType === 'both'
                  })
                  .map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 ${
                    plan.name === 'Platinum' ? 'border-primary scale-105 lg:scale-105 sm:scale-100' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{plan.icon}</div>
                    {plan.partnerType && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                        plan.partnerType === 'individual' 
                          ? 'bg-slate-100 text-slate-700' 
                          : plan.partnerType === 'franchise' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {plan.partnerType === 'individual' ? '👤 Individual' : 
                         plan.partnerType === 'franchise' ? '🏢 Franchise' : 
                         '👥 All Partners'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <FaCheckCircle className="text-green-500" />
                      <span>{plan.leads} Guaranteed Leads/month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <FaCheckCircle className="text-green-500" />
                      <span>{plan.commission}% Commission Rate</span>
                    </li>
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                        <FaCheckCircle className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.a
                    href="/partner/onboard"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block w-full text-center py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 ${
                      plan.name === 'Platinum'
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 text-primary hover:bg-gray-200'
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

        {/* How to Join */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(33, 74, 115, 0.1) 0%, transparent 100%)',
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">How to Join</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">Follow these simple steps to become a Nexo partner and start earning</p>
            </motion.div>

            {/* Enhanced Step Bar */}
            <div className="relative py-8">
              {/* Horizontal connecting line - Desktop with step-by-step fill */}
              <div className="hidden lg:block absolute top-[5.5rem] left-[12%] right-[12%] h-1.5 bg-gray-200 rounded-full overflow-hidden z-0" style={{ transform: 'translateY(-50%)' }}>
                {/* Base gray line */}
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                {/* Progressive fill segments - fills one by one after each step completes */}
                {steps.slice(0, -1).map((_, index) => {
                  const segmentWidth = 100 / (steps.length - 1)
                  const startPercent = (index * segmentWidth)
                  // Delay: step fill (0.8s) + icon appear (0.4s) + small gap (0.2s) = 1.4s per step
                  const baseDelay = index * 1.4
                  return (
                    <motion.div
                      key={index}
                      className="absolute h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full z-10"
                      style={{
                        left: `${startPercent}%`,
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${segmentWidth}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: baseDelay + 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  )
                })}
              </div>

              {/* Vertical connecting line - Mobile/Tablet with step-by-step fill */}
              <div className="lg:hidden absolute left-[2.5rem] sm:left-[3rem] top-[2.5rem] sm:top-[3rem] bottom-8 w-1 bg-gray-200 rounded-full overflow-hidden z-0" style={{ transform: 'translateX(-50%)' }}>
                {/* Base gray line */}
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                {/* Progressive fill segments - fills one by one after each step completes */}
                {steps.slice(0, -1).map((_, index) => {
                  const segmentHeight = 100 / (steps.length - 1)
                  const startPercent = (index * segmentHeight)
                  // Delay: step fill (0.8s) + icon appear (0.4s) + small gap (0.2s) = 1.4s per step
                  const baseDelay = index * 1.4
                  return (
                    <motion.div
                      key={index}
                      className="absolute w-full bg-gradient-to-b from-primary to-primary-dark rounded-full z-10"
                      style={{
                        top: `${startPercent}%`,
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${segmentHeight}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: baseDelay + 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  )
                })}
              </div>

              {/* Steps Container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                  const isLast = index === steps.length - 1
                  
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 1.4 }}
                    className="relative flex flex-col items-center"
                  >
                      {/* Step Circle Container */}
                      <div className="relative flex flex-col items-center w-full mb-6">
                        {/* Step Circle */}
                        <motion.div
                          whileHover={{ scale: 1.1, y: -5 }}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full shadow-2xl border-2 border-primary flex items-center justify-center group cursor-pointer transition-all duration-300"
                        >
                          {/* Step Number Badge - Positioned on right side */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 1.4 + 0.1, type: "spring", stiffness: 200 }}
                            className="absolute -right-1.5 -top-1.5 z-30 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-primary rounded-full flex items-center justify-center text-xs font-extrabold shadow-2xl border-2 border-white ring-2 ring-yellow-300/50"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                          >
                            <span className="drop-shadow-sm">{step.step}</span>
                            {/* Pulsing effect */}
                            <motion.div
                              className="absolute inset-0 rounded-full bg-yellow-400"
                              animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.6, 0, 0.6],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </motion.div>

                          {/* Outer animated ring */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-4 border-primary/20"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0, 0.3],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          
                          {/* Inner animated ring */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-4 border-primary/40"
                            animate={{
                              scale: [1, 1.15, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5,
                            }}
                          />
                          
                          {/* Step-by-step Fill Animation - Expanding from center */}
                          <motion.div
                            className="absolute inset-0 rounded-full overflow-hidden z-5"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ 
                              duration: 0.8, 
                              delay: index * 1.4,
                              ease: [0.16, 1, 0.3, 1] // Custom easing for smooth fill
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-primary via-primary-dark to-primary" />
                          </motion.div>

                          {/* Circular Progress Indicator - Shows fill progress */}
                          <motion.svg
                            className="absolute inset-0 w-full h-full transform -rotate-90 z-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 1.4 }}
                          >
                            <motion.circle
                              cx="50%"
                              cy="50%"
                              r="45%"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.3)"
                              strokeWidth="3"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                              whileInView={{ strokeDashoffset: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.8,
                                delay: index * 1.4,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.svg>

                          {/* Icon Background with Gradient - Fades in after fill */}
                          <motion.div
                            className="relative z-10 bg-gradient-to-br from-primary via-primary-dark to-primary rounded-full w-full h-full flex items-center justify-center shadow-inner"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ 
                              duration: 0.4, 
                              delay: index * 1.4 + 0.8,
                              ease: "easeOut"
                            }}
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              whileInView={{ scale: 1, rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ 
                                duration: 0.5, 
                                delay: index * 1.4 + 0.9,
                                type: "spring",
                                stiffness: 200
                              }}
                            >
                              <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
                            </motion.div>
                          </motion.div>

                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                        </motion.div>
                    </div>
                    
                      {/* Step Content */}
                      <div className="text-center px-2 mt-2">
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 1.4 + 1.0, ease: "easeOut" }}
                          className="text-xl sm:text-2xl font-bold text-primary mb-3"
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 1.4 + 1.2, ease: "easeOut" }}
                          className="text-sm sm:text-base text-gray-600 leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                    </div>
                    
                      {/* Connecting Arrow - Desktop only, between steps */}
                      {!isLast && (
                        <div className="hidden lg:block absolute top-[5.5rem] left-[calc(50%+3.5rem)] w-[calc(25%-4rem)] z-30" style={{ transform: 'translateY(-50%)' }}>
                          <motion.div
                            className="absolute right-0 top-1/2 -translate-y-1/2"
                            initial={{ opacity: 0, scale: 0, x: -20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                              duration: 0.5, 
                              delay: index * 1.4 + 0.8,
                              type: "spring",
                              stiffness: 150
                            }}
                          >
                            <svg className="w-6 h-6 text-primary drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        </div>
                      )}
                  </motion.div>
                )
              })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12 sm:mt-16"
            >
              <div className="flex justify-center">
                <motion.a
                  href="/partner/onboard"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all duration-300 shadow-lg flex items-center gap-3"
                >
                  <FaUserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  Start Partner Registration
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PartnerOnboarding
