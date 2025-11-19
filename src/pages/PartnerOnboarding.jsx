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
    {
      name: 'Silver',
      price: 1000,
      leads: 20,
      commission: 5,
      icon: '🥈',
      features: ['20 Guaranteed Leads/month', '5% Commission Rate', 'Priority Support']
    },
    {
      name: 'Gold',
      price: 2000,
      leads: 50,
      commission: 4,
      icon: '🥇',
      features: ['50 Guaranteed Leads/month', '4% Commission Rate', 'Priority Support', 'Weekly Reports']
    },
    {
      name: 'Platinum',
      price: 5000,
      leads: 150,
      commission: 3,
      icon: '💎',
      features: ['150 Guaranteed Leads/month', '3% Commission Rate', 'Premium Support', 'Daily Reports', 'Featured Listing']
    },
  ])

  // Fetch MG Plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Try to get plans without auth (public endpoint if available)
        // For now, use default plans
        // If you have a public endpoint, uncomment below:
        // const response = await partnerApi.getMGPlans(null)
        // if (response.success && response.data) {
        //   setMgPlans(response.data.map(plan => ({
        //     name: plan.name,
        //     price: plan.price,
        //     leads: plan.leads,
        //     commission: plan.commission,
        //     icon: plan.name === 'Silver' ? '🥈' : plan.name === 'Gold' ? '🥇' : '💎',
        //     features: plan.features || [
        //       `${plan.leads} Guaranteed Leads/month`,
        //       `${plan.commission}% Commission Rate`,
        //       'Priority Support'
        //     ]
        //   })))
        // }
      } catch (err) {
        console.error('Failed to fetch MG plans:', err)
        // Use default plans
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

        {/* Partner Subscription Plans */}
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
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">Partner Subscription Plans</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {mgPlans.map((plan, index) => (
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
                  <div className="text-4xl mb-3">{plan.icon}</div>
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
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="text-center relative"
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-2 -left-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg z-10">
                      {step.step}
                    </div>
                    
                    {/* Icon container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-8 sm:mt-12"
            >
              <div className="flex justify-center">
                <motion.a
                  href="/partner/onboard"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FaUserCheck className="w-5 h-5" />
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
