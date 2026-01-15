import React, { useState, useEffect } from 'react'
import { FiDollarSign, FiRefreshCw, FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import toast from 'react-hot-toast'

const RefundManagement = () => {
  const { user } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [refunds, setRefunds] = useState([])
  const [filteredRefunds, setFilteredRefunds] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  })

  // Load refunds data
  const loadRefunds = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        const refundsData = result.data.refunds.map(refund => ({
          id: refund._id,
          refundNumber: refund.refundNumber,
          orderId: refund.booking?._id || 'N/A',
          customerId: refund.user?._id || 'N/A',
          customerName: refund.customerDetails?.name || refund.user?.name || 'Unknown',
          customerEmail: refund.customerDetails?.email || refund.user?.email || '',
          customerPhone: refund.customerDetails?.phone || refund.user?.phone || '',
          amount: refund.finalRefundAmount,
          originalAmount: refund.originalAmount,
          visitingCharge: refund.visitingCharge,
          reason: refund.cancellationReason,
          status: refund.status,
          requestDate: new Date(refund.createdAt).toLocaleDateString(),
          processedDate: refund.refundedAt ? new Date(refund.refundedAt).toLocaleDateString() : null,
          serviceName: refund.serviceDetails?.serviceName || 'N/A',
          slaStatus: refund.slaStatus,
          rejectionReason: refund.rejectionReason,
          transactionId: refund.transactionId,
          paymentMode: refund.paymentMode
        }))
        
        setRefunds(refundsData)
        setFilteredRefunds(refundsData)
        
        // Calculate stats from backend data
        const totalAmount = refundsData.reduce((sum, refund) => sum + refund.amount, 0)
        setStats({
          total: refundsData.length,
          pending: refundsData.filter(r => r.status === 'pending').length,
          approved: refundsData.filter(r => r.status === 'approved').length,
          rejected: refundsData.filter(r => r.status === 'rejected').length,
          totalAmount
        })
        
        toast.success('Refunds loaded successfully')
      } else {
        toast.error(result.message || 'Failed to load refunds')
      }
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast.error('Error loading refunds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRefunds()
  }, [])

  // Filter refunds
  useEffect(() => {
    let filtered = refunds

    if (searchTerm) {
      filtered = filtered.filter(refund =>
        refund.refundNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(refund => refund.status === statusFilter)
    }

    setFilteredRefunds(filtered)
  }, [refunds, searchTerm, statusFilter])

  // Handle refund action
  const handleRefundAction = async (refundId, action, rejectionReason = null) => {
    try {
      const token = localStorage.getItem('adminToken')
      let endpoint = ''
      let body = {}
      
      if (action === 'approved') {
        endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refundId}/approve`
        body = { paymentMode: 'original_payment_method' }
      } else if (action === 'rejected') {
        if (!rejectionReason) {
          toast.error('Rejection reason is required')
          return
        }
        endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refundId}/reject`
        body = { rejectionReason }
      } else if (action === 'completed') {
        endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refundId}/process`
        body = { refundToWallet: true }
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Refund ${action} successfully`)
        loadRefunds() // Reload data
      } else {
        toast.error(result.message || `Failed to ${action} refund`)
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Error processing refund')
    }
  }

  // Table columns
  const columns = [
    { key: 'refundNumber', label: 'Refund #', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'serviceName', label: 'Service', sortable: false },
    { key: 'originalAmount', label: 'Original', sortable: true, format: (value) => `₹${value?.toLocaleString() || 0}` },
    { key: 'visitingCharge', label: 'Non-Refundable', sortable: true, format: (value) => `₹${value?.toLocaleString() || 0}` },
    { key: 'amount', label: 'Refund Amount', sortable: true, format: (value) => `₹${value?.toLocaleString() || 0}` },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      format: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'approved' ? 'bg-blue-100 text-blue-800' :
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { key: 'requestDate', label: 'Request Date', sortable: true }
  ]

  // Action buttons
  const actionButtons = (refund) => (
    <div className="flex space-x-2">
      <button
        onClick={() => {
          setSelectedRefund(refund)
          setShowDetails(true)
        }}
        className="p-1 text-blue-600 hover:text-blue-800"
        title="View Details"
      >
        <FiEye />
      </button>
      {refund.status === 'pending' && (
        <>
          <button
            onClick={() => handleRefundAction(refund.id, 'approved')}
            className="p-1 text-green-600 hover:text-green-800"
            title="Approve"
          >
            <FiCheck />
          </button>
          <button
            onClick={() => {
              const reason = prompt('Enter rejection reason:')
              if (reason) {
                handleRefundAction(refund.id, 'rejected', reason)
              }
            }}
            className="p-1 text-red-600 hover:text-red-800"
            title="Reject"
          >
            <FiX />
          </button>
        </>
      )}
      {refund.status === 'approved' && (
        <button
          onClick={() => handleRefundAction(refund.id, 'completed')}
          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          title="Process Refund"
        >
          Process
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Refund Management"
        description="Manage customer refund requests and approvals"
        icon={<FiDollarSign />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Refunds"
          value={stats.total}
          icon={FiDollarSign}
          color="bg-blue-500"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={FiClock}
          color="bg-yellow-500"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={FiCheck}
          color="bg-green-500"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={FiX}
          color="bg-red-500"
        />
        <StatCard
          label="Total Amount"
          value={`₹${stats.totalAmount.toLocaleString()}`}
          icon={FiDollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by refund #, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={loadRefunds}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredRefunds}
          columns={columns}
          actionButtons={actionButtons}
          loading={loading}
          emptyMessage="No refund requests found"
        />
      </div>

      {/* Refund Details Modal */}
      {showDetails && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Refund Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refund Number</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedRefund.refundNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedRefund.orderId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.customerEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.customerPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.serviceName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Original Amount</label>
                  <p className="mt-1 text-sm text-gray-900">₹{selectedRefund.originalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visiting Charge (Non-Refundable)</label>
                  <p className="mt-1 text-sm text-red-600 font-semibold">-₹{selectedRefund.visitingCharge?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Final Refund Amount</label>
                  <p className="mt-1 text-lg text-green-600 font-bold">₹{selectedRefund.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRefund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedRefund.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      selectedRefund.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedRefund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRefund.status.charAt(0).toUpperCase() + selectedRefund.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.requestDate}</p>
                </div>
                {selectedRefund.processedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processed Date</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRefund.processedDate}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Cancellation Reason</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-red-700">Rejection Reason</label>
                  <p className="mt-1 text-sm text-red-900 bg-red-50 p-3 rounded border border-red-200">{selectedRefund.rejectionReason}</p>
                </div>
              )}

              {selectedRefund.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono bg-green-50 p-3 rounded">{selectedRefund.transactionId}</p>
                </div>
              )}

              {selectedRefund.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleRefundAction(selectedRefund.id, 'approved')
                      setShowDetails(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <FiCheck /> Approve Refund
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) {
                        handleRefundAction(selectedRefund.id, 'rejected', reason)
                        setShowDetails(false)
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FiX /> Reject Refund
                  </button>
                </div>
              )}

              {selectedRefund.status === 'approved' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleRefundAction(selectedRefund.id, 'completed')
                      setShowDetails(false)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiDollarSign /> Process Refund to Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RefundManagement