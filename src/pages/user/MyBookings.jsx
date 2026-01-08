import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiClock, FiFilter, FiEye, FiX, FiCheckCircle, 
  FiAlertCircle, FiPhone, FiMessageCircle, FiStar, FiRefreshCw, FiPackage,
  FiFileText, FiPrinter, FiDownload 
} from 'react-icons/fi';
import axios from 'axios';
import InvoiceButton, { AdaptiveInvoiceButton } from '../../components/InvoiceButton';
import QuotationCard from '../../components/QuotationCard';
import QuotationDetailsModal from '../../components/QuotationDetailsModal';
import { userApi } from '../../services/userApi';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const invoiceRef = useRef(null);
  
  // Quotation states
  const [bookingQuotations, setBookingQuotations] = useState({});
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedBookingForQuotation, setSelectedBookingForQuotation] = useState(null);

  // Helper function to check if cancellation is allowed (before 2 hours of scheduled time)
const isCancellationAllowed = (bookingData) => {
  if (!bookingData.date) return false;
  
  // Get the scheduled date and time
  let scheduledDateTime;
  
  if (bookingData.time) {
    // If we have both date and time, combine them
    const bookingDate = new Date(bookingData.date);
    const [hours, minutes] = bookingData.time.split(':');
    scheduledDateTime = new Date(bookingDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    // If no time specified, assume it's at the start of the day
    scheduledDateTime = new Date(bookingData.date);
  }
  
  // Calculate 2 hours before the scheduled time
  const twoHoursBefore = new Date(scheduledDateTime.getTime() - (2 * 60 * 60 * 1000));
  const currentTime = new Date();
  
  // Allow cancellation if current time is before the 2-hour cutoff
  return currentTime < twoHoursBefore;
};

// Helper function to safely format address
  const formatAddress = (addressData) => {
    if (!addressData) return null;
    
    // If it's already a string, return it
    if (typeof addressData === 'string') return addressData;
    
    // If it's an object, format it properly
    if (typeof addressData === 'object') {
      const parts = [];
      
      // Check various possible field names for address components
      const addressLine = addressData.address || 
                         addressData.street || 
                         addressData.addressLine1 || 
                         addressData.line1 ||
                         '';
      
      const landmark = addressData.landmark || '';
      const city = addressData.city || '';
      const pincode = addressData.pincode || addressData.zipcode || '';
      
      if (addressLine) parts.push(addressLine);
      if (landmark) parts.push(landmark);
      if (city) parts.push(city);
      if (pincode) parts.push(pincode);
      
      return parts.filter(Boolean).join(', ') || null;
    }
    
    return null;
  };

  // Helper function to safely get booking data
  const getBookingData = (booking) => {
    // Log the booking structure for debugging if needed
    // console.log('🔍 Booking structure:', booking);
    
    // Handle address safely
    let formattedAddress = null;
    if (booking.address) {
      formattedAddress = formatAddress(booking.address);
    } else if (booking.userAddress) {
      formattedAddress = formatAddress(booking.userAddress);
    } else if (booking.serviceAddress) {
      formattedAddress = formatAddress(booking.serviceAddress);
    } else if (booking.location) {
      formattedAddress = formatAddress(booking.location);
    } else if (booking.user?.addresses?.[0]) {
      formattedAddress = formatAddress(booking.user.addresses[0]);
    }
    
    return {
      id: booking._id || booking.id || 'N/A',
      serviceName: booking.serviceName || 
                   booking.service?.name || 
                   booking.subService?.name || 
                   booking.subService?.service?.name ||
                   booking.product?.name ||
                   'Service Booking',
      
      status: booking.status || 'pending',
      
      date: booking.scheduledDate || 
            booking.bookingDate || 
            booking.serviceDate ||
            booking.createdAt || 
            booking.date ||
            null,
            
      time: booking.scheduledTime || 
            booking.bookingTime || 
            booking.serviceTime ||
            booking.time ||
            null,
            
      address: formattedAddress,
               
      amount: booking.totalAmount || 
              booking.amount || 
              booking.price ||
              booking.cost ||
              0,
              
      customerName: booking.user?.name || 
                    booking.userName || 
                    booking.customerName ||
                    booking.name ||
                    'Customer',
                    
      customerPhone: booking.user?.phone || 
                     booking.userPhone || 
                     booking.customerPhone ||
                     booking.phone ||
                     null,
                     
      cartItems: booking.cartItems || 
                 booking.items || 
                 booking.services ||
                 [],
                 
      hasReview: booking.hasReview || false,
      userRating: booking.userRating || null
    };
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  // Fetch quotations for bookings
  const fetchBookingQuotations = async (bookingId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await userApi.getBookingQuotations(token, bookingId);
      
      if (response.success) {
        setBookingQuotations(prev => ({
          ...prev,
          [bookingId]: response.data.quotations || []
        }));
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  // Handle quotation acceptance
  const handleAcceptQuotation = async (quotationId, paymentData = null) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await userApi.acceptQuotation(token, quotationId, paymentData);
      
      if (response.success) {
        setSuccessMessage('Quotation accepted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh bookings and quotations
        fetchBookings();
        if (selectedBookingForQuotation) {
          fetchBookingQuotations(selectedBookingForQuotation.id);
        }
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert(error.response?.data?.message || 'Failed to accept quotation');
    }
  };

  // Handle quotation rejection
  const handleRejectQuotation = async (quotationId, reason = '') => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await userApi.rejectQuotation(token, quotationId, reason);
      
      if (response.success) {
        setSuccessMessage('Quotation rejected successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh quotations
        if (selectedBookingForQuotation) {
          fetchBookingQuotations(selectedBookingForQuotation.id);
        }
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      alert(error.response?.data?.message || 'Failed to reject quotation');
    }
  };

  // Handle view quotation details
  const handleViewQuotationDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };

  // Handle view quotations for booking
  const handleViewQuotations = async (booking) => {
    if (!booking.id || booking.id === 'N/A') {
      console.error('Invalid booking ID for quotations:', booking.id);
      alert('Unable to load quotations. Please refresh the page and try again.');
      return;
    }
    setSelectedBookingForQuotation(booking);
    await fetchBookingQuotations(booking.id);
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 Debug - Fetching bookings...');
      console.log('   Token exists:', !!token);
      console.log('   Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        setBookings([]);
        setLoading(false);
        return;
      }

      let bookingsData = [];
      
      try {
        // Try the main endpoint first (getAllUserBookings)
        console.log('📋 Trying main bookings endpoint...');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/bookings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('📋 Bookings API Response:', response.data);
        
        if (response.data.success && response.data.data) {
          bookingsData = response.data.data.bookings || response.data.data || [];
        } else if (response.data.bookings) {
          bookingsData = response.data.bookings;
        } else if (Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          bookingsData = response.data;
        }
        
        console.log('📋 Processed bookings from main endpoint:', bookingsData.length);
        
      } catch (mainError) {
        console.warn('⚠️ Main endpoint failed, trying alternative...');
        console.warn('   Main error:', mainError.message);
        
        try {
          // Try alternative endpoint (getUserBookings)
          const altResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/user/bookings/all`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('📋 Alternative API Response:', altResponse.data);
          
          if (altResponse.data.success && altResponse.data.data) {
            if (altResponse.data.data.bookings) {
              bookingsData = altResponse.data.data.bookings;
            } else if (Array.isArray(altResponse.data.data)) {
              bookingsData = altResponse.data.data;
            }
          }
          
          console.log('📋 Processed bookings from alternative endpoint:', bookingsData.length);
          
        } catch (altError) {
          console.error('❌ Both endpoints failed');
          throw mainError; // Throw the original error
        }
      }
      
      // Ensure it's always an array
      const finalBookings = Array.isArray(bookingsData) ? bookingsData : [];
      console.log('📋 Final bookings count:', finalBookings.length);
      
      setBookings(finalBookings);
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('   Error response:', error.response?.data);
      console.error('   Error status:', error.response?.status);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    // Ensure bookings is always an array
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    
    if (filter === 'all') {
      setFilteredBookings(bookingsArray);
    } else {
      const filtered = bookingsArray.filter(b => b.status === filter);
      setFilteredBookings(filtered);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      work_completed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-orange-100 text-orange-800 border-orange-200',
      temp: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="inline" size={14} />,
      confirmed: <FiCheckCircle className="inline" size={14} />,
      in_progress: <FiRefreshCw className="inline animate-spin" size={14} />,
      work_completed: <FiCheckCircle className="inline" size={14} />,
      completed: <FiCheckCircle className="inline" size={14} />,
      cancelled: <FiX className="inline" size={14} />,
      accepted: <FiCheckCircle className="inline" size={14} />,
      rejected: <FiX className="inline" size={14} />,
      paused: <FiClock className="inline" size={14} />,
      temp: <FiAlertCircle className="inline" size={14} />
    };
    return icons[status] || <FiAlertCircle className="inline" size={14} />;
  };

  const handleSubmitReview = async () => {
    if (!reviewingBooking) return;

    try {
      const token = localStorage.getItem('userToken');
      const bookingData = getBookingData(reviewingBooking);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingData.id}/review`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
          bookingId: bookingData.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('Review submitted successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowReviewModal(false);
      setReviewingBooking(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    try {
      const token = localStorage.getItem('userToken');
      const bookingData = getBookingData(cancellingBooking);
      
      // Double-check cancellation is still allowed
      if (!isCancellationAllowed(bookingData)) {
        alert('Cancellation is no longer available. Bookings can only be cancelled up to 2 hours before the scheduled time.');
        setShowCancelModal(false);
        setCancellingBooking(null);
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingData.id}/cancel`,
        {
          cancellationReason: 'Customer requested cancellation',
          cancellationTime: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('Booking cancelled successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowCancelModal(false);
      setCancellingBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
      alert(errorMessage);
    }
  };

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    const printWindow = window.open('', '', 'height=800,width=800');
    
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page {
        size: A4;
        margin: 20mm;
      }
      
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        padding: 0;
        margin: 0;
        color: #333;
        line-height: 1.4;
      }
      
      .invoice-container { 
        max-width: 800px; 
        margin: 0 auto; 
        background: white;
        border: 2px solid #e5e7eb;
      }
      
      .invoice-header { 
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 30px;
        border-bottom: 2px solid #e5e7eb;
        background: #f9fafb;
      }
      
      .company-info h1 {
        font-size: 32px;
        font-weight: bold;
        color: #1e40af;
        margin: 0 0 5px 0;
      }
      
      .company-info p {
        margin: 2px 0;
        font-size: 12px;
        color: #6b7280;
      }
      
      .invoice-title {
        text-align: right;
      }
      
      .invoice-title h2 {
        font-size: 36px;
        font-weight: bold;
        color: #374151;
        margin: 0;
      }
      
      .invoice-number {
        font-size: 14px;
        color: #1e40af;
        font-weight: 600;
        margin: 5px 0;
      }
      
      .invoice-date {
        font-size: 12px;
        color: #6b7280;
      }
      
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        background: #10b981;
        color: white;
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px;
        margin-top: 5px;
      }
      
      .invoice-body {
        padding: 30px;
      }
      
      .billing-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
      }
      
      .bill-to, .service-details {
        flex: 1;
      }
      
      .service-details {
        margin-left: 40px;
      }
      
      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .customer-info, .service-info {
        font-size: 13px;
        line-height: 1.6;
      }
      
      .customer-name {
        font-weight: 600;
        color: #111827;
        font-size: 16px;
        margin-bottom: 5px;
      }
      
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
      }
      
      .info-label {
        color: #6b7280;
        min-width: 120px;
      }
      
      .info-value {
        color: #111827;
        font-weight: 500;
      }
      
      .services-table {
        width: 100%;
        border-collapse: collapse;
        margin: 30px 0;
        border: 1px solid #e5e7eb;
      }
      
      .services-table th {
        background: #f3f4f6;
        padding: 15px;
        text-align: left;
        font-weight: 600;
        font-size: 12px;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .services-table td {
        padding: 15px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 13px;
      }
      
      .services-table .description {
        font-weight: 500;
        color: #111827;
      }
      
      .services-table .quantity, .services-table .rate, .services-table .amount {
        text-align: right;
        font-weight: 500;
      }
      
      .totals-section {
        margin-top: 30px;
        display: flex;
        justify-content: flex-end;
      }
      
      .totals-table {
        width: 300px;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 13px;
      }
      
      .total-row.subtotal {
        border-bottom: 1px solid #e5e7eb;
        color: #6b7280;
      }
      
      .total-row.final {
        border-top: 2px solid #374151;
        padding-top: 15px;
        margin-top: 10px;
        font-size: 18px;
        font-weight: bold;
        color: #111827;
      }
      
      .total-row.final .amount {
        background: #374151;
        color: white;
        padding: 8px 15px;
        border-radius: 4px;
      }
      
      .footer {
        margin-top: 50px;
        text-align: center;
        padding-top: 30px;
        border-top: 2px solid #e5e7eb;
      }
      
      .thank-you {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 15px;
      }
      
      .contact-info {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
      }
      
      .disclaimer {
        font-size: 10px;
        color: #9ca3af;
        margin-top: 20px;
        font-style: italic;
      }
      
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .invoice-container { border: none; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadInvoice = () => {
    // For now, trigger print which allows "Save as PDF"
    handlePrintInvoice();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <FiCheckCircle size={24} />
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm text-green-100">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiCalendar size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">My Bookings</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Manage and track all your service bookings
              </p>
            </div>
            
            {/* Stats Summary */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold mb-1">{Array.isArray(bookings) ? bookings.length : 0}</p>
                <p className="text-sm text-blue-100">Total Bookings</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold mb-1">
                  {Array.isArray(bookings) ? bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length : 0}
                </p>
                <p className="text-sm text-blue-100">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiFilter className="text-primary" size={20} />
          <h3 className="font-semibold text-gray-800">Filter Bookings</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'confirmed', 'in_progress', 'work_completed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all transform hover:scale-105 ${
                filter === status 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'in_progress' ? 'In Progress' : 
               status === 'work_completed' ? 'Work Completed' : 
               status.replace('_', ' ').replace('-', ' ')}
              {status !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({Array.isArray(bookings) ? bookings.filter(b => b.status === status).length : 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCalendar className="text-primary" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {filter === 'all' 
              ? "You haven't made any bookings yet. Start by booking a service!" 
              : `No ${filter === 'in_progress' ? 'in progress' : 
                      filter === 'work_completed' ? 'work completed' : 
                      filter.replace('_', ' ').replace('-', ' ')} bookings at the moment.`}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiPackage size={20} />
            Book a Service Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => {
            const bookingData = getBookingData(booking);
            
            return (
              <div
                key={bookingData.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiPackage className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {bookingData.serviceName}
                          </h3>
                          <p className="text-sm text-gray-500">Booking ID: #{bookingData.id?.slice(-8)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 ml-15">
                        {bookingData.date && (
                          <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-2 text-primary" size={16} />
                            <span className="text-sm font-medium">
                              {new Date(bookingData.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {bookingData.time && (
                          <div className="flex items-center text-gray-600">
                            <FiClock className="mr-2 text-primary" size={16} />
                            <span className="text-sm font-medium">{bookingData.time}</span>
                          </div>
                        )}
                        {bookingData.address && (
                          <div className="flex items-start text-gray-600">
                            <FiMapPin className="mr-2 mt-1 text-primary flex-shrink-0" size={16} />
                            <span className="text-sm">
                              {typeof bookingData.address === 'string' ? bookingData.address : 'Address not available'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 flex items-center gap-2 ${getStatusColor(bookingData.status)}`}>
                      {getStatusIcon(bookingData.status)}
                      {bookingData.status === 'in_progress' ? 'In Progress' : 
                       bookingData.status === 'work_completed' ? 'Work Completed' : 
                       bookingData.status.replace('_', ' ').replace('-', ' ')}
                    </span>
                  </div>

                  {/* Services List */}
                  {bookingData.cartItems && bookingData.cartItems.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Services:</p>
                      <div className="space-y-1">
                        {bookingData.cartItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">• {item.name || item.serviceName || item.productName || 'Service Item'}</span>
                            <span className="text-gray-800 font-medium">₹{item.price || item.amount || item.cost || 0}</span>
                          </div>
                        ))}
                        {bookingData.cartItems.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            +{bookingData.cartItems.length - 3} more service(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {bookingData.amount > 0 && (
                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">
                          ₹{bookingData.amount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (bookingData.id && bookingData.id !== 'N/A') {
                          navigate(`/user/dashboard/bookings/${bookingData.id}`);
                        } else {
                          console.error('Invalid booking ID:', bookingData.id);
                          alert('Unable to view booking details. Please refresh the page and try again.');
                        }
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-medium"
                    >
                      <FiEye size={18} />
                      View Details
                    </button>
                    
                    {/* Quotation Button - Show for confirmed/in-progress bookings */}
                    {['confirmed', 'in_progress', 'work_completed'].includes(bookingData.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewQuotations(bookingData);
                        }}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium border-2 border-blue-200"
                      >
                        <FiFileText size={18} />
                        View Quotations
                      </button>
                    )}
                    
                    {/* Invoice Button - Available for ALL bookings */}
                    <AdaptiveInvoiceButton 
                      booking={booking}
                      className="flex-1 min-w-[140px]"
                    />
                    
                    {['pending', 'confirmed'].includes(bookingData.status) && isCancellationAllowed(bookingData) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancellingBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium border-2 border-red-200"
                      >
                        <FiX size={18} />
                        Cancel Booking
                      </button>
                    )}
                    
                    {['pending', 'confirmed'].includes(bookingData.status) && !isCancellationAllowed(bookingData) && (
                      <div 
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl border-2 border-gray-200 cursor-help"
                        title="Cancellation is only available up to 2 hours before the scheduled service time"
                      >
                        <FiClock size={18} />
                        <span className="text-sm">Cannot Cancel</span>
                      </div>
                    )}
                    
                    {bookingData.status === 'completed' && !bookingData.hasReview && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewingBooking(booking);
                          setShowReviewModal(true);
                        }}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-all font-medium border-2 border-yellow-200"
                      >
                        <FiStar size={18} />
                        Write Review
                      </button>
                    )}
                    
                    {bookingData.status === 'completed' && bookingData.hasReview && (
                      <div className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl border-2 border-green-200">
                        <FiStar size={18} />
                        <span className="text-sm">Review Submitted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && cancellingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiAlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Cancel Booking?</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel this booking for <strong>
                  {getBookingData(cancellingBooking).serviceName}
                </strong>?
              </p>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Cancellation Policy:</strong> Bookings can only be cancelled up to 2 hours before the scheduled service time. Cancellation charges may apply based on the cancellation policy.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-slide-up my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiFileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Invoice</h3>
                  <p className="text-blue-100 text-sm">Booking #{invoiceBooking._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-8">
              <div ref={invoiceRef}>
                <div className="invoice-container">
                  {/* Professional Invoice Header */}
                  <div className="invoice-header">
                    <div className="company-info">
                      <h1>NEXO</h1>
                      <p>ParNets Software India PVT LTD</p>
                      <p>Email: support@nexo.works</p>
                      <p>Phone: +91 1800-XXX-XXXX</p>
                      <p>Website: www.nexo.works</p>
                    </div>
                    <div className="invoice-title">
                      <h2>INVOICE</h2>
                      <div className="invoice-number">INV-{invoiceBooking._id ? invoiceBooking._id.slice(-8).toUpperCase() : 'N/A'}</div>
                      <div className="invoice-date">Date: {new Date().toLocaleDateString('en-IN')}</div>
                      <div className="status-badge">
                        {invoiceBooking.status === 'completed' ? 'PAID' : invoiceBooking.status?.toUpperCase() || 'PENDING'}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Body */}
                  <div className="invoice-body">
                    {/* Billing Section */}
                    <div className="billing-section">
                      <div className="bill-to">
                        <div className="section-title">Bill To</div>
                        <div className="customer-info">
                          <div className="customer-name">
                            {invoiceBooking.user?.name || 
                             invoiceBooking.userName || 
                             invoiceBooking.customerName || 
                             'Customer'}
                          </div>
                          <div className="info-row">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">
                              {invoiceBooking.user?.phone || 
                               invoiceBooking.userPhone || 
                               invoiceBooking.customerPhone || 
                               'N/A'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Address:</span>
                            <span className="info-value">
                              {formatAddress(invoiceBooking.address || 
                                           invoiceBooking.userAddress ||
                                           (invoiceBooking.user?.addresses?.[0])) || 
                               'Address not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="service-details">
                        <div className="section-title">Service Details</div>
                        <div className="service-info">
                          <div className="info-row">
                            <span className="info-label">Booking ID:</span>
                            <span className="info-value">#{invoiceBooking._id ? invoiceBooking._id.slice(-8) : 'N/A'}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Service Date:</span>
                            <span className="info-value">
                              {invoiceBooking.scheduledDate || invoiceBooking.bookingDate || invoiceBooking.createdAt ? 
                                new Date(invoiceBooking.scheduledDate || invoiceBooking.bookingDate || invoiceBooking.createdAt).toLocaleDateString('en-IN') : 
                                'Date not available'}
                            </span>
                          </div>
                          {(invoiceBooking.scheduledTime || invoiceBooking.bookingTime) && (
                            <div className="info-row">
                              <span className="info-label">Service Time:</span>
                              <span className="info-value">{invoiceBooking.scheduledTime || invoiceBooking.bookingTime}</span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span className="info-value">{invoiceBooking.status?.charAt(0).toUpperCase() + invoiceBooking.status?.slice(1) || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services Table */}
                    <table className="services-table">
                      <thead>
                        <tr>
                          <th className="description">Description</th>
                          <th className="quantity">Qty</th>
                          <th className="rate">Rate</th>
                          <th className="amount">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceBooking.cartItems && invoiceBooking.cartItems.length > 0 ? (
                          invoiceBooking.cartItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="description">
                                <div>{item.name || item.serviceName || item.productName || 'Service Item'}</div>
                                {item.description && (
                                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                    {item.description}
                                  </div>
                                )}
                              </td>
                              <td className="quantity">{item.quantity || 1}</td>
                              <td className="rate">₹{item.price || item.amount || item.cost || 0}</td>
                              <td className="amount">₹{(item.price || item.amount || item.cost || 0) * (item.quantity || 1)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="description">
                              <div>
                                {invoiceBooking.serviceName || 
                                 (invoiceBooking.subService && invoiceBooking.subService.name) ||
                                 'Professional Service'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                Service provided on {invoiceBooking.scheduledDate || invoiceBooking.bookingDate || invoiceBooking.createdAt ? 
                                  new Date(invoiceBooking.scheduledDate || invoiceBooking.bookingDate || invoiceBooking.createdAt).toLocaleDateString('en-IN') : 
                                  'scheduled date'}
                              </div>
                            </td>
                            <td className="quantity">1</td>
                            <td className="rate">₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</td>
                            <td className="amount">₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="totals-section">
                      <div className="totals-table">
                        <div className="total-row subtotal">
                          <span>Subtotal</span>
                          <span>₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</span>
                        </div>
                        
                        {(invoiceBooking.gstAmount && invoiceBooking.gstAmount > 0) && (
                          <div className="total-row subtotal">
                            <span>GST</span>
                            <span>₹{invoiceBooking.gstAmount}</span>
                          </div>
                        )}
                        
                        {(invoiceBooking.discount && invoiceBooking.discount > 0) && (
                          <div className="total-row subtotal" style={{ color: '#10b981' }}>
                            <span>Discount</span>
                            <span>-₹{invoiceBooking.discount}</span>
                          </div>
                        )}
                        
                        {(invoiceBooking.usewallet && invoiceBooking.usewallet > 0) && (
                          <div className="total-row subtotal" style={{ color: '#10b981' }}>
                            <span>Wallet Used</span>
                            <span>-₹{invoiceBooking.usewallet}</span>
                          </div>
                        )}
                        
                        <div className="total-row final">
                          <span>Total Amount</span>
                          <span className="amount">₹{invoiceBooking.totalAmount || invoiceBooking.amount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                      <div className="thank-you">Thank you for choosing Nexo!</div>
                      <div className="contact-info">
                        For any queries or support, please contact us:<br/>
                        Email: support@nexo.works | Phone: +91 1800-XXX-XXXX<br/>
                        Visit us at: www.nexo.works
                      </div>
                      <div className="disclaimer">
                        This is a computer-generated invoice and does not require a physical signature.
                        All services are subject to our terms and conditions.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-semibold"
                >
                  <FiPrinter size={20} />
                  Print Invoice
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  <FiDownload size={20} />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiStar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Write a Review</h3>
                  <p className="text-yellow-100 text-sm">Share your experience</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {getBookingData(reviewingBooking).serviceName}
                </h4>
                <p className="text-sm text-gray-600">
                  Booking ID: #{getBookingData(reviewingBooking).id?.slice(-8)}
                </p>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`p-2 rounded-lg transition-all ${
                        star <= reviewData.rating
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <FiStar size={24} fill={star <= reviewData.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {reviewData.rating === 1 && 'Poor'}
                  {reviewData.rating === 2 && 'Fair'}
                  {reviewData.rating === 3 && 'Good'}
                  {reviewData.rating === 4 && 'Very Good'}
                  {reviewData.rating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this service..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewingBooking(null);
                    setReviewData({ rating: 5, comment: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotations Modal */}
      {selectedBookingForQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Quotations for {selectedBookingForQuotation.serviceName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Booking ID: #{selectedBookingForQuotation.id?.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookingForQuotation(null);
                    setBookingQuotations({});
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {bookingQuotations[selectedBookingForQuotation.id]?.length > 0 ? (
                <div className="space-y-4">
                  {bookingQuotations[selectedBookingForQuotation.id].map((quotation) => (
                    <QuotationCard
                      key={quotation._id}
                      quotation={quotation}
                      booking={selectedBookingForQuotation}
                      onAccept={handleAcceptQuotation}
                      onReject={handleRejectQuotation}
                      onViewDetails={handleViewQuotationDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Yet</h3>
                  <p className="text-gray-500">
                    The service partner will provide quotations for any additional materials or services needed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quotation Details Modal */}
      <QuotationDetailsModal
        quotation={selectedQuotation}
        booking={selectedBookingForQuotation}
        isOpen={showQuotationModal}
        onClose={() => {
          setShowQuotationModal(false);
          setSelectedQuotation(null);
        }}
      />
    </div>
  );
};

export default MyBookings;