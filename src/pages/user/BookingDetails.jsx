import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUser, FiPhone, FiDollarSign, FiClock, FiEye } from 'react-icons/fi';
import axios from 'axios';
import InvoiceButton from '../../components/InvoiceButton';
import QuotationDetailsModal from '../../components/QuotationDetailsModal';
import { userApi } from '../../services/userApi';

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

// Helper function to get cancellation cutoff time for display
const getCancellationCutoffTime = (bookingData) => {
  if (!bookingData.date) return null;
  
  let scheduledDateTime;
  
  if (bookingData.time) {
    const bookingDate = new Date(bookingData.date);
    const [hours, minutes] = bookingData.time.split(':');
    scheduledDateTime = new Date(bookingDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    scheduledDateTime = new Date(bookingData.date);
  }
  
  const twoHoursBefore = new Date(scheduledDateTime.getTime() - (2 * 60 * 60 * 1000));
  return twoHoursBefore;
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
const getBookingData = (bookingRaw) => {
  if (!bookingRaw) return null;
  
  // console.log('🔍 Raw booking data:', bookingRaw);
  
  // Handle address safely
  let formattedAddress = null;
  if (bookingRaw.address) {
    formattedAddress = formatAddress(bookingRaw.address);
  } else if (bookingRaw.userAddress) {
    formattedAddress = formatAddress(bookingRaw.userAddress);
  } else if (bookingRaw.serviceAddress) {
    formattedAddress = formatAddress(bookingRaw.serviceAddress);
  } else if (bookingRaw.location) {
    formattedAddress = formatAddress(bookingRaw.location);
  } else if (bookingRaw.user?.addresses?.[0]) {
    formattedAddress = formatAddress(bookingRaw.user.addresses[0]);
  }
  
  return {
    id: bookingRaw._id || bookingRaw.id || 'N/A',
    serviceName: bookingRaw.serviceName || 
                 bookingRaw.service?.name || 
                 bookingRaw.subService?.name || 
                 bookingRaw.subService?.service?.name ||
                 bookingRaw.product?.name ||
                 'Service Booking',
    
    status: bookingRaw.status || 'pending',
    paymentStatus: bookingRaw.paymentStatus || 'pending',
    
    date: bookingRaw.scheduledDate || 
          bookingRaw.bookingDate || 
          bookingRaw.serviceDate ||
          bookingRaw.createdAt || 
          bookingRaw.date ||
          null,
          
    time: bookingRaw.scheduledTime || 
          bookingRaw.bookingTime || 
          bookingRaw.serviceTime ||
          bookingRaw.time ||
          null,
          
    address: formattedAddress,
             
    amount: bookingRaw.amount || bookingRaw.subtotal || 0,
    totalAmount: bookingRaw.totalAmount || bookingRaw.amount || bookingRaw.price || bookingRaw.cost || 0,
    gstAmount: bookingRaw.gstAmount || 0,
    usewallet: bookingRaw.usewallet || bookingRaw.walletUsed || 0,
    discount: bookingRaw.discount || 0,
            
    customerName: bookingRaw.user?.name || 
                  bookingRaw.userName || 
                  bookingRaw.customerName ||
                  bookingRaw.name ||
                  'Customer',
                  
    customerPhone: bookingRaw.user?.phone || 
                   bookingRaw.userPhone || 
                   bookingRaw.customerPhone ||
                   bookingRaw.phone ||
                   null,
                   
    partner: bookingRaw.partner ? {
      name: bookingRaw.partner.name || 
            bookingRaw.partner.profile?.name ||
            bookingRaw.partnerName ||
            'Service Provider',
      phone: bookingRaw.partner.phone || 
             bookingRaw.partner.profile?.phone ||
             bookingRaw.partnerPhone ||
             null
    } : null,
                   
    cartItems: bookingRaw.cartItems || 
               bookingRaw.items || 
               bookingRaw.services ||
               [],
               
    hasReview: bookingRaw.hasReview || bookingRaw.reviewed || false,
    userRating: bookingRaw.userRating || null
  };
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
    fetchQuotations();
  }, [bookingId]);

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      setQuotationsLoading(true);
      const response = await userApi.getQuotationsByBooking(token, bookingId);
      if (response.success && response.data) {
        setQuotations(response.data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const handleAcceptQuotation = async (quotationId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await userApi.acceptQuotation(token, quotationId);
      if (response.success) {
        await fetchQuotations(); // Refresh quotations
        alert('Quotation accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      throw error;
    }
  };

  const handleRejectQuotation = async (quotationId, rejectionReason) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await userApi.rejectQuotation(token, quotationId, rejectionReason);
      if (response.success) {
        await fetchQuotations(); // Refresh quotations
        alert('Quotation rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      throw error;
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('🔍 Fetching booking details for ID:', bookingId);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // console.log('🔍 Raw booking response:', response.data);
      
      // Backend returns data.data (the booking object)
      const rawBooking = response.data.data || response.data.booking || response.data;
      console.log('🔍 Extracted booking:', rawBooking);
      
      setBooking(rawBooking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('userToken');
      const bookingData = getBookingData(booking);
      
      // Double-check cancellation is still allowed
      if (!isCancellationAllowed(bookingData)) {
        alert('Cancellation is no longer available. Bookings can only be cancelled up to 2 hours before the scheduled time.');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}/cancel`,
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
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
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

  // Get processed booking data
  const bookingData = getBookingData(booking);
  
  if (!bookingData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load booking data</p>
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/user/dashboard/bookings')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {bookingData.serviceName}
            </h2>
            <p className="text-gray-500">Booking ID: #{bookingData.id?.slice(-8)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize
            ${bookingData.status === 'completed' ? 'bg-green-100 text-green-800' :
              bookingData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'}`}
          >
            {bookingData.status}
          </span>
        </div>
      </div>

      {/* Booking Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h3>
        <div className="space-y-4">
          {bookingData.date && (
            <div className="flex items-start">
              <FiCalendar className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(bookingData.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {bookingData.time && (
            <div className="flex items-start">
              <FiClock className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{bookingData.time}</p>
              </div>
            </div>
          )}

          {bookingData.address && (
            <div className="flex items-start">
              <FiMapPin className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">
                  {typeof bookingData.address === 'string' ? bookingData.address : 'Address not available'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partner Information */}
      {bookingData.partner && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Provider</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <FiUser className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">{bookingData.partner.name}</p>
              </div>
            </div>

            {bookingData.partner.phone && (
              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{bookingData.partner.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services/Items Information */}
      {(bookingData.cartItems && bookingData.cartItems.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Booked</h3>
          <div className="space-y-3">
            {bookingData.cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name || item.serviceName || item.productName || 'Service Item'}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                  {item.quantity && item.quantity > 1 && (
                    <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                  )}
                </div>
                <span className="font-medium text-gray-800 ml-4">₹{item.price || item.amount || item.cost || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      {bookingData.totalAmount > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{bookingData.amount}</span>
            </div>
            {bookingData.gstAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>GST</span>
                <span>₹{bookingData.gstAmount}</span>
              </div>
            )}
            {bookingData.usewallet > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Wallet Used</span>
                <span>- ₹{bookingData.usewallet}</span>
              </div>
            )}
            {bookingData.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{bookingData.discount}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-gray-800">₹{bookingData.totalAmount}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  bookingData.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  bookingData.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Payment: {bookingData.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotations Section */}
      {quotations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              <FiDollarSign className="inline mr-2" />
              Quotations ({quotations.length})
            </h3>
            {quotationsLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="space-y-3">
            {quotations.map((quotation) => (
              <div
                key={quotation._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      #{quotation.quotationNumber} - ₹{quotation.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Valid till: {quotation.validTill ? new Date(quotation.validTill).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedQuotation(quotation)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    title="View Details"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    quotation.customerStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                    quotation.customerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Your Status: {quotation.customerStatus}
                  </span>
                  {quotation.partnerStatus !== 'not_required' && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      quotation.partnerStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                      quotation.partnerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      Partner Status: {quotation.partnerStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice & Documents</h3>
        <InvoiceButton 
          booking={booking}
          variant="primary"
          size="lg"
          className="w-full"
        />
      </div>

      {/* Actions */}
      {bookingData.status !== 'cancelled' && bookingData.status !== 'completed' && (
        <div className="space-y-4">
          {isCancellationAllowed(bookingData) ? (
            <div className="flex gap-4">
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Cancel Booking
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiClock className="text-yellow-600" size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Cancellation Not Available</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Bookings can only be cancelled up to 2 hours before the scheduled time.
                  </p>
                  {getCancellationCutoffTime(bookingData) && (
                    <p className="text-xs text-yellow-600">
                      Cancellation was available until: {getCancellationCutoffTime(bookingData).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {bookingData.status === 'completed' && !bookingData.hasReview && (
        <button
          onClick={() => navigate(`/user/dashboard/bookings/${bookingId}/review`)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onAccept={handleAcceptQuotation}
          onReject={handleRejectQuotation}
          userType="customer"
          token={localStorage.getItem('userToken')}
        />
      )}
    </div>
  );
};

export default BookingDetails;