import React from 'react';
import { FiFileText, FiPrinter, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const InvoiceButton = ({ 
  booking, 
  variant = 'primary', 
  size = 'md', 
  showText = true,
  className = '',
  disabled = false
}) => {
  const navigate = useNavigate();

  // Check if invoice is available for this booking
  const isInvoiceAvailable = () => {
    if (!booking) return false;
    
    // Invoice available for confirmed, completed, or paid bookings
    const validStatuses = ['confirmed', 'completed', 'paid', 'delivered'];
    const bookingStatus = booking.status?.toLowerCase();
    
    return validStatuses.includes(bookingStatus);
  };

  const handleViewInvoice = () => {
    if (!booking || disabled) return;
    
    // Get booking ID from various possible fields
    const bookingId = booking._id || booking.id || booking.bookingId;
    
    if (!bookingId) {
      console.error('No booking ID found');
      return;
    }

    // Navigate to invoice viewer with booking ID
    navigate(`/invoice?bookingId=${bookingId}`);
  };

  const handlePrintInvoice = (e) => {
    e.stopPropagation();
    
    if (!booking || disabled) return;
    
    const bookingId = booking._id || booking.id || booking.bookingId;
    
    if (!bookingId) {
      console.error('No booking ID found');
      return;
    }

    // Open invoice in new window for printing
    const invoiceUrl = `/invoice?bookingId=${bookingId}`;
    const printWindow = window.open(invoiceUrl, '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      });
    }
  };

  // Don't render if invoice is not available
  if (!isInvoiceAvailable()) {
    return null;
  }

  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-2 border-blue-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border-2 border-gray-200',
    outline: 'border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    success: 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200 focus:ring-green-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <div className="flex gap-2">
      {/* Main Invoice Button */}
      <button
        onClick={handleViewInvoice}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } flex-1 min-w-[120px]`}
        title="View Invoice"
      >
        <FiFileText size={iconSizes[size]} className={showText ? 'mr-2' : ''} />
        {showText && 'View Invoice'}
      </button>

      {/* Quick Print Button */}
      <button
        onClick={handlePrintInvoice}
        disabled={disabled}
        className={`${baseClasses} ${variants.ghost} ${sizes[size]} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } px-3`}
        title="Print Invoice"
      >
        <FiPrinter size={iconSizes[size]} />
      </button>
    </div>
  );
};

// Compact version for tight spaces
export const CompactInvoiceButton = ({ booking, className = '' }) => {
  return (
    <InvoiceButton 
      booking={booking}
      variant="ghost"
      size="sm"
      showText={false}
      className={className}
    />
  );
};

// Success variant for completed bookings
export const SuccessInvoiceButton = ({ booking, className = '' }) => {
  return (
    <InvoiceButton 
      booking={booking}
      variant="success"
      size="md"
      showText={true}
      className={className}
    />
  );
};

export default InvoiceButton;