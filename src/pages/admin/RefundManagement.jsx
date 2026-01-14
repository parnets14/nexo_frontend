import React, { useState, useEffect } from 'react'
import { FiDollarSign, FiRefreshCw, FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

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
      // Mock data - replace with actual API call
      const mockRefunds = [
        {
          id: 1,
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          customerName: 'John Doe',
          amount: 1500,
          reason: 'Product damaged',
          status: 'pending',
          requestDate: '2024-01-10',
          processedDate: null
        },
        {
          id: 2,
          orderId: 'ORD-002',
          customerId: 'CUST-002',
          customerName: 'Jane Smith',
          amount: 750,
          reason: 'Wrong item delivered',
          status: 'approved',
          requestDate: '2024-01-09',
          processedDate: '2024-01-10'
        }
      ]
      
      setRefunds(mockRefunds)
      setFilteredRefunds(mockRefunds)
      
      // Calculate stats
      const totalAmount = mockRefunds.reduce((sum, refund) => sum + refund.amount, 0)
      setStats({
        total: mockRefunds.length,
        pending: mockRefunds.filter(r => r.status === 'pending').length,
        approved: mockRefunds.filter(r => r.status === 'approved').length,
        rejected: mockRefunds.filter(r => r.status === 'rejected').length,
        totalAmount
      })
    } catch (error) {
      console.error('Error loading refunds:', error)
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
        refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(refund => refund.status === statusFilter)
    }

    setFilteredRefunds(filtered)
  }, [refunds, searchTerm, statusFilter])

  // Handle refund action
  const handleRefundAction = async (refundId, action) => {
    try {
      // Mock API call - replace with actual implementation
      console.log(`${action} refund ${refundId}`)
      
      // Update local state
      setRefunds(prev => prev.map(refund =>
        refund.id === refundId
          ? { ...refund, status: action, processedDate: new Date().toISOString().split('T')[0] }
          : refund
      ))
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  // Table columns
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'orderId', label: 'Order ID', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (value) => `₹${value.toLocaleString()}` },
    { key: 'reason', label: 'Reason', sortable: false },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      format: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { key: 'requestDate', label: 'Request Date', sortable: true },
    { key: 'processedDate', label: 'Processed Date', sortable: true }
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
            onClick={() => handleRefundAction(refund.id, 'rejected')}
            className="p-1 text-red-600 hover:text-red-800"
            title="Reject"
          >
            <FiX />
          </button>
        </>
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
          title="Total Refunds"
          value={stats.total}
          icon={<FiDollarSign />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FiClock />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<FiCheck />}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<FiX />}
          color="red"
        />
        <StatCard
          title="Total Amount"
          value={`₹${stats.totalAmount.toLocaleString()}`}
          icon={<FiDollarSign />}
          color="purple"
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
                placeholder="Search by order ID or customer name..."
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
              <option value="rejected">Rejected</option>
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
                  <label className="block text-sm font-medium text-gray-700">Refund ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.orderId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">₹{selectedRefund.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRefund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedRefund.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedRefund.status.charAt(0).toUpperCase() + selectedRefund.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRefund.requestDate}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      handleRefundAction(selectedRefund.id, 'approved')
                      setShowDetails(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Refund
                  </button>
                  <button
                    onClick={() => {
                      handleRefundAction(selectedRefund.id, 'rejected')
                      setShowDetails(false)
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Refund
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