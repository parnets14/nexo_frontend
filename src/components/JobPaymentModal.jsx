import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiCreditCard, 
  FiDollarSign, 
  FiCheck, 
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { FaRupeeSign } from 'react-icons/fa';
import PaymentGateway from './PaymentGateway';

const JobPaymentModal = ({ 
  booking, 
  quotation, 
  onClose, 
  onPaymentComplete, 
  token 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [partnerWallet, setPartnerWallet] = useState(null);

  // Calculate remaining amount to pay
  const totalAmount = quotation?.totalAmount || booking?.totalAmount || booking?.amount || 0;
  const paidAmount = booking?.payamount || 0;
  
  // Check if booking is already fully paid
  const isBookingPaid = booking?.paymentStatus === 'completed';
  const remainingAmount = isBookingPaid ? 0 : Math.max(0, totalAmount - paidAmount);
  
  console.log(`[JobPaymentModal] Payment calculation:`, {
    bookingId: booking?._id,
    totalAmount,
    paidAmount,
    paymentStatus: booking?.paymentStatus,
    isBookingPaid,
    remainingAmount
  });

  // If booking is already paid, don't show the modal
  if (remainingAmount <= 0) {
    console.log(`[JobPaymentModal] Booking already paid, closing modal`);
    setTimeout(() => onClose(), 100);
    return null;
  }

  useEffect(() => {
    fetchWalletBalance();
  }, [token]);

  const fetchWalletBalance = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);
      
      const response = await fetch(`${API_BASE_URL}/api/partner/getWalletbypartner`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWalletBalance(data.data.balance || 0);
          setPartnerWallet(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const handleCashPayment = async () => {
    if (walletBalance < remainingAmount) {
      setError(`Insufficient wallet balance. Available: ₹${walletBalance.toLocaleString()}, Required: ₹${remainingAmount.toLocaleString()}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin);

      const response = await fetch(`${API_BASE_URL}/api/partner/jobs/${booking._id || booking.bookingId}/complete-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: 'cash',
          amount: remainingAmount,
          quotationId: quotation?._id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Trigger a custom event to refresh wallet data
        window.dispatchEvent(new CustomEvent('walletUpdated', { 
          detail: { 
            newBalance: data.newWalletBalance,
            transactionAmount: remainingAmount,
            transactionType: 'debit'
          } 
        }));
        
        onPaymentComplete({
          success: true,
          paymentMethod: 'cash',
          amount: remainingAmount,
          transactionId: data.transactionId,
          newWalletBalance: data.newWalletBalance
        });
        onClose();
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Cash payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = () => {
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Trigger a custom event to refresh wallet data
    window.dispatchEvent(new CustomEvent('walletUpdated', { 
      detail: { 
        transactionAmount: remainingAmount,
        transactionType: 'online_payment'
      } 
    }));
    
    onPaymentComplete({
      success: true,
      paymentMethod: 'online',
      amount: remainingAmount,
      transactionId: paymentData.txnid,
      paymentId: paymentData.payid
    });
    onClose();
  };

  const handlePaymentFailure = (error) => {
    setError(error.message || 'Online payment failed');
    setShowPaymentGateway(false);
  };

  if (showPaymentGateway) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
          <PaymentGateway
            amount={remainingAmount}
            orderData={{
              productinfo: `Job Payment - ${booking.service?.name || booking.subService?.name || booking.popularService?.name || booking.serviceName || 'Service'}`,
              bookingId: booking._id || booking.bookingId
            }}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onCancel={() => setShowPaymentGateway(false)}
            title="Complete Job Payment"
            description="Pay remaining amount for completed job"
          />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Complete Payment</h2>
                <p className="text-primary-light text-sm">Job completion payment</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Amount Summary */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Amount:</span>
                  <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Already Paid:</span>
                  <span className="font-semibold text-green-600">₹{paidAmount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Remaining Amount:</span>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign className="text-primary" />
                      <span className="text-xl font-bold text-primary">
                        {remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Balance Info */}
            {paymentMethod === 'cash' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaWallet className="text-blue-600" />
                  <span className="text-blue-800 font-semibold text-sm">Wallet Balance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 text-sm">Available Balance:</span>
                  <span className="font-bold text-blue-800">₹{walletBalance.toLocaleString()}</span>
                </div>
                {walletBalance < remainingAmount && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <FiAlertCircle />
                    Insufficient balance for cash payment
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Select Payment Method</h3>
              <div className="space-y-3">
                {/* Cash Payment */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'cash' && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-slate-600" />
                      <span className="font-semibold text-slate-800">Cash (Wallet)</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Deduct from wallet balance
                    </p>
                  </div>
                </label>

                {/* Online Payment */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    paymentMethod === 'online' ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'online' && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="text-slate-600" />
                      <span className="font-semibold text-slate-800">Online Payment</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Pay via PayU gateway
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={paymentMethod === 'cash' ? handleCashPayment : handleOnlinePayment}
                disabled={loading || (paymentMethod === 'cash' && walletBalance < remainingAmount)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  loading || (paymentMethod === 'cash' && walletBalance < remainingAmount)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiDollarSign />
                    Pay ₹{remainingAmount.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobPaymentModal;