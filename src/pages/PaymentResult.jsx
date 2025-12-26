import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimes, 
  FaSpinner, 
  FaHome, 
  FaReceipt,
  FaWhatsapp
} from 'react-icons/fa';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const status = searchParams.get('status');
  const txnid = searchParams.get('txnid');
  const payid = searchParams.get('payid');
  const reason = searchParams.get('reason');
  const type = searchParams.get('type'); // 'subscription' or undefined for regular payments

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    if (type === 'subscription') {
      navigate('/user/dashboard/subscriptions');
    } else {
      navigate('/user/dashboard/bookings');
    }
  };

  const handleContactSupport = () => {
    const message = `Hi! I need help with my payment. Transaction ID: ${txnid || 'N/A'}. Status: ${status}. ${reason ? `Reason: ${reason}` : ''}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919590926068?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Processing payment result...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      >
        {status === 'success' ? (
          <>
            {/* Success State */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              {type === 'subscription' 
                ? 'Your subscription has been activated successfully. You will receive a confirmation shortly.'
                : 'Your payment has been processed successfully. You will receive a confirmation shortly.'
              }
            </p>
            
            {txnid && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{txnid}</p>
                {payid && (
                  <>
                    <p className="text-sm text-gray-600 mb-1 mt-2">Payment ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">{payid}</p>
                  </>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <motion.button
                onClick={handleViewBookings}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
              >
                <FaReceipt />
                {type === 'subscription' ? 'View My Subscriptions' : 'View My Bookings'}
              </motion.button>
              
              <motion.button
                onClick={handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
              </motion.button>
            </div>
          </>
        ) : (
          <>
            {/* Failure State */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaTimes className="w-12 h-12 text-red-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">
              Unfortunately, your payment could not be processed.
            </p>
            
            {reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-600 font-medium">Reason:</p>
                <p className="text-sm text-red-700 mt-1">{reason}</p>
              </div>
            )}
            
            {txnid && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{txnid}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <motion.button
                onClick={handleContactSupport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                Contact Support
              </motion.button>
              
              <motion.button
                onClick={handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <FaHome />
                Go to Home
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentResult;