import React, { useState, useEffect } from 'react'
import { FiX, FiCheckCircle, FiXCircle, FiClock, FiUser, FiShield, FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi'

const QuotationDetailsModal = ({ quotation, onClose, onAccept, onReject, userType, token }) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Validate quotation data
  if (!quotation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Error</h2>
          <p className="text-slate-600 mb-4">Quotation data is missing or invalid.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return <FiCheckCircle className="w-4 h-4" />
      case 'rejected':
        return <FiXCircle className="w-4 h-4" />
      case 'pending':
        return <FiClock className="w-4 h-4" />
      default:
        return <FiClock className="w-4 h-4" />
    }
  }

  const handleAccept = async () => {
    setError(null)
    setLoading(true)
    try {
      await onAccept(quotation._id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to accept quotation')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim() && userType === 'admin') {
      setError('Please provide a rejection reason')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await onReject(quotation._id, rejectionReason)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to reject quotation')
    } finally {
      setLoading(false)
    }
  }

  const canCustomerRespond = userType === 'customer' && quotation.customerStatus === 'pending'
  const canAdminRespond = userType === 'admin' && quotation.adminStatus === 'pending'
  const canPartnerRespond = userType === 'partner' && quotation.partnerStatus === 'pending'
  const isExpired = quotation.validTill ? new Date(quotation.validTill) < new Date() : false

  // Debug log
  useEffect(() => {
    console.log('=== QuotationDetailsModal Debug ===')
    console.log('Quotation data:', quotation)
    console.log('Quotation ID:', quotation._id)
    console.log('Quotation Number:', quotation.quotationNumber)
    console.log('Items:', quotation.items)
    console.log('Items count:', quotation.items?.length || 0)
    console.log('User:', quotation.user)
    console.log('Partner:', quotation.partner)
    console.log('Booking:', quotation.booking)
    console.log('Subtotal:', quotation.subtotal)
    console.log('Total Amount:', quotation.totalAmount)
    console.log('===============================')
  }, [quotation])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quotation Details</h2>
            <p className="text-sm text-slate-600">#{quotation.quotationNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">Customer Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(quotation.customerStatus)}`}>
                {getStatusIcon(quotation.customerStatus)}
                {quotation.customerStatus?.charAt(0).toUpperCase() + quotation.customerStatus?.slice(1) || 'Pending'}
              </span>
              {quotation.customerResponseAt && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(quotation.customerResponseAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiBriefcase className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">Partner Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(quotation.partnerStatus)}`}>
                {getStatusIcon(quotation.partnerStatus)}
                {quotation.partnerStatus === 'not_required' ? 'Not Required' : 
                 quotation.partnerStatus?.charAt(0).toUpperCase() + quotation.partnerStatus?.slice(1) || 'Pending'}
              </span>
              {quotation.partnerResponseAt && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(quotation.partnerResponseAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">Admin Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(quotation.adminStatus)}`}>
                {getStatusIcon(quotation.adminStatus)}
                {quotation.adminStatus?.charAt(0).toUpperCase() + quotation.adminStatus?.slice(1) || 'Pending'}
              </span>
              {quotation.adminResponseAt && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(quotation.adminResponseAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">Overall Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(quotation.status)}`}>
                {getStatusIcon(quotation.status)}
                {quotation.status?.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Pending'}
              </span>
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Booking Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-600">Booking ID:</span>
                <span className="ml-2 font-semibold">
                  {quotation.booking?.bookingId || 
                   quotation.booking?._id?.toString().slice(-8) || 
                   quotation.booking?.toString().slice(-8) || 
                   'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Customer:</span>
                <span className="ml-2 font-semibold">{quotation.user?.name || quotation.user || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-600">Partner:</span>
                <span className="ml-2 font-semibold">
                  {quotation.partner?.profile?.name || 
                   quotation.partner?.phone || 
                   quotation.partner?.name ||
                   'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Valid Till:</span>
                <span className={`ml-2 font-semibold ${isExpired ? 'text-red-600' : ''}`}>
                  {quotation.validTill ? new Date(quotation.validTill).toLocaleDateString() : 'N/A'}
                  {isExpired && ' (Expired)'}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Items</h3>
            {quotation.items && quotation.items.length > 0 ? (
              <div className="space-y-2">
                {quotation.items.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold text-slate-800">{item.name || 'Item ' + (index + 1)}</p>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800">₹{(item.total || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>Qty: {item.quantity || 1}</span>
                      <span>Unit Price: ₹{(item.unitPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No items found in this quotation.</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">₹{(quotation.subtotal || 0).toFixed(2)}</span>
            </div>
            {(quotation.tax || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax:</span>
                <span className="font-semibold">₹{(quotation.tax || 0).toFixed(2)}</span>
              </div>
            )}
            {(quotation.discount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount:</span>
                <span className="font-semibold">-₹{(quotation.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-300">
              <span>Total Amount:</span>
              <span className="text-primary">₹{(quotation.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Description */}
          {quotation.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-sm text-slate-600">{quotation.description}</p>
            </div>
          )}

          {/* Notes */}
          {quotation.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
              <p className="text-sm text-slate-600">{quotation.notes}</p>
            </div>
          )}

          {/* Rejection Reasons */}
          {quotation.customerRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Customer Rejection Reason</h3>
              <p className="text-sm text-red-600">{quotation.customerRejectionReason}</p>
            </div>
          )}

          {quotation.partnerRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Partner Rejection Reason</h3>
              <p className="text-sm text-red-600">{quotation.partnerRejectionReason}</p>
            </div>
          )}

          {quotation.adminRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Admin Rejection Reason</h3>
              <p className="text-sm text-red-600">{quotation.adminRejectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          {(canCustomerRespond || canAdminRespond || canPartnerRespond) && !isExpired && (
            <div className="pt-4 border-t border-slate-200">
              {showRejectForm ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Rejection Reason {(userType === 'admin' || userType === 'partner') && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                      placeholder="Please provide a reason for rejection..."
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectionReason('')
                        setError(null)
                      }}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {canPartnerRespond && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-700 mb-2">Partner Approval Required</h3>
                      <p className="text-sm text-blue-600 mb-3">
                        As a franchise partner, you need to approve this quotation before it can be reviewed by admin.
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleAccept}
                          className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          <FiCheckCircle className="w-5 h-5" />
                          {loading ? 'Approving...' : 'Approve Quotation'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          <FiXCircle className="w-5 h-5" />
                          Reject Quotation
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {(canCustomerRespond || canAdminRespond) && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAccept}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        <FiCheckCircle className="w-5 h-5" />
                        {loading ? 'Processing...' : 'Accept Quotation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        <FiXCircle className="w-5 h-5" />
                        Reject Quotation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close Button if no actions available */}
          {!canCustomerRespond && !canAdminRespond && !canPartnerRespond && (
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuotationDetailsModal

