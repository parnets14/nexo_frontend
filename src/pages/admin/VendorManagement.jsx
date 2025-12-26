import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiUserX, FiUsers, FiSearch, FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const vendorColumns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Phone', accessor: 'phone' },
  { header: 'Company', accessor: 'companyName' },
  { header: 'Spare Parts', accessor: 'sparePartsCount' },
  { header: 'Bookings', accessor: 'bookingsCount' },
  { header: 'Revenue', accessor: 'revenue' },
  { header: 'Status', accessor: 'status' },
  { header: 'Actions', accessor: 'actions' }
]

const VendorManagement = () => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstNumber: '',
    panNumber: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: ''
    }
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVendors()
  }, [token, page, statusFilter, searchTerm])

  const fetchVendors = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.fetchVendors(token, {
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : ''
      })
      
      if (response.success) {
        setVendors(response.vendors || [])
        setTotalPages(response.totalPages || 1)
      } else {
        setError(response.message || 'Failed to fetch vendors')
      }
    } catch (err) {
      console.error('Fetch vendors error:', err)
      setError(err.message || 'Failed to fetch vendors')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVendors()
  }

  const handleStatusChange = async (vendorId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : newStatus === 'suspended' ? 'suspend' : 'deactivate'} this vendor?`)) {
      return
    }

    try {
      await adminApi.updateVendorStatus(token, vendorId, newStatus)
      fetchVendors()
    } catch (err) {
      alert(err.message || 'Failed to update vendor status')
    }
  }

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return
    }

    try {
      await adminApi.deleteVendor(token, vendorId)
      fetchVendors()
    } catch (err) {
      alert(err.message || 'Failed to delete vendor')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await adminApi.createVendor(token, formData)
      setShowCreateModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        companyName: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        gstNumber: '',
        panNumber: '',
        bankDetails: {
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          bankName: ''
        }
      })
      fetchVendors()
    } catch (err) {
      alert(err.message || 'Failed to create vendor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Prepare update data - remove empty password if not changed
      const updateData = { ...formData }
      
      // Only include password if it's been entered (not empty)
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password
        console.log('Password field empty, will not update password')
      } else {
        console.log('Password provided, will update password')
      }
      
      console.log('Updating vendor with data:', { 
        vendorId: selectedVendor._id, 
        fields: Object.keys(updateData),
        hasPassword: !!updateData.password 
      })
      
      const response = await adminApi.updateVendor(token, selectedVendor._id, updateData)
      console.log('Update response:', response)
      
      if (response.success) {
        setShowEditModal(false)
        setSelectedVendor(null)
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          companyName: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          gstNumber: '',
          panNumber: '',
          bankDetails: {
            accountNumber: '',
            ifscCode: '',
            accountHolderName: '',
            bankName: ''
          }
        })
        fetchVendors()
        alert('Vendor updated successfully!')
      }
    } catch (err) {
      console.error('Update vendor error:', err)
      alert(err.message || err.data?.message || 'Failed to update vendor')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      password: '',
      companyName: vendor.companyName || '',
      address: vendor.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      bankDetails: vendor.bankDetails || {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
      }
    })
    setShowEditModal(true)
  }

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
    inactive: vendors.filter(v => v.status === 'inactive').length
  }

  const formattedVendors = vendors.map(vendor => ({
    id: vendor._id,
    name: vendor.name || 'N/A',
    email: vendor.email || 'N/A',
    phone: vendor.phone || 'N/A',
    companyName: vendor.companyName || 'N/A',
    sparePartsCount: vendor.stats?.sparePartsCount || 0,
    bookingsCount: vendor.stats?.bookingsCount || 0,
    revenue: `₹${(vendor.stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
    status: vendor.status || 'active',
    actions: vendor
  }))

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Vendor Management"
        description="Create, manage, and monitor vendor accounts"
        icon={FiUsers}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Vendors"
          value={stats.total}
          icon={FiUsers}
          color="blue"
        />
        <StatCard
          title="Active Vendors"
          value={stats.active}
          icon={FiCheckCircle}
          color="green"
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          icon={FiUserX}
          color="red"
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          icon={FiUserX}
          color="gray"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <form onSubmit={handleSearch} className="flex-1 w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, company..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <FiPlus /> Create Vendor
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500">Loading vendors...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-rose-500">{error}</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={vendorColumns}
              data={formattedVendors.map(vendor => ({
                ...vendor,
                status: (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      vendor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : vendor.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {vendor.status}
                  </span>
                ),
                actions: (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => openEditModal(vendor.actions)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    {vendor.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(vendor.id, 'suspended')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Suspend"
                      >
                        <FiUserX />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(vendor.id, 'active')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Activate"
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )
              }))}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft /> Previous
              </button>
              <span className="text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Create New Vendor</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.address.street || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address.state || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={formData.address.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country || 'India'}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankDetails.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountHolderName || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankDetails.accountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankDetails.ifscCode || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Vendor'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Edit Vendor</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedVendor(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.address?.street || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={formData.address?.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address?.country || 'India'}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankDetails?.bankName || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankDetails?.accountHolderName || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankDetails?.ifscCode || ''}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Vendor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedVendor(null)
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorManagement

