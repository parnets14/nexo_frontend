import React, { useState, useRef } from 'react';
import { FiCreditCard, FiDollarSign, FiX, FiLoader } from 'react-icons/fi';
import { partnerApi } from '../services/partnerApi';
import { usePartnerAuth } from '../context/PartnerAuthContext';

const PartnerWalletPayment = ({ 
  amount, 
  onSuccess, 
  onFailure, 
  onCancel, 
  title = "Wallet Top-up",
  description = "Add money to your wallet"
}) => {
  const { token, partner } = usePartnerAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const formRef = useRef(null);

  const initiatePayment = async () => {
    try {
      if (!token) {
        throw new Error('Partner not authenticated');
      }

      console.log('🔄 Initiating partner wallet payment...');
      console.log('💰 Amount:', amount);
      console.log('👤 Partner:', { id: partner._id, name: partner.profile?.name, phone: partner.phone });

      // Initiate PayU payment for wallet top-up
      const paymentResponse = await partnerApi.initiatePayUWalletTopUp(token, amount);
      
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

      // Add all PayU parameters
      const params = {
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

      Object.keys(params).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      formRef.current = form;

      console.log('✅ PayU form created, submitting...');
      form.submit();

      setPaymentInitiated(true);

      return paymentResponse;
    } catch (error) {
      console.error('❌ Initiate payment error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!partner) {
      setError('Please login to continue with payment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await initiatePayment();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment');
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formRef.current) {
      document.body.removeChild(formRef.current);
      formRef.current = null;
    }
    setPaymentInitiated(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (paymentInitiated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLoader className="text-2xl text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Redirecting to Payment Gateway</h3>
          <p className="text-gray-600 mb-6">
            Please wait while we redirect you to PayU for secure payment processing...
          </p>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-xl text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX className="text-xl text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Amount to Add:</span>
              <span className="text-2xl font-bold text-primary">₹{amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiCreditCard className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Secure Payment via PayU</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment is processed securely through PayU gateway. We support all major payment methods including cards, UPI, and net banking.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePayment}
              disabled={loading || !amount || amount <= 0}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard />
                  Pay ₹{amount?.toLocaleString('en-IN')}
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By proceeding, you agree to our terms and conditions. 
              Amount will be added to your wallet after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerWalletPayment;