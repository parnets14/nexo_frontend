import React, { useState, useEffect } from 'react'
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'

const MyRefunds = () => {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/refunds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      if (result.success) {
        setRefunds(result.data)
      }
    } catch (error) {
      toast.error('Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-emerald-600" size={20} />
      case 'rejected':
      case 'failed':
        return <FiXCircle className="text-rose-600" size={20} />
      case 'pending':
      case 'approved':
      case 'processing':
        return <FiClock className="text-amber-600" size={20} />
      default:
        return <FiAlertCircle className="text-slate-600" size={20} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected':
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'approved':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading refunds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Refunds</h1>
          <p className="text-slate-600 mt-2">Track your refund requests and status</p>
        </div>

        {refunds.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-slate-400 mb-4">
              <FiAlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Refunds</h3>
            <p className="text-slate-600">You don't have any refund requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div key={refund._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(refund.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Refund {refund.refundNumber}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {refund.serviceDetails?.serviceName}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Original Amount</p>
                        <p className="font-semibold text-slate-900">₹{refund.originalAmount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Visiting Charge (Non-refundable)</p>
                        <p className="font-semibold text-rose-600">-₹{refund.visitingCharge?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Refund Amount</p>
                        <p className="font-semibold text-emerald-600">₹{refund.finalRefundAmount?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Requested: {new Date(refund.createdAt).toLocaleDateString()}</span>
                      {refund.refundedAt && (
                        <span>Completed: {new Date(refund.refundedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {refund.cancellationReason && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Cancellation Reason</p>
                        <p className="text-sm text-slate-700">{refund.cancellationReason}</p>
                      </div>
                    )}

                    {refund.rejectionReason && (
                      <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                        <p className="text-xs text-rose-600 mb-1">Rejection Reason</p>
                        <p className="text-sm text-rose-700">{refund.rejectionReason}</p>
                      </div>
                    )}

                    {refund.transactionId && refund.status === 'completed' && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-1">Transaction ID</p>
                        <p className="text-sm font-mono text-emerald-700">{refund.transactionId}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(refund.status)}`}>
                      {refund.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRefund(refund)
                        setShowDetailsModal(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition"
                    >
                      <FiEye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Refund Details - {selectedRefund.refundNumber}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedRefund.status)}
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className="font-semibold text-slate-900">{selectedRefund.status.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Refund Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{selectedRefund.finalRefundAmount?.toFixed(2)}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Price Breakdown</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Original Booking Amount:</span>
                    <span className="font-medium">₹{selectedRefund.originalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Visiting Charge (Non-refundable):</span>
                    <span>-₹{selectedRefund.visitingCharge?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 mt-2"></div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Refundable Amount:</span>
                    <span className="font-medium">₹{selectedRefund.refundableAmount?.toFixed(2)}</span>
                  </div>
                  {selectedRefund.adminAdjustedAmount !== null && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>Admin Adjusted Amount:</span>
                      <span>₹{selectedRefund.adminAdjustedAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-400 pt-2 mt-2"></div>
                  <div className="flex justify-between text-lg font-bold text-emerald-600">
                    <span>Final Refund Amount:</span>
                    <span>₹{selectedRefund.finalRefundAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Service Details</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Service:</span>
                    <span className="font-medium">{selectedRefund.serviceDetails?.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Scheduled Date:</span>
                    <span className="font-medium">
                      {selectedRefund.serviceDetails?.scheduledDate
                        ? new Date(selectedRefund.serviceDetails.scheduledDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Scheduled Time:</span>
                    <span className="font-medium">{selectedRefund.serviceDetails?.scheduledTime || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Refund Requested</p>
                      <p className="text-xs text-slate-600">{new Date(selectedRefund.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedRefund.reviewedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Reviewed by Admin</p>
                        <p className="text-xs text-slate-600">{new Date(selectedRefund.reviewedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {selectedRefund.refundedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Refund Completed</p>
                        <p className="text-xs text-slate-600">{new Date(selectedRefund.refundedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRefund.adminNotes && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Admin Notes</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900">{selectedRefund.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyRefunds
