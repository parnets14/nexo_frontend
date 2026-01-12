import React from 'react'
import { 
  FiX, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiDollarSign, 
  FiPercent,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiFileText
} from 'react-icons/fi'

const JobEarningsModal = ({ earning, onClose }) => {
  if (!earning) return null

  const safeFormatDate = (dateValue) => {
    try {
      if (!dateValue) return 'N/A'
      return new Date(dateValue).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  const safeFormatDateTime = (dateValue) => {
    try {
      if (!dateValue) return 'N/A'
      return new Date(dateValue).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Job Earnings Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiX className="text-xl text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Information */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FiFileText className="text-primary" />
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Service Name</label>
                <p className="text-slate-800 font-medium">{earning.serviceName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Booking ID</label>
                <p className="text-slate-800 font-mono text-sm">{earning.bookingId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Customer Name</label>
                <p className="text-slate-800">{earning.customerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Customer Phone</label>
                <p className="text-slate-800">{earning.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Job Date</label>
                <p className="text-slate-800">{safeFormatDate(earning.jobDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Scheduled Time</label>
                <p className="text-slate-800">{earning.scheduledTime || 'N/A'}</p>
              </div>
            </div>
            
            {earning.location?.address && (
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-600">Service Location</label>
                <p className="text-slate-800">{earning.location.address}</p>
              </div>
            )}

            {earning.remark && (
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-600">Job Completion Remark</label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">{earning.remark}</p>
                </div>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              Financial Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Total Job Amount</label>
                <p className="text-2xl font-bold text-blue-600">₹{(earning.jobAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Payment Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  earning.paymentStatus === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {earning.paymentStatus || 'Unknown'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">MG Plan Commission Rate</label>
                <p className="text-xl font-bold text-red-600">{earning.commissionRate || 0}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Commission Deducted</label>
                <p className="text-xl font-bold text-red-600">-₹{(earning.commissionAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Your Final Earning</label>
                <p className="text-3xl font-bold text-green-600">₹{(earning.partnerEarning || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">MG Plan</label>
                <p className="text-slate-800 font-medium">{earning.mgPlan || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Earnings Claim Status */}
          {earning.earningsClaimed && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-blue-600" />
                Earnings Claim Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Claim Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    earning.earningsApprovalStatus === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : earning.earningsApprovalStatus === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {earning.earningsApprovalStatus || 'Pending'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Claimed Amount</label>
                  <p className="text-lg font-bold text-blue-600">₹{(earning.earningsClaimedAmount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Claimed Date</label>
                  <p className="text-slate-800">{safeFormatDateTime(earning.earningsClaimedAt)}</p>
                </div>
                {earning.earningsApprovalStatus === 'approved' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Approved Date</label>
                      <p className="text-slate-800">{safeFormatDateTime(earning.earningsApprovedAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Approved Amount</label>
                      <p className="text-lg font-bold text-green-600">₹{(earning.earningsApprovedAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    {earning.earningsPaymentMode && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Payment Mode</label>
                        <p className="text-slate-800 font-medium">{earning.earningsPaymentMode}</p>
                        {earning.earningsTransactionId && (
                          <p className="text-sm text-slate-600">TXN: {earning.earningsTransactionId}</p>
                        )}
                        {earning.earningsPaidByName && (
                          <p className="text-sm text-slate-600">Paid by: {earning.earningsPaidByName}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {earning.earningsApprovalRemark && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-600">Admin Remark</label>
                  <div className="mt-1 p-3 bg-slate-100 rounded-lg">
                    <p className="text-slate-700">{earning.earningsApprovalRemark}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!earning.earningsClaimed && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <FiClock className="text-yellow-600" />
                Earnings Status
              </h3>
              <p className="text-yellow-700">This job's earnings have not been claimed yet. You can claim them from the earnings list.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobEarningsModal