import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiDollarSign, FiPackage, FiShoppingCart, FiUser, FiMail, FiPhone, FiEdit } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const VendorDetails = () => {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVendorDetails()
  }, [token, vendorId])

  const fetchVendorDetails = async () => {
    if (!token || !vendorId) return

    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getVendorDetails(token, vendorId)
      if (response.success) {
        setVendor(response.vendor)
      } else {
        setError(response.message || 'Failed to fetch vendor details')
      }
    } catch (err) {
      console.error('Fetch vendor details error:', err)
      setError(err.message || 'Failed to fetch vendor details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-rose-500">{error || 'Vendor not found'}</p>
        <button
          onClick={() => navigate('/admin/vendors')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Back to Vendors
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/vendors')}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <ModuleHeader
          title={`Vendor: ${vendor.name}`}
          description="View vendor details and activities"
          icon={FiUser}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Spare Parts</p>
            <FiPackage className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{vendor.stats?.sparePartsCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Bookings</p>
            <FiShoppingCart className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{vendor.stats?.bookingsCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Total Revenue</p>
            <FiDollarSign className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ₹{(vendor.stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Balance</p>
            <FiDollarSign className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ₹{(vendor.stats?.balance || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Vendor Information</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              vendor.status === 'active'
                ? 'bg-green-100 text-green-800'
                : vendor.status === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {vendor.status}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Name</p>
            <p className="text-slate-800 flex items-center gap-2">
              <FiUser className="text-slate-400" />
              {vendor.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Email</p>
            <p className="text-slate-800 flex items-center gap-2">
              <FiMail className="text-slate-400" />
              {vendor.email}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Phone</p>
            <p className="text-slate-800 flex items-center gap-2">
              <FiPhone className="text-slate-400" />
              {vendor.phone}
            </p>
          </div>
          {vendor.companyName && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Company Name</p>
              <p className="text-slate-800">{vendor.companyName}</p>
            </div>
          )}
          {vendor.gstNumber && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">GST Number</p>
              <p className="text-slate-800">{vendor.gstNumber}</p>
            </div>
          )}
          {vendor.panNumber && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">PAN Number</p>
              <p className="text-slate-800">{vendor.panNumber}</p>
            </div>
          )}
          {vendor.address && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-slate-600 mb-1">Address</p>
              <p className="text-slate-800">
                {vendor.address.street && `${vendor.address.street}, `}
                {vendor.address.city && `${vendor.address.city}, `}
                {vendor.address.state && `${vendor.address.state} - `}
                {vendor.address.pincode}
              </p>
            </div>
          )}
          {vendor.bankDetails && (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Bank Name</p>
                <p className="text-slate-800">{vendor.bankDetails.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Account Number</p>
                <p className="text-slate-800">{vendor.bankDetails.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">IFSC Code</p>
                <p className="text-slate-800">{vendor.bankDetails.ifscCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Account Holder Name</p>
                <p className="text-slate-800">{vendor.bankDetails.accountHolderName || 'N/A'}</p>
              </div>
            </>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Created At</p>
            <p className="text-slate-800">{new Date(vendor.createdAt).toLocaleDateString()}</p>
          </div>
          {vendor.lastLogin && (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Last Login</p>
              <p className="text-slate-800">{new Date(vendor.lastLogin).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Spare Parts */}
      {vendor.spareParts && vendor.spareParts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Spare Parts</h2>
          <div className="space-y-2">
            {vendor.spareParts.slice(0, 5).map((part) => (
              <div key={part._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">{part.name}</p>
                  <p className="text-sm text-slate-600">₹{part.price?.toLocaleString('en-IN')} | Stock: {part.stock}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    part.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {part.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {vendor.recentBookings && vendor.recentBookings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Bookings</h2>
          <div className="space-y-2">
            {vendor.recentBookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">{booking.sparePart?.name || 'N/A'}</p>
                  <p className="text-sm text-slate-600">
                    Qty: {booking.quantity} | ₹{booking.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDetails

