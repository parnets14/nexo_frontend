import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye
} from 'react-icons/fi'
import { exportToExcel } from '../../../utils/excelExport.js'

const EarningsTab = () => {
  const { token } = usePartnerAuth()
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, claimed, unclaimed
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [selectedBookings, setSelectedBookings] = useState([])
  const [claiming, setClaiming] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchEarnings()
  }, [token, currentPage, dateRange])

  const fetchEarnings = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      }
      
      const response = await partnerApi.getEarnings(token, params)
      setEarningsData(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings data')
    } finally {
      setLoading(false)
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

  if (loading && !earningsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
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
    if (filter === 'claimed') return earning.earningsClaimed
    if (filter === 'unclaimed') return !earning.earningsClaimed
    return true
  }) || []

  const selectedEarningsTotal = selectedBookings.reduce((total, bookingId) => {
    const earning = earnings?.find(e => e.bookingId === bookingId)
    return total + (earning?.partnerEarning || 0)
  }, 0)

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Job Earnings</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Track your earnings with commission cuts based on your MG plan
          </p>
        </div>
        <button
          onClick={fetchEarnings}
          disabled={loading}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto disabled:opacity-50"
        >
          <FiRefreshCw className={`text-lg sm:text-xl text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredEarnings.map((earning) => (
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
                          {earning.serviceName}
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
                          {earning.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-slate-600">
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

                  {/* Earnings Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-right">
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
              </div>
            ))}
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
    </div>
  )
}

export default EarningsTab