import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFileText, FiEye, FiCheck, FiX, FiClock, FiDollarSign, 
  FiCalendar, FiUser, FiPhone, FiMapPin, FiCreditCard 
} from 'react-icons/fi';
import PaymentGateway from './PaymentGateway';

const QuotationCard = ({ quotation, booking, onAccept, onReject, onViewDetails }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="inline" size={14} />,
      accepted: <FiCheck className="inline" size={14} />,
      rejected: <FiX className="inline" size={14} />,
      expired: <FiClock className="inline" size={14} />
    };
    return icons[status] || <FiClock className="inline" size={14} />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleAcceptQuotation = () => {
    // Check if booking is already paid
    const isBookingAlreadyPaid = booking?.paymentStatus === 'completed';
    
    if (isBookingAlreadyPaid) {
      // Booking already paid, accept quotation without payment
      console.log('Booking already paid, accepting quotation without payment');
      onAccept(quotation._id);
    } else if (quotation.totalAmount > 0) {
      // Payment required
      setShowPayment(true);
    } else {
      // Free quotation
      onAccept(quotation._id);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPayment(false);
    onAccept(quotation._id, paymentData);
  };

  const handlePaymentFailure = (error) => {
    setShowPayment(false);
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  const isExpired = quotation.validTill && new Date(quotation.validTill) < new Date();
  const canAccept = quotation.customerStatus === 'pending' && !isExpired;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Quotation #{quotation.quotationNumber}
              </h3>
              <p className="text-sm text-gray-500">
                Created on {formatDate(quotation.createdAt)}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.customerStatus)}`}>
            {getStatusIcon(quotation.customerStatus)}
            <span className="ml-1 capitalize">{quotation.customerStatus}</span>
          </div>
        </div>

        {/* Quotation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-green-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Subtotal</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(quotation.subtotal)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Tax</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(quotation.tax)}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiDollarSign className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-700">Total Amount</span>
              </div>
              {booking?.paymentStatus === 'completed' && (
                <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                  <FiCheck size={14} />
                  <span>Paid</span>
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(quotation.totalAmount)}
            </p>
          </div>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Items ({quotation.items?.length || 0})</h4>
          <div className="space-y-2">
            {quotation.items?.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
            {quotation.items?.length > 3 && (
              <p className="text-sm text-gray-500">
                +{quotation.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Validity */}
        {quotation.validTill && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-500" size={16} />
              <span className="text-sm text-gray-600">
                Valid till: {formatDate(quotation.validTill)}
                {isExpired && <span className="text-red-600 ml-2">(Expired)</span>}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {quotation.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {quotation.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onViewDetails(quotation)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiEye size={16} />
            <span>View Details</span>
          </button>

          {canAccept && (
            <>
              <button
                onClick={handleAcceptQuotation}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiCreditCard size={16} />
                <span>
                  {booking?.paymentStatus === 'completed' 
                    ? 'Accept' 
                    : quotation.totalAmount > 0 
                      ? 'Pay & Accept' 
                      : 'Accept'
                  }
                </span>
              </button>

              <button
                onClick={() => onReject(quotation._id)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FiX size={16} />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Payment</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <PaymentGateway
                amount={quotation.totalAmount}
                orderData={{
                  productinfo: `Quotation Payment - ${quotation.quotationNumber}`,
                  quotationId: quotation._id,
                  bookingId: booking._id
                }}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={() => setShowPayment(false)}
                title="Quotation Payment"
                description={`Pay for quotation ${quotation.quotationNumber}`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotationCard;