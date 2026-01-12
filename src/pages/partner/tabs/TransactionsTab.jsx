import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiUser, 
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiEye
} from 'react-icons/fi'
import JobEarningsModal from '../../../components/JobEarningsModal.jsx'
import Pagination from '../../../components/Pagination.jsx'
import PaginationControls from '../../../components/PaginationControls.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const TransactionsTab = () => {
  const { token } = usePartnerAuth()
  const [activeTab, setActiveTab] = useState('wallet') // wallet, earnings, claims-history
  
  // Wallet Transactions State
  const [transactions, setTransactions] = useState([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState(null)
  const [filter, setFilter] = useState('all') // all, credit, debit
  const [selectedJobEarning, setSelectedJobEarning] = useState(null)
  
  // Earnings State
  const [earningsData, setEarningsData] = useState(null)
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [earningsError, setEarningsError] = useState(null)
  const [earningsFilter, setEarningsFilter] = useState('all') // all, claimed, unclaimed
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [selectedBookings, setSelectedBookings] = useState([])
  const [claiming, setClaiming] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Claims History State
  const [claimsHistory, setClaimsHistory] = useState([])
  const [claimsHistoryLoading, setClaimsHistoryLoading] = useState(true)
  const [claimsHistoryError, setClaimsHistoryError] = useState(null)
  const [claimsHistoryFilter, setClaimsHistoryFilter] = useState('all') // all, approved, rejected, pending
  const [claimsHistoryPage, setClaimsHistoryPage] = useState(1)
  const [claimsHistorySummary, setClaimsHistorySummary] = useState(null)
  const [claimsHistoryPagination, setClaimsHistoryPagination] = useState(null)
  const [claimsHistoryItemsPerPage, setClaimsHistoryItemsPerPage] = useState(20)

  useEffect(() => {
    // Always fetch transactions since this is the TransactionsTab
    fetchTransactions()
  }, [token])

  // Also fetch when activeTab changes (if we keep the tab functionality)
  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchTransactions()
    } else if (activeTab === 'earnings') {
      fetchEarnings()
    } else if (activeTab === 'claims-history') {
      fetchClaimsHistory()
    }
  }, [activeTab, currentPage, dateRange, claimsHistoryPage, claimsHistoryFilter, itemsPerPage, claimsHistoryItemsPerPage])

  // Wallet Transactions Functions
  const fetchTransactions = async () => {
    if (!token) return

    setWalletLoading(true)
    setWalletError(null)
    try {
      const response = await partnerApi.getTransactions(token)
      const txnList = response?.transactions || response?.data || []
      setTransactions(txnList)
    } catch (err) {
      setWalletError(err.message || 'Failed to fetch transactions')
    } finally {
      setWalletLoading(false)
    }
  }

  // Earnings Functions
  const fetchEarnings = async () => {
    if (!token) return

    setEarningsLoading(true)
    setEarningsError(null)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      }
      
      const response = await partnerApi.getEarnings(token, params)
      
      if (response && response.data) {
        setEarningsData(response.data)
      } else {
        console.error('Invalid earnings response structure:', response)
        setEarningsError('Invalid data structure received from server')
      }
    } catch (err) {
      console.error('Error fetching earnings:', err)
      setEarningsError(err.message || 'Failed to fetch earnings data')
    } finally {
      setEarningsLoading(false)
    }
  }

  // Claims History Functions
  const fetchClaimsHistory = async () => {
    if (!token) return

    setClaimsHistoryLoading(true)
    setClaimsHistoryError(null)
    try {
      const params = {
        page: claimsHistoryPage,
        limit: claimsHistoryItemsPerPage,
        status: claimsHistoryFilter,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      }
      
      const response = await partnerApi.getEarningsClaimsHistory(token, params)
      setClaimsHistory(response.data.claimsHistory)
      setClaimsHistorySummary(response.data.summary)
      setClaimsHistoryPagination(response.data.pagination)
    } catch (err) {
      setClaimsHistoryError(err.message || 'Failed to fetch claims history')
    } finally {
      setClaimsHistoryLoading(false)
    }
  }

  const handleClaimEarnings = async () => {
    if (selectedBookings.length === 0) {
      alert('Please select bookings to claim earnings for')
      return
    }

    if (!confirm(`Are you sure you want to claim earnings for ${selectedBookings.length} job(s)?`)) {
      return
    }

    setClaiming(true)
    try {
      const response = await partnerApi.claimEarnings(token, { bookingIds: selectedBookings })
      
      if (response.success) {
        alert(`Successfully claimed ₹${response.data.totalClaimAmount} from ${response.data.jobsClaimed} job(s)!`)
        setSelectedBookings([])
        fetchEarnings() // Refresh data
        if (activeTab === 'wallet') {
          fetchTransactions() // Also refresh wallet transactions
        }
      }
    } catch (err) {
      alert('Error claiming earnings: ' + (err.message || 'Unknown error'))
    } finally {
      setClaiming(false)
    }
  }

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const handleSelectAll = () => {
    const unclaimedBookings = filteredEarnings.filter(earning => !earning.earningsClaimed)
    if (selectedBookings.length === unclaimedBookings.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(unclaimedBookings.map(earning => earning.bookingId))
    }
  }

  // Wallet transaction filtering
  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true
    return txn.type === filter
  })

  // Earnings filtering
  const { summary, allTimeStats, earnings, pagination, partner } = earningsData || {}
  const filteredEarnings = earnings?.filter(earning => {
    if (earningsFilter === 'claimed') return earning.earningsClaimed
    if (earningsFilter === 'unclaimed') return !earning.earningsClaimed
    if (earningsFilter === 'approved') return earning.earningsApprovalStatus === 'approved'
    if (earningsFilter === 'pending') return earning.earningsClaimed && earning.earningsApprovalStatus === 'pending'
    if (earningsFilter === 'rejected') return earning.earningsApprovalStatus === 'rejected'
    return true
  }) || []

  const selectedEarningsTotal = selectedBookings.reduce((total, bookingId) => {
    const earning = earnings?.find(e => e.bookingId === bookingId)
    return total + (earning?.partnerEarning || 0)
  }, 0)

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const isLoading = activeTab === 'wallet' ? walletLoading : activeTab === 'earnings' ? earningsLoading : claimsHistoryLoading
  const error = activeTab === 'wallet' ? walletError : activeTab === 'earnings' ? earningsError : claimsHistoryError

  // Earnings Tab Content
  function renderEarningsTab() {
    if (earningsLoading && !earningsData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    if (earningsError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{earningsError}</div>
          <button
            onClick={fetchEarnings}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      )
    }

    const { summary, allTimeStats, earnings, pagination, partner } = earningsData || {}
    
    const filteredEarnings = earnings?.filter(earning => {
      if (earningsFilter === 'claimed') return earning.earningsClaimed
      if (earningsFilter === 'unclaimed') return !earning.earningsClaimed
      if (earningsFilter === 'approved') return earning.earningsApprovalStatus === 'approved'
      if (earningsFilter === 'pending') return earning.earningsClaimed && earning.earningsApprovalStatus === 'pending'
      if (earningsFilter === 'rejected') return earning.earningsApprovalStatus === 'rejected'
      return true
    }) || []
    
    return (
      <>
        {/* MG Plan Info */}
        {partner?.mgPlan && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 sm:p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <FiPercent className="text-primary text-xl" />
              <h3 className="text-lg font-bold text-slate-800">Current MG Plan</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Plan Name</p>
                <p className="font-semibold text-slate-800">{partner.mgPlan.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Commission Rate</p>
                <p className="font-semibold text-red-600">{partner.mgPlan.commission}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Subscribed</p>
                <p className="font-semibold text-slate-800">
                  {partner.mgPlanSubscribedAt ? new Date(partner.mgPlanSubscribedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expires</p>
                <p className="font-semibold text-slate-800">
                  {partner.mgPlanExpiresAt ? new Date(partner.mgPlanExpiresAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Job Amount</p>
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-blue-600">₹{summary?.totalJobAmount?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{summary?.totalJobs || 0} jobs</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Commission Cut</p>
              <FiTrendingDown className="text-red-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-red-600">₹{summary?.totalCommissionCut?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{summary?.commissionRate || 0}% rate</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Your Earnings</p>
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{summary?.totalPartnerEarnings?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">After commission</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Wallet Balance</p>
              <FiDollarSign className="text-primary text-xl" />
            </div>
            <p className="text-2xl font-bold text-primary">₹{summary?.walletBalance?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Available balance</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-600" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="Start Date"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="End Date"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <FiFilter className="text-slate-600 hidden sm:block" />
              <div className="flex gap-2">
                {['all', 'claimed', 'unclaimed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEarningsFilter(f)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                      earningsFilter === f
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                const exportData = filteredEarnings.map(earning => ({
                  'Job Date': new Date(earning.jobDate).toLocaleDateString('en-IN'),
                  'Customer': earning.customerName,
                  'Service': earning.serviceName,
                  'Job Amount (₹)': earning.jobAmount,
                  'Commission Rate (%)': earning.commissionRate,
                  'Commission Cut (₹)': earning.commissionAmount,
                  'Your Earning (₹)': earning.partnerEarning,
                  'Payment Status': earning.paymentStatus,
                  'Earnings Status': earning.earningsClaimed ? 'Claimed' : 'Unclaimed',
                  'MG Plan': earning.mgPlan,
                  'Job Remark': earning.remark || 'N/A',
                  'Claimed Date': earning.earningsClaimedAt ? new Date(earning.earningsClaimedAt).toLocaleDateString('en-IN') : 'N/A',
                  'Approval Status': earning.earningsApprovalStatus || 'N/A',
                  'Approved Date': earning.earningsApprovedAt ? new Date(earning.earningsApprovedAt).toLocaleDateString('en-IN') : 'N/A',
                  'Payment Mode': earning.earningsPaymentMode || 'N/A',
                  'Transaction ID': earning.earningsTransactionId || 'N/A',
                  'Paid By': earning.earningsPaidByName || 'N/A',
                  'Admin Remark': earning.earningsApprovalRemark || 'N/A'
                }))
                exportToExcel(exportData, [
                  { header: 'Job Date', accessor: 'Job Date' },
                  { header: 'Customer', accessor: 'Customer' },
                  { header: 'Service', accessor: 'Service' },
                  { header: 'Job Amount (₹)', accessor: 'Job Amount (₹)' },
                  { header: 'Commission Rate (%)', accessor: 'Commission Rate (%)' },
                  { header: 'Commission Cut (₹)', accessor: 'Commission Cut (₹)' },
                  { header: 'Your Earning (₹)', accessor: 'Your Earning (₹)' },
                  { header: 'Payment Status', accessor: 'Payment Status' },
                  { header: 'Earnings Status', accessor: 'Earnings Status' },
                  { header: 'MG Plan', accessor: 'MG Plan' },
                  { header: 'Job Remark', accessor: 'Job Remark' },
                  { header: 'Claimed Date', accessor: 'Claimed Date' },
                  { header: 'Approval Status', accessor: 'Approval Status' },
                  { header: 'Approved Date', accessor: 'Approved Date' },
                  { header: 'Payment Mode', accessor: 'Payment Mode' },
                  { header: 'Transaction ID', accessor: 'Transaction ID' },
                  { header: 'Paid By', accessor: 'Paid By' },
                  { header: 'Admin Remark', accessor: 'Admin Remark' }
                ], 'Job_Earnings_Detailed', 'Job Earnings Detailed Report', {
                  columnWidths: [12, 20, 25, 12, 12, 12, 12, 12, 12, 12, 25, 12, 12, 12, 12, 15, 15, 25]
                })
              }}
              disabled={filteredEarnings.length === 0}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload /> Export Excel
            </button>
          </div>
        </div>

        {/* Claim Earnings Section */}
        {selectedBookings.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-1">
                  {selectedBookings.length} job(s) selected
                </h3>
                <p className="text-green-700">
                  Total earnings to claim: ₹{selectedEarningsTotal.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-semibold"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleClaimEarnings}
                  disabled={claiming}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {claiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Claim Earnings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Earnings List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Job Earnings</h2>
            {filteredEarnings.filter(e => !e.earningsClaimed).length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:text-primary-dark font-semibold"
              >
                {selectedBookings.length === filteredEarnings.filter(e => !e.earningsClaimed).length ? 'Deselect All' : 'Select All Unclaimed'}
              </button>
            )}
          </div>
          
          {filteredEarnings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiDollarSign className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No earnings found</p>
              {earningsData && !earnings && (
                <p className="text-xs mt-2 text-red-500">Error: Earnings data structure is invalid</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredEarnings.map((earning) => {
                // Add safety checks for earning object
                if (!earning || !earning.bookingId) {
                  console.warn('Invalid earning object:', earning)
                  return null
                }
                
                return (
                  <div
                    key={earning.bookingId}
                    className={`p-4 sm:p-6 hover:bg-slate-50 transition ${
                      selectedBookings.includes(earning.bookingId) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Job Info */}
                      <div className="flex items-start gap-3 flex-1">
                        {!earning.earningsClaimed && (
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(earning.bookingId)}
                            onChange={() => handleSelectBooking(earning.bookingId)}
                            className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                              {earning.serviceName || 'Unknown Service'}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.earningsClaimed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {earning.earningsClaimed ? 'Claimed' : 'Unclaimed'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {earning.paymentStatus || 'Unknown'}
                            </span>
                            {earning.earningsApprovalStatus && earning.earningsApprovalStatus !== 'pending' && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                earning.earningsApprovalStatus === 'approved'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {earning.earningsApprovalStatus}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-slate-600 mb-2">
                            <div className="flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {earning.customerName || 'Unknown Customer'}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              {earning.jobDate ? new Date(earning.jobDate).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-xs" />
                              {earning.scheduledTime || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMapPin className="text-xs" />
                              {earning.location?.address?.substring(0, 30) || 'N/A'}...
                            </div>
                          </div>

                          {/* Job Remark */}
                          {earning.remark && (
                            <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                              <span className="font-semibold text-blue-800">Job Remark: </span>
                              <span className="text-blue-700">{earning.remark}</span>
                            </div>
                          )}

                          {/* Transaction Details for Claimed Earnings */}
                          {earning.earningsClaimed && (
                            <div className="space-y-1">
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold">Claimed: </span>
                                {earning.earningsClaimedAt ? new Date(earning.earningsClaimedAt).toLocaleString('en-IN') : 'N/A'}
                              </div>
                              
                              {earning.earningsApprovalStatus === 'approved' && (
                                <>
                                  <div className="text-xs text-green-600">
                                    <span className="font-semibold">Approved: </span>
                                    {earning.earningsApprovedAt ? new Date(earning.earningsApprovedAt).toLocaleString('en-IN') : 'N/A'}
                                  </div>
                                  
                                  {earning.earningsPaymentMode && (
                                    <div className="text-xs text-blue-600">
                                      <span className="font-semibold">Payment Mode: </span>
                                      {earning.earningsPaymentMode}
                                      {earning.earningsTransactionId && (
                                        <span className="ml-2">
                                          (TXN: {earning.earningsTransactionId})
                                        </span>
                                      )}
                                      {earning.earningsPaidByName && (
                                        <span className="ml-2">
                                          (Paid by: {earning.earningsPaidByName})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              {earning.earningsApprovalRemark && (
                                <div className="p-2 bg-slate-50 rounded text-xs">
                                  <span className="font-semibold text-slate-700">Admin Remark: </span>
                                  <span className="text-slate-600">{earning.earningsApprovalRemark}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Earnings Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-right">
                        <div>
                          <p className="text-xs text-slate-500">Job Amount</p>
                          <p className="font-semibold text-slate-800">₹{(earning.jobAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Commission ({earning.commissionRate || 0}%)</p>
                          <p className="font-semibold text-red-600">-₹{(earning.commissionAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Your Earning</p>
                          <p className="font-semibold text-green-600">₹{(earning.partnerEarning || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div>
                            <p className="text-xs text-slate-500">MG Plan</p>
                            <p className="font-semibold text-primary text-xs">{earning.mgPlan || 'N/A'}</p>
                          </div>
                          <button
                            onClick={() => setSelectedJobEarning(earning)}
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold hover:bg-primary/20 transition inline-flex items-center gap-1 justify-center"
                          >
                            <FiEye className="text-xs" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </>
    )
  }

  // Claims History Tab Content  
  function renderClaimsHistoryTab() {
    if (claimsHistoryLoading && claimsHistory.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    if (claimsHistoryError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{claimsHistoryError}</div>
          <button
            onClick={fetchClaimsHistory}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      )
    }

    return (
      <>
        {/* Summary Cards */}
        {claimsHistorySummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Claims</p>
                <FiFileText className="text-blue-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{claimsHistorySummary.totalClaims || 0}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Approved Claims</p>
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-green-600">{claimsHistorySummary.approvedClaims || 0}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Pending Claims</p>
                <FiClock className="text-orange-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{claimsHistorySummary.pendingClaims || 0}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Approved Amount</p>
                <FiDollarSign className="text-green-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-green-600">₹{claimsHistorySummary.totalApprovedAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-600" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="Start Date"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="End Date"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <FiFilter className="text-slate-600 hidden sm:block" />
              <div className="flex gap-2">
                {['all', 'approved', 'pending', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setClaimsHistoryFilter(f)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                      claimsHistoryFilter === f
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                const exportData = claimsHistory.map(claim => ({
                  'Claim Date': new Date(claim.claimedDate).toLocaleDateString('en-IN'),
                  'Job Date': new Date(claim.jobDate).toLocaleDateString('en-IN'),
                  'Customer': claim.customerName,
                  'Service': claim.serviceName,
                  'Job Amount (₹)': claim.jobAmount,
                  'Claimed Amount (₹)': claim.claimedAmount,
                  'Approved Amount (₹)': claim.approvedAmount,
                  'Status': claim.approvalStatus,
                  'Payment Mode': claim.paymentMode || 'N/A',
                  'Remark': claim.approvalRemark || 'N/A'
                }))
                exportToExcel(exportData, [
                  { header: 'Claim Date', accessor: 'Claim Date' },
                  { header: 'Job Date', accessor: 'Job Date' },
                  { header: 'Customer', accessor: 'Customer' },
                  { header: 'Service', accessor: 'Service' },
                  { header: 'Job Amount (₹)', accessor: 'Job Amount (₹)' },
                  { header: 'Claimed Amount (₹)', accessor: 'Claimed Amount (₹)' },
                  { header: 'Approved Amount (₹)', accessor: 'Approved Amount (₹)' },
                  { header: 'Status', accessor: 'Status' },
                  { header: 'Payment Mode', accessor: 'Payment Mode' },
                  { header: 'Remark', accessor: 'Remark' }
                ], 'Claims_History', 'Claims History Report', {
                  columnWidths: [15, 15, 20, 25, 15, 15, 15, 12, 15, 30]
                })
              }}
              disabled={claimsHistory.length === 0}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload /> Export Excel
            </button>
          </div>
        </div>

        {/* Claims History List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Claims History</h2>
          </div>
          
          {claimsHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiFileText className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No claims history found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {claimsHistory.map((claim) => (
                <div
                  key={claim.claimId}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Claim Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                          {claim.serviceName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          claim.approvalStatus === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : claim.approvalStatus === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {claim.approvalStatus}
                        </span>
                        {claim.paymentMode && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {claim.paymentMode}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <FiUser className="text-xs" />
                          {claim.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-xs" />
                          Claimed: {new Date(claim.claimedDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="text-xs" />
                          Job: {new Date(claim.jobDate).toLocaleDateString('en-IN')}
                        </div>
                        {claim.transactionId && (
                          <div className="flex items-center gap-1">
                            <FiCreditCard className="text-xs" />
                            {claim.transactionId}
                          </div>
                        )}
                      </div>

                      {claim.approvalRemark && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                          <strong>Admin Remark:</strong> {claim.approvalRemark}
                        </div>
                      )}
                    </div>

                    {/* Amount Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center lg:text-right">
                      <div>
                        <p className="text-xs text-slate-500">Job Amount</p>
                        <p className="font-semibold text-slate-800">₹{claim.jobAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Claimed</p>
                        <p className="font-semibold text-blue-600">₹{claim.claimedAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          {claim.approvalStatus === 'approved' ? 'Approved' : 'Final'}
                        </p>
                        <p className={`font-semibold ${
                          claim.approvalStatus === 'approved' ? 'text-green-600' : 
                          claim.approvalStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          ₹{claim.approvedAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {claimsHistoryPagination && claimsHistoryPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setClaimsHistoryPage(prev => Math.max(prev - 1, 1))}
              disabled={!claimsHistoryPagination.hasPrevPage}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {claimsHistoryPagination.currentPage} of {claimsHistoryPagination.totalPages}
            </span>
            
            <button
              onClick={() => setClaimsHistoryPage(prev => Math.min(prev + 1, claimsHistoryPagination.totalPages))}
              disabled={!claimsHistoryPagination.hasNextPage}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </>
    )
  }

  if (isLoading && (activeTab === 'wallet' ? transactions.length === 0 : activeTab === 'earnings' ? !earningsData : claimsHistory.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
            {activeTab === 'wallet' ? 'Wallet Transactions' : 
             activeTab === 'earnings' ? 'Job Earnings' : 'Claims History'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {activeTab === 'wallet' ? 'View all your wallet transactions' :
             activeTab === 'earnings' ? 'Claim earnings from completed jobs' : 'View your earnings claims history'}
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'wallet') fetchTransactions()
            else if (activeTab === 'earnings') fetchEarnings()
            else fetchClaimsHistory()
          }}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg sm:text-xl text-slate-600" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'wallet', label: 'Wallet Transactions', icon: FiCreditCard },
            { key: 'earnings', label: 'Job Earnings', icon: FiDollarSign },
            { key: 'claims-history', label: 'Claims History', icon: FiFileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === key
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="text-lg" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'wallet' && renderWalletTab()}
      {activeTab === 'earnings' && renderEarningsTab()}
      {activeTab === 'claims-history' && renderClaimsHistoryTab()}

      {/* Job Earnings Details Modal */}
      {selectedJobEarning && (
        <JobEarningsModal
          earning={selectedJobEarning}
          onClose={() => setSelectedJobEarning(null)}
        />
      )}
    </div>
  )

  // Wallet Tab Content
  function renderWalletTab() {
    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Credits</p>
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Total Debits</p>
              <FiTrendingDown className="text-red-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Net Balance</p>
              <FiTrendingUp className="text-primary text-xl" />
            </div>
            <p className="text-2xl font-bold text-primary">
              ₹{(totalCredit - totalDebit).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <FiFilter className="text-slate-600 hidden sm:block" />
              <div className="flex gap-2">
                {['all', 'credit', 'debit'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                      filter === f
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                const exportData = filteredTransactions.map(txn => ({
                  'Date & Time': txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : 'N/A',
                  'Type': txn.type?.charAt(0).toUpperCase() + txn.type?.slice(1) || 'N/A',
                  'Amount (₹)': txn.amount || 0,
                  'Balance (₹)': txn.balance || 0,
                  'Description': txn.description || 'N/A',
                  'Reference': txn.reference || 'N/A',
                  'Transaction ID': txn.transactionId || txn._id || 'N/A'
                }))
                exportToExcel(exportData, [
                  { header: 'Date & Time', accessor: 'Date & Time' },
                  { header: 'Type', accessor: 'Type' },
                  { header: 'Amount (₹)', accessor: 'Amount (₹)' },
                  { header: 'Balance (₹)', accessor: 'Balance (₹)' },
                  { header: 'Description', accessor: 'Description' },
                  { header: 'Reference', accessor: 'Reference' },
                  { header: 'Transaction ID', accessor: 'Transaction ID' }
                ], 'Transactions', 'Transactions', {
                  columnWidths: [20, 12, 15, 15, 30, 20, 25]
                })
              }}
              disabled={filteredTransactions.length === 0}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
              title="Export to Excel"
            >
              <FiDownload /> <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">All Transactions</h2>
          </div>
          {walletError ? (
            <div className="p-6 text-center text-red-600">{walletError}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiTrendingUp className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No transactions found</p>
              <p className="text-xs mt-2">
                {walletLoading ? 'Loading...' : 'Try refreshing or check if you have any wallet activity'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTransactions.map((txn, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div
                      className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                        txn.type === 'credit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {txn.type === 'credit' ? (
                        <FiTrendingUp className="text-lg sm:text-xl" />
                      ) : (
                        <FiTrendingDown className="text-lg sm:text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">{txn.description || 'Transaction'}</p>
                        {txn.teamMember && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1">
                            <FiUser className="text-xs" />
                            {txn.teamMember.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                        <p className="text-xs sm:text-sm text-slate-500">
                          {txn.createdAt
                            ? new Date(txn.createdAt).toLocaleString('en-IN')
                            : txn.timestamp
                            ? new Date(txn.timestamp).toLocaleString('en-IN')
                            : 'N/A'}
                        </p>
                        {txn.transactionId && (
                          <p className="text-xs text-slate-400">ID: {txn.transactionId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p
                      className={`text-lg sm:text-xl font-bold ${
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }
}

export default TransactionsTab
