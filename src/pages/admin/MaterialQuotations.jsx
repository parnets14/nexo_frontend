import React, { useState, useEffect } from 'react'
import { FiPackage, FiUser, FiPhone, FiMapPin, FiTool, FiClock, FiCheckCircle, FiTruck, FiEye, FiRefreshCw } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const MaterialQuotations = () => {
  const { token } = useAdminAuth()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [approvalData, setApprovalData] = useState({
    approvedAmount: '',
    deliveryDate: '',
    notes: ''
  })
  const [deliveryData, setDeliveryData] = useState({
    deliveryNotes: '',
    deliveredBy: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch material quotations
  const { data: quotationsData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.getMaterialQuotations(token),
    []
  )

  const quotations = quotationsData?.data || []

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleApprove = (request) => {
    setSelectedRequest(request)
    setApprovalData({
      approvedAmount: request.totalAmount || '',
      deliveryDate: '',
      notes: ''
    })
    setShowApprovalModal(true)
  }

  const handleMarkDelivered = (request) => {
    setSelectedRequest(request)
    setDeliveryData({
      deliveryNotes: '',
      deliveredBy: ''
    })
    setShowDeliveryModal(true)
  }

  const submitApproval = async () => {
    if (!selectedRequest || !approvalData.approvedAmount || !approvalData.deliveryDate) {
      setErrorMsg('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.approveMaterialQuotation(token, selectedRequest.requestId, approvalData)
      setSuccessMsg('Material quotation approved successfully!')
      setShowApprovalModal(false)
      refresh()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setErrorMsg(error.message || 'Failed to approve quotation')
      setTimeout(() => setErrorMsg(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const submitDelivery = async () => {
    if (!selectedRequest || !deliveryData.deliveredBy) {
      setErrorMsg('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.markMaterialsDelivered(token, selectedRequest.requestId, deliveryData)
      setSuccessMsg('Materials marked as delivered successfully!')
      setShowDeliveryModal(false)
      refresh()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setErrorMsg(error.message || 'Failed to mark as delivered')
      setTimeout(() => setErrorMsg(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const getUrgencyBadge = (urgency) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    const icons = {
      emergency: '🚨',
      urgent: '⚡',
      normal: '📋'
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colors[urgency] || colors.normal}`}>
        {icons[urgency] || icons.normal} {urgency?.toUpperCase() || 'NORMAL'}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.pending}`}>
        {status?.toUpperCase() || 'PENDING'}
      </span>
    )
  }

  const columns = [
    {
      header: 'Request ID',
      accessor: 'requestId',
      render: (value) => (
        <span className="font-mono text-sm text-primary">{value}</span>
      )
    },
    {
      header: 'Customer Details',
      accessor: 'customerName',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600">{row.customerPhone}</div>
        </div>
      )
    },
    {
      header: 'Technician',
      accessor: 'technicianName',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600">{row.technicianPhone}</div>
        </div>
      )
    },
    {
      header: 'Service Type',
      accessor: 'serviceType',
      render: (value) => (
        <span className="capitalize text-sm">{value}</span>
      )
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (value) => (
        <span className="font-semibold text-green-600">
          {value ? `₹${value.toLocaleString('en-IN')}` : 'TBD'}
        </span>
      )
    },
    {
      header: 'Urgency',
      accessor: 'urgency',
      render: (value) => getUrgencyBadge(value)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => getStatusBadge(value)
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString('en-IN')
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleApprove(row)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Approve"
            >
              <FiCheckCircle className="w-4 h-4" />
            </button>
          )}
          {row.status === 'approved' && (
            <button
              onClick={() => handleMarkDelivered(row)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
              title="Mark as Delivered"
            >
              <FiTruck className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <ModuleHeader
        title="Material Quotations"
        subtitle="Manage material quotation requests from partners and technicians"
        actions={
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{quotations.length}</p>
            </div>
            <FiPackage className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {quotations.filter(q => q.status === 'pending').length}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {quotations.filter(q => q.status === 'approved').length}
              </p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-blue-600">
                {quotations.filter(q => q.status === 'delivered').length}
              </p>
            </div>
            <FiTruck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Material Quotations Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <DataTable
          columns={columns}
          data={quotations}
          loading={isLoading}
          error={error}
          emptyLabel="No material quotation requests found."
        />
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Material Quotation Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Request Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Request ID:</span>
                    <span className="ml-2 font-mono">{selectedRequest.requestId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedRequest.status)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Urgency:</span>
                    <span className="ml-2">{getUrgencyBadge(selectedRequest.urgency)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service Type:</span>
                    <span className="ml-2 capitalize">{selectedRequest.serviceType}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="text-blue-500" />
                  Customer Details
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedRequest.customerName}</div>
                  <div><span className="font-medium">Phone:</span> {selectedRequest.customerPhone}</div>
                </div>
              </div>

              {/* Technician Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiTool className="text-green-500" />
                  Technician Details
                </h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedRequest.technicianName}</div>
                  <div><span className="font-medium">Phone:</span> {selectedRequest.technicianPhone}</div>
                </div>
              </div>

              {/* Amount */}
              {selectedRequest.totalAmount && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Estimated Amount</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedRequest.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Approve Material Quotation</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Amount *
                </label>
                <input
                  type="number"
                  value={approvalData.approvedAmount}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Enter approved amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  value={approvalData.deliveryDate}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Mark as Delivered</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivered By *
                </label>
                <input
                  type="text"
                  value={deliveryData.deliveredBy}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, deliveredBy: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Enter delivery person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryData.deliveryNotes}
                  onChange={(e) => setDeliveryData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Any delivery notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDelivery}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Marking...' : 'Mark as Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaterialQuotations