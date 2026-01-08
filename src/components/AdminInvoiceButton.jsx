import React from 'react';
import { FiFileText, FiPrinter, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminInvoiceButton = ({ booking, className = '', variant = 'compact' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleViewInvoice = () => {
    const bookingId = booking._id || booking.bookingId;
    if (!bookingId) {
      console.error('No booking ID found');
      return;
    }
    
    // Navigate to admin invoice viewer with booking ID
    navigate(`/admin/invoice?bookingId=${bookingId}`);
  };

  const handlePrintInvoice = () => {
    const bookingId = booking._id || booking.bookingId;
    if (!bookingId) {
      console.error('No booking ID found');
      return;
    }
    
    // Open invoice in new window for printing
    const invoiceUrl = `/admin/invoice?bookingId=${bookingId}`;
    const printWindow = window.open(invoiceUrl, '_blank', 'width=800,height=600');
    
    // Auto-print when loaded
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          onClick={handleViewInvoice}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
          title="View Invoice"
        >
          <FiFileText className="text-xs" />
          Invoice
        </button>
        <button
          onClick={handlePrintInvoice}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
          title="Print Invoice"
        >
          <FiPrinter className="text-xs" />
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleViewInvoice}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiFileText className="text-sm" />
          View Invoice
        </button>
        <button
          onClick={handlePrintInvoice}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiPrinter className="text-sm" />
          Print
        </button>
      </div>
    );
  }

  // Default single button
  return (
    <button
      onClick={handleViewInvoice}
      className={`inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm ${className}`}
    >
      <FiFileText className="text-sm" />
      Invoice
    </button>
  );
};

export const CompactAdminInvoiceButton = ({ booking, className = '' }) => (
  <AdminInvoiceButton booking={booking} className={className} variant="compact" />
);

export const FullAdminInvoiceButton = ({ booking, className = '' }) => (
  <AdminInvoiceButton booking={booking} className={className} variant="full" />
);

export default AdminInvoiceButton;