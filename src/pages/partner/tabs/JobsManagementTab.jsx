import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiFilter, FiUser, FiFileText, FiDownload, FiPause, FiDollarSign, FiEye, FiPlay, FiTrash2, FiX, FiStar, FiAlertTriangle } from 'react-icons/fi'
import Invoice from '../../../components/Invoice.jsx'
import CompleteJobModal from '../../../components/CompleteJobModal.jsx'
import PauseJobModal from '../../../components/PauseJobModal.jsx'
import SendQuotationModal from '../../../components/SendQuotationModal.jsx'
import QuotationDetailsModal from '../../../components/QuotationDetailsModal.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'
import '../../../styles/media-modal.css'

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
  const [selectedBookingMedia, setSelectedBookingMedia] = useState(null) // For media modal
  const [showMediaModal, setShowMediaModal] = useState(false)

  // Helper function to calculate partner's visible amount
  // Partners should only see:
  // - If service booked: Base service price only (hide visiting charge, GST, discounts)
  // - If only visiting charge: Visiting charge only
  const calculatePartnerVisibleAmount = (booking) => {
    // Check if service is booked
    const hasService = (booking.baseServiceAmount && booking.baseServiceAmount > 0) || 
                      (booking.cartTotal && booking.cartTotal > 0) || 
                      (booking.selectedAddOns && booking.selectedAddOns.length > 0) ||
                      (booking.selectedSubServices && booking.selectedSubServices.length > 0) ||
                      (booking.amount && booking.amount > 0 && booking.paymentOption !== 'visiting')
    
    if (!hasService && booking.visitingCharge && booking.visitingCharge > 0) {
      // Case 2: Only visiting charge paid, no service booked
      return {
        visibleAmount: booking.visitingCharge,
        isOnlyVisitingCharge: true,
        description: 'Visiting Charge Only'
      }
    } else {
      // Case 1: Service is booked - show only service price (hide visiting charge, GST, discounts)
      const serviceAmount = (booking.baseServiceAmount || 0) + 
                           (booking.addOnsAmount || 0) + 
                           (booking.subServicesAmount || 0) ||
                           (booking.cartTotal || 0) ||
                           (booking.amount || 0)
      
      return {
        visibleAmount: serviceAmount,
        isOnlyVisitingCharge: false,
        description: 'Service Amount'
      }
    }
  }

  // Calculate partner earnings (85% of visible amount, 15% platform commission)
  const calculatePartnerEarnings = (visibleAmount) => {
    const commissionRate = 15
    const commissionAmount = (visibleAmount * commissionRate) / 100
    const partnerEarning = visibleAmount - commissionAmount
    
    return {
      visibleAmount,
      commissionRate,
      commissionAmount,
      partnerEarning
    }
  }

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
    if (filter === 'emergency') return booking.isEmergency
    return booking.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'work_completed':
        return 'bg-orange-100 text-orange-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
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
      case 'work_completed':
        return <FiDollarSign />
      case 'confirmed':
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
        alert('Work marked as completed successfully!')
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

  const handleAcceptJob = async (bookingId) => {
    if (!window.confirm('Are you sure you want to accept this job?')) {
      return
    }

    try {
      const response = await partnerApi.acceptJob(token, bookingId)
      if (response.success) {
        await fetchBookings()
        alert('Job accepted successfully! You can now start working on it.')
      } else {
        throw new Error(response.message || 'Failed to accept job')
      }
    } catch (err) {
      console.error('Failed to accept job:', err)
      alert(err.message || 'Failed to accept job')
    }
  }

  const handleDeleteQuotation = async (quotationId, bookingId) => {
    if (!window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      return
    }

    try {
      const response = await partnerApi.deleteQuotation(token, quotationId)
      if (response.success) {
        // Refresh quotations for this booking
        const quotesResponse = await partnerApi.getQuotationsByBooking(token, bookingId)
        if (quotesResponse.success && quotesResponse.data) {
          setQuotations(prev => ({
            ...prev,
            [bookingId]: quotesResponse.data
          }))
        }
        alert('Quotation deleted successfully!')
      } else {
        throw new Error(response.message || 'Failed to delete quotation')
      }
    } catch (err) {
      console.error('Failed to delete quotation:', err)
      
      let errorMessage = 'Failed to delete quotation'
      
      if (err.message.includes('Cannot delete quotation')) {
        errorMessage = 'Cannot delete quotation that has been accepted or rejected.'
      } else if (err.message.includes('not authorized')) {
        errorMessage = 'You are not authorized to delete this quotation.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      alert(errorMessage)
    }
  }

  const handleCreateQuotation = async (bookingId, quotationData) => {
    try {
      console.log('Creating quotation with data:', quotationData)
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
        
        // Return the response so the modal can access spare parts info
        return response
      } else {
        throw new Error(response.message || 'Failed to create quotation')
      }
    } catch (err) {
      console.error('Failed to create quotation:', err)
      
      // Show more specific error messages
      let errorMessage = 'Failed to create quotation'
      
      if (err.message.includes('Validation error')) {
        errorMessage = 'Please check all fields are filled correctly. Ensure all items have valid names, quantities, and prices.'
      } else if (err.message.includes('Invalid booking')) {
        errorMessage = 'Invalid booking. Please refresh and try again.'
      } else if (err.message.includes('authorization')) {
        errorMessage = 'You are not authorized to create quotation for this booking.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      alert(errorMessage)
      throw err // Re-throw so the modal can handle it
    }
  }

  const handleApproveQuotation = async (quotationId) => {
    try {
      console.log('[JobsManagement] Approving quotation:', quotationId)
      const response = await partnerApi.approveQuotation(token, quotationId)
      console.log('[JobsManagement] Approve response:', response)
      if (response.success) {
        // Find the booking ID for this quotation to refresh
        const bookingId = Object.keys(quotations).find(bId => 
          quotations[bId].some(q => q._id === quotationId)
        )
        
        console.log('[JobsManagement] Found booking ID:', bookingId)
        
        if (bookingId) {
          // Refresh quotations for this booking
          const quotesResponse = await partnerApi.getQuotationsByBooking(token, bookingId)
          if (quotesResponse.success && quotesResponse.data) {
            setQuotations(prev => ({
              ...prev,
              [bookingId]: quotesResponse.data
            }))
          }
        }
        
        alert('Quotation approved successfully!')
      } else {
        throw new Error(response.message || 'Failed to approve quotation')
      }
    } catch (err) {
      console.error('Failed to approve quotation:', err)
      throw new Error(err.message || 'Failed to approve quotation')
    }
  }

  const handleRejectQuotation = async (quotationId, rejectionReason) => {
    try {
      console.log('[JobsManagement] Rejecting quotation:', quotationId, 'reason:', rejectionReason)
      const response = await partnerApi.rejectQuotation(token, quotationId, rejectionReason)
      console.log('[JobsManagement] Reject response:', response)
      if (response.success) {
        // Find the booking ID for this quotation to refresh
        const bookingId = Object.keys(quotations).find(bId => 
          quotations[bId].some(q => q._id === quotationId)
        )
        
        if (bookingId) {
          // Refresh quotations for this booking
          const quotesResponse = await partnerApi.getQuotationsByBooking(token, bookingId)
          if (quotesResponse.success && quotesResponse.data) {
            setQuotations(prev => ({
              ...prev,
              [bookingId]: quotesResponse.data
            }))
          }
        }
        
        alert('Quotation rejected successfully.')
      } else {
        throw new Error(response.message || 'Failed to reject quotation')
      }
    } catch (err) {
      console.error('Failed to reject quotation:', err)
      throw new Error(err.message || 'Failed to reject quotation')
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
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    in_progress: bookings.filter((b) => b.status === 'in_progress').length,
    work_completed: bookings.filter((b) => b.status === 'work_completed').length,
    paused: bookings.filter((b) => b.status === 'paused').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    emergency: bookings.filter((b) => b.isEmergency).length
  }

  // Calculate review statistics
  const reviewedBookings = bookings.filter(b => b.review && b.review.rating);
  const totalRating = reviewedBookings.reduce((sum, b) => sum + (b.review.rating || 0), 0);
  const averageRating = reviewedBookings.length > 0 ? (totalRating / reviewedBookings.length).toFixed(1) : 0;

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4">
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
          <p className="text-sm text-slate-600 mb-1">Work Done</p>
          <p className="text-2xl font-bold text-orange-600">{stats.work_completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <div className="flex items-center gap-1 mb-1">
            <FiStar className="text-yellow-500 w-4 h-4" />
            <p className="text-sm text-slate-600">Avg Rating</p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
            <span className="text-sm text-slate-500">({reviewedBookings.length})</span>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-4 border border-red-200">
          <div className="flex items-center gap-1 mb-1">
            <FiAlertTriangle className="text-red-500 w-4 h-4" />
            <p className="text-sm text-red-600">Emergency</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.emergency}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <FiFilter className="text-slate-600 hidden sm:block" />
          {['all', 'emergency', 'pending', 'confirmed', 'accepted', 'in_progress', 'work_completed', 'paused', 'completed', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1 ${
                filter === f
                  ? 'bg-primary text-white'
                  : f === 'emergency' 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'emergency' && <FiAlertTriangle className="w-3 h-3" />}
              {f === 'work_completed' ? 'Work Done' : f === 'emergency' ? 'Emergency' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          </div>
          <button
            onClick={() => {
              const exportData = filteredBookings.map(b => ({
                'Booking ID': b._id?.toString().slice(-8) || 'N/A',
                'Customer Name': b.user?.name || 'N/A',
                'Customer Phone': b.user?.phone || 'N/A',
                'Service': b.service?.name || b.subService?.name || b.popularService?.name || b.serviceName || 'N/A',
                'Status': b.status || 'N/A',
                'Scheduled Date': b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'N/A',
                'Scheduled Time': b.scheduledTime || 'N/A',
                'Location': b.location?.address || 'N/A',
                'Team Member': b.teamMember?.name || 'Not Assigned',
                'Work Completed': b.workCompletedAt ? new Date(b.workCompletedAt).toLocaleString('en-IN') : 'N/A',
                'Fully Completed': b.completedAt ? new Date(b.completedAt).toLocaleString('en-IN') : 'N/A',
                'Customer Rating': b.review?.rating || 'No Rating',
                'Review Comment': b.review?.comment || 'No Review',
                'Review Date': b.review?.createdAt ? new Date(b.review.createdAt).toLocaleDateString('en-IN') : 'N/A',
                'Photos Count': b.photos ? b.photos.length : 0,
                'Videos Count': b.videos ? b.videos.length : 0,
                'Created At': b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : 'N/A'
              }))
              exportToExcel(exportData, [
                { header: 'Booking ID', accessor: 'Booking ID' },
                { header: 'Customer Name', accessor: 'Customer Name' },
                { header: 'Customer Phone', accessor: 'Customer Phone' },
                { header: 'Service', accessor: 'Service' },
                { header: 'Status', accessor: 'Status' },
                { header: 'Scheduled Date', accessor: 'Scheduled Date' },
                { header: 'Scheduled Time', accessor: 'Scheduled Time' },
                { header: 'Location', accessor: 'Location' },
                { header: 'Team Member', accessor: 'Team Member' },
                { header: 'Work Completed', accessor: 'Work Completed' },
                { header: 'Fully Completed', accessor: 'Fully Completed' },
                { header: 'Customer Rating', accessor: 'Customer Rating' },
                { header: 'Review Comment', accessor: 'Review Comment' },
                { header: 'Review Date', accessor: 'Review Date' },
                { header: 'Photos Count', accessor: 'Photos Count' },
                { header: 'Videos Count', accessor: 'Videos Count' },
                { header: 'Created At', accessor: 'Created At' }
              ], 'Jobs_Management', 'Jobs', {
                columnWidths: [15, 20, 15, 25, 12, 15, 12, 30, 20, 20, 20, 12, 30, 15, 10, 10, 20]
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
            {filteredBookings.map((booking, index) => {
              const isEmergency = booking.isEmergency || false;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 sm:p-6 hover:bg-slate-50 transition ${
                    isEmergency ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                  }`}
                >
                  {/* Emergency Badge */}
                  {isEmergency && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold border border-red-200">
                        <FiAlertTriangle className="w-4 h-4" />
                        🚨 EMERGENCY SERVICE
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                        {booking.service?.name || booking.subService?.name || booking.popularService?.name || booking.serviceName || 'Service Booking'}
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
                    
                    {/* Customer Details Section - Always Visible */}
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-blue-700 font-semibold mb-1">Name</p>
                          <p className="text-sm text-slate-800 font-medium">
                            {booking.user?.name || booking.customerDetails?.name || booking.userName || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700 font-semibold mb-1">Phone</p>
                          <p className="text-sm text-slate-800 font-medium">
                            {booking.user?.phone || booking.customerDetails?.phone || 'N/A'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-blue-700 font-semibold mb-1">Address</p>
                          <p className="text-sm text-slate-800">
                            {booking.location?.address || booking.address || 'N/A'}
                            {booking.location?.landmark && ` (Landmark: ${booking.location.landmark})`}
                            {booking.location?.pincode && ` - ${booking.location.pincode}`}
                          </p>
                        </div>
                        {booking.user?.email && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-blue-700 font-semibold mb-1">Email</p>
                            <p className="text-sm text-slate-800">{booking.user.email}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Service Details */}
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <h5 className="text-xs font-bold text-blue-900 mb-2">Service Booked</h5>
                        <p className="text-sm text-slate-800 font-medium mb-2">
                          {booking.service?.name || booking.subService?.name || booking.popularService?.name || booking.serviceName || 'Service'}
                        </p>
                        
                        {/* Payment Status Section - Partner View */}
                        {booking.paymentStatus && (() => {
                          const partnerAmount = calculatePartnerVisibleAmount(booking)
                          const earnings = calculatePartnerEarnings(partnerAmount.visibleAmount)
                          
                          return (
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                              <h6 className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <FiDollarSign className="w-4 h-4" />
                                Your Earnings Information
                              </h6>
                              
                              {booking.paymentStatus === 'partial' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-purple-700 font-semibold">Payment Status:</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold border border-orange-300">
                                      ⚠️ PARTIAL PAYMENT
                                    </span>
                                  </div>
                                  <div className="bg-white rounded p-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{partnerAmount.description}:</span>
                                      <span className="text-blue-600 font-bold">₹{partnerAmount.visibleAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Platform Commission (15%):</span>
                                      <span className="text-red-600 font-semibold">- ₹{earnings.commissionAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-1 mt-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-700 font-bold">Your Earning:</span>
                                        <span className="text-green-600 font-bold text-sm">₹{earnings.partnerEarning.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                                    <p className="text-xs text-orange-800 font-medium">
                                      ⚠️ Customer needs to complete payment
                                    </p>
                                  </div>
                                </div>
                              ) : booking.paymentStatus === 'completed' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-purple-700 font-semibold">Payment Status:</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-300">
                                      ✅ PAYMENT COMPLETED
                                    </span>
                                  </div>
                                  <div className="bg-white rounded p-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{partnerAmount.description}:</span>
                                      <span className="text-blue-600 font-bold">₹{partnerAmount.visibleAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Platform Commission (15%):</span>
                                      <span className="text-red-600 font-semibold">- ₹{earnings.commissionAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-1 mt-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-700 font-bold">Your Earning:</span>
                                        <span className="text-green-600 font-bold text-sm">₹{earnings.partnerEarning.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {partnerAmount.isOnlyVisitingCharge && (
                                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                                      <p className="text-xs text-blue-800 font-medium">
                                        ℹ️ This is a visiting charge only booking
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-purple-700 font-semibold">Payment Status:</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-300">
                                      {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                                    </span>
                                  </div>
                                  <div className="bg-white rounded p-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">{partnerAmount.description}:</span>
                                      <span className="text-blue-600 font-bold">₹{partnerAmount.visibleAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Platform Commission (15%):</span>
                                      <span className="text-red-600 font-semibold">- ₹{earnings.commissionAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-1 mt-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-700 font-bold">Your Earning:</span>
                                        <span className="text-green-600 font-bold text-sm">₹{earnings.partnerEarning.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        
                        {/* Add-ons */}
                        {booking.selectedAddOns && booking.selectedAddOns.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-blue-700 font-semibold mb-1">Add-ons:</p>
                            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                              {booking.selectedAddOns.map((addon, idx) => (
                                <li key={idx}>
                                  {addon.name} - ₹{addon.basePrice || addon.price || 0}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Sub-services */}
                        {booking.selectedSubServices && booking.selectedSubServices.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-blue-700 font-semibold mb-1">Sub-services:</p>
                            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                              {booking.selectedSubServices.map((subSvc, idx) => (
                                <li key={idx}>
                                  {subSvc.name} - ₹{subSvc.basePrice || subSvc.price || 0}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Special Instructions */}
                        {booking.specialInstructions && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800 font-semibold mb-1">Special Instructions:</p>
                            <p className="text-xs text-slate-700 italic">{booking.specialInstructions}</p>
                          </div>
                        )}
                        
                        {/* Scheduled Date & Time */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-blue-700 font-semibold mb-1">Scheduled Date</p>
                            <p className="text-sm text-slate-800">
                              {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-semibold mb-1">Scheduled Time</p>
                            <p className="text-sm text-slate-800">{booking.scheduledTime || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Team Member Assignment */}
                    <div className="flex items-center gap-3 flex-wrap mt-3">
                      {booking.teamMember && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                            <FiUser className="text-sm" />
                            Assigned to: {booking.teamMember?.name || 'Team Member'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Assign Team Member Section */}
                    {!booking.teamMember && (booking.status === 'confirmed' || booking.status === 'accepted' || booking.status === 'in_progress') && teamMembers.length > 0 && (
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
                    <p className="text-xs sm:text-sm text-slate-500">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => {
                          // Find accepted quotation for this booking
                          const acceptedQuotation = quotations[booking._id || booking.bookingId]?.find(
                            q => q.customerStatus === 'accepted'
                          );
                          
                          // Pass both booking and quotation data to invoice
                          const invoiceData = {
                            ...booking,
                            quotation: acceptedQuotation,
                            acceptedQuotation: acceptedQuotation
                          };
                          
                          setSelectedInvoice({ data: invoiceData, type: 'booking' });
                        }}
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

                      
                      {/* Accept Job button for confirmed jobs (admin assigned but partner hasn't accepted) */}
                      {booking.status === 'confirmed' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptJob(booking._id || booking.bookingId)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition inline-flex items-center gap-1 sm:gap-2 shadow-md"
                          >
                            <FiCheckCircle /> <span className="hidden sm:inline">Accept Job</span><span className="sm:hidden">Accept</span>
                          </button>
                          <p className="text-xs text-slate-600 italic">Admin assigned this job to you</p>
                        </div>
                      )}
                      
                      {/* Complete, Pause, and Send Quotation buttons for accepted/in_progress jobs */}
                      {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setCompleteJobModal(booking)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition inline-flex items-center gap-1 sm:gap-2"
                          >
                            <FiCheckCircle /> <span className="hidden sm:inline">Mark Work Done</span><span className="sm:hidden">Work Done</span>
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
                      {/* Work completed status - No payment option for partners */}
                      {booking.status === 'work_completed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-green-600" />
                            <span className="text-green-800 font-semibold text-sm">Work Completed</span>
                          </div>
                        </div>
                      )}
                      {/* Completed job status */}
                      {booking.status === 'completed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FiCheckCircle className="text-green-600" />
                            <span className="text-green-800 font-semibold text-sm">Job Completed</span>
                          </div>
                          <div className="text-xs text-green-700">
                            <p>Completed: {booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          
                          {/* Customer Review Section */}
                          {booking.review ? (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FiStar className="text-yellow-500" />
                                <span className="text-green-800 font-semibold text-sm">Customer Review</span>
                              </div>
                              <div className="space-y-2">
                                {/* Rating Stars */}
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (booking.review.rating || 0)
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-green-700 ml-2">
                                    {booking.review.rating || 0}/5
                                  </span>
                                </div>
                                
                                {/* Review Comment */}
                                {booking.review.comment && (
                                  <div className="bg-white rounded-lg p-2 border border-green-100">
                                    <p className="text-xs text-slate-700 italic">
                                      "{booking.review.comment}"
                                    </p>
                                    {booking.review.createdAt && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        - {new Date(booking.review.createdAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Video Review */}
                                {booking.review.video && (
                                  <div className="flex items-center gap-2">
                                    <FiPlay className="text-green-600 w-3 h-3" />
                                    <span className="text-xs text-green-700">Video review available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <div className="flex items-center gap-2">
                                <FiStar className="text-gray-400" />
                                <span className="text-gray-500 text-xs">No review yet</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Photos & Videos Section */}
                {((booking.photos && booking.photos.length > 0) || (booking.videos && booking.videos.length > 0)) && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photos & Videos
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedBookingMedia({
                            booking,
                            photos: booking.photos || [],
                            videos: booking.videos || []
                          })
                          setShowMediaModal(true)
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Photos Preview */}
                      {booking.photos && booking.photos.length > 0 && (
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-purple-700 font-medium">
                              {booking.photos.length} Photo{booking.photos.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex -space-x-2">
                            {booking.photos.slice(0, 4).map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Job photo ${index + 1}`}
                                className="w-10 h-10 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform shadow-sm"
                                onClick={() => {
                                  setSelectedBookingMedia({
                                    booking,
                                    photos: booking.photos,
                                    videos: booking.videos || []
                                  })
                                  setShowMediaModal(true)
                                }}
                              />
                            ))}
                            {booking.photos.length > 4 && (
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                                   onClick={() => {
                                     setSelectedBookingMedia({
                                       booking,
                                       photos: booking.photos,
                                       videos: booking.videos || []
                                     })
                                     setShowMediaModal(true)
                                   }}>
                                +{booking.photos.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Videos Preview */}
                      {booking.videos && booking.videos.length > 0 && (
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            <span className="text-sm text-purple-700 font-medium">
                              {booking.videos.length} Video{booking.videos.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {booking.videos.slice(0, 3).map((video, index) => (
                              <div
                                key={index}
                                className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors shadow-sm border border-purple-200"
                                onClick={() => {
                                  setSelectedBookingMedia({
                                    booking,
                                    photos: booking.photos || [],
                                    videos: booking.videos
                                  })
                                  setShowMediaModal(true)
                                }}
                              >
                                <FiPlay className="w-4 h-4 text-purple-600" />
                              </div>
                            ))}
                            {booking.videos.length > 3 && (
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors shadow-sm border border-purple-200 text-xs font-semibold text-purple-600"
                                   onClick={() => {
                                     setSelectedBookingMedia({
                                       booking,
                                       photos: booking.photos || [],
                                       videos: booking.videos
                                     })
                                     setShowMediaModal(true)
                                   }}>
                                +{booking.videos.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                          className="bg-white rounded-lg p-2 flex items-center justify-between hover:bg-blue-100 transition"
                        >
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedQuotation(quotation)}
                          >
                            <p className="text-xs font-semibold text-slate-800">
                              #{quotation.quotationNumber}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${quotation.customerStatus === 'accepted' ? 'bg-green-100 text-green-800' : quotation.customerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                Customer: {quotation.customerStatus}
                              </span>
                              {quotation.partnerStatus !== 'not_required' && (
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${quotation.partnerStatus === 'accepted' ? 'bg-green-100 text-green-800' : quotation.partnerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                  Partner: {quotation.partnerStatus}
                                </span>
                              )}
                              {quotation.adminStatus !== 'not_required' && (
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${quotation.adminStatus === 'accepted' ? 'bg-green-100 text-green-800' : quotation.adminStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  Admin: {quotation.adminStatus}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => setSelectedQuotation(quotation)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {/* Show delete button only if customer status is pending */}
                            {quotation.customerStatus === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteQuotation(quotation._id, booking._id || booking.bookingId)
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                title="Delete Quotation"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print-modal">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print-modal-content">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 print:hidden">
              <h2 className="text-xl font-bold text-slate-900">Invoice</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <Invoice
                data={selectedInvoice.data}
                type={selectedInvoice.type}
                onClose={() => setSelectedInvoice(null)}
              />
            </div>
          </div>
        </div>
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
          booking={bookings.find(b => (b._id || b.bookingId) === selectedQuotation.bookingId)}
          isOpen={true}
          onClose={() => setSelectedQuotation(null)}
          onAccept={handleApproveQuotation}
          onReject={handleRejectQuotation}
          userType="partner"
          token={token}
        />
      )}

      {/* Media Modal */}
      {showMediaModal && selectedBookingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 media-modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto media-modal-content">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Job Photos & Videos - {selectedBookingMedia.booking.service?.name || selectedBookingMedia.booking.subService?.name || selectedBookingMedia.booking.popularService?.name || selectedBookingMedia.booking.serviceName || 'Service'}
              </h3>
              <button
                onClick={() => {
                  setShowMediaModal(false)
                  setSelectedBookingMedia(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer: <span className="font-medium">{selectedBookingMedia.booking.user?.name || selectedBookingMedia.booking.userName || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Service: <span className="font-medium">{selectedBookingMedia.booking.service?.name || selectedBookingMedia.booking.subService?.name || selectedBookingMedia.booking.popularService?.name || selectedBookingMedia.booking.serviceName || 'Service'}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: <span className="font-medium">{selectedBookingMedia.booking.scheduledDate ? new Date(selectedBookingMedia.booking.scheduledDate).toLocaleDateString() : 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium capitalize">{selectedBookingMedia.booking.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              {selectedBookingMedia.photos && selectedBookingMedia.photos.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Job Photos ({selectedBookingMedia.photos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 media-grid">
                    {selectedBookingMedia.photos.map((photo, index) => (
                      <div key={index} className="relative group media-grid-item">
                        <img
                          src={photo}
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                          onError={(e) => {
                            e.target.classList.add('media-error');
                            e.target.alt = 'Failed to load image';
                          }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center photo-overlay">
                          <button
                            onClick={() => window.open(photo, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium transition-opacity hover:bg-gray-100"
                          >
                            View Full Size
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 media-counter text-white px-2 py-1 rounded text-xs">
                          {index + 1} / {selectedBookingMedia.photos.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {selectedBookingMedia.videos && selectedBookingMedia.videos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Job Videos ({selectedBookingMedia.videos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 video-grid">
                    {selectedBookingMedia.videos.map((video, index) => (
                      <div key={index} className="relative">
                        <video
                          src={video}
                          controls
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 video-player"
                          preload="metadata"
                          onError={(e) => {
                            e.target.classList.add('media-error');
                            e.target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'w-full h-48 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg media-error';
                            errorDiv.innerHTML = '<span>Failed to load video</span>';
                            e.target.parentNode.appendChild(errorDiv);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-2 right-2 media-counter text-white px-2 py-1 rounded text-xs">
                          Video {index + 1} / {selectedBookingMedia.videos.length}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Video {index + 1}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const videoElement = document.createElement('video');
                                videoElement.src = video;
                                videoElement.controls = true;
                                videoElement.style.width = '100%';
                                videoElement.style.height = 'auto';
                                const newWindow = window.open('', '_blank');
                                newWindow.document.body.appendChild(videoElement);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              Full Screen
                            </button>
                            <button
                              onClick={() => window.open(video, '_blank')}
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Media Message */}
              {(!selectedBookingMedia.photos || selectedBookingMedia.photos.length === 0) && 
               (!selectedBookingMedia.videos || selectedBookingMedia.videos.length === 0) && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No media available</h3>
                  <p className="mt-1 text-sm text-gray-500">This job doesn't have any photos or videos yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsManagementTab

