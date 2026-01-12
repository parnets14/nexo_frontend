import React, { useState, useEffect } from 'react'
import { 
  FiDollarSign, 
  FiUsers, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPhone,
  FiPercent,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCreditCard,
  FiSearch
} from 'react-icons/fi'
import { adminApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import Pagination from '../../components/Pagination'

const EarningsClaimsHistory = () => {
  const { token } = useAdminAuth()
  const [claimsHistory, setClaimsHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, approved, rejected
    partnerId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  })

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClaims: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  useEffect(() => {
    if (token) {
      fetchClaimsHistory()
    }
  }, [token, filters])

  const fetchClaimsHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getEarningsClaimsHistory(token, filters)
      setClaimsHistory(response.data.claimsHistory)
      setSummary(response.data.summary)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings claims history')
    } finally {
      setLoading(false)
    }
  }

  const handleViewClaim = async (bookingId) => {
    try {
      const response = await adminApi.getEarningsClaimDetails(token, bookingId)
      setSelectedClaim(response.data)
      setShowModal(true)
    } catch (err) {
      alert('Error fetching claim details: ' + err.message)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const exportToCSV = () => {
    const csvData = claimsHistory.map(claim => ({
      'Claim Date': new Date(claim.earningsClaimedAt).toLocaleDateString('en-IN'),
      'Partner Name': claim.partner?.profile?.name || 'Unknown',
      'Partner Phone': claim.partner?.phone || 'N/A',
      'Service Name': claim.serviceName,
      'Job Amount': claim.jobAmount,
      'Commission Rate': `${claim.commissionRate}%`,
      'Commission Amount': claim.commissionAmount,
      'Claimed Amount': claim.earningsClaimedAmount,
      'Status': claim.earningsApprovalStatus,
      'Approved Amount': claim.earningsApprovedAmount || 0,
      'Payment Mode': claim.earningsPaymentMode || 'N/A',
      'Transaction ID': claim.earningsTransactionId || 'N/A',
      'Paid By': claim.earningsPaidByName || 'N/A',
      'Approved Date': claim.earningsApprovedAt ? new Date(claim.earningsApprovedAt).toLocaleDateString('en-IN') : 'N/A',
      'Remark': claim.earningsApprovalRemark || 'N/A'
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-claims-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && claimsHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Earnings Claims History</h1>
          <p className="text-slate-600">Complete history of all partner earnings claims</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={claimsHistory.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
          >
            <FiDownload />
            Export CSV
          </button>
          <button
            onClick={fetchClaimsHistory}
            disabled={loading}
            className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`text-xl text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Claims</p>
              <FiUsers className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.totalClaims}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Approved</p>
              <FiCheck className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.approvedClaims}</p>
            <p className="text-xs text-slate-500 mt-1">₹{summary.totalApprovedAmount?.toLocaleString('en-IN') || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Pending</p>
              <FiClock className="text-orange-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{summary.pendingClaims}</p>
            <p className="text-xs text-slate-500 mt-1">₹{summary.pendingAmount?.toLocaleString('en-IN') || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Online Payments</p>
              <FiCreditCard className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.onlinePayments}</p>
            <p className="text-xs text-slate-500 mt-1">Digital transactions</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Cash Payments</p>
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.cashPayments}</p>
            <p className="text-xs text-slate-500 mt-1">Manual payments</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-slate-600" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Partner ID Filter */}
            <div className="flex items-center gap-2">
              <FiSearch className="text-slate-600" />
              <input
                type="text"
                value={filters.partnerId}
                onChange={(e) => handleFilterChange('partnerId', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Partner ID"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-slate-600" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Start Date"
              />
              <span className="text-slate-600 text-sm">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-600">
            Showing {claimsHistory.length} of {pagination.totalClaims} claims
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <div className="flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </div>
        </div>
      )}

      {/* Claims History List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Claims History</h2>
        </div>
        
        {claimsHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiDollarSign className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No earnings claims found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {claimsHistory.map((claim) => (
              <div
                key={claim._id}
                className="p-6 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Claim Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-800">
                        {claim.serviceName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        claim.earningsApprovalStatus === 'approved' 
                          ? 'bg-green-100 text-green-700'
                          : claim.earningsApprovalStatus === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {claim.earningsApprovalStatus}
                      </span>
                      {claim.earningsPaymentMode && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          claim.earningsPaymentMode === 'online'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {claim.earningsPaymentMode}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FiUser className="text-xs" />
                        {claim.partner?.profile?.name || 'Partner'}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiPhone className="text-xs" />
                        {claim.partner?.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-xs" />
                        {new Date(claim.earningsClaimedAt).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiPercent className="text-xs" />
                        {claim.commissionRate}% commission
                      </div>
                    </div>

                    {/* Payment Details */}
                    {claim.earningsApprovalStatus === 'approved' && (
                      <div className="text-sm text-slate-600 mb-3">
                        {claim.earningsTransactionId && (
                          <div className="flex items-center gap-1">
                            <FiCreditCard className="text-xs" />
                            <span>Transaction ID: </span>
                            <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                              {claim.earningsTransactionId}
                            </span>
                          </div>
                        )}
                        {claim.earningsPaidByName && (
                          <div className="flex items-center gap-1">
                            <FiUser className="text-xs" />
                            <span>Paid by: {claim.earningsPaidByName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Financial Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500">Job Amount</p>
                        <p className="font-semibold text-slate-800">₹{claim.jobAmount?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Commission</p>
                        <p className="font-semibold text-red-600">-₹{claim.commissionAmount?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Claimed Amount</p>
                        <p className="font-semibold text-blue-600">₹{claim.earningsClaimedAmount?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          {claim.earningsApprovalStatus === 'approved' ? 'Approved Amount' : 'Calculated Earning'}
                        </p>
                        <p className="font-semibold text-green-600">
                          ₹{(claim.earningsApprovedAmount || claim.calculatedPartnerEarning)?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewClaim(claim._id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <FiEye />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalClaims}
          itemsPerPage={filters.limit}
          onPageChange={handlePageChange}
          showInfo={true}
          showJumpToPage={pagination.totalPages > 10}
          className="mt-6"
        />
      )}

      {/* Claim Details Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Claim Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Claim Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Partner Information */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FiUser /> Partner Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium">{selectedClaim.partner?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium">{selectedClaim.partner?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">MG Plan:</span>
                      <span className="font-medium">{selectedClaim.partner?.mgPlan?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FiMapPin /> Job Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service:</span>
                      <span className="font-medium">{selectedClaim.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-medium">
                        {new Date(selectedClaim.completedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Customer:</span>
                      <span className="font-medium">{selectedClaim.customer?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FiDollarSign /> Financial Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Job Amount</p>
                    <p className="text-lg font-bold text-slate-800">₹{selectedClaim.jobAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Commission ({selectedClaim.commissionRate}%)</p>
                    <p className="text-lg font-bold text-red-600">-₹{selectedClaim.commissionAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Claimed Amount</p>
                    <p className="text-lg font-bold text-blue-600">₹{selectedClaim.earningsClaimedAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Final Amount</p>
                    <p className="text-lg font-bold text-green-600">₹{(selectedClaim.earningsApprovedAmount || selectedClaim.calculatedPartnerEarning)?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Approval Details */}
              {selectedClaim.earningsApprovalStatus !== 'pending' && (
                <div className={`rounded-lg p-6 ${
                  selectedClaim.earningsApprovalStatus === 'approved' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
                    selectedClaim.earningsApprovalStatus === 'approved' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedClaim.earningsApprovalStatus === 'approved' ? <FiCheck /> : <FiX />}
                    {selectedClaim.earningsApprovalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    {selectedClaim.earningsApprovalStatus === 'approved' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Approved Amount:</span>
                          <span className="font-medium text-green-700">
                            ₹{selectedClaim.earningsApprovedAmount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {selectedClaim.earningsPaymentMode && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Payment Mode:</span>
                            <span className="font-medium capitalize">
                              {selectedClaim.earningsPaymentMode}
                            </span>
                          </div>
                        )}
                        {selectedClaim.earningsTransactionId && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Transaction ID:</span>
                            <span className="font-medium font-mono text-xs">
                              {selectedClaim.earningsTransactionId}
                            </span>
                          </div>
                        )}
                        {selectedClaim.earningsPaidByName && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Paid By:</span>
                            <span className="font-medium">
                              {selectedClaim.earningsPaidByName}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Processed Date:</span>
                      <span className="font-medium">
                        {new Date(selectedClaim.earningsApprovedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {selectedClaim.earningsApprovalRemark && (
                      <div>
                        <span className="text-slate-600">Admin Remark:</span>
                        <p className="font-medium mt-1 p-2 bg-white rounded border">
                          {selectedClaim.earningsApprovalRemark}
                        </p>
                      </div>
                    )}
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

export default EarningsClaimsHistory