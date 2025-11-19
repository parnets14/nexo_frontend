import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import SEO from '../components/SEO'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'

const MaterialStore = () => {
  const whatsappNumber = "919590926068"
  const handleWhatsAppClick = useWhatsAppClick()
  const [materialCategories, setMaterialCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch material categories from API
  useEffect(() => {
    const fetchMaterialCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || 'https://nexo.works'
        const response = await fetch(`${apiUrl}/api/public/material-categories`)
        const data = await response.json()
        
        if (data?.success && data?.data && Array.isArray(data.data)) {
          // Transform backend data to match frontend format
          const transformedCategories = data.data.map(category => ({
            name: category.name,
            icon: category.icon,
            items: category.items || []
          }))
          setMaterialCategories(transformedCategories)
        } else {
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
        console.error('Error fetching material categories:', error)
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
        title="Materials for Technicians | Order Materials on WhatsApp | Nexo"
        description="Order materials instantly on WhatsApp. Plumbing materials, switchboards, cables, painting supplies, AC gas, hardware items. Best prices, instant delivery, quality assured."
        keywords="technician materials, plumbing materials, electrical supplies, painting supplies, AC gas, hardware items, material store"
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
              Order materials instantly on WhatsApp
            </p>
            <div className="flex justify-center">
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-[#25D366]/50 transition-all duration-300 flex items-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
                Order Materials on WhatsApp
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
              <p className="text-xl text-gray-500">No materials available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {materialCategories.map((category, index) => (
                <motion.div
                  key={`${category.name}-${index}`}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300"></div>
                  
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative p-6 lg:p-8">
                    {/* Icon Container */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="mb-6 flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300"
                    >
                      <span className="text-5xl">{category.icon}</span>
                    </motion.div>

                    {/* Category Name */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-6 text-center group-hover:text-primary-dark transition-colors">
                      {category.name}
                    </h3>

                    {/* Items List */}
                    <div className="mb-8 min-h-[120px]">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {category.items.map((item, idx) => (
                          <motion.span
                            key={`${item}-${idx}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.1 + idx * 0.05 
                            }}
                            whileHover={{ scale: 1.1 }}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-semibold rounded-full border border-primary/20 hover:border-primary/40 hover:from-primary/20 hover:to-primary/10 transition-all duration-200 shadow-sm"
                          >
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      {item}
                          </motion.span>
                  ))}
                      </div>
                    </div>

                    {/* Order Button */}
                <motion.button
                  onClick={handleWhatsAppClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      <FaWhatsapp className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Order on WhatsApp</span>
                </motion.button>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:to-blue-400/10 transition-all duration-500 rounded-3xl"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-300/50 via-transparent to-blue-300/50 animate-pulse"></div>
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
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-300/30 to-blue-500/20 rounded-2xl flex items-center justify-center border-2 border-blue-300/30 group-hover:border-blue-300/50 transition-all duration-300">
                  <span className="text-6xl">✅</span>
                </div>
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-blue-200 transition-colors duration-300">
                Quality Assured
              </h3>
              <p className="text-white/80 leading-relaxed text-lg relative z-10">
                Verified and tested materials only - quality you can trust
              </p>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default MaterialStore

