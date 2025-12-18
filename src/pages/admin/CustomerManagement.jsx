import React, { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiDownload, FiEye, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiCreditCard } from 'react-icons/fi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { adminApi } from '../../services/adminApi.js'

const CustomerManagement = () => {
  const { token } = useAdminAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    if (token) {
      fetchCustomers()
    }
  }, [token])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.fetchCustomers(token, {
        page: 1,
        limit: 1000 // Fetch all customers for now
      })
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Total Spent', 'Joined Date']
    const csvData = filteredCustomers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.totalBookings || 0,
      c.totalSpent || 0,
      new Date(c.createdAt).toLocaleDateString()
    ])
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customers.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all registered customers</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiEye className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Customers</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">New This Month</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {customers.filter(c => {
                  const date = new Date(c.createdAt)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                ₹{customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiCreditCard className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-semibold">
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{customer.phone}</div>
                      {customer.currentAddress && (
                        <div className="text-xs text-slate-500 mt-1">
                          {customer.currentAddress.pincode && `PIN: ${customer.currentAddress.pincode}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{customer.totalBookings || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">₹{(customer.totalSpent || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {customer.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Customer Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {selectedCustomer.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900">{selectedCustomer.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {selectedCustomer.currentAddress && (
                    <div className="flex items-start gap-3">
                      <FiMapPin className="text-slate-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">Current Address</p>
                        <p className="text-sm text-slate-900">{selectedCustomer.currentAddress.address}</p>
                        {selectedCustomer.currentAddress.landmark && (
                          <p className="text-xs text-slate-600 mt-1">Landmark: {selectedCustomer.currentAddress.landmark}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {selectedCustomer.currentAddress.addressType && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {selectedCustomer.currentAddress.addressType}
                            </span>
                          )}
                          {selectedCustomer.currentAddress.pincode && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded">
                              PIN: {selectedCustomer.currentAddress.pincode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500">Total Bookings</p>
                    <p className="text-xl font-bold text-slate-900">{selectedCustomer.totalBookings || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500">Total Spent</p>
                    <p className="text-xl font-bold text-slate-900">₹{(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500">Member Since</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* All Addresses */}
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">All Saved Addresses</h3>
                  <div className="space-y-3">
                    {selectedCustomer.addresses.map((addr, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{addr.address}</p>
                            {addr.landmark && (
                              <p className="text-xs text-slate-600 mt-1">Landmark: {addr.landmark}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {addr.addressType && (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {addr.addressType}
                                </span>
                              )}
                              {addr.pincode && (
                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-800 rounded">
                                  PIN: {addr.pincode}
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedCustomer.selectedAddress === addr._id && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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

export default CustomerManagement
