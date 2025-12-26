import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PaymentGateway from '../components/PaymentGateway';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';

const TestPayment = () => {
  const { isAuthenticated, user } = useUserAuth();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    alert('Payment successful! Check console for details.');
    setShowPayment(false);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed! Check console for details.');
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to test payments.</p>
          <button
            onClick={() => navigate('/user/login')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Gateway Test</h1>
          <p className="text-gray-600">Test the PayU payment integration</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Information</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Name:</span> {user?.name || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {user?.email || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> {user?.phone || 'N/A'}</p>
              <p><span className="font-semibold">User Type:</span> {user?.userType || 'home'}</p>
            </div>
          </div>

          {/* Test Payment Options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Payments</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                Test Payment - ₹100
              </button>
              
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">Test Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click the button above to open payment gateway</li>
                  <li>You'll be redirected to PayU test environment</li>
                  <li>Use test card details provided by PayU</li>
                  <li>After payment, you'll be redirected back</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <PaymentGateway
                amount={100}
                orderData={{
                  productinfo: 'Test Payment - PayU Integration',
                  userId: user?._id || user?.userId
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
                title="Test Payment"
                description="Testing PayU payment integration"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPayment;