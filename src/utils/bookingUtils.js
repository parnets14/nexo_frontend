/**
 * Utility functions for booking data processing
 */

/**
 * Get service name from booking object with fallback hierarchy
 * @param {Object} booking - The booking object
 * @param {string} fallback - Fallback text if no service name found
 * @returns {string} The service name or fallback
 */
export const getServiceName = (booking, fallback = 'Service Booking') => {
  if (!booking) return fallback;
  
  return (
    booking.service?.name ||
    booking.subService?.name ||
    booking.popularService?.name ||
    booking.serviceName ||
    fallback
  );
};

/**
 * Get booking ID in short format
 * @param {Object} booking - The booking object
 * @returns {string} Short booking ID or 'N/A'
 */
export const getBookingId = (booking) => {
  if (!booking) return 'N/A';
  
  return (
    booking.bookingId ||
    booking._id?.toString().slice(-8) ||
    'N/A'
  );
};

/**
 * Get customer name from booking
 * @param {Object} booking - The booking object
 * @returns {string} Customer name or 'N/A'
 */
export const getCustomerName = (booking) => {
  if (!booking) return 'N/A';
  
  return (
    booking.user?.name ||
    booking.userName ||
    booking.customerName ||
    'N/A'
  );
};

/**
 * Get formatted booking amount
 * @param {Object} booking - The booking object
 * @param {boolean} includeSymbol - Whether to include ₹ symbol
 * @returns {string} Formatted amount
 */
export const getBookingAmount = (booking, includeSymbol = true) => {
  if (!booking) return includeSymbol ? '₹0' : '0';
  
  const amount = booking.totalAmount || booking.amount || 0;
  const formatted = amount.toLocaleString('en-IN');
  
  return includeSymbol ? `₹${formatted}` : formatted;
};

/**
 * Get remaining payment amount
 * @param {Object} booking - The booking object
 * @returns {number} Remaining amount to be paid
 */
export const getRemainingAmount = (booking) => {
  if (!booking) return 0;
  
  const totalAmount = booking.totalAmount || booking.amount || 0;
  const paidAmount = booking.payamount || 0;
  
  return Math.max(0, totalAmount - paidAmount);
};

/**
 * Check if booking payment is complete
 * @param {Object} booking - The booking object
 * @returns {boolean} True if payment is complete
 */
export const isPaymentComplete = (booking) => {
  return getRemainingAmount(booking) <= 0;
};

/**
 * Get booking status display info
 * @param {string} status - The booking status
 * @returns {Object} Status display configuration
 */
export const getStatusConfig = (status) => {
  const configs = {
    completed: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      label: 'Completed'
    },
    work_completed: {
      color: 'bg-orange-100 text-orange-800',
      icon: '💰',
      label: 'Payment Pending'
    },
    accepted: {
      color: 'bg-blue-100 text-blue-800',
      icon: '👍',
      label: 'Accepted'
    },
    in_progress: {
      color: 'bg-purple-100 text-purple-800',
      icon: '🔄',
      label: 'In Progress'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
      label: 'Pending'
    },
    paused: {
      color: 'bg-orange-100 text-orange-800',
      icon: '⏸️',
      label: 'Paused'
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      label: 'Rejected'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800',
      icon: '🚫',
      label: 'Cancelled'
    }
  };
  
  return configs[status] || {
    color: 'bg-slate-100 text-slate-800',
    icon: '📋',
    label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'
  };
};