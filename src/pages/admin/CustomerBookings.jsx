import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  FiUsers, 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown,
  FiEye,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUserPlus,
  FiSearch
} from 'react-icons/fi'
import { adminApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { CompactInvoiceButton } from '../../components/InvoiceButton'
import QuotationDetailsModal from '../../components/QuotationDetailsModal'

const CustomerBookings = () => {
  const { token } = useAdminAuth()
  const [bookings, setBookings] = useState([])
  const [partners, setPartners] = useState([])
  const [teamMembers, setTeamMembers] = useState({}) // Store team members by partner ID
  const [loading, setLoading] = useState(true)
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    search: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningPartner, setAssigningPartner] = useState(null)
  const [quotations, setQuotations] = useState({}) // Store quotations by booking ID
  const [quotationsLoading, setQuotationsLoading] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [partnerFilters, setPartnerFilters] = useState({
    search: '',
    sortBy: 'name', // name, leads, mgPlan, leadUsage
    sortOrder: 'asc', // asc, desc
    partnerType: 'all' // all, franchise, individual
  })

  useEffect(() => {
    if (token) {
      fetchBookings(pagination.currentPage)
    }
  }, [token, filters.dateRange, filters.status, filters.search, pagination.currentPage, pagination.itemsPerPage])

  useEffect(() => {
    // Fetch quotations for all bookings
    if (bookings.length > 0 && token) {
      fetchQuotationsForBookings()
    }
  }, [bookings, token])

  const fetchQuotationsForBookings = async () => {
    setQuotationsLoading(true)
    try {
      const quotationPromises = bookings.map(async (booking) => {
        try {
          const bookingId = booking._id || booking.bookingId
          if (!bookingId) return null

          const response = await adminApi.getQuotationsByBooking ? 
            await adminApi.getQuotationsByBooking(token, bookingId) :
            await fetch(`${import.meta.env.VITE_API_URL || 'https://nexo.works'}/api/admin/bookings/${bookingId}/quotations`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
          
          if (response && response.success && response.data) {
            return { bookingId, quotations: response.data }
          }
          return null
        } catch (err) {
          console.error(`Failed to fetch quotations for booking ${booking._id}:`, err)
          return null
        }
      })

      const results = await Promise.allSettled(quotationPromises)
      const newQuotations = {}
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { bookingId, quotations } = result.value
          newQuotations[bookingId] = quotations
        }
      })

      setQuotations(newQuotations)
    } catch (err) {
      console.error('Error fetching quotations:', err)
    } finally {
      setQuotationsLoading(false)
    }
  }

  const handleApproveQuotation = async (quotationId) => {
    try {
      const response = await adminApi.approveQuotation(token, quotationId)
      if (response.success) {
        await fetchQuotationsForBookings() // Refresh quotations
        alert('Quotation approved successfully!')
      }
    } catch (error) {
      console.error('Error approving quotation:', error)
      throw error
    }
  }

  const handleRejectQuotation = async (quotationId, rejectionReason) => {
    try {
      const response = await adminApi.rejectQuotation(token, quotationId, rejectionReason)
      if (response.success) {
        await fetchQuotationsForBookings() // Refresh quotations
        alert('Quotation rejected successfully!')
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      throw error
    }
  }

  const fetchBookings = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      // Ensure page is a number
      const pageNumber = typeof page === 'number' ? page : parseInt(page) || 1

      const response = await adminApi.fetchBookings(token, {
        page: pageNumber,
        limit: pagination.itemsPerPage,
        status: filters.status !== 'all' ? filters.status : undefined,
        fromDate: getDateFromRange(filters.dateRange)?.from,
        toDate: getDateFromRange(filters.dateRange)?.to,
        search: filters.search || undefined
      })

      setBookings(response.data || [])
      // Update pagination info
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalItems: response.pagination.totalItems,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage
        }))

      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await adminApi.fetchTeamMembers(token, { status: 'active' })
      
      // Group team members by partner ID
      const teamMembersByPartner = {}
      if (response.data) {
        response.data.forEach(member => {
          const partnerId = member.partner?._id || member.partner
          if (partnerId) {
            if (!teamMembersByPartner[partnerId]) {
              teamMembersByPartner[partnerId] = []
            }
            teamMembersByPartner[partnerId].push(member)
          }
        })
      }
      
      setTeamMembers(teamMembersByPartner)
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    }
  }

  const fetchPartners = async () => {
    try {
      setPartnersLoading(true)
      const response = await adminApi.fetchPartners(token, {
        page: 1,
        limit: 100,
        status: 'approved'
      })
      
      // Transform the partner data to match expected structure
      const transformedPartners = (response.partners || []).map(partner => ({
        _id: partner.Profile.id,
        profile: {
          name: partner.Profile.name,
          email: partner.Profile.email,
          city: partner.Profile.address || `Pincode: ${partner.Profile.pincode}`,
          pincode: partner.Profile.pincode,
          address: partner.Profile.address
        },
        phone: partner.Profile.phone,
        partnerType: partner.Profile.partnerType,
        mgPlan: partner.mgPlan,
        mgPlanLeadQuota: partner.mgPlanLeadQuota || 0,
        mgPlanLeadsUsed: partner.mgPlanLeadsUsed || 0,
        mgPlanSubscribedAt: partner.mgPlanSubscribedAt,
        mgPlanExpiresAt: partner.mgPlanExpiresAt
      }))
      
      setPartners(transformedPartners)
      
      // Fetch team members after partners are loaded
      await fetchTeamMembers()
    } catch (err) {
      console.error('Failed to fetch partners:', err)
    } finally {
      setPartnersLoading(false)
    }
  }

  const getDateFromRange = (range) => {
    const now = new Date()
    switch (range) {
      case 'today':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
          to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
        }
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return {
          from: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString(),
          to: new Date().toISOString()
        }
      case 'month':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: new Date().toISOString()
        }
      default:
        return null
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage: newLimit, 
      currentPage: 1 // Reset to first page when changing items per page
    }))
  }

  const resetPagination = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    resetPagination() // Reset to first page when filters change
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      in_progress: 'text-purple-600 bg-purple-50',
      completed: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
      accepted: 'text-indigo-600 bg-indigo-50'
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: FiClock,
      confirmed: FiCheckCircle,
      in_progress: FiRefreshCw,
      completed: FiCheckCircle,
      cancelled: FiXCircle,
      accepted: FiCheckCircle
    }
    return icons[status] || FiAlertCircle
  }

  const calculateRemainingLeads = useCallback((partner) => {
    if (!partner.mgPlan) return 'No Plan'
    return Math.max(0, partner.mgPlanLeadQuota - partner.mgPlanLeadsUsed)
  }, [])

  const calculateLeadUsagePercentage = useCallback((partner) => {
    if (!partner.mgPlan || partner.mgPlanLeadQuota === 0) return 0
    return Math.min(100, (partner.mgPlanLeadsUsed / partner.mgPlanLeadQuota) * 100)
  }, [])

  const openAssignModal = (booking) => {
    setSelectedBooking(booking)
    setShowAssignModal(true)
    setPartnerFilters({ search: '', sortBy: 'name', sortOrder: 'asc', partnerType: 'all' }) // Reset filters
    fetchPartners()
  }

  const handlePartnerFilterChange = (key, value) => {
    setPartnerFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredAndSortedPartners = useMemo(() => {
    let filteredPartners = partners

    // Apply partner type filter
    if (partnerFilters.partnerType && partnerFilters.partnerType !== 'all') {
      filteredPartners = filteredPartners.filter(partner => 
        partner.partnerType === partnerFilters.partnerType
      )
    }

    // Apply search filter
    if (partnerFilters.search) {
      const searchLower = partnerFilters.search.toLowerCase()
      filteredPartners = filteredPartners.filter(partner => 
        partner.profile?.name?.toLowerCase().includes(searchLower) ||
        partner.phone?.includes(partnerFilters.search) ||
        partner.profile?.address?.toLowerCase().includes(searchLower) ||
        partner.profile?.city?.toLowerCase().includes(searchLower) ||
        partner.mgPlan?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filteredPartners.sort((a, b) => {
      let aValue, bValue

      switch (partnerFilters.sortBy) {
        case 'name':
          aValue = a.profile?.name || ''
          bValue = b.profile?.name || ''
          break
        case 'leads':
          aValue = calculateRemainingLeads(a)
          bValue = calculateRemainingLeads(b)
          // Convert 'No Plan' to -1 for sorting
          aValue = typeof aValue === 'string' ? -1 : aValue
          bValue = typeof bValue === 'string' ? -1 : bValue
          break
        case 'mgPlan':
          aValue = a.mgPlan?.name || 'No Plan'
          bValue = b.mgPlan?.name || 'No Plan'
          break
        case 'leadUsage':
          aValue = calculateLeadUsagePercentage(a)
          bValue = calculateLeadUsagePercentage(b)
          break
        default:
          aValue = a.profile?.name || ''
          bValue = b.profile?.name || ''
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return partnerFilters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return partnerFilters.sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }
    })

    return filteredPartners
  }, [partners, partnerFilters, calculateRemainingLeads, calculateLeadUsagePercentage])

  const handleAssignPartner = async (partnerId) => {
    try {
      setAssigningPartner(partnerId)
      // Use the booking._id from the nested booking object
      const bookingId = selectedBooking.booking?._id || selectedBooking._id
      await adminApi.assignBooking(token, bookingId, partnerId, null)
      
      // Find the assigned partner
      const assignedPartner = partners.find(p => p._id === partnerId)
      
      // Update the booking in the list
      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? { 
              ...booking, 
              partner: assignedPartner,
              partnerName: assignedPartner?.profile?.name || 'Unknown Partner',
              partnerPhone: assignedPartner?.phone || 'No phone',
              partnerId: partnerId
            }
          : booking
      ))
      
      setShowAssignModal(false)
      setSelectedBooking(null)
      
      // Show success message
      alert('Partner assigned successfully!')
    } catch (err) {
      console.error('Failed to assign partner:', err)
      alert('Failed to assign partner: ' + (err.message || 'Unknown error'))
    } finally {
      setAssigningPartner(null)
    }
  }

  // No client-side filtering needed since we're doing server-side filtering
  const filteredBookings = bookings
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-2xl text-primary" />
          <span className="text-lg">Loading bookings...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-700">
          <FiXCircle className="text-xl" />
          <span className="font-medium">Error loading data</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchBookings}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and assign bookings to partners</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <FiRefreshCw className="text-sm" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <FiDownload className="text-sm" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-500" />
          <span className="font-medium text-gray-700">Filters & Search</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, phone, service..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ dateRange: 'all', status: 'all', search: '' })}
              className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalItems}</p>
              <p className="text-xs text-gray-500">Showing {filteredBookings.length} on this page</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiCalendar className="text-xl text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBookings.filter(b => !b.partner && b.partnerName === 'Still not assigned').length}
              </p>
              <p className="text-xs text-gray-500">On current page</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FiUserPlus className="text-xl text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBookings.filter(b => b.partner || b.partnerName !== 'Still not assigned').length}
              </p>
              <p className="text-xs text-gray-500">On current page</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiCheckCircle className="text-xl text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Current page total</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiDollarSign className="text-xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quotations</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(quotations).reduce((sum, bookingQuotations) => sum + bookingQuotations.length, 0)}
              </p>
              <p className="text-xs text-gray-500">
                {Object.values(quotations).reduce((sum, bookingQuotations) => 
                  sum + bookingQuotations.filter(q => q.adminStatus === 'pending').length, 0
                )} pending review
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <FiEye className="text-xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status)
                
                return (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {booking.customerName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customerName || 'Unknown Customer'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiPhone className="text-xs" />
                            {booking.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.serviceName || 'Service Booking'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiMapPin className="text-xs" />
                        {booking.location?.address?.substring(0, 30) || 'No address'}...
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.scheduledTime}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.amount?.toLocaleString() || '0'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        <StatusIcon className="text-xs" />
                        {booking.status}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.partnerName && booking.partnerName !== 'Still not assigned' ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-xs">
                              {(() => {
                                const name = booking.partnerName || 'P'
                                // Clean the name and get first character
                                const cleanName = typeof name === 'string' ? name.trim() : 'P'
                                return cleanName.charAt(0)?.toUpperCase() || 'P'
                              })()}
                            </div>
                          </div>
                          <div className="ml-3 flex flex-col">
                            <div className="text-sm font-medium text-gray-900 leading-tight">
                              {booking.partnerName && booking.partnerName !== 'Still not assigned' 
                                ? booking.partnerName 
                                : 'Unknown Partner'}
                            </div>
                            <div className="text-sm text-gray-500 leading-tight mt-1">
                              {booking.partnerPhone && booking.partnerPhone !== 'N/A' 
                                ? booking.partnerPhone 
                                : 'No phone'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>

                    {/* Quotations Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quotationsLoading ? (
                        <div className="flex items-center gap-2">
                          <FiRefreshCw className="animate-spin text-sm text-gray-400" />
                          <span className="text-sm text-gray-400">Loading...</span>
                        </div>
                      ) : quotations[booking._id] && quotations[booking._id].length > 0 ? (
                        <div className="space-y-1">
                          {quotations[booking._id].slice(0, 2).map((quotation) => (
                            <div
                              key={quotation._id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                              onClick={() => setSelectedQuotation(quotation)}
                            >
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-800">
                                  #{quotation.quotationNumber}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ₹{quotation.totalAmount?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  quotation.customerStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                                  quotation.customerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  C: {quotation.customerStatus?.charAt(0).toUpperCase()}
                                </span>
                                {quotation.partnerStatus !== 'not_required' && (
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                    quotation.partnerStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                                    quotation.partnerStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    P: {quotation.partnerStatus?.charAt(0).toUpperCase()}
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  quotation.adminStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                                  quotation.adminStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  A: {quotation.adminStatus?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                          {quotations[booking._id].length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{quotations[booking._id].length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No quotations</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {booking.partnerName === 'Still not assigned' ? (
                          <button
                            onClick={() => openAssignModal(booking)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-xs"
                          >
                            <FiUserPlus className="text-xs" />
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignModal(booking)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs"
                          >
                            <FiEye className="text-xs" />
                            Change
                          </button>
                        )}
                        
                        {/* Invoice Button */}
                        <CompactInvoiceButton 
                          booking={booking}
                          className="ml-2"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">No bookings match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalItems > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Pagination Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} bookings
              </div>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>

            {/* Pagination Buttons */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    !pagination.hasPrevPage
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  First
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    !pagination.hasPrevPage
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                          pageNum === pagination.currentPage
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                {/* Go to page input */}
                {pagination.totalPages > 5 && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-600">Go to:</span>
                    <input
                      type="number"
                      min="1"
                      max={pagination.totalPages}
                      placeholder="Page"
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt(e.target.value)
                          if (page >= 1 && page <= pagination.totalPages) {
                            handlePageChange(page)
                            e.target.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    !pagination.hasNextPage
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    !pagination.hasNextPage
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Partner Assignment Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Partner - {selectedBooking.serviceName}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer: <span className="font-medium">{selectedBooking.customerName}</span></p>
                    <p className="text-sm text-gray-600">Phone: <span className="font-medium">{selectedBooking.customerPhone}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: <span className="font-medium">{new Date(selectedBooking.scheduledDate).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{selectedBooking.amount}</span></p>
                  </div>
                </div>
              </div>

              {/* Partners List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Available Partners</h4>
                  <div className="text-sm text-gray-500">
                    {filteredAndSortedPartners.length} of {partners.length} partners
                  </div>
                </div>



                {/* Partner Search and Sort Controls */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Partners</label>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          placeholder="Name, phone, location..."
                          value={partnerFilters.search}
                          onChange={(e) => handlePartnerFilterChange('search', e.target.value)}
                          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          autoFocus
                        />
                        {partnerFilters.search && (
                          <button
                            onClick={() => handlePartnerFilterChange('search', '')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <FiXCircle className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                        {partnerFilters.sortOrder === 'asc' ? (
                          <FiTrendingUp className="inline ml-1 text-xs text-green-600" />
                        ) : (
                          <FiTrendingDown className="inline ml-1 text-xs text-red-600" />
                        )}
                      </label>
                      <select
                        value={partnerFilters.sortBy}
                        onChange={(e) => handlePartnerFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="name">Partner Name</option>
                        <option value="leads">Remaining Leads</option>
                        <option value="mgPlan">MG Plan</option>
                        <option value="leadUsage">Lead Usage %</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <select
                        value={partnerFilters.sortOrder}
                        onChange={(e) => handlePartnerFilterChange('sortOrder', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="asc">
                          {partnerFilters.sortBy === 'name' || partnerFilters.sortBy === 'mgPlan' ? 'A to Z' : 'Low to High'}
                        </option>
                        <option value="desc">
                          {partnerFilters.sortBy === 'name' || partnerFilters.sortBy === 'mgPlan' ? 'Z to A' : 'High to Low'}
                        </option>
                      </select>
                    </div>

                    {/* Partner Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
                      <select
                        value={partnerFilters.partnerType}
                        onChange={(e) => handlePartnerFilterChange('partnerType', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="franchise">Franchise</option>
                        <option value="individual">Individual</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Filter Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => setPartnerFilters(prev => ({ ...prev, search: '', sortBy: 'leads', sortOrder: 'desc' }))}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                    >
                      Most Leads Available
                    </button>
                    <button
                      onClick={() => setPartnerFilters(prev => ({ ...prev, search: '', sortBy: 'leadUsage', sortOrder: 'asc' }))}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
                    >
                      Least Used
                    </button>
                    <button
                      onClick={() => setPartnerFilters(prev => ({ ...prev, search: '', partnerType: 'franchise', sortBy: 'name', sortOrder: 'asc' }))}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
                    >
                      Franchise Only
                    </button>
                    <button
                      onClick={() => setPartnerFilters(prev => ({ ...prev, search: '', partnerType: 'individual', sortBy: 'name', sortOrder: 'asc' }))}
                      className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition"
                    >
                      Individual Only
                    </button>
                    <button
                      onClick={() => setPartnerFilters(prev => ({ ...prev, search: '', partnerType: 'all', sortBy: 'name', sortOrder: 'asc' }))}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                    >
                      Reset Filters
                    </button>
                  </div>


                </div>
                {partnersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FiRefreshCw className="animate-spin text-xl text-primary mr-2" />
                    <span>Loading partners...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredAndSortedPartners.map((partner) => {
                      const remainingLeads = calculateRemainingLeads(partner)
                      const usagePercentage = calculateLeadUsagePercentage(partner)
                      const isCurrentlyAssigned = selectedBooking.partnerId === partner._id
                      const partnerTeamMembers = teamMembers[partner._id] || []
                      
                      return (
                        <div key={partner._id} className={`border rounded-lg p-4 ${isCurrentlyAssigned ? 'border-primary bg-primary-50' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                                  {partner.profile?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-medium text-gray-900">{partner.profile?.name || 'Unknown Partner'}</h5>
                                  {isCurrentlyAssigned && (
                                    <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">Current</span>
                                  )}
                                  {partner.partnerType === 'franchise' && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Franchise</span>
                                  )}
                                  {partner.mgPlan && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      {partner.mgPlan.name}
                                    </span>
                                  )}
                                  {!partner.mgPlan && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      No Plan
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <FiPhone className="text-xs" />
                                  {partner.phone}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <FiMapPin className="text-xs" />
                                  {partner.profile?.address || partner.profile?.city || 'Location not specified'}
                                </p>
                                {partner.partnerType === 'franchise' && (
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <FiUsers className="text-xs" />
                                    Team: {partnerTeamMembers.length} member{partnerTeamMembers.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {partner.mgPlan ? (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-gray-900">{partner.mgPlan.name}</div>
                                  <div className="text-xs text-gray-500">₹{partner.mgPlan.price}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="text-xs text-gray-600">
                                      {partner.mgPlanLeadsUsed || 0}/{partner.mgPlanLeadQuota || 0} leads
                                    </div>
                                    <div className="w-16 bg-gray-200 rounded-full h-1">
                                      <div
                                        className={`h-1 rounded-full ${
                                          usagePercentage >= 90 ? 'bg-red-500' :
                                          usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${usagePercentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className={`text-xs font-medium flex items-center gap-1 ${
                                    typeof remainingLeads === 'number' && remainingLeads <= 5 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {typeof remainingLeads === 'number' && remainingLeads <= 5 ? (
                                      <FiAlertCircle className="text-xs" />
                                    ) : (
                                      <FiCheckCircle className="text-xs" />
                                    )}
                                    {remainingLeads} remaining
                                  </div>
                                </div>
                              ) : (
                                <div className="mb-3">
                                  <span className="text-xs text-gray-400">No MG Plan</span>
                                </div>
                              )}
                              
                              <button
                                onClick={() => handleAssignPartner(partner._id)}
                                disabled={assigningPartner === partner._id || (typeof remainingLeads === 'number' && remainingLeads <= 0)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  assigningPartner === partner._id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : typeof remainingLeads === 'number' && remainingLeads <= 0
                                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                    : isCurrentlyAssigned
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                }`}
                              >
                                {assigningPartner === partner._id ? (
                                  <div className="flex items-center gap-2">
                                    <FiRefreshCw className="animate-spin text-xs" />
                                    Assigning...
                                  </div>
                                ) : typeof remainingLeads === 'number' && remainingLeads <= 0 ? (
                                  'No Leads Left'
                                ) : isCurrentlyAssigned ? (
                                  'Currently Assigned'
                                ) : (
                                  'Assign Partner'
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Team Members Section for Franchise Partners */}
                          {partner.partnerType === 'franchise' && partnerTeamMembers.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h6 className="text-sm font-medium text-gray-700 mb-3">Team Members ({partnerTeamMembers.length})</h6>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {partnerTeamMembers.slice(0, 4).map((member) => (
                                  <div key={member._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-xs">
                                        {member.name?.charAt(0)?.toUpperCase() || 'T'}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-900 truncate">
                                        {member.name}
                                      </div>
                                      <div className="text-xs text-gray-500 capitalize">
                                        {member.role || 'technician'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {partnerTeamMembers.length > 4 && (
                                  <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
                                    +{partnerTeamMembers.length - 4} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {filteredAndSortedPartners.length === 0 && partners.length > 0 && (
                      <div className="text-center py-8">
                        <FiSearch className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="text-gray-500">No partners match your search criteria</p>
                        <button
                          onClick={() => setPartnerFilters(prev => ({ ...prev, search: '' }))}
                          className="mt-2 text-sm text-primary hover:text-primary-dark"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                    
                    {partners.length === 0 && (
                      <div className="text-center py-8">
                        <FiUsers className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="text-gray-500">No partners available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onAccept={handleApproveQuotation}
          onReject={handleRejectQuotation}
          userType="admin"
          token={token}
        />
      )}
    </div>
  )
}

export default CustomerBookings