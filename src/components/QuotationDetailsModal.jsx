import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, FiFileText, FiCalendar, FiUser, 
  FiPhone, FiMapPin, FiPackage, FiInfo, FiCheck, FiXCircle 
} from 'react-icons/fi';

const QuotationDetailsModal = ({ 
  quotation, 
  booking, 
  isOpen, 
  onClose, 
  onAccept, 
  onReject, 
  userType = 'customer',
  token 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !quotation) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Quotation #{quotation.quotationNumber}
              </h2>
              <p className="text-sm text-gray-500">
                Created on {formatDate(quotation.createdAt)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Status and Validity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Customer Status</h3>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quotation.customerStatus)}`}>
                {quotation.customerStatus.charAt(0).toUpperCase() + quotation.customerStatus.slice(1)}
              </div>
            </div>

            {/* Partner Status */}
            {quotation.partnerStatus && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Partner Status</h3>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quotation.partnerStatus)}`}>
                  {quotation.partnerStatus.charAt(0).toUpperCase() + quotation.partnerStatus.slice(1)}
                </div>
              </div>
            )}
            
            {quotation.validTill && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Valid Till</h3>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-500" size={16} />
                  <span className="text-gray-700">{formatDate(quotation.validTill)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Information */}
          {booking && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                <FiInfo className="mr-2" size={16} />
                Booking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-blue-600" size={14} />
                  <span className="text-blue-800">
                    {booking.user?.name || booking.customerName || 'Customer'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-blue-600" size={14} />
                  <span className="text-blue-800">
                    {booking.user?.phone || booking.customerPhone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-blue-600" size={14} />
                  <span className="text-blue-800">
                    {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMapPin className="text-blue-600" size={14} />
                  <span className="text-blue-800">
                    {booking.location?.address || 'Address not available'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <FiPackage className="mr-2" size={16} />
              Items ({quotation.items?.length || 0})
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotation.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.name}
                        {item.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            Category: {item.category}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Pricing Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(quotation.subtotal)}
                </span>
              </div>
              
              {quotation.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(quotation.discount)}
                  </span>
                </div>
              )}
              
              {quotation.tax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(quotation.tax)}
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(quotation.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {quotation.description && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {quotation.description}
                </p>
              </div>
            </div>
          )}

          {/* Partner Action Buttons */}
          {userType === 'partner' && quotation.partnerStatus === 'pending' && onAccept && onReject && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Partner Action Required</h3>
                <p className="text-sm text-blue-800 mb-4">
                  This quotation is waiting for your approval. Please review the details and take action.
                </p>
                
                {!showRejectionForm ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          await onAccept(quotation._id);
                          onClose();
                        } catch (error) {
                          console.error('Error approving quotation:', error);
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FiCheck size={16} />
                      <span>{isProcessing ? 'Approving...' : 'Approve Quotation'}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowRejectionForm(true)}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FiXCircle size={16} />
                      <span>Reject Quotation</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejecting this quotation..."
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={async () => {
                          if (!rejectionReason.trim()) {
                            alert('Please provide a rejection reason');
                            return;
                          }
                          
                          setIsProcessing(true);
                          try {
                            await onReject(quotation._id, rejectionReason);
                            onClose();
                          } catch (error) {
                            console.error('Error rejecting quotation:', error);
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing || !rejectionReason.trim()}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <FiXCircle size={16} />
                        <span>{isProcessing ? 'Rejecting...' : 'Confirm Rejection'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowRejectionForm(false);
                          setRejectionReason('');
                        }}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Response History */}
          {(quotation.customerResponseAt || quotation.customerRejectionReason || quotation.partnerResponseAt || quotation.partnerRejectionReason) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-3">Response History</h3>
              
              {/* Customer Response */}
              {quotation.customerResponseAt && (
                <div className="mb-3 pb-3 border-b border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium mb-1">Customer Response:</p>
                  <p className="text-sm text-yellow-800 mb-1">
                    Status: {quotation.customerStatus} on {formatDate(quotation.customerResponseAt)}
                  </p>
                  {quotation.customerRejectionReason && (
                    <p className="text-sm text-yellow-800">
                      Reason: {quotation.customerRejectionReason}
                    </p>
                  )}
                </div>
              )}
              
              {/* Partner Response */}
              {quotation.partnerResponseAt && (
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Partner Response:</p>
                  <p className="text-sm text-yellow-800 mb-1">
                    Status: {quotation.partnerStatus} on {formatDate(quotation.partnerResponseAt)}
                  </p>
                  {quotation.partnerRejectionReason && (
                    <p className="text-sm text-yellow-800">
                      Reason: {quotation.partnerRejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuotationDetailsModal;