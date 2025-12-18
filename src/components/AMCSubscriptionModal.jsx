import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaClock, 
  FaAward,
  FaRupeeSign,
  FaTimes,
  FaSpinner,
  FaCreditCard,
  FaCalendarAlt,
  FaTools,
  FaBuilding,
  FaHome,
  FaUsers,
  FaStar,
  FaPercentage,
  FaMapMarkerAlt
} from 'react-icons/fa';
import PaymentGateway from './PaymentGateway';
import { useUserAuth } from '../context/UserAuthContext';
import '../styles/modal-layers.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);

const AMCSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  service, 
  cartTotal, 
  user, 
  onSubscribe,
  serviceAddress 
}) => {
  const { isAuthenticated } = useUserAuth();
  const [amcPlans, setAmcPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const whatsappNumber = "919590926068";

  // Fetch AMC plans from backend
  useEffect(() => {
    if (isOpen) {
      fetchAMCPlans();
    }
  }, [isOpen]);

  const fetchAMCPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/amc-plans`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter plans based on user type and service
        const filteredPlans = filterPlansForUser(result.data);
        setAmcPlans(filteredPlans);
      }
    } catch (error) {
      console.error('Error fetching AMC plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlansForUser = (plans) => {
    if (!user) return plans.slice(0, 3); // Show first 3 plans for non-authenticated users

    const userType = user.userType || 'home';
    
    // Filter plans based on user type
    let filteredPlans = plans.filter(plan => {
      if (userType === 'company') {
        return plan.planType === 'business' || plan.planType === 'corporate';
      } else if (userType === 'pg') {
        return plan.planType === 'business' || plan.planType === 'individual';
      } else {
        return plan.planType === 'individual' || plan.planType === 'business';
      }
    });

    // If service is related to specific categories, prioritize relevant plans
    if (service) {
      const serviceName = service.name.toLowerCase();
      if (serviceName.includes('ac') || serviceName.includes('electrical') || serviceName.includes('plumbing')) {
        // Prioritize plans that include these services
        filteredPlans = filteredPlans.sort((a, b) => {
          const aHasService = a.includedServices?.some(s => 
            s.name?.toLowerCase().includes(serviceName.split(' ')[0])
          );
          const bHasService = b.includedServices?.some(s => 
            s.name?.toLowerCase().includes(serviceName.split(' ')[0])
          );
          return bHasService - aHasService;
        });
      }
    }

    return filteredPlans.slice(0, 4); // Show max 4 plans
  };

  const calculateSavings = (plan) => {
    if (!cartTotal || cartTotal === 0) return 0;
    
    // Estimate annual service cost without AMC
    const estimatedAnnualCost = cartTotal * 4; // Assuming 4 services per year
    const savings = estimatedAnnualCost - plan.price;
    return Math.max(0, savings);
  };

  const getSavingsPercentage = (plan) => {
    if (!cartTotal || cartTotal === 0) return 0;
    
    const estimatedAnnualCost = cartTotal * 4;
    if (estimatedAnnualCost === 0) return 0;
    
    const savings = calculateSavings(plan);
    return Math.round((savings / estimatedAnnualCost) * 100);
  };

  const handleWhatsAppClick = (plan) => {
    const userName = user?.name || 'there';
    const companyName = user?.companyDetails?.companyName || '';
    const serviceContext = service ? ` for ${service.name}` : '';
    
    let message = `Hi! I'm ${userName}${companyName ? ` from ${companyName}` : ''}. I'm interested in the ${plan.name} AMC plan (₹${plan.price.toLocaleString('en-IN')}/year)${serviceContext}.`;
    
    if (cartTotal > 0) {
      message += `\n\nI'm currently booking services worth ₹${cartTotal.toLocaleString('en-IN')} and would like to know more about AMC benefits.`;
    }
    
    if (user?.companyDetails) {
      message += `\n\nCompany Details:`;
      message += `\n• Company: ${user.companyDetails.companyName}`;
      if (user.companyDetails.companySize) {
        message += `\n• Size: ${user.companyDetails.companySize}`;
      }
      if (user.companyDetails.industry) {
        message += `\n• Industry: ${user.companyDetails.industry}`;
      }
    }
    
    message += `\n\nPlease provide more details about this plan and help me get started.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubscribeNow = (plan) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe to AMC plans');
      return;
    }
    
    setPaymentPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log('AMC Payment successful:', paymentResult);
    setShowPayment(false);
    setPaymentPlan(null);
    
    // Show success message
    alert(`Payment successful! Your ${paymentPlan?.name} AMC plan is now active.`);
    
    // Call the onSubscribe callback
    if (onSubscribe) {
      onSubscribe(paymentPlan, paymentResult);
    }
    
    // Close the modal
    onClose();
  };

  const handlePaymentFailure = (error) => {
    console.error('AMC Payment failed:', error);
    setShowPayment(false);
    alert('Payment failed. Please try again or contact support.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentPlan(null);
  };

  const getUserTypeIcon = () => {
    const userType = user?.userType || 'home';
    switch (userType) {
      case 'company': return FaBuilding;
      case 'pg': return FaUsers;
      default: return FaHome;
    }
  };

  const getUserTypeLabel = () => {
    const userType = user?.userType || 'home';
    switch (userType) {
      case 'company': return 'Business';
      case 'pg': return 'PG/Hostel';
      default: return 'Home';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay amc-modal" style={{ zIndex: 9300 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-content max-w-5xl w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Subscribe to AMC Plan</h2>
                <p className="text-white/90 flex items-center gap-2">
                  {React.createElement(getUserTypeIcon(), { className: "w-4 h-4" })}
                  Save money with annual maintenance contracts for {getUserTypeLabel()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Service Context with Address */}
          {service && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaTools className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      You're booking: {service.name}
                    </p>
                    {cartTotal > 0 && (
                      <p className="text-xs text-blue-700">
                        Current booking value: ₹{cartTotal.toLocaleString('en-IN')} • 
                        Save up to 40% with AMC plans
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Service Address Information */}
                {serviceAddress && serviceAddress.address && (
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          AMC Service Address:
                        </p>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {serviceAddress.address}
                          {serviceAddress.landmark && `, ${serviceAddress.landmark}`}
                          {serviceAddress.pincode && ` - ${serviceAddress.pincode}`}
                        </p>
                        {serviceAddress.customerName && (
                          <p className="text-xs text-blue-700 mt-1">
                            Contact: {serviceAddress.customerName}
                            {serviceAddress.customerPhone && ` • ${serviceAddress.customerPhone}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading AMC plans...</p>
              </div>
            ) : amcPlans.length === 0 ? (
              <div className="text-center py-12">
                <FaShieldAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No AMC Plans Available</h3>
                <p className="text-gray-600 mb-6">We're currently setting up AMC plans for your area. Contact us for custom quotes.</p>
                <motion.button
                  onClick={() => handleWhatsAppClick({ name: 'Custom AMC Plan', price: 0 })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#20BA5A] transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Contact for Custom Plan
                </motion.button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your AMC Plan</h3>
                  <p className="text-gray-600">
                    Get regular maintenance, priority support, and significant savings with our Annual Maintenance Contracts.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {amcPlans.map((plan, index) => {
                    const savings = calculateSavings(plan);
                    const savingsPercentage = getSavingsPercentage(plan);
                    
                    return (
                      <motion.div
                        key={plan._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                          plan.highlight 
                            ? 'border-primary scale-105 shadow-xl shadow-primary/20' 
                            : 'border-gray-200 hover:border-primary/30 hover:shadow-xl'
                        }`}
                      >
                        {plan.highlight && (
                          <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-center py-2 px-4">
                            <span className="text-sm font-bold">
                              {plan.highlightText || 'RECOMMENDED'}
                            </span>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="mb-4">
                              <span className="text-3xl font-bold text-primary">
                                {plan.priceDisplay || `₹${plan.price.toLocaleString('en-IN')}`}
                              </span>
                              <span className="text-gray-600">/year</span>
                            </div>
                            
                            {/* Savings Badge */}
                            {savings > 0 && (
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                                <FaPercentage className="w-3 h-3" />
                                Save ₹{savings.toLocaleString('en-IN')} ({savingsPercentage}%)
                              </div>
                            )}
                            
                            {plan.description && (
                              <p className="text-gray-600 text-sm">{plan.description}</p>
                            )}
                          </div>

                          {/* Plan Type Badge */}
                          <div className="flex justify-center mb-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              plan.planType === 'corporate' 
                                ? 'bg-purple-100 text-purple-800'
                                : plan.planType === 'business'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {plan.planType === 'corporate' && <FaBuilding className="w-3 h-3" />}
                              {plan.planType === 'business' && <FaUsers className="w-3 h-3" />}
                              {plan.planType === 'individual' && <FaHome className="w-3 h-3" />}
                              {plan.planType?.charAt(0).toUpperCase() + plan.planType?.slice(1) || 'Standard'}
                            </span>
                          </div>

                          <ul className="space-y-2 mb-6">
                            {plan.features.slice(0, 5).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0 text-sm" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 5 && (
                              <li className="text-gray-500 text-sm">
                                +{plan.features.length - 5} more features
                              </li>
                            )}
                          </ul>

                          {/* Service Frequency */}
                          {plan.duration && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                              <FaCalendarAlt className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">
                                {plan.duration} {plan.durationUnit || 'months'} coverage
                              </span>
                            </div>
                          )}

                          <div className="space-y-2">
                            <motion.button
                              onClick={() => handleSubscribeNow(plan)}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                plan.highlight
                                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg'
                                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                              }`}
                            >
                              <FaCreditCard className="w-4 h-4" />
                              Subscribe Now
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleWhatsAppClick(plan)}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20BA5A]"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                              Discuss on WhatsApp
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <FaShieldAlt className="w-4 h-4 text-green-500" />
                  All AMC plans include warranty coverage and priority support
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition"
                >
                  Maybe Later
                </button>
                <motion.button
                  onClick={() => handleWhatsAppClick({ name: 'Custom AMC Plan', price: 0 })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#25D366] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#20BA5A] transition-all duration-300 flex items-center gap-2"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  Custom Plan
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Gateway Modal */}
        {showPayment && paymentPlan && (
          <div className="modal-overlay payment-modal" style={{ zIndex: 9400 }}>
            <div className="max-w-md w-full">
              <PaymentGateway
                amount={paymentPlan.price}
                orderData={{
                  productinfo: `${paymentPlan.name} AMC Plan`,
                  userId: user?._id || user?.userId
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
                title={`Subscribe to ${paymentPlan.name}`}
                description={`Annual Maintenance Contract - ${paymentPlan.name}`}
              />
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default AMCSubscriptionModal;