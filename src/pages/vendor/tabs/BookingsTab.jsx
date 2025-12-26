import React, { useEffect, useState } from 'react'
import { useVendorAuth } from '../../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../../services/vendorApi.js'
import { FiShoppingCart, FiRefreshCw, FiCheckCircle, FiTruck, FiX } from 'react-icons/fi'

const BookingsTab = () => {
  const { token } = useVendorAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [token, statusFilter])

  const fetchBookings = async () => {
    if (!token) return

    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await vendorApi.getBookings(token, params)
      setBookings(response.data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus, additionalData = {}) => {
    setUpdateLoading(true)
    try {
      await vendorApi.updateBookingStatus(token, bookingId, {
        status: newStatus,
        ...additionalData
      })
      fetchBookings()
      setSelectedBooking(null)
    } catch (error) {
      alert('Failed to update booking status')
    } finally {
      setUpdateLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'dispatched':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Bookings</h1>
          <p className="text-slate-600">Manage spare part bookings</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
          <FiShoppingCart className="text-4xl mx-auto mb-2 opacity-50 text-slate-400" />
          <p className="text-slate-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        {booking.sparePart?.name || 'Spare Part'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Order Date: {new Date(booking.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Quantity</p>
                      <p className="font-semibold text-slate-800">{booking.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Unit Price</p>
                      <p className="font-semibold text-slate-800">
                        ₹{booking.unitPrice?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Amount</p>
                      <p className="font-semibold text-primary">
                        ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-semibold text-slate-800">
                        {booking.customer?.name || booking.partner?.profile?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {booking.shippingAddress && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-slate-700">
                        {booking.shippingAddress.name}, {booking.shippingAddress.street},{' '}
                        {booking.shippingAddress.city}, {booking.shippingAddress.state} -{' '}
                        {booking.shippingAddress.pincode}
                      </p>
                      <p className="text-sm text-slate-600">Phone: {booking.shippingAddress.phone}</p>
                    </div>
                  )}

                  {booking.trackingNumber && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Tracking Number</p>
                      <p className="text-sm font-semibold text-slate-800">{booking.trackingNumber}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        disabled={updateLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                      >
                        <FiCheckCircle className="inline mr-2" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        disabled={updateLoading}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <FiX className="inline mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        const tracking = prompt('Enter tracking number:')
                        if (tracking) {
                          handleStatusUpdate(booking._id, 'dispatched', { trackingNumber: tracking })
                        }
                      }}
                      disabled={updateLoading}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50"
                    >
                      <FiTruck className="inline mr-2" />
                      Dispatch
                    </button>
                  )}
                  {booking.status === 'dispatched' && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'delivered')}
                      disabled={updateLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingsTab

