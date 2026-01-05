import React from 'react';
import { openInvoiceForPrint } from '../utils/invoiceIntegration';

// Example of how to add invoice functionality to your existing booking components
const InvoiceButton = ({ bookingId, variant = 'primary', size = 'sm', className = '' }) => {
  const handleViewInvoice = () => {
    openInvoiceForPrint(bookingId);
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={handleViewInvoice}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      title="View & Print Invoice"
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Invoice
    </button>
  );
};

// Example usage in a booking card
export const BookingCardWithInvoice = ({ booking }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{booking.serviceName}</h3>
          <p className="text-sm text-gray-600">Booking ID: #{booking._id || booking.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {booking.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Amount:</span> ₹{booking.totalAmount}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            View Details
          </button>
          {/* Add the invoice button here */}
          <InvoiceButton 
            bookingId={booking._id || booking.id} 
            variant="outline" 
            size="md"
          />
        </div>
        
        {booking.status === 'completed' && (
          <InvoiceButton 
            bookingId={booking._id || booking.id} 
            variant="primary" 
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceButton;