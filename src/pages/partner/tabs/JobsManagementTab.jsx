import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiFilter, FiUser, FiFileText, FiDownload, FiPause, FiDollarSign, FiEye, FiPlay } from 'react-icons/fi'
import Invoice from '../../../components/Invoice.jsx'
import CompleteJobModal from '../../../components/CompleteJobModal.jsx'
import PauseJobModal from '../../../components/PauseJobModal.jsx'
import SendQuotationModal from '../../../components/SendQuotationModal.jsx'
import QuotationDetailsModal from '../../../components/QuotationDetailsModal.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const JobsManagementTab = () => {
  const { token } = usePartnerAuth()
  const [bookings, setBookings] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, accepted, completed, rejected
  const [assigningMember, setAssigningMember] = useState(null) // bookingId being assigned
  const [selectedInvoice, setSelectedInvoice] = useState(null) // For invoice modal
  const [completeJobModal, setCompleteJobModal] = useState(null) // Booking for complete job modal
  const [pauseJobModal, setPauseJobModal] = useState(null) // Booking for pause job modal
  const [sendQuotationModal, setSendQuotationModal] = useState(null) // Booking for send quotation modal
  const [selectedQuotation, setSelectedQuotation] = useState(null) // Selected quotation for details
  const [quotations, setQuotations] = useState({}) // Store quotations by bookingId
  const [quotationsLoading, setQuotationsLoading] = useState(false) // Loading state for quotations

  // Helper function to retry failed requests
  const retryWithDelay = async (fn, retries = 2, delay = 1000) => {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0 && (error.message.includes('Network error') || error.message.includes('Failed to fetch'))) {
        console.log(`Retrying request in ${delay}ms... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return retryWithDelay(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchTeamMembers()
  }, [token])

  useEffect(() => {
    // Fetch quotations for all bookings with better error handling
    const fetchQuotationsForBookings = async () => {
      if (bookings.length > 0 && token) {
        setQuotationsLoading(true)
        
        const quotationPromises = bookings.map(async (booking) => {
          try {
            const bookingId = booking._id || booking.bookingId
            if (!bookingId) {
              console.warn('Booking missing ID:', booking)
              return null
            }

            const response = await retryWithDelay(() => 
              partnerApi.getQuotationsByBooking(token, bookingId)
            )
            
            if (response && response.success && response.data) {
              return { bookingId, quotations: response.data }
            }
            return null
          } catch (err) {
            // Log specific booking that failed but don't stop others
            console.error(`Failed to fetch quotations for booking ${booking._id || booking.bookingId} after retries:`, err.message)
            return null
          }
        })

        try {
          const results = await Promise.allSettled(quotationPromises)
          const newQuotations = {}
          
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              const { bookingId, quotations } = result.value
              newQuotations[bookingId] = quotations
            }
          })

          if (Object.keys(newQuotations).length > 0) {
            setQuotations(prev => ({ ...prev, ...newQuotations }))
          }
        } catch (err) {
          console.error('Error processing quotation results:', err)
        } finally {
          setQuotationsLoading(false)
        }
      }
    }

    fetchQuotationsForBookings()
  }, [bookings, token])

  const refreshAll = async () => {
    setLoading(true)
    setQuotationsLoading(true)
    try {
      await fetchBookings()
      await fetchTeamMembers()
      // Quotations will be fetched automatically when bookings update
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data. Please try again.')
    }
  }

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
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
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
      case 'in_progress':
        return <FiClock />
      case 'paused':
        return <FiPause />
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

  const handleCompleteJob = async (bookingId, formData) => {
    try {
      const response = await partnerApi.completeJob(token, bookingId, formData)
      if (response.success) {
        await fetchBookings()
        alert('Job completed successfully!')
      } else {
        throw new Error(response.message || 'Failed to complete job')
      }
    } catch (err) {
      console.error('Failed to complete job:', err)
      throw err
    }
  }

  const handlePauseJob = async (bookingId, pauseData) => {
    try {
      const response = await partnerApi.pauseJob(token, bookingId, pauseData)
      if (response.success) {
        await fetchBookings()
        alert('Job paused successfully!')
      } else {
        throw new Error(response.message || 'Failed to pause job')
      }
    } catch (err) {
      console.error('Failed to pause job:', err)
      throw err
    }
  }

  const handleResumeJob = async (bookingId) => {
    if (!window.confirm('Are you sure you want to continue this job?')) {
      return
    }

    try {
      const response = await partnerApi.resumeJob(token, bookingId)
      if (response.success) {
        await fetchBookings()
        alert('Job continued successfully!')
      } else {
        throw new Error(response.message || 'Failed to resume job')
      }
    } catch (err) {
      console.error('Failed to resume job:', err)
      alert(err.message || 'Failed to resume job')
    }
  }

  const handleCreateQuotation = async (bookingId, quotationData) => {
    try {
      const response = await partnerApi.createQuotation(token, bookingId, quotationData)
      if (response.success) {
        // Refresh quotations for this booking
        const quotesResponse = await partnerApi.getQuotationsByBooking(token, bookingId)
        if (quotesResponse.success && quotesResponse.data) {
          setQuotations(prev => ({
            ...prev,
            [bookingId]: quotesResponse.data
          }))
        }
        await fetchBookings()
        alert('Quotation sent successfully!')
      } else {
        throw new Error(response.message || 'Failed to create quotation')
      }
    } catch (err) {
      console.error('Failed to create quotation:', err)
      throw err
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
    in_progress: bookings.filter((b) => b.status === 'in_progress').length,
    paused: bookings.filter((b) => b.status === 'paused').length,
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
          onClick={refreshAll}
          disabled={loading || quotationsLoading}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`text-lg sm:text-xl text-slate-600 ${(loading || quotationsLoading) ? 'animate-spin' : ''}`} />
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
          {['all', 'pending', 'accepted', 'in_progress', 'paused', 'completed', 'rejected'].map((f) => (
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
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => setSelectedInvoice({ data: booking, type: 'booking' })}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/20 transition inline-flex items-center gap-1 sm:gap-2"
                      >
                        <FiFileText /> <span className="hidden sm:inline">Invoice</span>
                      </button>
                      {/* Continue Job button for paused jobs */}
                      {booking.status === 'paused' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleResumeJob(booking._id || booking.bookingId)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition inline-flex items-center gap-1 sm:gap-2"
                          >
                            <FiPlay /> <span className="hidden sm:inline">Continue Job</span><span className="sm:hidden">Continue</span>
                          </button>
                          {booking.pauseDetails && (
                            <div className="text-xs text-slate-600 mt-1">
                              <p>Resume: {booking.pauseDetails.nextScheduledDate ? new Date(booking.pauseDetails.nextScheduledDate).toLocaleDateString() : 'N/A'} {booking.pauseDetails.nextScheduledTime || ''}</p>
                              {booking.pauseDetails.pauseReason && (
                                <p className="text-slate-500">Reason: {booking.pauseDetails.pauseReason}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Complete, Pause, and Send Quotation buttons for accepted/in_progress jobs */}
                      {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setCompleteJobModal(booking)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition inline-flex items-center gap-1 sm:gap-2"
                          >
                            <FiCheckCircle /> <span className="hidden sm:inline">Complete</span><span className="sm:hidden">Complete</span>
                          </button>
                          <button
                            onClick={() => setPauseJobModal(booking)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-yellow-600 transition inline-flex items-center gap-1 sm:gap-2"
                          >
                            <FiPause /> <span className="hidden sm:inline">Pause</span><span className="sm:hidden">Pause</span>
                          </button>
                          <button
                            onClick={() => setSendQuotationModal(booking)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-600 transition inline-flex items-center gap-1 sm:gap-2"
                          >
                            <FiDollarSign /> <span className="hidden sm:inline">Send Quote</span><span className="sm:hidden">Quote</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {booking.address && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <strong>Address:</strong> {booking.address}
                    </p>
                  </div>
                )}
                {/* Quotations Section */}
                {quotations[booking._id || booking.bookingId] && quotations[booking._id || booking.bookingId].length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-800">
                        <FiDollarSign className="inline mr-1" />
                        Quotations ({quotations[booking._id || booking.bookingId].length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {quotations[booking._id || booking.bookingId].map((quotation) => (
                        <div
                          key={quotation._id}
                          className="bg-white rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition"
                          onClick={() => setSelectedQuotation(quotation)}
                        >
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-800">
                              #{quotation.quotationNumber} - ₹{quotation.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${quotation.customerStatus === 'accepted' ? 'bg-green-100 text-green-800' : quotation.customerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                Customer: {quotation.customerStatus}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${quotation.adminStatus === 'accepted' ? 'bg-green-100 text-green-800' : quotation.adminStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                Admin: {quotation.adminStatus}
                              </span>
                            </div>
                          </div>
                          <FiEye className="w-4 h-4 text-blue-600 ml-2" />
                        </div>
                      ))}
                    </div>
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

      {/* Complete Job Modal */}
      {completeJobModal && (
        <CompleteJobModal
          booking={completeJobModal}
          onClose={() => setCompleteJobModal(null)}
          onComplete={handleCompleteJob}
          token={token}
        />
      )}

      {/* Pause Job Modal */}
      {pauseJobModal && (
        <PauseJobModal
          booking={pauseJobModal}
          onClose={() => setPauseJobModal(null)}
          onPause={handlePauseJob}
          token={token}
        />
      )}

      {/* Send Quotation Modal */}
      {sendQuotationModal && (
        <SendQuotationModal
          booking={sendQuotationModal}
          onClose={() => setSendQuotationModal(null)}
          onCreate={handleCreateQuotation}
          token={token}
        />
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          userType="partner"
          token={token}
        />
      )}
    </div>
  )
}

export default JobsManagementTab

