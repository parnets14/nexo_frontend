import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUser, FiPhone, FiDollarSign, FiClock } from 'react-icons/fi';
import axios from 'axios';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setBooking(response.data.data || response.data.booking);
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled successfully');
      fetchBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
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
      {booking.partner && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Provider</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <FiUser className="text-gray-400 mt-1 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">{booking.partner.name}</p>
              </div>
            </div>

            {booking.partner.phone && (
              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{booking.partner.phone}</p>
                </div>
              </div>
            )}
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

      {/* Actions */}
      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <div className="flex gap-4">
          <button
            onClick={handleCancelBooking}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel Booking
          </button>
        </div>
      )}

      {booking.status === 'completed' && !booking.reviewed && (
        <button
          onClick={() => navigate(`/user/dashboard/bookings/${bookingId}/review`)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write a Review
        </button>
      )}
    </div>
  );
};

export default BookingDetails;
