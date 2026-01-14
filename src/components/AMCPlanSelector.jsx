import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBuilding, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaShieldAlt, 
  FaClock, 
  FaAward,
  FaRupeeSign,
  FaTimes,
  FaSpinner,
  FaCreditCard
} from 'react-icons/fa';
import PaymentGateway from './PaymentGateway';
import { useUserAuth } from '../context/UserAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);

const AMCPlanSelector = ({ user, onClose, onPlanSelect }) => {
  const { isAuthenticated } = useUserAuth();
  const [amcPlans, setAmcPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const whatsappNumber = "+15558136145";

  // Fetch AMC plans from backend
  useEffect(() => {
    const fetchAMCPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/amc-plans`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setAmcPlans(result.data);
        }
      } catch (error) {
        console.error('Error fetching AMC plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAMCPlans();
  }, []);

  const handleWhatsAppClick = (plan) => {
    const companyName = user?.companyDetails?.companyName || 'your company';
    let message = `Hi! I'm ${user?.name} from ${companyName}. I'm interested in the ${plan.name} AMC plan (₹${plan.price.toLocaleString('en-IN')}/year).`;
    
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
    const whatsappUrl = `https://wa.aisensy.com/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Call the onPlanSelect callback if provided
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  const handlePayNow = (plan) => {
    if (!isAuthenticated) {
      alert('Please login to proceed with payment');
      return;
    }
    
    setPaymentPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setShowPayment(false);
    setPaymentPlan(null);
    
    // Show success message
    alert(`Payment successful! Your ${paymentPlan?.name} AMC plan is now active.`);
    
    // Call the onPlanSelect callback
    if (onPlanSelect) {
      onPlanSelect(paymentPlan);
    }
    
    // Close the modal
    if (onClose) {
      onClose();
    }
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setShowPayment(false);
    alert('Payment failed. Please try again or contact support.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentPlan(null);
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaBuilding className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Choose Your AMC Plan</h2>
              <p className="text-white/90">
                Welcome {user?.companyDetails?.companyName || user?.name}! Select an Annual Maintenance Contract plan.
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading AMC plans...</p>
            </div>
          ) : amcPlans.length === 0 ? (
            <div className="text-center py-12">
              <FaBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No AMC Plans Available</h3>
              <p className="text-gray-600 mb-6">We're currently setting up our AMC plans. Please contact us for custom quotes.</p>
              <motion.button
                onClick={() => handleWhatsAppClick({ name: 'Custom AMC Plan', price: 0 })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#20BA5A] transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <FaWhatsapp className="w-5 h-5" />
                Contact Us for Custom Plan
              </motion.button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Choose the perfect AMC plan for your business needs. Get priority support, scheduled maintenance, and significant cost savings.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amcPlans.map((plan, index) => (
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
                        {plan.description && (
                          <p className="text-gray-600 text-sm">{plan.description}</p>
                        )}
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0 text-sm" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-gray-500 text-sm">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Display included and excluded services */}
                      {((plan.includedServices && plan.includedServices.length > 0) || (plan.excludedServices && plan.excludedServices.length > 0)) && (
                        <div className="mb-6 space-y-3">
                          {/* Included Services */}
                          {plan.includedServices && plan.includedServices.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 w-3 h-3" />
                                Included ({plan.includedServices.length})
                              </h4>
                              <div className="space-y-1">
                                {plan.includedServices.slice(0, 2).map((service, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-green-700 font-medium">
                                      {typeof service === 'object' ? service.name : service}
                                    </span>
                                    {plan.serviceFrequency && plan.serviceFrequency[service._id || service] && (
                                      <span className="text-green-600 font-semibold">
                                        {plan.serviceFrequency[service._id || service] === 'unlimited' 
                                          ? 'Unlimited' 
                                          : `${plan.serviceFrequency[service._id || service]}x/year`}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {plan.includedServices.length > 2 && (
                                  <div className="text-xs text-green-600 font-medium">
                                    +{plan.includedServices.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Excluded Services */}
                          {plan.excludedServices && plan.excludedServices.length > 0 && (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-2">
                                <FaTimes className="text-red-600 w-3 h-3" />
                                Not Included ({plan.excludedServices.length})
                              </h4>
                              <div className="space-y-1">
                                {plan.excludedServices.slice(0, 2).map((service, idx) => (
                                  <div key={idx} className="flex items-center text-xs">
                                    <span className="text-red-700 font-medium">
                                      {typeof service === 'object' ? service.name : service}
                                    </span>
                                  </div>
                                ))}
                                {plan.excludedServices.length > 2 && (
                                  <div className="text-xs text-red-600 font-medium">
                                    +{plan.excludedServices.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                          <div className="space-y-2 mb-6">
                            <motion.button
                              onClick={() => handlePayNow(plan)}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                plan.highlight
                                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg'
                                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                              }`}
                            >
                              <FaCreditCard className="w-4 h-4" />
                              Pay Now
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
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <p>Need a custom plan? Our team will help you find the perfect solution.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition"
              >
                Skip for now
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
              title={`Pay for ${paymentPlan.name}`}
              description={`Annual Maintenance Contract - ${paymentPlan.name}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AMCPlanSelector;