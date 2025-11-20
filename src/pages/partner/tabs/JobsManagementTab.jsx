import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiFilter, FiUser, FiUserPlus, FiFileText, FiDownload } from 'react-icons/fi'
import Invoice from '../../../components/Invoice.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const JobsManagementTab = () => {
  const { token, partner } = usePartnerAuth()
  const [bookings, setBookings] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, accepted, completed, rejected
  const [assigningMember, setAssigningMember] = useState(null) // bookingId being assigned
  const [selectedInvoice, setSelectedInvoice] = useState(null) // For invoice modal

  useEffect(() => {
    fetchBookings()
    fetchTeamMembers()
  }, [token])

  const fetchTeamMembers = async () => {
    if (!token) return
    try {
      const response = await partnerApi.getTeamMembers(token)
      const members = response?.data || response || []
      setTeamMembers(Array.isArray(members) ? members : [])
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    }
  }

  const fetchBookings = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const response = await partnerApi.getBookings(token)
      // Handle different response structures (including team member bookings)
      let bookingsList = []
      if (response?.bookings) {
        // If bookings are organized by status (from allpartnerBookings endpoint)
        Object.values(response.bookings).forEach(statusBookings => {
          if (Array.isArray(statusBookings)) {
            bookingsList = bookingsList.concat(statusBookings)
          }
        })
      } else if (Array.isArray(response)) {
        bookingsList = response
      } else if (Array.isArray(response?.data)) {
        bookingsList = response.data
      } else if (Array.isArray(response?.bookings)) {
        bookingsList = response.bookings
      } else if (response?.data && Array.isArray(response.data)) {
        bookingsList = response.data
      }
      setBookings(bookingsList)
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle />
      case 'accepted':
        return <FiClock />
      case 'rejected':
        return <FiXCircle />
      default:
        return <FiBriefcase />
    }
  }

  const handleAssignTeamMember = async (bookingId, teamMemberId) => {
    if (!token || !teamMemberId) return

    setAssigningMember(bookingId)
    try {
      const response = await partnerApi.assignBookingToTeamMember(token, bookingId, teamMemberId)
      if (response.success) {
        // Refresh bookings to show updated assignment
        await fetchBookings()
        alert('Team member assigned successfully!')
      } else {
        alert(response.message || 'Failed to assign team member')
      }
    } catch (err) {
      console.error('Failed to assign team member:', err)
      alert(err.message || 'Failed to assign team member')
    } finally {
      setAssigningMember(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Jobs Management</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage all your service bookings and jobs</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg sm:text-xl text-slate-600" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <FiFilter className="text-slate-600 hidden sm:block" />
          {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => (
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
          <button
            onClick={() => {
              const exportData = filteredBookings.map(b => ({
                'Booking ID': b._id?.toString().slice(-8) || 'N/A',
                'Customer Name': b.user?.name || 'N/A',
                'Customer Phone': b.user?.phone || 'N/A',
                'Service': b.subService?.name || 'N/A',
                'Amount (₹)': b.amount || 0,
                'Status': b.status || 'N/A',
                'Scheduled Date': b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'N/A',
                'Scheduled Time': b.scheduledTime || 'N/A',
                'Location': b.location?.address || 'N/A',
                'Team Member': b.teamMember?.name || 'Not Assigned',
                'Created At': b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'N/A'
              }))
              exportToExcel(exportData, [
                { header: 'Booking ID', accessor: 'Booking ID' },
                { header: 'Customer Name', accessor: 'Customer Name' },
                { header: 'Customer Phone', accessor: 'Customer Phone' },
                { header: 'Service', accessor: 'Service' },
                { header: 'Amount (₹)', accessor: 'Amount (₹)' },
                { header: 'Status', accessor: 'Status' },
                { header: 'Scheduled Date', accessor: 'Scheduled Date' },
                { header: 'Scheduled Time', accessor: 'Scheduled Time' },
                { header: 'Location', accessor: 'Location' },
                { header: 'Team Member', accessor: 'Team Member' },
                { header: 'Created At', accessor: 'Created At' }
              ], 'Jobs_Management', 'Jobs', {
                columnWidths: [15, 20, 15, 25, 15, 12, 15, 12, 30, 20, 20]
              })
            }}
            disabled={filteredBookings.length === 0}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
            title="Export to Excel"
          >
            <FiDownload /> <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiBriefcase className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredBookings.map((booking, index) => (
              <div key={index} className="p-4 sm:p-6 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                        {booking.service?.name || booking.serviceName || 'Service Booking'}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      Booking ID: {booking.bookingId || booking._id || 'N/A'}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {booking.user && (
                        <p className="text-sm text-slate-600">
                          Customer: {booking.user?.name || booking.userName || 'N/A'}
                        </p>
                      )}
                      {booking.teamMember && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1">
                          <FiUser className="text-xs" />
                          Team: {booking.teamMember?.name || 'Team Member'}
                        </span>
                      )}
                    </div>
                    {/* Assign Team Member Section */}
                    {!booking.teamMember && (booking.status === 'accepted' || booking.status === 'in_progress') && teamMembers.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignTeamMember(booking._id || booking.bookingId, e.target.value)
                              e.target.value = '' // Reset selection
                            }
                          }}
                          disabled={assigningMember === (booking._id || booking.bookingId)}
                          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                          <option value="">Assign to Team Member...</option>
                          {teamMembers
                            .filter(m => m.status === 'active')
                            .map((member) => (
                              <option key={member._id || member.id} value={member._id || member.id}>
                                {member.name} ({member.role || 'technician'})
                              </option>
                            ))}
                        </select>
                        {assigningMember === (booking._id || booking.bookingId) && (
                          <span className="text-xs text-slate-500">Assigning...</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-lg sm:text-xl font-bold text-primary">
                      ₹{booking.totalAmount?.toLocaleString('en-IN') || booking.amount?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                    <button
                      onClick={() => setSelectedInvoice({ data: booking, type: 'booking' })}
                      className="mt-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/20 transition inline-flex items-center gap-1 sm:gap-2"
                    >
                      <FiFileText /> <span className="hidden sm:inline">Invoice</span>
                    </button>
                  </div>
                </div>
                {booking.address && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <strong>Address:</strong> {booking.address}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
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

export default JobsManagementTab

