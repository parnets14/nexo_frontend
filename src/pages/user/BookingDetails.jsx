import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCalendar, FiMapPin, FiUser, FiPhone, FiClock,
  FiFileText, FiPrinter, FiDownload, FiX, FiStar, FiHeart, FiEdit3,
  FiThumbsUp, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: '',
    hoveredRating: 0
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns data.data (the booking object)
      const bookingData = response.data.data || response.data.booking;
      
      // Check if booking has been reviewed
      if (bookingData) {
        try {
          const reviewResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/user/bookings`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const allBookings = reviewResponse.data.data?.bookings || reviewResponse.data.data || [];
          const currentBooking = allBookings.find(b => b._id === bookingId);
          if (currentBooking) {
            bookingData.hasReview = currentBooking.hasReview;
            bookingData.userRating = currentBooking.userRating;
            bookingData.reviewSubmitted = currentBooking.reviewSubmitted;
          }
        } catch (reviewError) {
          console.log('Could not fetch review status:', reviewError);
        }
      }
      
      setBooking(bookingData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle feedback modal
  const handleOpenFeedback = () => {
    setFeedbackData({
      rating: 0,
      comment: '',
      hoveredRating: 0
    });
    setShowFeedbackModal(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
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
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}/review`,
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
      
      // Refresh booking details to show updated review status
      fetchBookingDetails();
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Check if booking has been reviewed
  const hasBeenReviewed = () => {
    return booking?.hasReview || booking?.reviewSubmitted || false;
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

  const handlePrintInvoice = () => {
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
                <div class="invoice-number">#INV-${booking._id.slice(-8).toUpperCase()}</div>
                <div class="invoice-date">
                  <strong>Date:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div class="status-badge status-${booking.status}">
                  ${booking.status.toUpperCase()}
                </div>
              </div>
            </div>

            <!-- Details Section -->
            <div class="invoice-details">
              <div class="detail-section">
                <h3>Bill To</h3>
                <div class="detail-item">
                  <div class="detail-value customer-name">${booking.customerDetails?.name || booking.user?.name || 'Customer'}</div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${booking.customerDetails?.phone || booking.user?.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${booking.customerDetails?.email || booking.user?.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${booking.location?.address || booking.address || 'N/A'}</span>
                </div>
                ${booking.location?.landmark ? `
                  <div class="detail-item">
                    <span class="detail-label">Landmark:</span>
                    <span class="detail-value">${booking.location.landmark}</span>
                  </div>
                ` : ''}
                <div class="detail-item">
                  <span class="detail-label">Pincode:</span>
                  <span class="detail-value">${booking.location?.pincode || 'N/A'}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Service Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${booking._id.slice(-8).toUpperCase()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Date:</span>
                  <span class="detail-value">${new Date(booking.scheduledDate || booking.bookingDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Time:</span>
                  <span class="detail-value">${booking.scheduledTime || booking.bookingTime || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Mode:</span>
                  <span class="detail-value">${booking.paymentMode?.toUpperCase() || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Status:</span>
                  <span class="detail-value">${booking.paymentStatus?.toUpperCase() || 'N/A'}</span>
                </div>
                ${booking.txnid ? `
                  <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${booking.txnid}</span>
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
                  ${booking.cartItems && booking.cartItems.length > 0 ? 
                    booking.cartItems.map(item => `
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
                          <div class="service-name">${booking.serviceName || 'Service Booking'}</div>
                          <div class="service-description">Professional home service booking</div>
                        </td>
                        <td class="quantity-cell">1</td>
                        <td class="rate-cell">₹${(booking.amount || 0).toLocaleString('en-IN')}</td>
                        <td class="amount-cell">₹${(booking.amount || 0).toLocaleString('en-IN')}</td>
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
                  <td class="totals-value">₹${(booking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ${booking.gstAmount ? `
                  <tr>
                    <td class="totals-label">GST (18%):</td>
                    <td class="totals-value">₹${booking.gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                ${booking.usewallet && booking.usewallet > 0 ? `
                  <tr>
                    <td class="totals-label">Wallet Applied:</td>
                    <td class="totals-value">-₹${booking.usewallet.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="totals-label">TOTAL AMOUNT:</td>
                  <td class="totals-value">₹${(booking.totalAmount || booking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

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
  const canCancelBooking = (booking) => {
    if (!booking) return false;
    const bookingTime = new Date(booking.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - bookingTime;
    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    return timeDifference <= twoHoursInMs && 
           ['pending', 'confirmed'].includes(booking.status);
  };

  // Get remaining time for cancellation
  const getCancellationTimeRemaining = (booking) => {
    if (!booking) return null;
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

  const handleCancelBooking = async () => {
    // Check if cancellation is allowed
    if (!canCancelBooking(booking)) {
      alert('Cancellation is only allowed within 2 hours of booking creation.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 BookingDetails cancel request:');
      console.log('   Booking ID:', bookingId);
      console.log('   Token exists:', !!token);
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}/cancel-simple`,
        { 
          cancellationReason: 'Customer requested cancellation from booking details',
          cancellationTime: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled successfully');
      fetchBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found</p>
        <button
          onClick={() => navigate('/user/dashboard/bookings')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Bookings
        </button>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/user/dashboard/bookings')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
        </div>
        
        {/* Quick Invoice Access - Always show */}
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg"
        >
          <FiFileText size={18} />
          See Invoice
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {booking.serviceName || 'Service Booking'}
            </h2>
            <p className="text-gray-500">Booking ID: {booking._id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium
            ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'}`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Booking Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <FiCalendar className="text-gray-400 mt-1 mr-3" size={20} />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-800">
                {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {booking.bookingTime && (
            <div className="flex items-start">
              <FiClock className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{booking.bookingTime}</p>
              </div>
            </div>
          )}

          {booking.address && (
            <div className="flex items-start">
              <FiMapPin className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{booking.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partner Information */}
      {booking.partner ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Provider</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <FiUser className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">
                  {booking.partner.profile?.name || booking.partner.name || 'Service Provider'}
                </p>
              </div>
            </div>

            {(booking.partner.phone || booking.partner.profile?.phone) && (
              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">
                    {booking.partner.phone || booking.partner.profile?.phone}
                  </p>
                </div>
              </div>
            )}

            {booking.partner.profile?.email && (
              <div className="flex items-start">
                <FiUser className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{booking.partner.profile.email}</p>
                </div>
              </div>
            )}

            {booking.partner.profile?.address && (
              <div className="flex items-start">
                <FiMapPin className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Provider Address</p>
                  <p className="font-medium text-gray-800">
                    {booking.partner.profile.address}
                    {booking.partner.profile.city && `, ${booking.partner.profile.city}`}
                    {booking.partner.profile.pincode && ` - ${booking.partner.profile.pincode}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Provider</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <FiUser className="text-blue-500 mt-1 mr-3" size={20} />
              <div>
                <p className="font-medium text-blue-800 mb-1">Service Provider Assignment</p>
                <p className="text-sm text-blue-700">
                  A qualified service provider will be assigned to your booking soon. 
                  You will receive their contact details once assigned.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services/Items Information */}
      {(booking.cartItems && booking.cartItems.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Booked</h3>
          <div className="space-y-3">
            {booking.cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name || item.serviceName}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                  {item.quantity && item.quantity > 1 && (
                    <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                  )}
                </div>
                <span className="font-medium text-gray-800 ml-4">₹{item.price || item.amount || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      {booking.totalAmount && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{booking.amount || 0}</span>
            </div>
            {booking.gstAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{booking.gstAmount}</span>
              </div>
            )}
            {booking.usewallet > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Wallet Used</span>
                <span>- ₹{booking.usewallet}</span>
              </div>
            )}
            {booking.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{booking.discount}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-gray-800">₹{booking.totalAmount}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Payment: {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Section - Always available for all bookings */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-blue-600" />
          Invoice & Documents
        </h3>

        {/* Debug info to check booking data */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p><strong>Debug Info (Remove in production):</strong></p>
          <p>Booking ID: <span className="font-mono">{booking._id}</span></p>
          <p>Status: <span className="font-mono">{booking.status}</span></p>
          <p>Payment Status: <span className="font-mono">{booking.paymentStatus || 'N/A'}</span></p>
          <p>Total Amount: <span className="font-mono">₹{booking.totalAmount || booking.amount || 0}</span></p>
          <p>Invoice Section: <span className="font-mono text-green-600">ALWAYS VISIBLE</span></p>
        </div>

        {/* Invoice buttons - Always available */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-medium border-2 border-blue-200"
          >
            <FiFileText size={18} />
            View Invoice
          </button>
          <button
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-medium border-2 border-green-200"
          >
            <FiPrinter size={18} />
            Print Invoice
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all font-medium border-2 border-purple-200"
          >
            <FiDownload size={18} />
            Download PDF
          </button>
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Invoice is available for all bookings regardless of status. 
            It includes all available service details and payment information.
          </p>
        </div>
      </div>

      {/* Feedback Section for Completed Bookings */}
      {(booking.status === 'completed' || booking.status === 'confirmed') && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiStar className="w-5 h-5 text-yellow-600" />
            Service Feedback
          </h3>

          {/* Debug info to help identify the issue */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p><strong>Debug Info (Remove in production):</strong></p>
            <p>Booking Status: <span className="font-mono">{booking.status}</span></p>
            <p>Has Review: <span className="font-mono">{hasBeenReviewed() ? 'Yes' : 'No'}</span></p>
            <p>User Rating: <span className="font-mono">{booking.userRating || 'None'}</span></p>
            <p>Review Submitted: <span className="font-mono">{booking.reviewSubmitted ? 'Yes' : 'No'}</span></p>
            <p>Feedback Section: <span className="font-mono text-green-600">VISIBLE FOR COMPLETED & CONFIRMED</span></p>
          </div>

          {hasBeenReviewed() ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FiCheckCircle className="text-green-600" size={24} />
                <div>
                  <h4 className="font-semibold text-green-800">Thank You for Your Feedback!</h4>
                  <p className="text-sm text-green-700">Your review has been submitted successfully.</p>
                </div>
              </div>
              {booking.userRating && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-green-700 font-medium">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {getStarRating(booking.userRating, 16)}
                  </div>
                  <span className="text-sm text-green-600 ml-2">
                    ({booking.userRating}/5 stars)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiHeart className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Share Your Experience</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      {booking.status === 'completed' 
                        ? 'Help us improve our services by sharing your feedback about this completed service.'
                        : 'Service is confirmed! You can share your feedback once the service is completed.'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleOpenFeedback}
                disabled={booking.status !== 'completed'}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all ${
                  booking.status === 'completed'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed hover:scale-100 hover:shadow-lg'
                }`}
              >
                <FiStar size={20} />
                {booking.status === 'completed' ? 'Share Your Feedback' : 'Feedback Available After Completion'}
                <FiHeart size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <div className="space-y-4">
          {canCancelBooking(booking) ? (
            <div>
              <button
                onClick={handleCancelBooking}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Cancel Booking
              </button>
              {(() => {
                const timeRemaining = getCancellationTimeRemaining(booking);
                return timeRemaining && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      <strong>Cancellation Policy:</strong> Free cancellation available for {timeRemaining.hours}h {timeRemaining.minutes}m more
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 font-medium mb-2">Cancellation Not Available</p>
              <p className="text-sm text-gray-500">
                Free cancellation is only available within 2 hours of booking creation. 
                For assistance, please contact customer support.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Professional Feedback Modal */}
      {showFeedbackModal && booking && (
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
                    <FiUser className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      {booking.serviceName || 'Service Booking'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={14} className="text-blue-500" />
                        <span>{new Date(booking.scheduledDate || booking.bookingDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock size={14} className="text-blue-500" />
                        <span>{booking.scheduledTime || booking.bookingTime || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Booking ID:</span> #{booking._id.slice(-8)}
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

      {/* Invoice Modal */}
      {showInvoiceModal && booking && (
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
                  <p className="text-blue-100 text-sm">Booking #{booking._id.slice(-8)}</p>
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
                      <p className="text-gray-700 font-medium">{booking.customerDetails?.name || booking.user?.name || 'Customer'}</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.customerDetails?.phone || booking.user?.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.location?.address || booking.address || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-800 mb-3">Invoice Details:</h4>
                      <p className="text-sm text-gray-600">Invoice #: <span className="font-medium text-gray-800">INV-{booking._id.slice(-8).toUpperCase()}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Booking ID: <span className="font-medium text-gray-800">#{booking._id.slice(-8)}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Date: <span className="font-medium text-gray-800">{new Date(booking.scheduledDate || booking.bookingDate).toLocaleDateString('en-IN')}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-medium capitalize ${booking.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{booking.status}</span></p>
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
                      {booking.cartItems && booking.cartItems.length > 0 ? (
                        booking.cartItems.map((item, idx) => (
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
                            <p className="font-medium text-gray-800">{booking.serviceName || 'Service'}</p>
                            <p className="text-sm text-gray-600 mt-1">Booking Date: {new Date(booking.scheduledDate || booking.bookingDate).toLocaleDateString('en-IN')}</p>
                            {booking.scheduledTime && (
                              <p className="text-sm text-gray-600">Time: {booking.scheduledTime}</p>
                            )}
                          </td>
                          <td className="p-4 text-center border-b border-gray-200 text-gray-700">1</td>
                          <td className="p-4 text-right border-b border-gray-200 font-medium text-gray-800">₹{booking.amount || booking.totalAmount || 0}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Total Section */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-2 text-gray-700">
                        <span>Subtotal:</span>
                        <span>₹{booking.amount || booking.totalAmount || 0}</span>
                      </div>
                      {booking.gstAmount > 0 && (
                        <div className="flex justify-between py-2 text-gray-700">
                          <span>GST (18%):</span>
                          <span>₹{booking.gstAmount}</span>
                        </div>
                      )}
                      {booking.usewallet > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Wallet Used:</span>
                          <span>- ₹{booking.usewallet}</span>
                        </div>
                      )}
                      {booking.discount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Discount:</span>
                          <span>- ₹{booking.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg text-primary">
                        <span>Total Amount:</span>
                        <span>₹{booking.totalAmount || 0}</span>
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
    </div>
  );
};

export default BookingDetails;
