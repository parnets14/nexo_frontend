import React, { useState } from 'react';
import { usePartnerAuth } from '../context/PartnerAuthContext';
import PartnerWalletPayment from '../components/PartnerWalletPayment';
import { FiDollarSign, FiCreditCard } from 'react-icons/fi';

const TestPartnerWalletPayment = () => {
  const { partner, token } = usePartnerAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [testAmount, setTestAmount] = useState(100);

  if (!partner || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner Login Required</h2>
          <p className="text-gray-600">Please login as a partner to test wallet payment</p>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment Success:', paymentData);
    setShowPayment(false);
    alert('Payment successful! Check your wallet.');
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment Failed:', error);
    setShowPayment(false);
    alert('Payment failed: ' + (error?.message || 'Unknown error'));
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="text-3xl text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Partner Wallet Payment</h1>
            <p className="text-gray-600">Test PayU integration for partner wallet top-up</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Partner Details</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Name:</strong> {partner.profile?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> {partner.phone}</p>
              <p><strong>Email:</strong> {partner.profile?.email || partner.email || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Amount (₹)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                min="10"
                max="100000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter amount to test"
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[50, 100, 500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTestAmount(amount)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    testAmount === amount
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPayment(true)}
              disabled={!testAmount || testAmount < 10}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiCreditCard />
              Test Payment - ₹{testAmount?.toLocaleString('en-IN')}
            </button>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Test Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This will initiate a real PayU payment (test mode)</li>
              <li>• Use test card details provided by PayU</li>
              <li>• Amount will be added to your wallet on successful payment</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>

      {showPayment && (
        <PartnerWalletPayment
          amount={testAmount}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
          title="Test Wallet Payment"
          description={`Testing PayU integration with ₹${testAmount?.toLocaleString('en-IN')}`}
        />
      )}
    </div>
  );
};

export default TestPartnerWalletPayment;