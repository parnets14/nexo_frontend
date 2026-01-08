import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaLock, 
  FaShieldAlt, 
  FaSpinner,
  FaCheckCircle,
  FaTimes,
  FaRupeeSign,
  FaArrowLeft,
  FaWallet,
  FaMobileAlt,
  FaUniversity
} from 'react-icons/fa';
import { useUserAuth } from '../context/UserAuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo-backend-testing.onrender.com' : window.location.origin);

const PaymentGateway = ({ 
  amount, 
  orderData, 
  onSuccess, 
  onFailure, 
  onCancel,
  title = "Complete Payment",
  description = "Secure payment powered by PayU"
}) => {
  const { user, isAuthenticated } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const formRef = useRef(null);

  const initiatePayment = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('User not authenticated');
      }

      // Check if this is a quotation payment
      const isQuotationPayment = orderData?.quotationId;
      // Check if this is a subscription payment
      const isSubscription = orderData?.planId || orderData?.planName;
      
      let apiEndpoint, paymentPayload;
      
      console.log('🔍 Payment Type Detection:');
      console.log('   isQuotationPayment:', isQuotationPayment);
      console.log('   isSubscription:', isSubscription);
      console.log('   orderData:', orderData);
      
      if (isQuotationPayment) {
        apiEndpoint = `${API_BASE_URL}/api/user/quotations/${orderData.quotationId}/initiate-payment`;
        paymentPayload = {};
        console.log('💳 Quotation Payment - Endpoint:', apiEndpoint);
      } else if (isSubscription) {
        apiEndpoint = `${API_BASE_URL}/api/user/subscription/initiate-payment`;
        paymentPayload = {
          planId: orderData.planId,
          productinfo: orderData?.productinfo || 'Subscription Payment'
        };
        console.log('📅 Subscription Payment - Endpoint:', apiEndpoint);
      } else {
        apiEndpoint = `${API_BASE_URL}/api/user-payment/initiate-payment`;
        paymentPayload = {
          amount: amount,
          phone: user.phone || '',
          name: user.name || '',
          email: user.email || '',
          productinfo: orderData?.productinfo || 'Service Payment',
          userId: user._id || user.userId
        };
        console.log('🛒 Regular Payment - Endpoint:', apiEndpoint);
      }

      console.log('📤 API Request:');
      console.log('   Endpoint:', apiEndpoint);
      console.log('   Payload:', paymentPayload);
      console.log('   Headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` });

      const response = await axios.post(
        apiEndpoint,
        paymentPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 API Response:');
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Initiate payment error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated || !user) {
      setError('Please login to continue with payment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Initiating payment...');
      console.log('💰 Amount:', amount);
      console.log('📦 Order Data:', orderData);
      console.log('👤 User:', { id: user._id || user.userId, name: user.name, email: user.email, phone: user.phone });

      // Initiate payment with PayU
      const paymentResponse = await initiatePayment();
      
      console.log('📡 Payment Response:', paymentResponse);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to initiate payment');
      }

      const { data } = paymentResponse;
      
      console.log('🎯 Payment Data:', data);

      // Validate required PayU parameters
      if (!data.action) {
        throw new Error('PayU gateway URL not provided by server');
      }
      
      if (!data.key || !data.txnid || !data.hash) {
        throw new Error('Missing required PayU parameters');
      }

      console.log('🚀 Creating PayU form...');
      console.log('🌐 PayU Action URL:', data.action);

      // Create and submit PayU form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.action;
      form.style.display = 'none';

      // Add all PayU parameters as hidden inputs
      const payuParams = {
        key: data.key,
        txnid: data.txnid,
        amount: data.amount,
        productinfo: data.productinfo,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        surl: data.surl,
        furl: data.furl,
        hash: data.hash
      };

      console.log('📋 PayU Parameters:', payuParams);

      Object.keys(payuParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payuParams[key] || '';
        form.appendChild(input);
      });

      document.body.appendChild(form);
      setPaymentInitiated(true);
      
      console.log('✅ Submitting form to PayU...');
      
      // Submit form to PayU
      form.submit();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(error.response?.data?.message || error.message || 'Payment failed');
      setLoading(false);
      onFailure && onFailure(error);
    }
  };

  // Listen for payment completion (when user returns from PayU)
  useEffect(() => {
    const handlePaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('status');
      const txnid = urlParams.get('txnid');
      const payid = urlParams.get('payid');

      if (paymentStatus === 'success' && txnid) {
        onSuccess && onSuccess({ txnid, payid, status: 'success' });
      } else if (paymentStatus === 'failed') {
        const reason = urlParams.get('reason') || 'Payment failed';
        onFailure && onFailure({ message: reason });
      }
    };

    // Check URL parameters on component mount
    handlePaymentReturn();

    // Listen for URL changes (if using client-side routing)
    window.addEventListener('popstate', handlePaymentReturn);
    
    return () => {
      window.removeEventListener('popstate', handlePaymentReturn);
    };
  }, [onSuccess, onFailure]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: FaCreditCard,
      description: 'Visa, Mastercard, RuPay'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: FaMobileAlt,
      description: 'GPay, PhonePe, Paytm'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: FaUniversity,
      description: 'All major banks'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: FaWallet,
      description: 'Paytm, Mobikwik, etc.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">
      {/* Close Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition text-gray-700 shadow-lg"
        >
          <FaTimes />
        </button>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Amount Display - Centered */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm mb-2">Amount to Pay</p>
          <div className="flex items-center justify-center gap-1">
            <FaRupeeSign className="text-primary text-2xl" />
            <span className="text-4xl font-bold text-gray-900">
              {amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center gap-2">
              <FaTimes className="text-red-500" />
              <span className="text-red-700 font-medium">Payment Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </motion.div>
        )}

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FaShieldAlt className="text-green-600" />
            <span className="text-green-800 font-semibold text-sm">Secure Payment</span>
          </div>
          <p className="text-green-700 text-xs">
            Your payment information is encrypted and secure. We use industry-standard security measures.
          </p>
        </div>

        {/* Pay Button */}
        <motion.button
          onClick={handlePayment}
          disabled={loading || paymentInitiated}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            loading || paymentInitiated
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              {paymentInitiated ? 'Redirecting to PayU...' : 'Processing...'}
            </>
          ) : (
            <>
              <FaLock />
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </motion.button>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Amount: ₹{amount}</p>
            <p>Order Data: {JSON.stringify(orderData, null, 2)}</p>
            <p>User: {user?.name} ({user?.email})</p>
            <p>API Base: {API_BASE_URL}</p>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing API endpoint...');
                  const response = await initiatePayment();
                  console.log('✅ API Test Success:', response);
                  alert('API Test Success! Check console for details.');
                } catch (error) {
                  console.error('❌ API Test Failed:', error);
                  alert('API Test Failed! Check console for details.');
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Test API
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;