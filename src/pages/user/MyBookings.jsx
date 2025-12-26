import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiClock, FiFilter, FiEye, FiX, FiCheckCircle, 
  FiAlertCircle, FiPhone, FiMessageCircle, FiStar, FiRefreshCw, FiPackage,
  FiFileText, FiPrinter, FiDownload 
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
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns data.data (array of bookings)
      const bookingsData = response.data.data || response.data.bookings || [];
      // Ensure it's always an array
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="inline" size={14} />,
      confirmed: <FiCheckCircle className="inline" size={14} />,
      'in-progress': <FiRefreshCw className="inline animate-spin" size={14} />,
      completed: <FiCheckCircle className="inline" size={14} />,
      cancelled: <FiX className="inline" size={14} />
    };
    return icons[status] || <FiAlertCircle className="inline" size={14} />;
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;

    try {
      const token = localStorage.getItem('userToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${cancellingBooking._id}/cancel`,
        {},
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
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .invoice-container { max-width: 800px; margin: 0 auto; }
      .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #214A73; padding-bottom: 20px; }
      .invoice-logo { font-size: 32px; font-weight: bold; color: #214A73; margin-bottom: 10px; }
      .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .invoice-section { flex: 1; }
      .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
      .invoice-total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
      .invoice-footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
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
          {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all transform hover:scale-105 ${
                filter === status 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('-', ' ')}
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
                        <p className="text-sm text-gray-500">Booking ID: #{booking._id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-15">
                      <div className="flex items-center text-gray-600">
                        <FiCalendar className="mr-2 text-primary" size={16} />
                        <span className="text-sm font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {booking.bookingTime && (
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2 text-primary" size={16} />
                          <span className="text-sm font-medium">{booking.bookingTime}</span>
                        </div>
                      )}
                      {booking.address && (
                        <div className="flex items-start text-gray-600">
                          <FiMapPin className="mr-2 mt-1 text-primary flex-shrink-0" size={16} />
                          <span className="text-sm">{booking.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.replace('-', ' ')}
                  </span>
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
                  
                  {['confirmed', 'completed'].includes(booking.status) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInvoiceBooking(booking);
                        setShowInvoiceModal(true);
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-medium border-2 border-green-200"
                    >
                      <FiFileText size={18} />
                      View Invoice
                    </button>
                  )}
                  
                  {['pending', 'confirmed'].includes(booking.status) && (
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
                  
                  {booking.status === 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Review feature coming soon!');
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-all font-medium border-2 border-yellow-200"
                    >
                      <FiStar size={18} />
                      Write Review
                    </button>
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
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel this booking for <strong>{cancellingBooking.serviceName}</strong>?
              </p>
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Cancellation charges may apply based on the cancellation policy.
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
                    <div className="invoice-logo text-4xl font-bold text-primary mb-2">Nexo</div>
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
                      <p className="text-sm text-gray-600 mt-1">Date: <span className="font-medium text-gray-800">{new Date(invoiceBooking.bookingDate).toLocaleDateString('en-IN')}</span></p>
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
                            <p className="text-sm text-gray-600 mt-1">Booking Date: {new Date(invoiceBooking.bookingDate).toLocaleDateString('en-IN')}</p>
                            {invoiceBooking.bookingTime && (
                              <p className="text-sm text-gray-600">Time: {invoiceBooking.bookingTime}</p>
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
                    <p className="text-sm text-gray-600 mb-2">Thank you for choosing Nexo!</p>
                    <p className="text-xs text-gray-500">For any queries, contact us at support@nexo.works | +91 1800-XXX-XXXX</p>
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

export default MyBookings;
