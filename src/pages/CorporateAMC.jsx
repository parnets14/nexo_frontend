import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaShieldAlt, 
  FaClock, 
  FaTools, 
  FaHeadset, 
  FaAward,
  FaPhone,
  FaChartLine,
  FaHandshake,
  FaLightbulb,
  FaCog,
  FaHome,
  FaUsers,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import SEO from '../components/SEO';
import PaymentGateway from '../components/PaymentGateway';
import { useUserAuth } from '../context/UserAuthContext';
import { getIconComponent } from '../utils/iconMapper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);

const CorporateAMC = () => {
  const [amcPlans, setAmcPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const whatsappNumber = "+15558136145";
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserAuth();

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Plans', icon: FaFilter, color: 'bg-gray-100 text-gray-700' },
    { id: 'individual', label: 'Individual', icon: FaHome, color: 'bg-green-100 text-green-700' },
    { id: 'business', label: 'Business', icon: FaUsers, color: 'bg-blue-100 text-blue-700' },
    { id: 'corporate', label: 'Corporate', icon: FaBuilding, color: 'bg-purple-100 text-purple-700' }
  ];

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        console.log('Fetching services from:', `${API_BASE_URL}/api/public/popular-services`);
        const response = await fetch(`${API_BASE_URL}/api/public/popular-services`);
        const result = await response.json();
        
        console.log('Services API response:', result);
        
        if (result.success && result.data) {
          console.log('Services loaded:', result.data.length, 'services');
          setServices(result.data);
        } else {
          console.log('No services found or API error:', result);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch AMC plans from backend
  useEffect(() => {
    const fetchAMCPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/amc-plans`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setAmcPlans(result.data);
          setFilteredPlans(result.data); // Initially show all plans
        }
      } catch (error) {
        console.error('Error fetching AMC plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAMCPlans();
  }, []);

  // Filter plans based on selected filter and services
  useEffect(() => {
    let filtered = amcPlans;

    // Filter by plan type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(plan => 
        plan.planType?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Filter by selected services
    if (selectedServices.length > 0) {
      filtered = filtered.filter(plan => {
        if (!plan.includedServices || plan.includedServices.length === 0) return false;
        
        return selectedServices.some(serviceId => 
          plan.includedServices.some(includedService => 
            (typeof includedService === 'object' ? includedService._id : includedService) === serviceId
          )
        );
      });
    }

    setFilteredPlans(filtered);
  }, [selectedFilter, amcPlans, selectedServices]);

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
  };

  // Handle service filter change
  const handleServiceFilterChange = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Clear service filters
  const clearServiceFilters = () => {
    setSelectedServices([]);
  };

  // Toggle card expansion
  const toggleCardExpansion = (planId) => {
    setExpandedCards(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const handlePlanClick = (plan) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      alert('Please login to proceed with payment');
      navigate('/user-login');
      return;
    }

    // User is logged in, show payment gateway
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleWhatsAppClick = (plan = null) => {
    let message = "Hi! I'm interested in Nexo's Corporate AMC services.";
    
    if (plan) {
      message += ` I would like to know more about the ${plan.name} plan (₹${plan.price.toLocaleString('en-IN')}).`;
    } else {
      message += " Could you please provide more details about your AMC packages?";
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.aisensy.com/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setShowPayment(false);
    setSelectedPlan(null);
    
    // Show success message
    alert(`Payment successful! Your ${selectedPlan?.name} AMC plan is now active.`);
    
    // Optionally redirect to payment result page
    navigate('/payment-result?status=success&txnid=' + paymentData.txnid);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setShowPayment(false);
    alert('Payment failed. Please try again or contact support.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  const benefits = [
    {
      icon: FaShieldAlt,
      title: "Guaranteed Service",
      description: "24/7 priority support with guaranteed response times"
    },
    {
      icon: FaClock,
      title: "Scheduled Maintenance",
      description: "Regular preventive maintenance to avoid breakdowns"
    },
    {
      icon: FaTools,
      title: "Expert Technicians",
      description: "Certified professionals with years of experience"
    },
    {
      icon: FaHeadset,
      title: "Dedicated Support",
      description: "Dedicated account manager for your business needs"
    },
    {
      icon: FaAward,
      title: "Quality Assurance",
      description: "100% satisfaction guarantee on all services"
    },
    {
      icon: FaChartLine,
      title: "Cost Savings",
      description: "Up to 40% savings compared to ad-hoc repairs"
    }
  ];

  const serviceTypes = [
    {
      icon: FaCog,
      title: "AC Maintenance",
      description: "Complete AC servicing, cleaning, and repairs"
    },
    {
      icon: FaLightbulb,
      title: "Electrical Services",
      description: "Electrical maintenance, wiring, and installations"
    },
    {
      icon: FaTools,
      title: "Plumbing Services",
      description: "Plumbing repairs, maintenance, and installations"
    },
    {
      icon: FaHandshake,
      title: "General Maintenance",
      description: "Carpentry, painting, and general facility maintenance"
    }
  ];

  return (
    <>
      <SEO 
        title="Corporate AMC Plans | Nexo - Annual Maintenance Contracts for Businesses"
        description="Comprehensive Annual Maintenance Contract (AMC) plans for businesses. Get priority support, scheduled maintenance, and cost-effective solutions for your company's facility management needs."
        keywords="corporate AMC, annual maintenance contract, business maintenance, facility management, corporate services, AMC plans"
        url="/corporate-amc"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Payment Gateway Modal */}
        {showPayment && selectedPlan && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full"
            >
              <PaymentGateway
                amount={selectedPlan.price}
                orderData={{
                  productinfo: `${selectedPlan.name} AMC Plan`,
                  userId: user?._id || user?.userId
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
                title={`Pay for ${selectedPlan.name}`}
                description={`Annual Maintenance Contract - ${selectedPlan.name}`}
              />
            </motion.div>
          </div>
        )}
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-16 lg:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            />
          </div>

          {/* Animated Background Elements */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl"
            animate={{
              y: [0, 20, 0],
              x: [0, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
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
                className="inline-block mb-6"
              >
                <FaBuilding className="w-16 h-16 text-yellow-300" />
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Corporate AMC Plans
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-yellow-300 font-semibold">
                Annual Maintenance Contracts for Your Business
              </p>
              <p className="text-lg mb-10 max-w-3xl mx-auto text-white/90">
                Comprehensive facility maintenance solutions designed for businesses. 
                Get priority support, scheduled maintenance, and significant cost savings with our AMC plans.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <motion.button
                  onClick={() => handleWhatsAppClick()}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  Get Quote on WhatsApp
                </motion.button>
                <motion.button
                  onClick={() => {
                    const plansSection = document.querySelector('#amc-plans');
                    plansSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold border border-white/40 hover:bg-white/30 transition-all duration-300"
                >
                  View Plans
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Nexo AMC?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our Annual Maintenance Contracts provide comprehensive coverage and peace of mind for your business operations
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Covered Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Services Covered
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive maintenance services for all your business facility needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {serviceTypes.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AMC Plans Section */}
        <section id="amc-plans" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your AMC Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Flexible plans designed to meet different business needs and budgets
              </p>

              {/* Plan Type Filter Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3 mb-8"
              >
                {filterOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedFilter === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleFilterChange(option.id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                        isSelected
                          ? 'bg-primary text-white shadow-lg transform scale-105'
                          : `${option.color} hover:shadow-md`
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{option.label}</span>
                      {option.id !== 'all' && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/60 text-gray-700'
                        }`}>
                          {amcPlans.filter(plan => plan.planType?.toLowerCase() === option.id.toLowerCase()).length}
                        </span>
                      )}
                      {option.id === 'all' && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/60 text-gray-700'
                        }`}>
                          {amcPlans.length}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Services Filter Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Filter by Services</h3>
                  <p className="text-gray-600">Select services to find AMC plans that include them</p>
                </div>

                {servicesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-600">Loading services...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8">
                    <FaTools className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Services Available</h4>
                    <p className="text-gray-600 mb-4">Services will be displayed here once they are added to the system.</p>
                    <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3 max-w-md mx-auto">
                      <p><strong>Debug Info:</strong></p>
                      <p>API Endpoint: {API_BASE_URL}/api/public/popular-services</p>
                      <p>Services Loading: {servicesLoading ? 'Yes' : 'No'}</p>
                      <p>Services Array Length: {services.length}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Services Button Grid */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {services.map((service, index) => {
                        const isSelected = selectedServices.includes(service._id);
                        const IconComponent = getIconComponent(service.icon);
                        
                        return (
                          <motion.button
                            key={service._id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleServiceFilterChange(service._id)}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
                              isSelected
                                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-primary/30'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                            }`}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <FaCheckCircle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                            
                            {/* Service Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${
                                isSelected ? 'text-white' : 'text-primary'
                              }`} />
                            </div>
                            
                            {/* Service Name */}
                            <span className="text-sm font-semibold">
                              {service.name}
                            </span>
                            
                            {/* Service Price (if available) */}
                            {service.price && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isSelected 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {service.price}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Filter Results Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 mb-4 text-center"
              >
                <div className="space-y-1">
                  {selectedFilter === 'all' ? (
                    <span>Showing all {filteredPlans.length} AMC plans</span>
                  ) : (
                    <span>
                      Showing {filteredPlans.length} {selectedFilter} plan{filteredPlans.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  
                  {selectedServices.length > 0 && (
                    <div className="text-xs text-primary font-medium">
                      Filtered by {selectedServices.length} selected service{selectedServices.length > 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {filteredPlans.length === 0 && (
                    <div className="text-amber-600 font-medium text-sm mt-2">
                      No plans match your current filters. Try adjusting your selection.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Loading AMC plans...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <FaBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedFilter === 'all' ? 'No AMC Plans Available' : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Plans Available`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedFilter === 'all' 
                    ? "We're currently setting up our AMC plans. Please contact us for custom quotes."
                    : `No ${selectedFilter} plans are currently available. Try selecting a different category or contact us for custom quotes.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  {selectedFilter !== 'all' && (
                    <motion.button
                      onClick={() => handleFilterChange('all')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      View All Plan Types
                    </motion.button>
                  )}
                  {selectedServices.length > 0 && (
                    <motion.button
                      onClick={clearServiceFilters}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-200 text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-300 transition-all duration-300 flex items-center gap-2"
                    >
                      <FaTimes className="w-4 h-4" />
                      Clear Service Filters
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => handleWhatsAppClick()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-all duration-300 flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Contact Us
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan, index) => {
                  const isExpanded = expandedCards[plan._id || index];
                  
                  return (
                    <motion.div
                      key={plan._id || index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      layout
                      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                        plan.highlight 
                          ? 'border-primary shadow-xl shadow-primary/20' 
                          : 'border-gray-200 hover:border-primary/30 hover:shadow-xl'
                      }`}
                    >
                      {/* Highlight Badge */}
                      {plan.highlight && (
                        <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-center py-2 px-4 rounded-t-2xl">
                          <span className="text-sm font-bold flex items-center justify-center gap-1">
                            <FaAward className="w-4 h-4" />
                            {plan.highlightText || 'MOST POPULAR'}
                          </span>
                        </div>
                      )}
                      
                      <div className="p-6">
                        {/* Header Section */}
                        <div className="text-center mb-6">
                          {/* Plan Type Badge */}
                          {plan.planType && (
                            <div className="mb-3">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                                plan.planType.toLowerCase() === 'individual' 
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : plan.planType.toLowerCase() === 'business'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                  : plan.planType.toLowerCase() === 'corporate'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}>
                                {plan.planType.toLowerCase() === 'individual' && <FaHome className="w-4 h-4" />}
                                {plan.planType.toLowerCase() === 'business' && <FaUsers className="w-4 h-4" />}
                                {plan.planType.toLowerCase() === 'corporate' && <FaBuilding className="w-4 h-4" />}
                                {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)} Plan
                              </span>
                            </div>
                          )}
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                          <div className="mb-4">
                            <span className="text-3xl font-bold text-primary">
                              {plan.priceDisplay || `₹${plan.price.toLocaleString('en-IN')}`}
                            </span>
                            <span className="text-gray-600 text-lg">/year</span>
                          </div>
                          {plan.description && (
                            <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
                          )}
                        </div>

                        {/* Features Section */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4" />
                            Key Features
                          </h4>
                          <div className="space-y-2">
                            {plan.features.slice(0, isExpanded ? plan.features.length : 3).map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0 w-3 h-3" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </div>
                            ))}
                            {!isExpanded && plan.features.length > 3 && (
                              <div className="text-sm text-primary font-medium">
                                +{plan.features.length - 3} more features
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 space-y-4"
                          >
                            {/* Services Section */}
                            {((plan.includedServices && plan.includedServices.length > 0) || (plan.excludedServices && plan.excludedServices.length > 0)) && (
                              <div className="space-y-3">
                                {/* Included Services */}
                                {plan.includedServices && plan.includedServices.length > 0 && (
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                                      <FaCheckCircle className="text-green-600 w-3 h-3" />
                                      Included ({plan.includedServices.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {plan.includedServices.slice(0, 4).map((service, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs bg-white rounded p-2 border border-green-100">
                                          <div className="flex items-center gap-2">
                                            <FaTools className="w-3 h-3 text-green-600" />
                                            <span className="text-green-700 font-medium">
                                              {typeof service === 'object' ? service.name : service}
                                            </span>
                                          </div>
                                          {plan.serviceFrequency && plan.serviceFrequency[service._id || service] && (
                                            <span className="text-green-600 font-semibold text-xs bg-green-100 px-2 py-1 rounded-full">
                                              {plan.serviceFrequency[service._id || service] === 'unlimited' 
                                                ? 'Unlimited' 
                                                : `${plan.serviceFrequency[service._id || service]}x/yr`}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                      {plan.includedServices.length > 4 && (
                                        <div className="text-xs text-green-600 font-medium text-center py-1 bg-white rounded border border-green-100">
                                          +{plan.includedServices.length - 4} more services
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Excluded Services */}
                                {plan.excludedServices && plan.excludedServices.length > 0 && (
                                  <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                                      <FaTimes className="text-red-600 w-2.5 h-2.5" />
                                      Not Included ({plan.excludedServices.length})
                                    </h4>
                                    <div className="space-y-0.5">
                                      {plan.excludedServices.slice(0, 3).map((service, idx) => (
                                        <div key={idx} className="text-xs text-red-700">
                                          • {typeof service === 'object' ? service.name : service}
                                        </div>
                                      ))}
                                      {plan.excludedServices.length > 3 && (
                                        <div className="text-xs text-red-600 font-medium">
                                          +{plan.excludedServices.length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Plan Duration */}
                            {plan.duration && (
                              <div className="text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                  <FaClock className="mr-1 w-3 h-3" />
                                  {plan.duration} {plan.durationUnit || 'months'} Contract
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Read More Button */}
                        <motion.button
                          onClick={() => toggleCardExpansion(plan._id || index)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 mb-4 text-sm font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isExpanded ? (
                            <>
                              <FaChevronUp className="w-3 h-3" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <span>View Details</span>
                              <FaChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </motion.button>

                        {/* Action Button */}
                        <motion.button
                          onClick={() => handlePlanClick(plan)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
                            plan.highlight
                              ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                              : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                          }`}
                        >
                          Choose {plan.name}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-10 max-w-3xl mx-auto text-white/90">
                Contact our team to discuss your business requirements and get a customized AMC plan
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <motion.button
                  onClick={() => handleWhatsAppClick()}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  Chat on WhatsApp
                </motion.button>
                
                <motion.a
                  href={`tel:+91${whatsappNumber}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold border border-white/40 hover:bg-white/30 transition-all duration-300 flex items-center gap-3"
                >
                  <FaPhone className="w-5 h-5" />
                  Call Now
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CorporateAMC;