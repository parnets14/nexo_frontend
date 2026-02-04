import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaWhatsapp, 
  FaTools, 
  FaBolt, 
  FaCheckCircle, 
  FaRupeeSign, 
  FaCreditCard, 
  FaMobileAlt, 
  FaWrench,
  FaSnowflake,
  FaPaintRoller,
  FaHammer,
  FaTint,
  FaBroom,
  FaPlug,
  FaFilter,
  FaUserCheck,
  FaCommentDots,
  FaMapMarkerAlt,
  FaTimes,
  FaTag,
  FaGift
} from 'react-icons/fa'
import SEO from '../components/SEO'
import CitySelectionModal from '../components/CitySelectionModal'
import DiscountPopup from '../components/DiscountPopup'
import SpecialOfferPopup from '../components/SpecialOfferPopup'
import ReviewCarousel from '../components/ReviewCarousel'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'
import { useUserAuth } from '../context/UserAuthContext'
import cityService from '../services/cityService'
import { determineOfferToDisplay, getActiveBannerOffers } from '../utils/offerDisplayUtils'

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
  FaRupeeSign,
  FaCreditCard,
  FaMobileAlt,
  FaUserCheck,
  FaCommentDots
}

const getIconComponent = (iconName) => {
  return iconMap[iconName] || FaTools // Default icon if not found
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:9088' : window.location.origin)

const Home = () => {
  const handleWhatsAppClick = useWhatsAppClick()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUserAuth()
  const [popularServices, setPopularServices] = useState([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  const [showCityModal, setShowCityModal] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)
  const [showTopBanner, setShowTopBanner] = useState(true)
  const [activeOffers, setActiveOffers] = useState([])
  
  // Offer popup state
  const [offerToDisplay, setOfferToDisplay] = useState(null)
  const [showOfferPopup, setShowOfferPopup] = useState(false)

  useEffect(() => {
    // Check if city is already selected
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      const city = JSON.parse(savedCity);
      
      // Verify the city is still enabled using cached service
      const verifyCityStatus = async () => {
        try {
          const currentCity = await cityService.findCityById(city._id);
          
          // If city not found or disabled, clear it
          if (!currentCity || !currentCity.isEnabled) {
            localStorage.removeItem('selectedCity');
            setSelectedCity(null);
            setShowCityModal(true);
          } else {
            setSelectedCity(currentCity);
          }
        } catch (error) {
          console.error('Error verifying city status:', error);
          // Keep the saved city if API fails
          setSelectedCity(city);
        }
      };
      
      verifyCityStatus();
    } else {
      // Show city modal on first visit
      setTimeout(() => setShowCityModal(true), 1000);
    }
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityModal(false);
  };

  // Fetch active offers for banner and popup
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/offers`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // Get active offers for banner (all active offers)
          const bannerOffers = getActiveBannerOffers(result.data)
          setActiveOffers(bannerOffers)
          
          // Determine which offer type to display in popup
          const offerDisplay = determineOfferToDisplay(result.data)
          setOfferToDisplay(offerDisplay)
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      }
    }
    
    fetchOffers()
  }, [])

  // Show offer popup after 2 seconds delay
  useEffect(() => {
    if (offerToDisplay) {
      console.log('🎁 Setting timer to show offer popup in 2 seconds...')
      const timer = setTimeout(() => {
        console.log('🎁 Showing offer popup now!', offerToDisplay)
        setShowOfferPopup(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [offerToDisplay])

  // Periodic check to verify selected city is still enabled
  useEffect(() => {
    if (!selectedCity) return;

    const checkCityStatus = async () => {
      try {
        const isEnabled = await cityService.verifyCityStatus(selectedCity._id);
        
        // If city is disabled, clear selection and show modal
        if (!isEnabled) {
          localStorage.removeItem('selectedCity');
          setSelectedCity(null);
          alert('The selected city is no longer available. Please select another city.');
          setShowCityModal(true);
        }
      } catch (error) {
        console.error('Error checking city status:', error);
      }
    };

    // Check every 5 minutes (reduced frequency)
    const interval = setInterval(checkCityStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedCity]);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setIsLoadingServices(true)
        const response = await fetch(`${API_BASE_URL}/api/user/popular`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // Map the API data to include icon components
          const servicesWithIcons = result.data.map(service => ({
            ...service,
            icon: getIconComponent(service.icon)
          }))
          setPopularServices(servicesWithIcons)
        } else {
          // Fallback to default services if API fails
          setPopularServices([
            { name: 'AC Service', slug: 'ac-service', icon: FaSnowflake },
            { name: 'Electrical Work', slug: 'electrical-work', icon: FaBolt },
            { name: 'Plumbing', slug: 'plumbing', icon: FaTint },
            { name: 'Deep Cleaning', slug: 'deep-cleaning', icon: FaBroom },
            { name: 'Painting', slug: 'painting', icon: FaPaintRoller },
            { name: 'Appliance Repair', slug: 'appliance-repair', icon: FaTools },
            { name: 'Carpentry', slug: 'carpentry', icon: FaHammer },
            { name: 'Water Purifier Service', slug: 'water-purifier-service', icon: FaFilter },
          ])
        }
      } catch (error) {
        console.error('Error fetching popular services:', error)
        // Fallback to default services on error
        setPopularServices([
          { name: 'AC Service', slug: 'ac-service', icon: FaSnowflake },
          { name: 'Electrical Work', slug: 'electrical-work', icon: FaBolt },
          { name: 'Plumbing', slug: 'plumbing', icon: FaTint },
          { name: 'Deep Cleaning', slug: 'deep-cleaning', icon: FaBroom },
          { name: 'Painting', slug: 'painting', icon: FaPaintRoller },
          { name: 'Appliance Repair', slug: 'appliance-repair', icon: FaTools },
          { name: 'Carpentry', slug: 'carpentry', icon: FaHammer },
          { name: 'Water Purifier Service', slug: 'water-purifier-service', icon: FaFilter },
        ])
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchPopularServices()
  }, [])



  const whyChooseUs = [
    { icon: FaBolt, text: 'Response under 2 minutes', color: 'text-yellow-500' },
    { icon: FaCheckCircle, text: 'Verified technicians', color: 'text-green-500' },
    { icon: FaRupeeSign, text: 'Fixed pricing', color: 'text-blue-500' },
    { icon: FaCreditCard, text: 'Pay First, Relax Later', color: 'text-purple-500' },
    { icon: FaMobileAlt, text: '24x7 WhatsApp support', color: 'text-green-600' },
    { icon: FaWrench, text: 'Free rework within 72 hours', color: 'text-orange-500' },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Tell us your requirement on WhatsApp',
      description: 'Just message your problem. Our AI assistant handles the rest.',
      icon: FaCommentDots,
    },
    {
      step: '2',
      title: 'Get the right technician',
      description: 'We assign a verified, background-checked expert near you.',
      icon: FaUserCheck,
    },
    {
      step: '3',
      title: 'Pay First, Relax Later Confirmed Service With Guaranteed Slot',
      description: 'Simple, transparent, and satisfaction guaranteed.',
      icon: FaCreditCard,
    },
  ]

  const [reviews, setReviews] = useState([
    { text: 'Fast service and clean work.', author: 'Rajesh K.', rating: 5 },
    { text: 'Great response time. Loved it.', author: 'Priya M.', rating: 5 },
    { text: 'Technician was polite and professional.', author: 'Amit S.', rating: 5 },
  ])

  // Fetch featured reviews from backend
  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:9088'
        const response = await fetch(`${apiUrl}/api/public/featured-reviews`)
        const data = await response.json()
        
        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Transform backend data to match frontend format
          const transformedReviews = data.data.map(review => ({
            text: review.text,
            author: review.author,
            rating: review.rating || 5
          }))
          setReviews(transformedReviews)
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error)
        // Keep default reviews on error
      }
    }

    fetchFeaturedReviews()
  }, [])

  // Enhanced animation variants
  const bannerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

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

  // Particle animation for background
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
        title="Nexo - Home Services on WhatsApp | AC, Electrical, Plumbing & More"
        description="Fast, reliable and affordable home services from verified experts. Book AC service, electrical work, plumbing, cleaning, and 200+ services on WhatsApp. Response under 2 minutes. Verified technicians. Pay First, Relax Later."
        keywords="home services, AC service, electrical work, plumbing, cleaning services, WhatsApp booking, verified technicians, home maintenance, appliance repair, carpentry, painting services"
        url="/"
      />
      
      {/* City Selection Modal */}
      <CitySelectionModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        onCitySelect={handleCitySelect}
      />
      
      {/* Offer Popups - Only one will show based on offer type */}
      {showOfferPopup && offerToDisplay && (
        <>
          {offerToDisplay.type === 'special' ? (
            <SpecialOfferPopup 
              offer={offerToDisplay.data} 
              onClose={() => setShowOfferPopup(false)} 
            />
          ) : (
            <DiscountPopup 
              offers={offerToDisplay.data} 
              onClose={() => setShowOfferPopup(false)} 
            />
          )}
        </>
      )}
      
      {/* Top Offer Banner - Always Visible */}
      <AnimatePresence>
        {showTopBanner && activeOffers.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
              {/* Mobile Layout */}
              <div className="flex md:hidden items-center justify-between gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <FaGift className="w-5 h-5" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight truncate">
                    🎉 {activeOffers[0].offerTitle}
                  </p>
                  <p className="text-xs opacity-90 truncate">
                    {activeOffers[0].discount}% OFF - Code: <span className="font-black">{activeOffers[0].couponCode}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setShowOfferPopup(true)}
                    className="bg-white text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-orange-50 transition-all whitespace-nowrap"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setShowTopBanner(false)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                    aria-label="Close banner"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0"
                  >
                    <FaGift className="w-6 h-6" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg lg:text-xl leading-tight">
                      🎉 {activeOffers[0].offerTitle} - Get {activeOffers[0].discount}% OFF!
                    </p>
                    <p className="text-sm opacity-90 mt-0.5">
                      Use code: <span className="font-black bg-white/20 px-2 py-1 rounded">{activeOffers[0].couponCode}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => setShowOfferPopup(true)}
                    className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold hover:bg-orange-50 hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <FaTag className="w-4 h-4" />
                    View Offer
                  </button>
                  <button
                    onClick={() => setShowTopBanner(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    aria-label="Close banner"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="overflow-x-hidden w-full max-w-full">
        {/* Enhanced Hero Section with Professional Background Animations */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden w-full max-w-full pt-20" style={{ marginTop: showTopBanner && activeOffers.length > 0 ? '80px' : '0' }}>
          {/* Animated Background Pattern with Motion */}
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
        
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              variants={bannerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
              >
                Your Home services.
                <br />
                <motion.span 
                  className="text-yellow-300 inline-block"
                  variants={itemVariants}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Now on WhatsApp.
                </motion.span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
              >
                Fast, reliable and affordable service from verified experts.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
              >
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-[#25D366]/50 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
                  Book on WhatsApp
                </motion.button>
                <motion.a
                  href="/partner/onboard"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-white/50 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Become a Partner
                </motion.a>
              </motion.div>
              
              <motion.p 
                variants={itemVariants}
                className="text-white/80 mt-6 sm:mt-8 text-sm sm:text-lg px-4"
              >
                Support for AC, Electrical, Plumbing, Cleaning, Appliances and 200+ Services.
              </motion.p>

              {/* City Selection Card */}
              <motion.div 
                variants={itemVariants}
                className="mt-8 sm:mt-10 px-4 flex justify-center"
              >
                <motion.button
                  onClick={() => setShowCityModal(true)}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white/95 backdrop-blur-md text-gray-900 px-8 py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-white transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-white/30 border border-white/50 overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon with animation */}
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="relative z-10"
                  >
                    <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  
                  {/* Text content */}
                  <div className="relative z-10 flex flex-col items-start">
                    <span className="text-xs text-gray-500 font-normal">Service Location</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {selectedCity ? selectedCity.name : 'Select Your City'}
                    </span>
                  </div>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10 ml-2"
                  >
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated bottom wave */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-20 sm:h-24 bg-white pointer-events-none"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            style={{ marginBottom: 0 }}
          />
        </section>

        {/* How It Works - Fixed Icon Display */}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">How It Works</h2>
              <p className="text-lg sm:text-xl text-gray-600">Simple steps to get your service done</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {howItWorks.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8 rounded-2xl border border-primary/20 hover:shadow-xl transition-all duration-300 relative"
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    
                    {/* Icon container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4 text-center">{item.title}</h3>
                    <p className="text-gray-600 text-base sm:text-lg text-center">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-8 sm:mt-12"
            >
              <div className="flex justify-center">
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Start on WhatsApp
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Popular Services */}
        <section id="services" className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
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
              className="text-center mb-12 sm:mb-16"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent mb-3 sm:mb-4">
                  Popular Services
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-dark mx-auto mb-4 rounded-full"></div>
              </motion.div>
              <p className="text-lg sm:text-xl text-gray-600">Choose from our wide range of professional services</p>
            </motion.div>

            {isLoadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 animate-pulse"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {popularServices.map((service, index) => {
                  const IconComponent = service.icon
                  return (
                    <Link 
                      key={service.slug || service._id || index}
                      to={`/service/${service.slug}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ 
                          y: -8, 
                          scale: 1.03,
                          rotateY: 5,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        className="group relative bg-gradient-to-br from-white via-white to-gray-50/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-primary/60 cursor-pointer overflow-hidden h-full transform-gpu"
                      >
                        {/* Enhanced background gradient with hover animation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/5 opacity-100 group-hover:from-primary/8 group-hover:to-primary/12 transition-all duration-500" />
                        
                        {/* Animated decorative elements */}
                        <motion.div 
                          className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full opacity-60"
                          whileHover={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.6, 0.9, 0.6]
                          }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <motion.div 
                          className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full opacity-40"
                          whileHover={{ 
                            scale: [1, 1.3, 1],
                            x: [0, 5, 0],
                            y: [0, -5, 0]
                          }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />

                        {/* Floating particles on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-primary/40 rounded-full"
                              style={{
                                left: `${15 + (i * 10)}%`,
                                top: `${20 + (i * 8)}%`,
                              }}
                              animate={{
                                y: [0, -30, 0],
                                x: [0, (i % 2 === 0 ? 10 : -10), 0],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.5, 1],
                              }}
                              transition={{
                                duration: 2 + (i * 0.2),
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>

                        {/* Pulsing border effect */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-pulse" />
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                          {/* Enhanced Icon container with multiple hover effects */}
                          <motion.div 
                            className="relative w-20 h-20 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-primary/10 group-hover:shadow-2xl group-hover:shadow-primary/20"
                            whileHover={{ 
                              scale: 1.1, 
                              rotate: [0, -5, 5, 0],
                              transition: { duration: 0.5 }
                            }}
                          >
                            {/* Enhanced icon background glow with animation */}
                            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg group-hover:bg-primary/25 group-hover:blur-xl transition-all duration-500" />
                            
                            {/* Rotating ring effect */}
                            <motion.div
                              className="absolute inset-0 rounded-2xl border-2 border-primary/20 opacity-0 group-hover:opacity-100"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            
                            {/* Icon with enhanced hover animation */}
                            <motion.div
                              whileHover={{ 
                                scale: 1.2,
                                rotate: [0, 10, -10, 0],
                                transition: { duration: 0.4 }
                              }}
                            >
                              <IconComponent className="w-10 h-10 text-primary relative z-10 group-hover:text-primary-dark transition-colors duration-300" />
                            </motion.div>

                            {/* Corner sparkle effect */}
                            <motion.div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                              animate={{
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </motion.div>
                          
                          {/* Service Name with enhanced hover animation */}
                          <motion.h3 
                            className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-primary transition-all duration-300 line-clamp-2 mb-3 leading-tight"
                            whileHover={{ scale: 1.05 }}
                          >
                            {service.name}
                          </motion.h3>

                          {/* Service description with fade-in animation */}
                          <motion.p 
                            className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-700 mb-4 leading-relaxed transition-all duration-300"
                            whileHover={{ y: -2 }}
                          >
                            Professional & Reliable Service
                          </motion.p>

                          {/* Enhanced View Button with multiple hover effects */}
                          <motion.div 
                            className="w-full mt-auto"
                            whileHover={{ scale: 1.02 }}
                          >
                            <motion.div 
                              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-primary/10 group-hover:to-primary/20 text-gray-700 group-hover:text-primary text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg border border-gray-300 group-hover:border-primary/40"
                              whileHover={{ 
                                y: -2,
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                              }}
                            >
                              <motion.svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                transition={{ duration: 0.2 }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </motion.svg>
                              <span>View Details</span>
                              <motion.div
                                className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Enhanced bottom accent line with animation */}
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 group-hover:h-2 group-hover:from-primary/50 group-hover:via-primary group-hover:to-primary/50 transition-all duration-500"
                          whileHover={{
                            scaleX: [1, 1.05, 1],
                            transition: { duration: 0.5 }
                          }}
                        />
                        
                        {/* Enhanced shine effect with multiple layers */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1200" />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-yellow-400/5 transform translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[100%] group-hover:translate-y-[100%] transition-transform duration-1500" />
                        </div>

                        {/* Subtle glow effect around the entire card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">Why Choose Us</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {whyChooseUs.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center gap-3 sm:gap-4 bg-gray-50 p-4 sm:p-6 rounded-xl hover:bg-primary/5 transition-all duration-300"
                  >
                    <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${item.color} flex-shrink-0`} />
                    <span className="text-base sm:text-lg font-semibold text-gray-800">{item.text}</span>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-8 sm:mt-12"
            >
              <div className="flex justify-center">
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Book Your Service
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>



        {/* AMC Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H0v-2h22zm0 0v2H0v-2h22z'/%3E%3C/g%3E%3C/svg%3E")`,
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
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">AMC for PGs, Clinics, Shops & Apartments</h2>
                <p className="text-lg sm:text-xl mb-4 sm:mb-6 text-white/90">
                  Electrical + Plumbing + AC Maintenance + Repairs
                </p>
                <p className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Starting ₹2,500/month</p>
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleWhatsAppClick}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Get AMC Quote on WhatsApp
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Customer Reviews */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(33, 74, 115, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(33, 74, 115, 0.1) 0%, transparent 50%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10,
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">Customer Reviews</h2>
            </motion.div>

            <ReviewCarousel reviews={reviews} variant="home" />
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
