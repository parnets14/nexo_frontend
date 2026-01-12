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
  FiAlertCircle
} from 'react-icons/fi'
import { adminApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import Pagination from '../../components/Pagination'

const PartnerEarningsManagement = () => {
  const { token } = useAdminAuth()
  const [claims, setClaims] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'pending', // all, pending, approved, rejected
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

  // Process claim form
  const [processForm, setProcessForm] = useState({
    action: 'approve', // approve, reject
    approvedAmount: '',
    remark: '',
    paymentMode: 'online', // online, cash
    transactionId: '',
    paidByName: ''
  })

  useEffect(() => {
    if (token) {
      fetchClaims()
      fetchStatistics()
    }
  }, [token, filters])

  const fetchClaims = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getPartnerEarningsClaims(token, filters)
      setClaims(response.data.claims)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings claims')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await adminApi.getEarningsStatistics(token)
      setStatistics(response.data.statistics)
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
    }
  }

  const handleViewClaim = async (bookingId) => {
    try {
      const response = await adminApi.getEarningsClaimDetails(token, bookingId)
      setSelectedClaim(response.data)
      setProcessForm({
        action: 'approve',
        approvedAmount: response.data.earningsClaimedAmount.toString(),
        remark: '',
        paymentMode: 'online',
        transactionId: '',
        paidByName: ''
      })
      setShowModal(true)
    } catch (err) {
      alert('Error fetching claim details: ' + err.message)
    }
  }

  const handleProcessClaim = async () => {
    if (!selectedClaim) return

    if (processForm.action === 'approve' && (!processForm.approvedAmount || parseFloat(processForm.approvedAmount) <= 0)) {
      alert('Please enter a valid approved amount')
      return
    }

    if (processForm.action === 'approve' && !processForm.paymentMode) {
      alert('Please select a payment mode')
      return
    }

    if (processForm.action === 'approve' && processForm.paymentMode === 'online' && !processForm.transactionId.trim()) {
      alert('Please enter transaction ID for online payment')
      return
    }

    if (processForm.action === 'approve' && processForm.paymentMode === 'cash' && !processForm.paidByName.trim()) {
      alert('Please enter the name of person who gave cash payment')
      return
    }

    if (!processForm.remark.trim()) {
      alert('Please enter a remark')
      return
    }

    setProcessing(true)
    try {
      const requestData = {
        action: processForm.action,
        remark: processForm.remark
      }

      if (processForm.action === 'approve') {
        requestData.approvedAmount = parseFloat(processForm.approvedAmount)
        requestData.paymentMode = processForm.paymentMode
        if (processForm.paymentMode === 'online') {
          requestData.transactionId = processForm.transactionId
        } else if (processForm.paymentMode === 'cash') {
          requestData.paidByName = processForm.paidByName
        }
      }

      await adminApi.processEarningsClaim(token, selectedClaim.bookingId, requestData)

      alert(`Earnings claim ${processForm.action}d successfully!`)
      setShowModal(false)
      setSelectedClaim(null)
      fetchClaims()
      fetchStatistics()
    } catch (err) {
      alert('Error processing claim: ' + err.message)
    } finally {
      setProcessing(false)
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

  if (loading && claims.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Partner Earnings Management</h1>
          <p className="text-slate-600">Review and approve partner earnings claims</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchClaims}
            disabled={loading}
            className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`text-xl text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Claims</p>
              <FiUsers className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{statistics.totalClaims}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Pending Claims</p>
              <FiClock className="text-orange-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{statistics.pendingClaims}</p>
            <p className="text-xs text-slate-500 mt-1">₹{statistics.pendingAmount?.toLocaleString('en-IN') || 0} pending</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Approved Amount</p>
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{statistics.totalApprovedAmount?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{statistics.approvedClaims} approved</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Approval Rate</p>
              <FiPercent className="text-primary text-xl" />
            </div>
            <p className="text-2xl font-bold text-primary">{statistics.approvalRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{statistics.rejectedClaims} rejected</p>
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
            Showing {claims.length} of {pagination.totalClaims} claims
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

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Earnings Claims</h2>
        </div>
        
        {claims.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiDollarSign className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No earnings claims found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {claims.map((claim) => (
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
                      {claim.earningsApprovalStatus === 'approved' && claim.earningsPaymentMode && (
                        <div className="flex items-center gap-1 col-span-full">
                          <FiDollarSign className="text-xs" />
                          <span className="capitalize">{claim.earningsPaymentMode}</span>
                          {claim.earningsTransactionId && (
                            <span className="text-xs font-mono bg-slate-100 px-1 rounded">
                              {claim.earningsTransactionId}
                            </span>
                          )}
                          {claim.earningsPaidByName && (
                            <span className="text-xs">by {claim.earningsPaidByName}</span>
                          )}
                        </div>
                      )}
                    </div>

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
                      {claim.earningsApprovalStatus === 'pending' ? 'Review' : 'View Details'}
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

      {/* Process Claim Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedClaim.earningsApprovalStatus === 'pending' ? 'Review Earnings Claim' : 'Earnings Claim Details'}
                </h2>
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
                    <p className="text-xs text-slate-500 mb-1">Calculated Earning</p>
                    <p className="text-lg font-bold text-green-600">₹{selectedClaim.calculatedPartnerEarning?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Process Claim Form (only for pending claims) */}
              {selectedClaim.earningsApprovalStatus === 'pending' && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Process Claim</h3>
                  
                  <div className="space-y-4">
                    {/* Action Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="approve"
                            checked={processForm.action === 'approve'}
                            onChange={(e) => setProcessForm(prev => ({ ...prev, action: e.target.value }))}
                            className="text-green-600"
                          />
                          <span className="text-green-600 font-medium">Approve</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="reject"
                            checked={processForm.action === 'reject'}
                            onChange={(e) => setProcessForm(prev => ({ ...prev, action: e.target.value }))}
                            className="text-red-600"
                          />
                          <span className="text-red-600 font-medium">Reject</span>
                        </label>
                      </div>
                    </div>

                    {/* Approved Amount (only for approve action) */}
                    {processForm.action === 'approve' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Approved Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={processForm.approvedAmount}
                          onChange={(e) => setProcessForm(prev => ({ ...prev, approvedAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Enter approved amount"
                          min="0"
                          step="0.01"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Claimed amount: ₹{selectedClaim.earningsClaimedAmount?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}

                    {/* Payment Mode (only for approve action) */}
                    {processForm.action === 'approve' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Payment Mode <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="online"
                              checked={processForm.paymentMode === 'online'}
                              onChange={(e) => setProcessForm(prev => ({ 
                                ...prev, 
                                paymentMode: e.target.value,
                                transactionId: '',
                                paidByName: ''
                              }))}
                              className="text-blue-600"
                            />
                            <span className="text-blue-600 font-medium">Online Payment</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="cash"
                              checked={processForm.paymentMode === 'cash'}
                              onChange={(e) => setProcessForm(prev => ({ 
                                ...prev, 
                                paymentMode: e.target.value,
                                transactionId: '',
                                paidByName: ''
                              }))}
                              className="text-green-600"
                            />
                            <span className="text-green-600 font-medium">Cash Payment</span>
                          </label>
                        </div>

                        {/* Transaction ID for Online Payment */}
                        {processForm.paymentMode === 'online' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={processForm.transactionId}
                              onChange={(e) => setProcessForm(prev => ({ ...prev, transactionId: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Enter transaction ID"
                              required
                            />
                          </div>
                        )}

                        {/* Paid By Name for Cash Payment */}
                        {processForm.paymentMode === 'cash' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Paid By (Name) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={processForm.paidByName}
                              onChange={(e) => setProcessForm(prev => ({ ...prev, paidByName: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Enter name of person who gave cash"
                              required
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remark */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Remark <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={processForm.remark}
                        onChange={(e) => setProcessForm(prev => ({ ...prev, remark: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="3"
                        placeholder={processForm.action === 'approve' ? 'Enter approval note...' : 'Enter rejection reason...'}
                        required
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        onClick={handleProcessClaim}
                        disabled={processing}
                        className={`px-6 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 disabled:opacity-50 ${
                          processForm.action === 'approve'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {processing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {processForm.action === 'approve' ? <FiCheck /> : <FiX />}
                            {processForm.action === 'approve' ? 'Approve Claim' : 'Reject Claim'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Details (for processed claims) */}
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

export default PartnerEarningsManagement