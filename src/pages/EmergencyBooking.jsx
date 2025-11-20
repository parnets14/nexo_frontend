import React from 'react'
import { motion } from 'framer-motion'
import { FaShoppingCart, FaBolt, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import SEO from '../components/SEO'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'

const EmergencyBooking = () => {
  const whatsappNumber = "919590926068"
  const handleWhatsAppClick = useWhatsAppClick()
  const features = [
    { icon: '⚡', text: 'Service in 20–40 minutes' },
    { icon: '🌙', text: 'Available 24/7' },
    { icon: '✅', text: 'Verified emergency technicians' },
    { icon: '💰', text: 'You keep 50% commission' },
  ]

  const emergencyTypes = [
    { name: 'Electrical Emergency', icon: '⚡', description: 'Power outage, short circuit, electrical fire risk' },
    { name: 'Plumbing Emergency', icon: '💧', description: 'Burst pipe, severe leak, blocked drain' },
    { name: 'AC Emergency', icon: '❄️', description: 'AC breakdown, gas leak, compressor failure' },
    { name: 'Lockout Emergency', icon: '🔒', description: 'Locked out, broken lock, key stuck' },
  ]

  return (
    <>
      <SEO 
        title="Emergency Service in 20-40 Minutes | 24/7 Available | Nexo"
        description="Emergency home service available 24/7. Get help in 20-40 minutes for electrical, plumbing, AC, and lockout emergencies. Response under 2 minutes. Verified technicians."
        keywords="emergency service, 24/7 service, urgent repair, emergency plumber, emergency electrician, midnight service, emergency AC repair"
        url="/emergency"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section with Professional Background Animations */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
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
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl sm:text-6xl mb-4"
            >
              🚨
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">Emergency Service</h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-2">in 20–40 minutes</p>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90">For midnight or urgent needs</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto mb-6 sm:mb-8">
              <p className="text-base sm:text-lg mb-2">Emergency Charge: ₹199–499</p>
              <p className="text-base sm:text-lg">You keep 50 percent commission</p>
            </div>
            <div className="flex justify-center">
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 flex items-center gap-2"
              >
                <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-current" />
                Book Now
              </motion.button>
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

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Why Choose Emergency Service</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 text-center"
              >
                <span className="text-5xl mb-4 block">{feature.icon}</span>
                <p className="text-lg font-semibold text-gray-800">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Emergency Types</h2>
            <p className="text-xl text-gray-600">We handle all types of emergencies</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {emergencyTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{type.icon}</span>
                  <h3 className="text-2xl font-bold text-primary">{type.name}</h3>
                </div>
                <p className="text-gray-600 text-lg">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Need Help Right Now?</h2>
            <p className="text-xl mb-8 text-white/90">Our emergency team is ready 24/7</p>
            <div className="flex justify-center">
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/50 flex items-center gap-2"
              >
                <FaShoppingCart className="w-5 h-5 text-current" />
                Book Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  )
}

export default EmergencyBooking

