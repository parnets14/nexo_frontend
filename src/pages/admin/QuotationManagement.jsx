import React, { useState, useEffect } from 'react'
import { FiEye, FiCheckCircle, FiXCircle, FiClock, FiFilter, FiRefreshCw, FiDownload } from 'react-icons/fi'
import { adminApi } from '../../services/adminApi'
import QuotationDetailsModal from '../../components/QuotationDetailsModal'
import { exportToExcel } from '../../utils/excelExport'

const QuotationManagement = () => {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    customerStatus: 'all',
    partnerStatus: 'all',
    adminStatus: 'all'
  })

  useEffect(() => {
    fetchQuotations()
  }, [filters])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('adminToken')
      
      const params = {}
      if (filters.status !== 'all') params.status = filters.status
      if (filters.customerStatus !== 'all') params.customerStatus = filters.customerStatus
      if (filters.partnerStatus !== 'all') params.partnerStatus = filters.partnerStatus
      if (filters.adminStatus !== 'all') params.adminStatus = filters.adminStatus

      const response = await adminApi.getAllQuotations(token, params)
      if (response.success) {
        setQuotations(response.data || [])
      } else {
        throw new Error(response.message || 'Failed to fetch quotations')
      }
    } catch (err) {
      console.error('Error fetching quotations:', err)
      setError(err.message || 'Failed to fetch quotations')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveQuotation = async (quotationId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await adminApi.approveQuotation(token, quotationId)
      if (response.success) {
        await fetchQuotations()
        alert('Quotation approved successfully!')
      }
    } catch (error) {
      console.error('Error approving quotation:', error)
      throw error
    }
  }

  const handleRejectQuotation = async (quotationId, rejectionReason) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await adminApi.rejectQuotation(token, quotationId, rejectionReason)
      if (response.success) {
        await fetchQuotations()
        alert('Quotation rejected successfully!')
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      throw error
    }
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

  const exportQuotations = () => {
    const exportData = quotations.map(q => ({
      'Quotation Number': q.quotationNumber || 'N/A',
      'Customer Name': q.user?.name || 'N/A',
      'Partner Name': q.partner?.profile?.name || q.partner?.phone || 'N/A',
      'Total Amount (₹)': q.totalAmount || 0,
      'Customer Status': q.customerStatus || 'pending',
      'Partner Status': q.partnerStatus === 'not_required' ? 'Not Required' : (q.partnerStatus || 'pending'),
      'Admin Status': q.adminStatus || 'pending',
      'Overall Status': q.status || 'pending',
      'Valid Till': q.validTill ? new Date(q.validTill).toLocaleDateString('en-IN') : 'N/A',
      'Created At': q.createdAt ? new Date(q.createdAt).toLocaleString('en-IN') : 'N/A',
      'Items Count': q.items?.length || 0
    }))

    exportToExcel(exportData, [
      { header: 'Quotation Number', accessor: 'Quotation Number' },
      { header: 'Customer Name', accessor: 'Customer Name' },
      { header: 'Partner Name', accessor: 'Partner Name' },
      { header: 'Total Amount (₹)', accessor: 'Total Amount (₹)' },
      { header: 'Customer Status', accessor: 'Customer Status' },
      { header: 'Partner Status', accessor: 'Partner Status' },
      { header: 'Admin Status', accessor: 'Admin Status' },
      { header: 'Overall Status', accessor: 'Overall Status' },
      { header: 'Valid Till', accessor: 'Valid Till' },
      { header: 'Created At', accessor: 'Created At' },
      { header: 'Items Count', accessor: 'Items Count' }
    ], 'Quotations_Management', 'Quotations', {
      columnWidths: [20, 20, 20, 15, 15, 15, 15, 15, 15, 20, 12]
    })
  }

  if (loading) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Quotation Management</h1>
          <p className="text-slate-600">Manage and review all quotations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchQuotations}
            disabled={loading}
            className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`text-lg text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportQuotations}
            disabled={quotations.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Quotations</p>
          <p className="text-2xl font-bold text-slate-800">{quotations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Pending Partner</p>
          <p className="text-2xl font-bold text-blue-600">
            {quotations.filter(q => q.partnerStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Pending Admin Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {quotations.filter(q => q.adminStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {quotations.filter(q => q.adminStatus === 'accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {quotations.filter(q => q.adminStatus === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex items-center gap-4 flex-wrap">
          <FiFilter className="text-slate-600" />
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Overall Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Customer Status:</label>
            <select
              value={filters.customerStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, customerStatus: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Partner Status:</label>
            <select
              value={filters.partnerStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, partnerStatus: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Admin Status:</label>
            <select
              value={filters.adminStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, adminStatus: e.target.value }))}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiClock className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No quotations found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {quotations.map((quotation) => (
              <div key={quotation._id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        #{quotation.quotationNumber}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(quotation.customerStatus)}`}>
                          {getStatusIcon(quotation.customerStatus)}
                          Customer: {quotation.customerStatus}
                        </span>
                        {quotation.partnerStatus !== 'not_required' && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(quotation.partnerStatus)}`}>
                            {getStatusIcon(quotation.partnerStatus)}
                            Partner: {quotation.partnerStatus}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(quotation.adminStatus)}`}>
                          {getStatusIcon(quotation.adminStatus)}
                          Admin: {quotation.adminStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                      <p><strong>Customer:</strong> {quotation.user?.name || 'N/A'}</p>
                      <p><strong>Partner:</strong> {quotation.partner?.profile?.name || quotation.partner?.phone || 'N/A'}</p>
                      <p><strong>Items:</strong> {quotation.items?.length || 0}</p>
                      <p><strong>Valid Till:</strong> {quotation.validTill ? new Date(quotation.validTill).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-primary mb-2">
                      ₹{quotation.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                    <button
                      onClick={() => setSelectedQuotation(quotation)}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition inline-flex items-center gap-2"
                    >
                      <FiEye /> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onAccept={handleApproveQuotation}
          onReject={handleRejectQuotation}
          userType="admin"
          token={localStorage.getItem('adminToken')}
        />
      )}
    </div>
  )
}

export default QuotationManagement