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
  FiCreditCard
} from 'react-icons/fi'
import Invoice from '../../../components/Invoice.jsx'
import Pagination from '../../../components/Pagination.jsx'
import PaginationControls from '../../../components/PaginationControls.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const TransactionsTab = () => {
  const { token } = usePartnerAuth()
  const [activeTab, setActiveTab] = useState('earnings') // earnings, wallet, claims-history
  
  // Wallet Transactions State
  const [transactions, setTransactions] = useState([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState(null)
  const [filter, setFilter] = useState('all') // all, credit, debit
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  
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
    if (activeTab === 'wallet') {
      fetchTransactions()
    } else if (activeTab === 'earnings') {
      fetchEarnings()
    } else if (activeTab === 'claims-history') {
      fetchClaimsHistory()
    }
  }, [token, activeTab, currentPage, dateRange, claimsHistoryPage, claimsHistoryFilter, itemsPerPage, claimsHistoryItemsPerPage])

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
      setEarningsData(response.data)
    } catch (err) {
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

  if (isLoading && (activeTab === 'wallet' ? transactions.length === 0 : activeTab === 'earnings' ? !earningsData : claimsHistory.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-0">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
            {activeTab === 'earnings' ? 'Job Earnings' : activeTab === 'wallet' ? 'Wallet Transactions' : 'Claims History'}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">
            {activeTab === 'earnings' 
              ? 'Track your earnings with commission cuts based on your MG plan'
              : activeTab === 'wallet'
              ? 'View all your wallet transactions'
              : 'View history of all your earnings claims'
            }
          </p>
        </div>
        <button
          onClick={activeTab === 'wallet' ? fetchTransactions : activeTab === 'earnings' ? fetchEarnings : fetchClaimsHistory}
          disabled={isLoading}
          className="p-2 sm:p-2.5 lg:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto disabled:opacity-50"
        >
          <FiRefreshCw className={`text-base sm:text-lg lg:text-xl text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm lg:text-base font-semibold transition ${
              activeTab === 'earnings'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <FiDollarSign className="text-sm sm:text-base lg:text-lg" />
              <span className="text-xs sm:text-sm lg:text-base">Job Earnings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm lg:text-base font-semibold transition ${
              activeTab === 'wallet'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <FiTrendingUp className="text-sm sm:text-base lg:text-lg" />
              <span className="text-xs sm:text-sm lg:text-base">Wallet</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('claims-history')}
            className={`flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm lg:text-base font-semibold transition ${
              activeTab === 'claims-history'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <FiFileText className="text-sm sm:text-base lg:text-lg" />
              <span className="text-xs sm:text-sm lg:text-base">Claims</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'earnings' ? renderEarningsTab() : activeTab === 'wallet' ? renderWalletTab() : renderClaimsHistoryTab()}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Invoice
          data={selectedInvoice.data}
          type={selectedInvoice.type}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )

  // Earnings Tab Content
  function renderEarningsTab() {
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

    return (
      <>
        {/* MG Plan Info */}
        {partner?.mgPlan && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 sm:p-4 lg:p-6 border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <FiPercent className="text-primary text-lg sm:text-xl" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Current MG Plan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/50 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Plan Name</p>
                <p className="font-semibold text-slate-800 text-sm sm:text-base">{partner.mgPlan.name}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Commission Rate</p>
                <p className="font-semibold text-red-600 text-sm sm:text-base">{partner.mgPlan.commission}%</p>
              </div>
              <div className="bg-white/50 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Subscribed</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {partner.mgPlanSubscribedAt ? new Date(partner.mgPlanSubscribedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-white/50 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Expires</p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {partner.mgPlanExpiresAt ? new Date(partner.mgPlanExpiresAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Total Job Amount</p>
              <FiDollarSign className="text-blue-600 text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">₹{summary?.totalJobAmount?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{summary?.totalJobs || 0} jobs</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Commission Cut</p>
              <FiTrendingDown className="text-red-600 text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">₹{summary?.totalCommissionCut?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">{summary?.commissionRate || 0}% rate</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Your Earnings</p>
              <FiTrendingUp className="text-green-600 text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">₹{summary?.totalPartnerEarnings?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">After commission</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Wallet Balance</p>
              <FiDollarSign className="text-primary text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">₹{summary?.walletBalance?.toLocaleString('en-IN') || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Available balance</p>
          </div>
        </div>

        {/* Earnings Filters and Actions */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Date Range</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Start Date"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-slate-600 text-sm">to</span>
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <FiFilter className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Status Filter</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'unclaimed', 'pending', 'approved', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEarningsFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      earningsFilter === f
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : 
                     f === 'unclaimed' ? 'Unclaimed' :
                     f === 'pending' ? 'Pending' :
                     f === 'approved' ? 'Approved' :
                     f === 'rejected' ? 'Rejected' : 
                     f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
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
                    'Earnings Status': earning.earningsClaimed 
                      ? earning.earningsApprovalStatus === 'approved'
                        ? 'Approved'
                        : earning.earningsApprovalStatus === 'rejected'
                        ? 'Rejected'
                        : 'Pending Approval'
                      : 'Unclaimed',
                    'MG Plan': earning.mgPlan
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
                    { header: 'MG Plan', accessor: 'MG Plan' }
                  ], 'Job_Earnings', 'Job Earnings Report', {
                    columnWidths: [15, 20, 25, 15, 15, 15, 15, 15, 15, 15]
                  })
                }}
                disabled={filteredEarnings.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="text-sm" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Claim Earnings Section */}
        {selectedBookings.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-green-800 mb-1">
                  {selectedBookings.length} job(s) selected
                </h3>
                <p className="text-sm sm:text-base text-green-700">
                  Total earnings to claim: ₹{selectedEarningsTotal.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedBookings([])}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition text-sm font-semibold"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleClaimEarnings}
                  disabled={claiming}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
          <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 gap-2 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Job Earnings</h2>
                {filteredEarnings.filter(e => !e.earningsClaimed).length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs sm:text-sm text-primary hover:text-primary-dark font-semibold self-start sm:self-auto"
                  >
                    {selectedBookings.length === filteredEarnings.filter(e => !e.earningsClaimed).length ? 'Deselect All' : 'Select All Unclaimed'}
                  </button>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <PaginationControls
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(newLimit) => {
                    setItemsPerPage(newLimit)
                    setCurrentPage(1)
                  }}
                  totalItems={pagination?.totalItems || 0}
                  options={[10, 20, 50, 100]}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
          
          {filteredEarnings.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-500">
              <FiDollarSign className="text-3xl sm:text-4xl mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No earnings found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredEarnings.map((earning) => (
                <div
                  key={earning.bookingId}
                  className={`p-3 sm:p-4 lg:p-6 hover:bg-slate-50 transition ${
                    selectedBookings.includes(earning.bookingId) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Mobile Layout */}
                    <div className="block lg:hidden">
                      {/* Header with checkbox and service name */}
                      <div className="flex items-start gap-3 mb-3">
                        {!earning.earningsClaimed && (
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(earning.bookingId)}
                            onChange={() => handleSelectBooking(earning.bookingId)}
                            className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm mb-2">
                            {earning.serviceName}
                          </h3>
                          
                          {/* Status badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.earningsClaimed 
                                ? earning.earningsApprovalStatus === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : earning.earningsApprovalStatus === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {earning.earningsClaimed 
                                ? earning.earningsApprovalStatus === 'approved'
                                  ? 'Approved'
                                  : earning.earningsApprovalStatus === 'rejected'
                                  ? 'Rejected'
                                  : 'Pending'
                                : 'Unclaimed'
                              }
                            </span>
                            {earning.earningsPaymentMode && earning.earningsApprovalStatus === 'approved' && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                earning.earningsPaymentMode === 'online'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {earning.earningsPaymentMode}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {earning.paymentStatus}
                            </span>
                          </div>
                          
                          {/* Job details */}
                          <div className="space-y-2 text-xs text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <FiUser className="text-xs flex-shrink-0" />
                              <span className="truncate">{earning.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-xs flex-shrink-0" />
                              <span>{new Date(earning.jobDate).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-xs flex-shrink-0" />
                              <span>{earning.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMapPin className="text-xs flex-shrink-0" />
                              <span className="truncate">{earning.location?.address?.substring(0, 40)}...</span>
                            </div>
                          </div>

                          {/* Financial breakdown - Mobile */}
                          <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 rounded-lg p-3">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Job Amount</p>
                              <p className="font-semibold text-slate-800 text-sm">₹{earning.jobAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Commission</p>
                              <p className="font-semibold text-red-600 text-sm">-₹{earning.commissionAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Your Earning</p>
                              <p className="font-semibold text-green-600 text-sm">₹{earning.partnerEarning.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">MG Plan</p>
                              <p className="font-semibold text-primary text-xs">{earning.mgPlan}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
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
                            <h3 className="font-semibold text-slate-800 text-base">
                              {earning.serviceName}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.earningsClaimed 
                                ? earning.earningsApprovalStatus === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : earning.earningsApprovalStatus === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {earning.earningsClaimed 
                                ? earning.earningsApprovalStatus === 'approved'
                                  ? 'Approved'
                                  : earning.earningsApprovalStatus === 'rejected'
                                  ? 'Rejected'
                                  : 'Pending Approval'
                                : 'Unclaimed'
                              }
                            </span>
                            {earning.earningsPaymentMode && earning.earningsApprovalStatus === 'approved' && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                earning.earningsPaymentMode === 'online'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {earning.earningsPaymentMode}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              earning.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {earning.paymentStatus}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {earning.customerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              {new Date(earning.jobDate).toLocaleDateString('en-IN')}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-xs" />
                              {earning.scheduledTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMapPin className="text-xs" />
                              {earning.location?.address?.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Earnings Breakdown - Desktop */}
                      <div className="grid grid-cols-4 gap-4 text-center text-right">
                        <div>
                          <p className="text-xs text-slate-500">Job Amount</p>
                          <p className="font-semibold text-slate-800">₹{earning.jobAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Commission ({earning.commissionRate}%)</p>
                          <p className="font-semibold text-red-600">-₹{earning.commissionAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Your Earning</p>
                          <p className="font-semibold text-green-600">₹{earning.partnerEarning.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">MG Plan</p>
                          <p className="font-semibold text-primary text-xs">{earning.mgPlan}</p>
                        </div>
                      </div>
                    </div>

                        {/* Payment Details for Approved Earnings */}
                        {earning.earningsApprovalStatus === 'approved' && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-green-700">
                              <div>
                                <span className="font-medium">Approved Amount: </span>
                                ₹{earning.earningsApprovedAmount?.toLocaleString('en-IN')}
                              </div>
                              {earning.earningsApprovedAt && (
                                <div>
                                  <span className="font-medium">Approved Date: </span>
                                  {new Date(earning.earningsApprovedAt).toLocaleDateString('en-IN')}
                                </div>
                              )}
                              {earning.earningsTransactionId && (
                                <div className="col-span-full">
                                  <span className="font-medium">Transaction ID: </span>
                                  <span className="font-mono text-xs bg-green-100 px-1 rounded">
                                    {earning.earningsTransactionId}
                                  </span>
                                </div>
                              )}
                              {earning.earningsPaidByName && (
                                <div className="col-span-full">
                                  <span className="font-medium">Paid By: </span>
                                  {earning.earningsPaidByName}
                                </div>
                              )}
                              {earning.earningsApprovalRemark && (
                                <div className="col-span-full">
                                  <span className="font-medium">Admin Remark: </span>
                                  <span className="italic">{earning.earningsApprovalRemark}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rejection Details */}
                        {earning.earningsApprovalStatus === 'rejected' && earning.earningsApprovalRemark && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-xs text-red-700">
                              <span className="font-medium">Rejection Reason: </span>
                              <span className="italic">{earning.earningsApprovalRemark}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            showInfo={true}
            showJumpToPage={pagination.totalPages > 10}
            className="mt-6"
          />
        )}
      </>
    )
  }

  // Wallet Tab Content (existing functionality)
  function renderWalletTab() {
    if (walletError) {
      return (
        <div className="text-center py-8 sm:py-12">
          <div className="text-red-600 mb-4 text-sm sm:text-base">{walletError}</div>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      )
    }

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Total Credits</p>
              <FiTrendingUp className="text-green-600 text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Total Debits</p>
              <FiTrendingDown className="text-red-600 text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-slate-600">Net Balance</p>
              <FiTrendingUp className="text-primary text-lg sm:text-xl" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              ₹{(totalCredit - totalDebit).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
              </div>
              <div className="flex gap-2">
                {['all', 'credit', 'debit'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
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
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <FiDownload className="text-sm" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">All Transactions</h2>
          </div>
          {filteredTransactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-500">
              <FiTrendingUp className="text-3xl sm:text-4xl mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTransactions.map((txn, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 lg:p-6 hover:bg-slate-50 transition"
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          txn.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {txn.type === 'credit' ? (
                          <FiTrendingUp className="text-lg" />
                        ) : (
                          <FiTrendingDown className="text-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">
                              {txn.description || 'Transaction'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {txn.createdAt
                                ? new Date(txn.createdAt).toLocaleString('en-IN')
                                : txn.timestamp
                                ? new Date(txn.timestamp).toLocaleString('en-IN')
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p
                              className={`text-lg font-bold ${
                                txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                            </p>
                            <p className="text-xs text-slate-500">
                              Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                            </p>
                          </div>
                        </div>
                        {txn.teamMember && (
                          <div className="mb-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold inline-flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {txn.teamMember.name}
                            </span>
                          </div>
                        )}
                        {txn.transactionId && (
                          <p className="text-xs text-slate-400 mb-2">ID: {txn.transactionId}</p>
                        )}
                        <button
                          onClick={() => setSelectedInvoice({ data: txn, type: 'transaction' })}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition inline-flex items-center gap-1"
                        >
                          <FiFileText className="text-xs" />
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`p-3 rounded-lg flex-shrink-0 ${
                          txn.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {txn.type === 'credit' ? (
                          <FiTrendingUp className="text-xl" />
                        ) : (
                          <FiTrendingDown className="text-xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 text-base truncate">{txn.description || 'Transaction'}</p>
                          {txn.teamMember && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1">
                              <FiUser className="text-xs" />
                              {txn.teamMember.name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                          <p className="text-sm text-slate-500">
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
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-xl font-bold ${
                          txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                      </p>
                      <p className="text-sm text-slate-500">
                        Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                      </p>
                      <button
                        onClick={() => setSelectedInvoice({ data: txn, type: 'transaction' })}
                        className="mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition inline-flex items-center gap-2"
                      >
                        <FiFileText />
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  // Claims History Tab Content
  function renderClaimsHistoryTab() {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600">Total Claims</p>
                <FiFileText className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{claimsHistorySummary.totalClaims}</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600">Approved</p>
                <FiCheckCircle className="text-green-600 text-lg sm:text-xl" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{claimsHistorySummary.approvedClaims}</p>
              <p className="text-xs text-slate-500 mt-1">₹{claimsHistorySummary.totalApprovedAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600">Pending</p>
                <FiClock className="text-orange-600 text-lg sm:text-xl" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{claimsHistorySummary.pendingClaims}</p>
              <p className="text-xs text-slate-500 mt-1">₹{claimsHistorySummary.pendingAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600">Approval Rate</p>
                <FiPercent className="text-primary text-lg sm:text-xl" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{claimsHistorySummary.approvalRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Success rate</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Date Range</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Start Date"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-slate-600 text-sm">to</span>
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <FiFilter className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Status Filter</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'approved', 'pending', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setClaimsHistoryFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
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
          </div>
        </div>

        {/* Claims History List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Claims History</h2>
              <div className="w-full sm:w-auto">
                <PaginationControls
                  itemsPerPage={claimsHistoryItemsPerPage}
                  onItemsPerPageChange={(newLimit) => {
                    setClaimsHistoryItemsPerPage(newLimit)
                    setClaimsHistoryPage(1)
                  }}
                  totalItems={claimsHistoryPagination?.totalItems || 0}
                  options={[10, 20, 50, 100]}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
          
          {claimsHistory.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-500">
              <FiFileText className="text-3xl sm:text-4xl mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No claims history found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {claimsHistory.map((claim) => (
                <div
                  key={claim.claimId}
                  className="p-3 sm:p-4 lg:p-6 hover:bg-slate-50 transition"
                >
                  <div className="space-y-4">
                    {/* Mobile Layout */}
                    <div className="block lg:hidden">
                      <div className="flex flex-col gap-3">
                        {/* Header with service name and status */}
                        <div className="flex flex-col gap-2">
                          <h3 className="font-semibold text-slate-800 text-sm">
                            {claim.serviceName}
                          </h3>
                          
                          {/* Status badges */}
                          <div className="flex flex-wrap gap-1">
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
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                claim.paymentMode === 'online'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {claim.paymentMode}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Claim details */}
                        <div className="space-y-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <FiUser className="text-xs flex-shrink-0" />
                            <span className="truncate">{claim.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-xs flex-shrink-0" />
                            <span>Claimed: {new Date(claim.claimedDate).toLocaleDateString('en-IN')}</span>
                          </div>
                          {claim.approvedAt && (
                            <div className="flex items-center gap-1">
                              <FiCheckCircle className="text-xs flex-shrink-0" />
                              <span>Approved: {new Date(claim.approvedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FiPercent className="text-xs flex-shrink-0" />
                            <span>{claim.commissionRate}% commission</span>
                          </div>
                        </div>

                        {/* Payment Details - Mobile */}
                        {claim.approvalStatus === 'approved' && (
                          <div className="text-xs text-slate-600 space-y-1">
                            {claim.transactionId && (
                              <div className="flex items-center gap-1">
                                <FiCreditCard className="text-xs flex-shrink-0" />
                                <span>Transaction ID: </span>
                                <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                                  {claim.transactionId}
                                </span>
                              </div>
                            )}
                            {claim.paidByName && (
                              <div className="flex items-center gap-1">
                                <FiUser className="text-xs flex-shrink-0" />
                                <span>Paid by: {claim.paidByName}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remark - Mobile */}
                        {claim.approvalRemark && (
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">Remark: </span>
                            <span className="italic">{claim.approvalRemark}</span>
                          </div>
                        )}

                        {/* Financial breakdown - Mobile */}
                        <div className="grid grid-cols-2 gap-3 text-center bg-slate-50 rounded-lg p-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Job Amount</p>
                            <p className="font-semibold text-slate-800 text-sm">₹{claim.jobAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Commission</p>
                            <p className="font-semibold text-red-600 text-sm">-₹{claim.commissionAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Claimed Amount</p>
                            <p className="font-semibold text-blue-600 text-sm">₹{claim.claimedAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              {claim.approvalStatus === 'approved' ? 'Approved Amount' : 'Expected Amount'}
                            </p>
                            <p className="font-semibold text-green-600 text-sm">
                              ₹{(claim.approvedAmount || claim.partnerEarning).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                      {/* Claim Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-800 text-base">
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
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              claim.paymentMode === 'online'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {claim.paymentMode}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <FiUser className="text-xs" />
                            {claim.customerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-xs" />
                            Claimed: {new Date(claim.claimedDate).toLocaleDateString('en-IN')}
                          </div>
                          {claim.approvedAt && (
                            <div className="flex items-center gap-1">
                              <FiCheckCircle className="text-xs" />
                              Approved: {new Date(claim.approvedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FiPercent className="text-xs" />
                            {claim.commissionRate}% commission
                          </div>
                        </div>

                        {/* Payment Details */}
                        {claim.approvalStatus === 'approved' && (
                          <div className="text-sm text-slate-600 mb-3">
                            {claim.transactionId && (
                              <div className="flex items-center gap-1">
                                <FiCreditCard className="text-xs" />
                                <span>Transaction ID: </span>
                                <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                                  {claim.transactionId}
                                </span>
                              </div>
                            )}
                            {claim.paidByName && (
                              <div className="flex items-center gap-1">
                                <FiUser className="text-xs" />
                                <span>Paid by: {claim.paidByName}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Remark */}
                        {claim.approvalRemark && (
                          <div className="text-sm text-slate-600 mb-3">
                            <span className="font-medium">Remark: </span>
                            <span className="italic">{claim.approvalRemark}</span>
                          </div>
                        )}
                      </div>

                      {/* Financial Breakdown - Desktop */}
                      <div className="grid grid-cols-4 gap-4 text-center text-right">
                        <div>
                          <p className="text-xs text-slate-500">Job Amount</p>
                          <p className="font-semibold text-slate-800">₹{claim.jobAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Commission ({claim.commissionRate}%)</p>
                          <p className="font-semibold text-red-600">-₹{claim.commissionAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Claimed Amount</p>
                          <p className="font-semibold text-blue-600">₹{claim.claimedAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            {claim.approvalStatus === 'approved' ? 'Approved Amount' : 'Expected Amount'}
                          </p>
                          <p className="font-semibold text-green-600">
                            ₹{(claim.approvedAmount || claim.partnerEarning).toLocaleString('en-IN')}
                          </p>
                        </div>
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
          <Pagination
            currentPage={claimsHistoryPagination.currentPage}
            totalPages={claimsHistoryPagination.totalPages}
            totalItems={claimsHistoryPagination.totalItems}
            itemsPerPage={claimsHistoryPagination.itemsPerPage}
            onPageChange={(page) => setClaimsHistoryPage(page)}
            showInfo={true}
            showJumpToPage={claimsHistoryPagination.totalPages > 10}
            className="mt-6"
          />
        )}
      </>
    )
  }
}

export default TransactionsTab

