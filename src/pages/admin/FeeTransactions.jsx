import React, { useState, useMemo, useEffect } from 'react'
import { 
  FiCreditCard, 
  FiFilter, 
  FiRefreshCw,
  FiX,
  FiList,
  FiLayers,
  FiFileText,
  FiDownload
} from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import Invoice from '../../components/Invoice.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { exportToExcel } from '../../utils/excelExport.js'

const FeeTransactions = () => {
  const { token } = useAdminAuth()
  const [filters, setFilters] = useState({
    feeType: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('individual') // 'individual' or 'grouped'
  const [selectedInvoice, setSelectedInvoice] = useState(null) // For invoice modal

  // Create filter params object that changes when filters change
  const filterParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate ? 100 : 50
    }
    
    // Only include filters if they're not 'all'
    if (filters.feeType && filters.feeType !== 'all') {
      params.feeType = filters.feeType
    }
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status
    }
    
    // Only include dates if they have values
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('Filter Params Updated:', params)
    }
    
    return params
  }, [filters.feeType, filters.status, filters.startDate, filters.endDate, currentPage])

  // Create a stable string representation for the dependency array
  const filterParamsKey = useMemo(() => {
    return JSON.stringify(filterParams)
  }, [filterParams])

  // Create the fetcher function that captures filterParams
  const fetchTransactions = useMemo(() => {
    // Capture filterParams in the closure
    const currentParams = { ...filterParams }
    return (token) => adminApi.fetchFeeTransactions(token, currentParams)
  }, [filterParamsKey]) // Recreate when filterParams change

  const { data: transactionsData, isLoading, error, refresh } = useAdminData(
    fetchTransactions,
    [filterParamsKey] // Include filterParamsKey in deps to ensure cache key changes
  )

  const transactions = Array.isArray(transactionsData?.data) ? transactionsData.data : []
  const stats = transactionsData?.stats || {}
  const pagination = transactionsData?.pagination || {}
  const hasTransactions = transactions && transactions.length > 0

  // Group transactions by fee type for grouped view
  const groupedTransactions = useMemo(() => {
    if (viewMode !== 'grouped') return {}
    
    const grouped = {}
    transactions.forEach(txn => {
      const feeType = txn.feeType || 'other'
      if (!grouped[feeType]) {
        grouped[feeType] = {
          feeType,
          transactions: [],
          totalAmount: 0,
          count: 0,
          successCount: 0,
          successAmount: 0
        }
      }
      grouped[feeType].transactions.push(txn)
      grouped[feeType].totalAmount += txn.amount || 0
      grouped[feeType].count += 1
      if (txn.status === 'success') {
        grouped[feeType].successCount += 1
        grouped[feeType].successAmount += txn.amount || 0
      }
    })
    
    return grouped
  }, [transactions, viewMode])

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      // If startDate is after endDate, clear endDate
      if (key === 'startDate' && value && newFilters.endDate && new Date(value) > new Date(newFilters.endDate)) {
        newFilters.endDate = ''
      }
      // If endDate is before startDate, clear startDate
      if (key === 'endDate' && value && newFilters.startDate && new Date(value) < new Date(newFilters.startDate)) {
        newFilters.startDate = ''
      }
      return newFilters
    })
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleResetFilters = () => {
    setFilters({
      feeType: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    })
    setCurrentPage(1)
  }

  const getFeeTypeColor = (feeType) => {
    switch (feeType) {
      case 'registration':
        return 'bg-blue-500/10 text-blue-600'
      case 'mg_plan':
        return 'bg-purple-500/10 text-purple-600'
      case 'security_deposit':
        return 'bg-yellow-500/10 text-yellow-600'
      case 'toolkit':
        return 'bg-green-500/10 text-green-600'
      case 'lead_fee':
        return 'bg-orange-500/10 text-orange-600'
      default:
        return 'bg-slate-500/10 text-slate-600'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600'
      case 'failed':
        return 'bg-rose-500/10 text-rose-600'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600'
      case 'refunded':
        return 'bg-blue-500/10 text-blue-600'
      default:
        return 'bg-slate-500/10 text-slate-600'
    }
  }

  const formatFeeType = (feeType) => {
    return feeType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other'
  }

  return (
    <div>
      <ModuleHeader
        title="Fee Transactions"
        subtitle="View and manage all fee transactions including registration fees, MG plans, security deposits, and toolkit purchases."
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('individual')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                  viewMode === 'individual'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiList className="w-4 h-4" />
                Individual
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                  viewMode === 'grouped'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiLayers className="w-4 h-4" />
                Grouped
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const exportData = transactions.map(txn => ({
                    'Date & Time': new Date(txn.createdAt).toLocaleString('en-IN'),
                    'Partner Name': txn.partner?.name || txn.metadata?.partnerName || 'Unknown',
                    'Partner Phone': txn.partner?.phone || txn.metadata?.partnerPhone || txn.partnerId || 'N/A',
                    'Amount (₹)': txn.amount || 0,
                    'Status': txn.status?.charAt(0).toUpperCase() + txn.status?.slice(1) || 'Unknown',
                    'Payment Method': txn.paymentMethod?.charAt(0).toUpperCase() + txn.paymentMethod?.slice(1) || 'N/A',
                    'Transaction ID': txn.transactionId || 'N/A',
                    'Description': txn.description || 'N/A',
                    'Fee Type': txn.feeType || 'N/A'
                  }))
                  exportToExcel(exportData, [
                    { header: 'Date & Time', accessor: 'Date & Time' },
                    { header: 'Partner Name', accessor: 'Partner Name' },
                    { header: 'Partner Phone', accessor: 'Partner Phone' },
                    { header: 'Amount (₹)', accessor: 'Amount (₹)' },
                    { header: 'Status', accessor: 'Status' },
                    { header: 'Payment Method', accessor: 'Payment Method' },
                    { header: 'Transaction ID', accessor: 'Transaction ID' },
                    { header: 'Description', accessor: 'Description' },
                    { header: 'Fee Type', accessor: 'Fee Type' }
                  ], 'Fee_Transactions', 'Transactions', {
                    columnWidths: [20, 20, 15, 15, 12, 15, 25, 30, 15]
                  })
                }}
                disabled={!hasTransactions}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to Excel"
              >
                <FiDownload /> Export Excel
              </button>
              <button
                onClick={refresh}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition inline-flex items-center gap-2"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>
        }
      />

      {/* Statistics Cards - Show even when no data to indicate filter results */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Amount</p>
              <FiCreditCard className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ₹{(stats.totalAmount || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{(stats.totalCount || 0)} transaction{(stats.totalCount || 0) !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Successful</p>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{(stats.successAmount || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{(stats.successCount || 0)} transaction{(stats.successCount || 0) !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Failed</p>
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600">
              {stats.failedCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Failed transaction{(stats.failedCount || 0) !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Success Rate</p>
              <FiRefreshCw className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(stats.totalCount || 0) > 0 
                ? (((stats.successCount || 0) / (stats.totalCount || 1)) * 100).toFixed(1) 
                : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Payment success rate</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fee Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Fee Type
            </label>
            <select
              value={filters.feeType}
              onChange={(e) => handleFilterChange('feeType', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="registration">Registration</option>
              <option value="security_deposit">Security Deposit</option>
              <option value="toolkit">Toolkit</option>
              <option value="mg_plan">MG Plan</option>
              <option value="lead_fee">Lead Fee</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                max={filters.endDate || undefined}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate || undefined}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="End Date"
              />
            </div>
            {filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate) && (
              <p className="text-xs text-rose-600 mt-1">End date must be after start date</p>
            )}
          </div>
        </div>

        {/* Reset Filters Button */}
        {(filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition inline-flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 m-6 rounded-lg">
            <p className="font-semibold mb-1">Error loading transactions</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refresh}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : !hasTransactions ? (
          <div className="text-center py-16">
            <FiCreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg mb-2">No transactions found</p>
            <p className="text-sm text-slate-400 mb-4">
              {(filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) 
                ? 'No transactions match your current filters. Try adjusting your filters or clear them to see all transactions.'
                : 'There are no fee transactions in the system yet.'}
            </p>
            {(filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grouped' ? (
          // Grouped View
          <div className="divide-y divide-slate-200">
            {!hasTransactions || Object.keys(groupedTransactions).length === 0 ? (
              <div className="text-center py-16">
                <FiCreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium text-lg mb-2">No transactions found</p>
                <p className="text-sm text-slate-400 mb-4">
                  {(filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) 
                    ? 'No transactions match your current filters. Try adjusting your filters or clear them to see all transactions.'
                    : 'There are no fee transactions in the system yet.'}
                </p>
                {(filters.feeType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              Object.values(groupedTransactions).map((group) => (
                <div key={group.feeType} className="p-6">
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getFeeTypeColor(group.feeType)}`}>
                        {formatFeeType(group.feeType)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {group.count} transaction{group.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-slate-500">Total Amount</p>
                        <p className="font-bold text-slate-900">₹{group.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500">Successful</p>
                        <p className="font-bold text-emerald-600">₹{group.successAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Group Transactions */}
                  {group.transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No transactions in this group
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Date & Time</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Partner</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Payment Method</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Transaction ID</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.transactions.map((txn) => {
                        return (
                          <tr key={txn._id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                              {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm">
                                <p className="font-semibold text-slate-900">
                                  {txn.partner?.name || txn.metadata?.partnerName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {txn.partner?.phone || txn.metadata?.partnerPhone || txn.partnerId}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{txn.amount?.toLocaleString('en-IN') || 0}
                              </p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                                {txn.status?.charAt(0).toUpperCase() + txn.status?.slice(1) || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                              {txn.paymentMethod?.charAt(0).toUpperCase() + txn.paymentMethod?.slice(1) || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-xs text-slate-500 font-mono">
                                {txn.transactionId || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                              <div>
                                <p className="truncate">{txn.description || 'N/A'}</p>
                                {txn.metadata?.priceBreakdown && (
                                  <details className="mt-1">
                                    <summary className="text-xs text-primary cursor-pointer hover:underline">
                                      View Payment Breakdown
                                    </summary>
                                    <div className="mt-1 text-xs text-slate-500 space-y-0.5 pl-2 bg-slate-50 p-2 rounded">
                                      {txn.metadata.priceBreakdown.registrationFee > 0 && (
                                        <p className={filters.feeType === 'registration' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Registration Fee: ₹{txn.metadata.priceBreakdown.registrationFee.toLocaleString('en-IN')}
                                          {filters.feeType === 'registration' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.securityDeposit > 0 && (
                                        <p className={filters.feeType === 'security_deposit' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Security Deposit: ₹{txn.metadata.priceBreakdown.securityDeposit.toLocaleString('en-IN')}
                                          {filters.feeType === 'security_deposit' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.toolkitPrice > 0 && (
                                        <p className={filters.feeType === 'toolkit' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Toolkit: ₹{txn.metadata.priceBreakdown.toolkitPrice.toLocaleString('en-IN')}
                                          {filters.feeType === 'toolkit' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.totalAmount > 0 && (
                                        <p className="font-semibold text-slate-700 border-t border-slate-200 pt-1 mt-1">
                                          Total Paid: ₹{txn.metadata.priceBreakdown.totalAmount.toLocaleString('en-IN')}
                                        </p>
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedInvoice({ data: txn, type: 'transaction' })}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition flex items-center gap-2"
                              >
                                <FiFileText /> Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Individual View
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                      {transactions.map((txn) => {
                        return (
                          <tr key={txn._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <p className="font-semibold text-slate-900">
                                  {txn.partner?.name || txn.metadata?.partnerName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {txn.partner?.phone || txn.metadata?.partnerPhone || txn.partnerId}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getFeeTypeColor(txn.feeType)}`}>
                                {formatFeeType(txn.feeType)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{txn.amount?.toLocaleString('en-IN') || 0}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                                {txn.status?.charAt(0).toUpperCase() + txn.status?.slice(1) || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {txn.paymentMethod?.charAt(0).toUpperCase() + txn.paymentMethod?.slice(1) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-500 font-mono">
                                {txn.transactionId || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                              <div>
                                <p className="truncate">{txn.description || 'N/A'}</p>
                                {txn.metadata?.priceBreakdown && (
                                  <details className="mt-1">
                                    <summary className="text-xs text-primary cursor-pointer hover:underline">
                                      View Payment Breakdown
                                    </summary>
                                    <div className="mt-1 text-xs text-slate-500 space-y-0.5 pl-2 bg-slate-50 p-2 rounded">
                                      {txn.metadata.priceBreakdown.registrationFee > 0 && (
                                        <p className={filters.feeType === 'registration' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Registration Fee: ₹{txn.metadata.priceBreakdown.registrationFee.toLocaleString('en-IN')}
                                          {filters.feeType === 'registration' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.securityDeposit > 0 && (
                                        <p className={filters.feeType === 'security_deposit' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Security Deposit: ₹{txn.metadata.priceBreakdown.securityDeposit.toLocaleString('en-IN')}
                                          {filters.feeType === 'security_deposit' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.toolkitPrice > 0 && (
                                        <p className={filters.feeType === 'toolkit' ? 'font-semibold text-primary bg-primary/10 px-2 py-1 rounded' : ''}>
                                          Toolkit: ₹{txn.metadata.priceBreakdown.toolkitPrice.toLocaleString('en-IN')}
                                          {filters.feeType === 'toolkit' && ' (Current Filter)'}
                                        </p>
                                      )}
                                      {txn.metadata.priceBreakdown.totalAmount > 0 && (
                                        <p className="font-semibold text-slate-700 border-t border-slate-200 pt-1 mt-1">
                                          Total Paid: ₹{txn.metadata.priceBreakdown.totalAmount.toLocaleString('en-IN')}
                                        </p>
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedInvoice({ data: txn, type: 'transaction' })}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition flex items-center gap-2"
                              >
                                <FiFileText /> Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * (pagination.limit || 20)) + 1} to{' '}
                  {Math.min(currentPage * (pagination.limit || 20), pagination.total)} of{' '}
                  {pagination.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Page {currentPage} of {pagination.pages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages || 1, prev + 1))}
                    disabled={currentPage >= (pagination.pages || 1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
}

export default FeeTransactions

