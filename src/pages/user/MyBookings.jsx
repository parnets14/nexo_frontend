import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiClock, FiFilter, FiEye, FiX, FiCheckCircle, 
  FiAlertCircle, FiPhone, FiMessageCircle, FiStar, FiRefreshCw, FiPackage,
  FiFileText, FiPrinter, FiDownload, FiEdit3, FiThumbsUp, FiHeart 
} from 'react-icons/fi';
import axios from 'axios';

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: '',
    hoveredRating: 0
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchBookings();
    
    // Check if user just came back from payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      // Remove the payment parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      setSuccessMessage('Payment successful! Your booking has been confirmed.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Refresh bookings after a short delay to ensure backend has processed the payment
      setTimeout(() => {
        console.log('🔄 Refreshing bookings after successful payment...');
        fetchBookings();
      }, 2000);
    }
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 Fetching user bookings...');
      console.log('   Token exists:', !!token);
      console.log('   Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      console.log('   API URL:', `${import.meta.env.VITE_API_URL}/api/user/bookings`);
      
      if (!token) {
        console.error('❌ No authentication token found');
        setBookings([]);
        setLoading(false);
        return;
      }
      
      console.log('📋 Calling bookings API...');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/bookings`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('📋 Bookings API Response Status:', response.status);
      console.log('📋 Bookings API Response:', response.data);
      
      // Backend returns data.data (array of bookings) or data.bookings (array of bookings)
      const bookingsData = response.data.data?.bookings || response.data.data || response.data.bookings || [];
      console.log('📋 Processed bookings data:', bookingsData);
      console.log('📋 Bookings count:', Array.isArray(bookingsData) ? bookingsData.length : 'Not an array');
      
      // Ensure it's always an array
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      setBookings([]); // Set empty array on error
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
      setFilteredBookings(bookingsArray.filter(b => b.status === filter));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="inline" size={14} />,
      confirmed: <FiCheckCircle className="inline" size={14} />,
      'in_progress': <FiRefreshCw className="inline animate-spin" size={14} />,
      completed: <FiCheckCircle className="inline" size={14} />,
      cancelled: <FiX className="inline" size={14} />
    };
    return icons[status] || <FiAlertCircle className="inline" size={14} />;
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    // Check if cancellation is allowed
    if (!canCancelBooking(cancellingBooking)) {
      alert('Cancellation is only allowed within 2 hours of booking creation.');
      setShowCancelModal(false);
      setCancellingBooking(null);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 Cancel booking request details:');
      console.log('   Booking ID:', cancellingBooking._id);
      console.log('   Token exists:', !!token);
      console.log('   API URL:', `${import.meta.env.VITE_API_URL}/api/user/bookings/${cancellingBooking._id}/cancel`);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${cancellingBooking._id}/cancel-simple`,
        { 
          cancellationReason: 'Customer requested cancellation within 2 hours',
          cancellationTime: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Cancel booking response:', response.data);
      
      setSuccessMessage('Booking cancelled successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowCancelModal(false);
      setCancellingBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      console.error('   Error response:', error.response?.data);
      console.error('   Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
      alert(errorMessage);
    }
  };

  const handlePrintInvoice = (booking) => {
    // Use the passed booking as invoiceBooking for the print function
    const invoiceBooking = booking;
    
    const printWindow = window.open('', '_blank');
    
    // Get the logo URL - try PNG first, fallback to SVG
    const logoUrl = `${window.location.origin}/logo.png`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${booking._id.slice(-8).toUpperCase()}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #1f2937;
              line-height: 1.4;
              background: #ffffff;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              font-size: 12px;
            }
            
            .invoice-container { 
              max-width: 210mm;
              margin: 0 auto;
              padding: 15mm;
              background: #ffffff;
              min-height: 297mm;
              height: 297mm;
              overflow: hidden;
            }
            
            /* Header Section - Compact */
            .invoice-header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .company-section {
              flex: 1;
            }
            
            .company-logo {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            
            .logo-container {
              width: 60px;
              height: 60px;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.1));
            }
            
            .logo-svg-fallback {
              display: none;
              width: 50px;
              height: 50px;
              filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.3));
            }
            
            .company-tagline {
              color: #6b7280;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 5px;
            }
            
            .company-details {
              color: #6b7280;
              font-size: 10px;
              line-height: 1.4;
            }
            
            .company-details strong {
              color: #374151;
              font-weight: 600;
            }
            
            .invoice-meta {
              text-align: right;
              flex-shrink: 0;
            }
            
            .invoice-title {
              font-size: 28px;
              font-weight: 300;
              color: #1f2937;
              margin-bottom: 5px;
              letter-spacing: -0.5px;
            }
            
            .invoice-number {
              font-size: 14px;
              font-weight: 600;
              color: #3b82f6;
              margin-bottom: 8px;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            
            .invoice-date {
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 8px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            
            .status-confirmed { background: #dbeafe; color: #1e40af; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #dc2626; }
            
            /* Details Section - Compact */
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 25px;
            }
            
            .detail-section h3 {
              font-size: 11px;
              font-weight: 700;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
              padding-bottom: 4px;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .detail-item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 6px;
              padding: 2px 0;
            }
            
            .detail-label {
              font-size: 11px;
              color: #6b7280;
              font-weight: 500;
              min-width: 80px;
            }
            
            .detail-value {
              font-size: 11px;
              color: #1f2937;
              font-weight: 600;
              text-align: right;
              flex: 1;
            }
            
            .customer-name {
              font-size: 13px !important;
              font-weight: 700 !important;
              color: #1f2937 !important;
              margin-bottom: 2px;
            }
            
            /* Table Section - Compact */
            .services-section {
              margin-bottom: 20px;
            }
            
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              background: #ffffff;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .invoice-table thead {
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            }
            
            .invoice-table th {
              padding: 8px 12px;
              text-align: left;
              font-weight: 700;
              font-size: 10px;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 11px;
              vertical-align: top;
            }
            
            .invoice-table tbody tr:last-child td {
              border-bottom: none;
            }
            
            .service-name {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 2px;
            }
            
            .service-description {
              font-size: 10px;
              color: #6b7280;
              line-height: 1.3;
            }
            
            .quantity-cell, .rate-cell, .amount-cell {
              text-align: right;
              font-weight: 600;
              color: #1f2937;
            }
            
            /* Totals Section - Compact */
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }
            
            .totals-table {
              min-width: 250px;
            }
            
            .totals-table tr {
              border-bottom: 1px solid #f3f4f6;
            }
            
            .totals-table tr:last-child {
              border-bottom: none;
            }
            
            .totals-table td {
              padding: 6px 0;
              font-size: 11px;
            }
            
            .totals-label {
              color: #6b7280;
              font-weight: 500;
              padding-right: 25px;
            }
            
            .totals-value {
              text-align: right;
              font-weight: 600;
              color: #1f2937;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            
            .total-row {
              background: linear-gradient(135deg, #1f2937, #374151);
              color: #ffffff !important;
            }
            
            .total-row td {
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 4px;
            }
            
            .total-row .totals-label,
            .total-row .totals-value {
              color: #ffffff !important;
            }
            
            /* Footer - Compact */
            .invoice-footer {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #f3f4f6;
              text-align: center;
            }
            
            .footer-title {
              font-size: 13px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .footer-text {
              color: #6b7280;
              font-size: 10px;
              line-height: 1.4;
              margin-bottom: 4px;
            }
            
            .footer-contact {
              color: #3b82f6;
              font-weight: 600;
            }
            
            .footer-legal {
              font-size: 9px;
              color: #9ca3af;
              margin-top: 10px;
              font-style: italic;
            }
            
            /* Print Styles - A4 Optimized */
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
                font-size: 11px;
              }
              
              .invoice-container { 
                margin: 0; 
                padding: 0;
                box-shadow: none;
                max-width: none;
                height: auto;
                min-height: auto;
              }
              
              .invoice-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
              
              .invoice-details {
                margin-bottom: 20px;
                gap: 20px;
              }
              
              .services-section {
                margin-bottom: 15px;
              }
              
              .totals-section {
                margin-bottom: 15px;
              }
              
              .invoice-footer {
                margin-top: 15px;
                padding-top: 10px;
              }
              
              .logo-container {
                width: 50px !important;
                height: 50px !important;
              }
              
              .logo-img {
                width: 100% !important;
                height: 100% !important;
              }
              
              .logo-svg-fallback {
                width: 40px !important;
                height: 40px !important;
              }
              
              .invoice-title {
                font-size: 24px;
              }
              
              .invoice-table th,
              .invoice-table td {
                padding: 6px 8px;
              }
            }
          </style>
          <script>
            // Handle logo loading with fallback
            function handleLogoError(img) {
              img.style.display = 'none';
              document.querySelector('.logo-svg-fallback').style.display = 'block';
            }
          </script>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header Section -->
            <div class="invoice-header">
              <div class="company-section">
                <div class="company-logo">
                  <div class="logo-container">
                    <img src="${logoUrl}" alt="Company Logo" class="logo-img" onerror="handleLogoError(this)" />
                    <svg class="logo-svg-fallback" width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z" fill="#3b82f6"/>
                      <path d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z" fill="#3b82f6"/>
                      <path d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z" fill="#3b82f6"/>
                      <path d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z" fill="#3b82f6"/>
                      <circle cx="24" cy="24" r="3" fill="#ffffff"/>
                    </svg>
                  </div>
                </div>
                <div class="company-tagline">Professional Home Services</div>
                <div class="company-details">
                  <strong>Professional Home Services Private Limited</strong><br>
                  CIN: U74999KA2023PTC123456<br>
                  GSTIN: 29ABCDE1234F1Z5<br>
                  <br>
                  <strong>Registered Office:</strong><br>
                  #123, Tech Park, Whitefield<br>
                  Bangalore, Karnataka - 560066<br>
                  <br>
                  <strong>Contact:</strong> +91-80-4567-8900<br>
                  <strong>Email:</strong> support@company.works<br>
                  <strong>Website:</strong> www.nexo.works 
                </div>
              </div>
              
              <div class="invoice-meta">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#INV-${invoiceBooking._id.slice(-8).toUpperCase()}</div>
                <div class="invoice-date">
                  <strong>Date:</strong> ${new Date(invoiceBooking.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div class="status-badge status-${invoiceBooking.status}">
                  ${invoiceBooking.status.toUpperCase()}
                </div>
              </div>
            </div>

            <!-- Details Section -->
            <div class="invoice-details">
              <div class="detail-section">
                <h3>Bill To</h3>
                <div class="detail-item">
                  <div class="detail-value customer-name">${invoiceBooking.customerDetails?.name || 'N/A'}</div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${invoiceBooking.customerDetails?.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${invoiceBooking.customerDetails?.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${invoiceBooking.location?.address || 'N/A'}</span>
                </div>
                ${invoiceBooking.location?.landmark ? `
                  <div class="detail-item">
                    <span class="detail-label">Landmark:</span>
                    <span class="detail-value">${invoiceBooking.location.landmark}</span>
                  </div>
                ` : ''}
                <div class="detail-item">
                  <span class="detail-label">Pincode:</span>
                  <span class="detail-value">${invoiceBooking.location?.pincode || 'N/A'}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Service Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${invoiceBooking._id.slice(-8).toUpperCase()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Date:</span>
                  <span class="detail-value">${new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Time:</span>
                  <span class="detail-value">${invoiceBooking.scheduledTime}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Mode:</span>
                  <span class="detail-value">${invoiceBooking.paymentMode?.toUpperCase() || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Status:</span>
                  <span class="detail-value">${invoiceBooking.paymentStatus?.toUpperCase() || 'N/A'}</span>
                </div>
                ${invoiceBooking.txnid ? `
                  <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${invoiceBooking.txnid}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Services Section -->
            <div class="services-section">
              <h2 class="section-title">Services & Items</h2>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 15%;">Quantity</th>
                    <th style="width: 17.5%;">Rate</th>
                    <th style="width: 17.5%;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceBooking.cartItems && invoiceBooking.cartItems.length > 0 ? 
                    invoiceBooking.cartItems.map(item => `
                      <tr>
                        <td>
                          <div class="service-name">${item.name || item.serviceName || 'Service'}</div>
                          ${item.description ? `<div class="service-description">${item.description}</div>` : ''}
                        </td>
                        <td class="quantity-cell">${item.quantity || 1}</td>
                        <td class="rate-cell">₹${(item.price || item.amount || 0).toLocaleString('en-IN')}</td>
                        <td class="amount-cell">₹${((item.price || item.amount || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td>
                          <div class="service-name">${invoiceBooking.serviceName || 'Service Booking'}</div>
                          <div class="service-description">Professional home service booking</div>
                        </td>
                        <td class="quantity-cell">1</td>
                        <td class="rate-cell">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                        <td class="amount-cell">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    `
                  }
                </tbody>
              </table>
            </div>

            <!-- Totals Section -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="totals-label">Subtotal:</td>
                  <td class="totals-value">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ${invoiceBooking.gstAmount ? `
                  <tr>
                    <td class="totals-label">GST (18%):</td>
                    <td class="totals-value">₹${invoiceBooking.gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                ${invoiceBooking.usewallet && invoiceBooking.usewallet > 0 ? `
                  <tr>
                    <td class="totals-label">Wallet Applied:</td>
                    <td class="totals-value">-₹${invoiceBooking.usewallet.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="totals-label">TOTAL AMOUNT:</td>
                  <td class="totals-value">₹${(invoiceBooking.totalAmount || invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            ${invoiceBooking.specialInstructions ? `
              <div class="instructions-section">
                <div class="instructions-title">Special Instructions</div>
                <div class="instructions-text">${invoiceBooking.specialInstructions}</div>
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="invoice-footer">
              <div class="footer-title">Thank You for Choosing Our Services!</div>
              <div class="footer-text">
                For any queries regarding this invoice, please contact us at 
                <span class="footer-contact">support@company.works</span> or call 
                <span class="footer-contact">+91-80-4567-8900</span>
              </div>
              <div class="footer-text">
                Visit our website at <span class="footer-contact">www.nexo.works </span> for more services
              </div>
              <div class="footer-legal">
                This is a computer-generated invoice and does not require a physical signature.<br>
                Subject to Bangalore jurisdiction. Terms and conditions apply.
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadInvoice = () => {
    // For now, trigger print which allows "Save as PDF"
    handlePrintInvoice();
  };

  // Check if booking can be cancelled (within 2 hours of creation)
  const canCancelBooking = (booking) => {
    const bookingTime = new Date(booking.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - bookingTime;
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    return timeDifference <= twoHoursInMs && 
           ['pending', 'confirmed'].includes(booking.status);
  };

  // Get remaining time for cancellation
  const getCancellationTimeRemaining = (booking) => {
    const bookingTime = new Date(booking.createdAt);
    const currentTime = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const timePassed = currentTime - bookingTime;
    const timeRemaining = twoHoursInMs - timePassed;
    
    if (timeRemaining <= 0) return null;
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return { hours, minutes };
  };

  // Handle feedback modal
  const handleOpenFeedback = (booking) => {
    setFeedbackBooking(booking);
    setFeedbackData({
      rating: 0,
      comment: '',
      hoveredRating: 0
    });
    setShowFeedbackModal(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    setFeedbackBooking(null);
    setFeedbackData({
      rating: 0,
      comment: '',
      hoveredRating: 0
    });
  };

  const handleRatingClick = (rating) => {
    setFeedbackData(prev => ({ ...prev, rating }));
  };

  const handleRatingHover = (rating) => {
    setFeedbackData(prev => ({ ...prev, hoveredRating: rating }));
  };

  const handleRatingLeave = () => {
    setFeedbackData(prev => ({ ...prev, hoveredRating: 0 }));
  };

  const handleCommentChange = (e) => {
    const comment = e.target.value;
    if (comment.length <= 500) {
      setFeedbackData(prev => ({ ...prev, comment }));
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.rating) {
      alert('Please select a rating');
      return;
    }

    if (!feedbackData.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    if (feedbackData.comment.trim().length < 10) {
      alert('Review comment must be at least 10 characters long');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${feedbackBooking._id}/review`,
        {
          rating: feedbackData.rating,
          comment: feedbackData.comment.trim(),
          type: 'booking'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Review submitted successfully:', response.data);
      
      setSuccessMessage('Thank you for your feedback! Your review has been submitted successfully.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      handleCloseFeedback();
      
      // Refresh bookings to show updated review status
      fetchBookings();
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Check if booking has been reviewed
  const hasBeenReviewed = (booking) => {
    return booking.hasReview || booking.reviewSubmitted || false;
  };

  // Get star rating display
  const getStarRating = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          size={size}
          className={i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    setLoading(true);
                    fetchBookings();
                  }}
                  className="ml-auto bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
                  title="Refresh bookings"
                >
                  <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline text-sm">Refresh</span>
                </button>
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
                  {Array.isArray(bookings) ? bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length : 0}
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
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all transform hover:scale-105 ${
                filter === status 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
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
              : `No ${filter.replace('-', ' ')} bookings at the moment.`}
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
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
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
                          {booking.serviceName || 'Service Booking'}
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-500">Booking ID: #{booking._id.slice(-8)}</p>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            📄 Invoice Available
                          </span>
                          {booking.status === 'completed' && booking.hasReview && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <FiStar size={10} className="fill-current" />
                              Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-15">
                      <div className="flex items-center text-gray-600">
                        <FiCalendar className="mr-2 text-primary" size={16} />
                        <span className="text-sm font-medium">
                          {new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {booking.scheduledTime && (
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2 text-primary" size={16} />
                          <span className="text-sm font-medium">{booking.scheduledTime}</span>
                        </div>
                      )}
                      {(booking.location?.address || booking.address) && (
                        <div className="flex items-start text-gray-600">
                          <FiMapPin className="mr-2 mt-1 text-primary flex-shrink-0" size={16} />
                          <span className="text-sm">{booking.location?.address || booking.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Quick Invoice Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInvoiceBooking(booking);
                        setShowInvoiceModal(true);
                      }}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm flex items-center gap-1 border border-blue-200"
                      title="View Invoice"
                    >
                      <FiFileText size={14} />
                      Invoice
                    </button>
                    
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Services List */}
                {booking.cartItems && booking.cartItems.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Services:</p>
                    <div className="space-y-1">
                      {booking.cartItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">• {item.name || item.serviceName}</span>
                          <span className="text-gray-800 font-medium">₹{item.price || item.amount || 0}</span>
                        </div>
                      ))}
                      {booking.cartItems.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{booking.cartItems.length - 3} more service(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {booking.totalAmount && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{booking.totalAmount}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/dashboard/bookings/${booking._id}`);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-medium"
                  >
                    <FiEye size={18} />
                    View Details
                  </button>
                  
                  {/* Invoice Options - Always show for all bookings */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInvoiceBooking(booking);
                      setShowInvoiceModal(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-medium border-2 border-blue-200"
                  >
                    <FiFileText size={18} />
                    View Invoice
                  </button>

                  {/* Print Invoice Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintInvoice(booking);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-medium border-2 border-green-200"
                  >
                    <FiPrinter size={18} />
                    Print Invoice
                  </button>
                  
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <>
                      {canCancelBooking(booking) ? (
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
                      ) : (
                        <div className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 text-gray-400 rounded-xl border-2 border-gray-200 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <FiClock size={16} />
                            <span className="text-sm font-medium">Cancellation Expired</span>
                          </div>
                          <div className="text-xs mt-1">
                            (2-hour window passed)
                          </div>
                        </div>
                      )}
                      
                      {/* Show remaining time for cancellation */}
                      {canCancelBooking(booking) && (() => {
                        const timeRemaining = getCancellationTimeRemaining(booking);
                        return timeRemaining && (
                          <div className="w-full mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-700">
                              <FiAlertCircle size={16} />
                              <span className="text-sm font-medium">
                                Cancellation available for {timeRemaining.hours}h {timeRemaining.minutes}m more
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                  
                  {booking.status === 'completed' && (
                    <>
                      {hasBeenReviewed(booking) ? (
                        <div className="flex-1 min-w-[140px] px-4 py-2.5 bg-green-50 text-green-700 rounded-xl border-2 border-green-200 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <FiCheckCircle size={16} />
                            <span className="text-sm font-medium">Review Submitted</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {getStarRating(booking.userRating || 5, 12)}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFeedback(booking);
                          }}
                          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-medium border-2 border-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <FiStar size={18} />
                          Share Feedback
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel this booking for <strong>{cancellingBooking.serviceName}</strong>?
              </p>
              
              {/* 2-Hour Policy Information */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      • Free cancellation within 2 hours of booking
                    </p>
                    <p className="text-sm text-blue-700 mb-2">
                      • After 2 hours, cancellation charges may apply
                    </p>
                    {canCancelBooking(cancellingBooking) && (() => {
                      const timeRemaining = getCancellationTimeRemaining(cancellingBooking);
                      return timeRemaining && (
                        <p className="text-sm font-semibold text-green-700">
                          ✅ You can cancel for free (Time remaining: {timeRemaining.hours}h {timeRemaining.minutes}m)
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This action cannot be undone. You will receive a confirmation email after cancellation.
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
                  {/* Invoice Header */}
                  <div className="invoice-header text-center mb-8 pb-6 border-b-2 border-primary">
                    <div className="invoice-logo flex justify-center items-center mb-6">
                    <div className="logo-display-container">
                      <img 
                        src="/logo.png" 
                        alt="Company Logo" 
                        className="h-24 w-auto max-w-xs object-contain mx-auto"
                        style={{
                          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden flex justify-center items-center">
                        <svg width="96" height="96" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                          <path d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z" fill="#3b82f6"/>
                          <path d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z" fill="#3b82f6"/>
                          <path d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z" fill="#3b82f6"/>
                          <path d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z" fill="#3b82f6"/>
                          <circle cx="24" cy="24" r="3" fill="#ffffff"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                    <p className="text-gray-600">Professional Home Services</p>
                    <p className="text-sm text-gray-500 mt-2">Invoice Date: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Bill To:</h4>
                      <p className="text-gray-700 font-medium">{invoiceBooking.userName || 'Customer'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceBooking.userPhone || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceBooking.address || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-800 mb-3">Invoice Details:</h4>
                      <p className="text-sm text-gray-600">Invoice #: <span className="font-medium text-gray-800">INV-{invoiceBooking._id.slice(-8).toUpperCase()}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Booking ID: <span className="font-medium text-gray-800">#{invoiceBooking._id.slice(-8)}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Date: <span className="font-medium text-gray-800">{new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN')}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-medium capitalize ${invoiceBooking.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{invoiceBooking.status}</span></p>
                    </div>
                  </div>

                  {/* Service Details Table */}
                  <table className="w-full border-collapse mb-8">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-4 font-bold text-gray-800 border-b-2 border-gray-300">Service Description</th>
                        <th className="text-center p-4 font-bold text-gray-800 border-b-2 border-gray-300">Quantity</th>
                        <th className="text-right p-4 font-bold text-gray-800 border-b-2 border-gray-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceBooking.cartItems && invoiceBooking.cartItems.length > 0 ? (
                        invoiceBooking.cartItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-4 border-b border-gray-200">
                              <p className="font-medium text-gray-800">{item.name || item.serviceName}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                            </td>
                            <td className="p-4 text-center border-b border-gray-200 text-gray-700">{item.quantity || 1}</td>
                            <td className="p-4 text-right border-b border-gray-200 font-medium text-gray-800">₹{item.price || item.amount || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-4 border-b border-gray-200">
                            <p className="font-medium text-gray-800">{invoiceBooking.serviceName || 'Service'}</p>
                            <p className="text-sm text-gray-600 mt-1">Booking Date: {new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN')}</p>
                            {invoiceBooking.scheduledTime && (
                              <p className="text-sm text-gray-600">Time: {invoiceBooking.scheduledTime}</p>
                            )}
                          </td>
                          <td className="p-4 text-center border-b border-gray-200 text-gray-700">1</td>
                          <td className="p-4 text-right border-b border-gray-200 font-medium text-gray-800">₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Total Section */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-2 text-gray-700">
                        <span>Subtotal:</span>
                        <span>₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</span>
                      </div>
                      {invoiceBooking.gstAmount > 0 && (
                        <div className="flex justify-between py-2 text-gray-700">
                          <span>GST (18%):</span>
                          <span>₹{invoiceBooking.gstAmount}</span>
                        </div>
                      )}
                      {invoiceBooking.usewallet > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Wallet Used:</span>
                          <span>- ₹{invoiceBooking.usewallet}</span>
                        </div>
                      )}
                      {invoiceBooking.discount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Discount:</span>
                          <span>- ₹{invoiceBooking.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg text-primary">
                        <span>Total Amount:</span>
                        <span>₹{invoiceBooking.totalAmount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-6 border-t border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">Thank you for choosing our services!</p>
                    <p className="text-xs text-gray-500">For any queries, contact us at support@nexo.works| +91 1800-XXX-XXXX</p>
                    <p className="text-xs text-gray-400 mt-2">This is a computer-generated invoice and does not require a signature.</p>
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

      {/* Professional Feedback Modal */}
      {showFeedbackModal && feedbackBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FiHeart size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Share Your Experience</h3>
                    <p className="text-yellow-100 text-sm">Help us improve our services with your valuable feedback</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseFeedback}
                  className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Service Information */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiPackage className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      {feedbackBooking.serviceName || 'Service Booking'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={14} className="text-blue-500" />
                        <span>{new Date(feedbackBooking.scheduledDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock size={14} className="text-blue-500" />
                        <span>{feedbackBooking.scheduledTime || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Booking ID:</span> #{feedbackBooking._id.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiStar className="text-yellow-500" size={24} />
                  Rate Your Experience
                </h4>
                <p className="text-gray-600 mb-6">How would you rate the overall service quality?</p>
                
                <div className="flex items-center justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={handleRatingLeave}
                      className="transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 rounded-full p-2"
                    >
                      <FiStar
                        size={40}
                        className={`transition-colors duration-200 ${
                          star <= (feedbackData.hoveredRating || feedbackData.rating)
                            ? 'text-yellow-400 fill-current drop-shadow-lg'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Rating Labels */}
                <div className="text-center">
                  {feedbackData.rating > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
                      <FiThumbsUp className="text-yellow-600" size={16} />
                      <span className="text-yellow-800 font-medium">
                        {feedbackData.rating === 1 && 'Poor'}
                        {feedbackData.rating === 2 && 'Fair'}
                        {feedbackData.rating === 3 && 'Good'}
                        {feedbackData.rating === 4 && 'Very Good'}
                        {feedbackData.rating === 5 && 'Excellent'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiEdit3 className="text-blue-500" size={24} />
                  Share Your Thoughts
                </h4>
                <p className="text-gray-600 mb-4">Tell us about your experience. What went well? What could be improved?</p>
                
                <div className="relative">
                  <textarea
                    value={feedbackData.comment}
                    onChange={handleCommentChange}
                    placeholder="Share your detailed feedback here... (minimum 10 characters)"
                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-700 placeholder-gray-400"
                    maxLength={500}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {feedbackData.comment.length}/500
                  </div>
                </div>

                {/* Character count and validation */}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {feedbackData.comment.length >= 10 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <FiCheckCircle size={14} />
                        <span>Great! Your review looks good</span>
                      </div>
                    ) : feedbackData.comment.length > 0 ? (
                      <div className="flex items-center gap-1 text-orange-600">
                        <FiAlertCircle size={14} />
                        <span>Please write at least {10 - feedbackData.comment.length} more characters</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Minimum 10 characters required</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseFeedback}
                  disabled={submittingFeedback}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback || !feedbackData.rating || feedbackData.comment.trim().length < 10}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl hover:from-yellow-500 hover:to-orange-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {submittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FiHeart size={20} />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>

              {/* Privacy Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-1">Privacy & Review Policy</h5>
                    <p className="text-sm text-blue-700">
                      Your review will be moderated before being published. We respect your privacy and will only use your feedback to improve our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
