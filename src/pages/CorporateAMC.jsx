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
  FaFilter
} from 'react-icons/fa';
import SEO from '../components/SEO';
import PaymentGateway from '../components/PaymentGateway';
import { useUserAuth } from '../context/UserAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);

const CorporateAMC = () => {
  const [amcPlans, setAmcPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const whatsappNumber = "919590926068";
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserAuth();

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Plans', icon: FaFilter, color: 'bg-gray-100 text-gray-700' },
    { id: 'individual', label: 'Individual', icon: FaHome, color: 'bg-green-100 text-green-700' },
    { id: 'business', label: 'Business', icon: FaUsers, color: 'bg-blue-100 text-blue-700' },
    { id: 'corporate', label: 'Corporate', icon: FaBuilding, color: 'bg-purple-100 text-purple-700' }
  ];

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

  // Filter plans based on selected filter
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredPlans(amcPlans);
    } else {
      const filtered = amcPlans.filter(plan => 
        plan.planType?.toLowerCase() === selectedFilter.toLowerCase()
      );
      setFilteredPlans(filtered);
    }
  }, [selectedFilter, amcPlans]);

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
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
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
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

  const services = [
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
              {services.map((service, index) => {
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

              {/* Filter Options */}
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

              {/* Filter Results Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 mb-4"
              >
                {selectedFilter === 'all' ? (
                  <span>Showing all {filteredPlans.length} AMC plans</span>
                ) : (
                  <span>
                    Showing {filteredPlans.length} {selectedFilter} plan{filteredPlans.length !== 1 ? 's' : ''}
                    {filteredPlans.length === 0 && (
                      <span className="text-amber-600 font-medium"> - No plans available for this category</span>
                    )}
                  </span>
                )}
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
                      View All Plans
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
              <motion.div 
                layout
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredPlans.map((plan, index) => (
                  <motion.div
                    key={plan._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 overflow-hidden ${
                      plan.highlight 
                        ? 'border-primary scale-105 shadow-2xl shadow-primary/20' 
                        : 'border-gray-200 hover:border-primary/30 hover:shadow-2xl'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-center py-2 px-4">
                        <span className="text-sm font-bold">
                          {plan.highlightText || 'MOST POPULAR'}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="text-center mb-6">
                        {/* Plan Type Badge */}
                        {plan.planType && (
                          <div className="mb-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              plan.planType.toLowerCase() === 'individual' 
                                ? 'bg-green-100 text-green-700'
                                : plan.planType.toLowerCase() === 'business'
                                ? 'bg-blue-100 text-blue-700'
                                : plan.planType.toLowerCase() === 'corporate'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {plan.planType.toLowerCase() === 'individual' && <FaHome className="w-3 h-3" />}
                              {plan.planType.toLowerCase() === 'business' && <FaUsers className="w-3 h-3" />}
                              {plan.planType.toLowerCase() === 'corporate' && <FaBuilding className="w-3 h-3" />}
                              {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)} Plan
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-primary">
                            {plan.priceDisplay || `₹${plan.price.toLocaleString('en-IN')}`}
                          </span>
                          <span className="text-gray-600">/year</span>
                        </div>
                        {plan.description && (
                          <p className="text-gray-600 text-sm">{plan.description}</p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Display included services if available */}
                      {plan.includedServices && plan.includedServices.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FaTools className="text-primary" />
                            Included Services ({plan.includedServices.length})
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {plan.includedServices.slice(0, 4).map((service, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700 font-medium">
                                  {typeof service === 'object' ? service.name : service}
                                </span>
                                {plan.serviceFrequency && plan.serviceFrequency[service._id || service] && (
                                  <span className="text-primary font-semibold">
                                    {plan.serviceFrequency[service._id || service] === 'unlimited' 
                                      ? 'Unlimited' 
                                      : `${plan.serviceFrequency[service._id || service]}x/year`}
                                  </span>
                                )}
                              </div>
                            ))}
                            {plan.includedServices.length > 4 && (
                              <div className="text-xs text-gray-500 font-medium">
                                +{plan.includedServices.length - 4} more services
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Plan duration */}
                      {plan.duration && (
                        <div className="mb-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            <FaClock className="mr-1" />
                            {plan.duration} {plan.durationUnit || 'months'} plan
                          </span>
                        </div>
                      )}

                      <motion.button
                        onClick={() => handlePlanClick(plan)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-primary hover:from-gray-200 hover:to-gray-300'
                        }`}
                      >
                        Buy {plan.name} Plan
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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