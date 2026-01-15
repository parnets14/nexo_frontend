import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaFileAlt } from 'react-icons/fa'
import SEO from '../components/SEO'

const LeadMarketplace = () => {
  const navigate = useNavigate()
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [subServices, setSubServices] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    service: '',
    subService: '',
    city: '',
    address: '',
    landmark: '',
    pincode: '',
    description: '',
    estimatedBudget: ''
  })

  // Fetch categories from public service hierarchy endpoint
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const apiUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:5173'
        const response = await fetch(`${apiUrl}/api/public/service-hierarchy`)
        const data = await response.json()
        
        console.log('Service hierarchy response:', data)
        
        if (data?.success && data?.data?.categories) {
          // Transform the hierarchy data to match the expected format
          const categoriesList = data.data.categories
            .filter(cat => cat.isActive !== false) // Only show active categories
            .map(cat => ({
              _id: cat._id,
              name: cat.name,
              icon: cat.icon, // Make sure icon is included
              description: cat.description,
              services: cat.services || []
            }))
          setCategories(categoriesList)
          console.log('Categories loaded:', categoriesList.length)
          console.log('Categories with icons:', categoriesList.map(c => ({ name: c.name, icon: c.icon })))
        } else if (data?.data && Array.isArray(data.data)) {
          // Handle case where data is directly an array
          const categoriesList = data.data.map(cat => ({
            _id: cat._id,
            name: cat.name,
            icon: cat.icon,
            description: cat.description,
            services: cat.services || []
          }))
          setCategories(categoriesList)
        } else {
          console.warn('Unexpected data format:', data)
          setCategories([])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        // Fallback to empty array on error
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setEnquiryForm(prev => ({ ...prev, category: categoryId, service: '', subService: '' }))
    setServices([])
    setSubServices([])
    
    if (categoryId) {
      const category = categories.find(c => c._id === categoryId)
      if (category?.services) {
        setServices(category.services || [])
      }
    }
  }

  // Handle service change
  const handleServiceChange = (serviceId) => {
    setEnquiryForm(prev => ({ ...prev, service: serviceId, subService: '' }))
    setSubServices([])
    
    if (serviceId) {
      const service = services.find(s => s._id === serviceId)
      if (service?.subServices) {
        setSubServices(service.subServices || [])
      }
    }
  }

  // Handle form submission
  const handleSubmitEnquiry = async (e) => {
    e.preventDefault()
    
    if (!enquiryForm.name || !enquiryForm.phone || !enquiryForm.category || !enquiryForm.city) {
      alert('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const apiUrl = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:5173'
      const response = await fetch(`${apiUrl}/api/public/submit-service-enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enquiryForm)
      })

      const data = await response.json()
      
      console.log('Enquiry submission response:', data)
      
      if (data.success) {
        alert('Service enquiry submitted successfully! We will contact you soon.')
        setShowEnquiryModal(false)
        setEnquiryForm({
          name: '',
          phone: '',
          email: '',
          category: '',
          service: '',
          subService: '',
          city: '',
          address: '',
          landmark: '',
          pincode: '',
          description: '',
          estimatedBudget: ''
        })
        // Reset services and subServices
        setServices([])
        setSubServices([])
      } else {
        alert(data.message || 'Failed to submit enquiry. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting enquiry:', err)
      alert('Failed to submit enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Remove static categories - we'll use dynamic categories from admin


  const howItWorks = [
    {
      step: '1',
      title: 'Customer messages on WhatsApp',
      description: 'Verified customer sends requirement',
    },
    {
      step: '2',
      title: 'We verify the requirement',
      description: 'Quality check and validation',
    },
    {
      step: '3',
      title: 'Lead is shared with max 3 partners',
      description: 'Fair distribution to qualified partners',
    },
    {
      step: '4',
      title: 'You pay per lead',
      description: 'Only pay for genuine, verified leads',
    },
  ]

  return (
    <>
      <SEO 
        title="Get Verified Leads for Your Business | Lead Marketplace | Nexo"
        description="Buy verified leads for your business. Pay only for genuine leads. Categories: Painting, Carpentry, Renovation, AC Installation, Electrical Wiring, Plumbing Projects, Waterproofing."
        keywords="business leads, verified leads, service leads, contractor leads, lead generation, buy leads, qualified leads"
        url="/leads"
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Get Verified Leads for Your Business</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90">Pay only for genuine leads</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                onClick={() => navigate('/partner/onboard?from=leadsneed')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-white/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                I am Looking for Leads
              </motion.button>
              <motion.button
                onClick={() => setShowEnquiryModal(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-[#25D366]/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
                I am Looking for Service
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

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Categories</h2>
            <p className="text-xl text-gray-600">Choose from various service categories</p>
          </motion.div>

          {loadingCategories ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl animate-pulse"
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mx-auto w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl border border-primary/20 text-center cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowEnquiryModal(true)}
                  >
                    <span className="text-5xl mb-4 block">{category.icon || '🔧'}</span>
                    <h3 className="text-xl font-bold text-primary">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg">No categories available at the moment</p>
                  <p className="text-gray-400 text-sm mt-2">Categories will appear here once added by admin</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">How it Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                onClick={() => navigate('/partner/onboard?from=leadsneed')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                I am Looking for Leads
              </motion.button>
              <motion.button
                onClick={() => setShowEnquiryModal(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-[#20ba5a] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5" />
                Submit Service Enquiry
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Enquiry Modal */}
      <AnimatePresence>
        {showEnquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
            onClick={() => setShowEnquiryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5" />
                  Submit Service Enquiry
                </h2>
                <button
                  onClick={() => setShowEnquiryModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <FaTimes className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmitEnquiry} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaUser className="w-4 h-4 inline mr-1" />
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaPhone className="w-4 h-4 inline mr-1" />
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaEnvelope className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaMapMarkerAlt className="w-4 h-4 inline mr-1" />
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.city}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, city: e.target.value }))}
                      required
                      placeholder="Enter your city"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={enquiryForm.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {services.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Service
                      </label>
                      <select
                        value={enquiryForm.service}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Service</option>
                        {services.map(svc => (
                          <option key={svc._id} value={svc._id}>{svc.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {subServices.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Sub Service
                      </label>
                      <select
                        value={enquiryForm.subService}
                        onChange={(e) => setEnquiryForm(prev => ({ ...prev, subService: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Sub Service</option>
                        {subServices.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaMapMarkerAlt className="w-4 h-4 inline mr-1" />
                      Address
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.address}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.landmark}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="Enter landmark"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.pincode}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Enter pincode"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estimated Budget (₹)
                    </label>
                    <input
                      type="number"
                      value={enquiryForm.estimatedBudget}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                      placeholder="Enter estimated budget"
                      min="0"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaFileAlt className="w-4 h-4 inline mr-1" />
                      Description
                    </label>
                    <textarea
                      value={enquiryForm.description}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your service requirement in detail"
                      rows="4"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="w-4 h-4" />
                        Submit Enquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}

export default LeadMarketplace
