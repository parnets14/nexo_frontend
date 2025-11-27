import React, { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiDollarSign, FiMessageCircle, FiX, FiSearch, FiUser, FiMapPin, FiFileText, FiUserPlus, FiDownload, FiEye, FiFile, FiCheckCircle, FiImage } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import Invoice from '../../components/Invoice.jsx'
import QuotationDetailsModal from '../../components/QuotationDetailsModal.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { exportToExcel } from '../../utils/excelExport.js'

const bookingColumns = [
  { header: 'Booking ID', accessor: 'bookingId' },
  { header: 'Customer', accessor: 'customerName' },
  { header: 'Service', accessor: 'serviceName' },
  { header: 'City', accessor: 'city' },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => {
      const statusColors = {
        'completed': 'bg-emerald-500/10 text-emerald-600',
        'in_progress': 'bg-amber-500/10 text-amber-600',
        'paused': 'bg-yellow-500/10 text-yellow-600',
        'accepted': 'bg-blue-500/10 text-blue-600',
        'pending': 'bg-slate-200 text-slate-700',
        'cancelled': 'bg-red-500/10 text-red-600',
        'rejected': 'bg-red-500/10 text-red-600'
      }
      const statusValue = value?.toLowerCase() || ''
      return (
        <span
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
            statusColors[statusValue] || 'bg-slate-200 text-slate-700'
          }`}
        >
          {value?.charAt(0).toUpperCase() + value?.slice(1) || value}
        </span>
      )
    }
  },
  { 
    header: 'Quotations', 
    accessor: 'quotations',
    render: (value, row) => {
      const count = row.quotations?.length || 0
      if (count === 0) return <span className="text-slate-400">-</span>
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
          <FiFile className="w-3 h-3" /> {count}
        </span>
      )
    }
  },
  { header: 'Partner', accessor: 'partnerName' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Updated', accessor: 'updatedAt' }
]

const feedbackColumns = [
  { header: 'Date', accessor: 'date' },
  { header: 'Customer', accessor: 'customer' },
  { header: 'Service', accessor: 'service' },
  {
    header: 'Rating',
    accessor: 'rating',
    render: (value) => (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
        ★ {value}
      </span>
    )
  },
  { header: 'Feedback', accessor: 'feedback' }
]

const paymentColumns = [
  { header: 'Txn ID', accessor: 'transactionId' },
  { header: 'Booking', accessor: 'bookingId' },
  { header: 'Gateway', accessor: 'gateway' },
  { header: 'Status', accessor: 'status' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Settled On', accessor: 'settledOn' }
]

const fallbackBookings = [
  {
    id: 'BK-3012',
    bookingId: 'BK-3012',
    customerName: 'Anita Sharma',
    serviceName: 'AC Service - Split',
    city: 'Mumbai',
    status: 'In Progress',
    amount: '₹1,499',
    updatedAt: '12 Nov, 14:22'
  },
  {
    id: 'BK-3004',
    bookingId: 'BK-3004',
    customerName: 'Rahul Menon',
    serviceName: 'Refrigerator Repair',
    city: 'Bengaluru',
    status: 'Completed',
    amount: '₹2,199',
    updatedAt: '12 Nov, 11:40'
  },
  {
    id: 'BK-2991',
    bookingId: 'BK-2991',
    customerName: 'Megha Patil',
    serviceName: 'Washing Machine Install',
    city: 'Pune',
    status: 'Payment Pending',
    amount: '₹1,299',
    updatedAt: '12 Nov, 10:05'
  }
]

const CustomerBookings = () => {
  const { token } = useAdminAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    userId: '',
    subServiceId: '',
    scheduledDate: '',
    scheduledTime: '',
    location: { address: '', landmark: '', pincode: '' },
    amount: '',
    paymentMode: 'cash',
    discount: 0,
    lat: '',
    lng: ''
  })
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [subServices, setSubServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null) // For invoice modal
  const [assigningPartner, setAssigningPartner] = useState(null) // bookingId being assigned
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBookingForAssign, setSelectedBookingForAssign] = useState(null)
  const [selectedAssignValue, setSelectedAssignValue] = useState('')
  const [selectedQuotation, setSelectedQuotation] = useState(null) // For quotation modal
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [loadingQuotation, setLoadingQuotation] = useState(false)
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null) // For booking details modal
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hasQuotationFilter, setHasQuotationFilter] = useState('all') // 'all', 'yes', 'no'
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })

  const { data: bookingData, isLoading, error, refetch } = useAdminData(
    (token) => adminApi.fetchBookings(token, { 
      page: 1, 
      limit: 100,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    [statusFilter] // Refetch when status filter changes
  )

  const { data: usersData } = useAdminData(
    (token) => adminApi.fetchUsers(token, { limit: 100 }),
    []
  )

  const { data: categoriesData } = useAdminData(
    (token) => adminApi.fetchModuleData('/api/admin/categories-with-details', token),
    []
  )

  const { data: partnersData } = useAdminData(
    (token) => adminApi.fetchPartners(token, { limit: 100, status: 'active' }),
    []
  )

  const { data: teamMembersData } = useAdminData(
    (token) => adminApi.fetchTeamMembers(token, { status: 'active' }),
    []
  )

  const partners = partnersData?.data || partnersData?.partners || []
  const teamMembers = teamMembersData?.data || teamMembersData?.teamMembers || []

  // Debug: Log team members to check partner data
  useEffect(() => {
    if (teamMembers.length > 0) {
      console.log('Team Members with Partner Data:', teamMembers.map(m => ({
        name: m.name,
        phone: m.phone,
        partner: m.partner,
        partnerName: m.partner?.profile?.name,
        partnerPhone: m.partner?.phone
      })))
    }
  }, [teamMembers])

  // Extract data from backend response
  const allBookings = bookingData?.data || []
  const bookingCount = bookingData?.count || allBookings.length || 0
  const monthlyBookingCount = bookingData?.monthlyBookingCount || {}

  // Filter bookings based on search and filters
  const filteredBookings = React.useMemo(() => {
    let filtered = [...allBookings]
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking => {
        const b = booking.booking || booking
        const customerName = (booking.customerName || b.user?.name || '').toLowerCase()
        const serviceName = (booking.serviceName || b.subService?.name || '').toLowerCase()
        const bookingId = (booking._id || b._id)?.toString().toLowerCase() || ''
        const partnerName = (booking.partnerName || b.partner?.profile?.name || '').toLowerCase()
        
        return customerName.includes(query) || 
               serviceName.includes(query) || 
               bookingId.includes(query) ||
               partnerName.includes(query)
      })
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => {
        const b = booking.booking || booking
        const status = (booking.status || b.status || '').toLowerCase()
        return status === statusFilter.toLowerCase()
      })
    }
    
    // Quotation filter
    if (hasQuotationFilter !== 'all') {
      filtered = filtered.filter(booking => {
        const hasQuotations = (booking.quotations && booking.quotations.length > 0) || 
                             (booking.booking?.quotations && booking.booking.quotations.length > 0)
        return hasQuotationFilter === 'yes' ? hasQuotations : !hasQuotations
      })
    }
    
    // Date filter
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter(booking => {
        const b = booking.booking || booking
        const createdAt = new Date(b.createdAt || booking.createdAt)
        if (dateFilter.from && createdAt < new Date(dateFilter.from)) return false
        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to)
          toDate.setHours(23, 59, 59, 999) // Include entire end date
          if (createdAt > toDate) return false
        }
        return true
      })
    }
    
    return filtered
  }, [allBookings, searchQuery, statusFilter, hasQuotationFilter, dateFilter])

  const bookings = filteredBookings

  // Calculate stats from actual booking data
  const pendingBookings = bookings.filter(b => {
    const status = (b.status || b.booking?.status || '').toLowerCase()
    return status === 'pending' || status === 'accepted'
  }).length
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

  const stats = [
    {
      label: 'Total Bookings',
      value: bookingCount,
      trend: `${pendingBookings} pending`,
      icon: FiCalendar,
      description: 'Across all service categories'
    },
    {
      label: 'Completed',
      value: completedBookings,
      trend: `${cancelledBookings} cancelled`,
      icon: FiClock,
      description: 'Successfully completed bookings'
    },
    {
      label: 'Pending',
      value: pendingBookings,
      trend: 'Awaiting assignment',
      icon: FiDollarSign,
      description: 'Bookings in progress'
    },
    {
      label: 'Monthly Trend',
      value: Object.keys(monthlyBookingCount).length > 0 ? Object.values(monthlyBookingCount).reduce((a, b) => a + b, 0) : 0,
      trend: `${Object.keys(monthlyBookingCount).length} months tracked`,
      icon: FiMessageCircle,
      description: 'Historical booking data'
    }
  ]

  // Get all sub-services from categories
  React.useEffect(() => {
    if (categoriesData?.data) {
      const allSubServices = []
      categoriesData.data.forEach(category => {
        category.subCategories?.forEach(subCat => {
          subCat.services?.forEach(service => {
            service.subServices?.forEach(subService => {
              allSubServices.push({
                ...subService,
                serviceName: service.name,
                subCategoryName: subCat.name,
                categoryName: category.name
              })
            })
          })
        })
      })
      setSubServices(allSubServices)
    }
  }, [categoriesData])

  const filteredUsers = usersData?.data?.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.phone?.includes(userSearch)
  ) || []

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setBookingForm(prev => ({ ...prev, userId: user._id }))
    setUserSearch('')
  }

  const handleSubServiceChange = (e) => {
    const subServiceId = e.target.value
    const subService = subServices.find(s => s._id === subServiceId)
    setBookingForm(prev => ({
      ...prev,
      subServiceId,
      amount: subService?.price || ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    if (!bookingForm.userId || !bookingForm.subServiceId || !bookingForm.scheduledDate || !bookingForm.scheduledTime) {
      setErrorMsg('Please fill all required fields')
      setLoading(false)
      return
    }

    try {
      await adminApi.createManualBooking(token, bookingForm)
      setSuccessMsg('Booking created successfully!')
      setShowBookingModal(false)
      setBookingForm({
        userId: '',
        subServiceId: '',
        scheduledDate: '',
        scheduledTime: '',
        location: { address: '', landmark: '', pincode: '' },
        amount: '',
        paymentMode: 'cash',
        discount: 0,
        lat: '',
        lng: ''
      })
      setSelectedUser(null)
      if (refetch) refetch()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Customer Bookings"
        subtitle="Track bookings through their lifecycle, reconcile payments, and close the feedback loop in one workspace."
        actions={
          <button 
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
          >
            Create Manual Booking
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Live Booking Tracker
            </h2>
            <div className="flex items-center gap-3">
              {error && <p className="text-xs text-rose-500">Sync failed. Showing cached data.</p>}
              {isLoading && <p className="text-xs text-slate-400">Loading bookings...</p>}
              <button
                onClick={() => {
                  const exportData = filteredBookings.length > 0 ? filteredBookings.map((b) => {
                    const booking = b.booking || b
                    const partner = booking?.partner || b.partner
                    const teamMember = booking?.teamMember || b.teamMember
                    let partnerName = 'Not Assigned'
                    if (b.partnerName && b.partnerName !== 'Still not assigned') {
                      partnerName = b.partnerName
                    } else if (partner) {
                      partnerName = partner.profile?.name || partner.name || 'Partner'
                      if (teamMember) {
                        partnerName = `${partnerName} (via ${teamMember.name || 'Team Member'})`
                      }
                    } else if (teamMember) {
                      partnerName = teamMember.partner?.profile?.name || teamMember.partner?.name || 'Team Member'
                    }
                    return {
                      bookingId: (b._id || booking?._id)?.toString().slice(-8) || 'N/A',
                      customerName: b.customerName || booking?.user?.name || b.user?.name || 'N/A',
                      serviceName: b.serviceName || booking?.subService?.name || b.subService?.name || 'N/A',
                      city: (b.location || booking?.location)?.address?.split(',')?.pop()?.trim() || 'N/A',
                      status: b.status || booking?.status || 'pending',
                      partnerName: partnerName,
                      amount: b.amount || booking?.amount || 0,
                      updatedAt: (b.createdAt || booking?.createdAt) ? new Date(b.createdAt || booking?.createdAt).toLocaleString('en-IN') : 'N/A'
                    }
                  }) : []
                  exportToExcel(exportData, bookingColumns, 'Customer_Bookings', 'Bookings', {
                    columnWidths: [15, 20, 25, 15, 15, 25, 15, 20]
                  })
                }}
                disabled={bookings.length === 0}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Export to Excel"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-4 space-y-3 bg-slate-50 p-4 rounded-lg">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer name, service, booking ID, or partner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Quotation Filter */}
              <select
                value={hasQuotationFilter}
                onChange={(e) => setHasQuotationFilter(e.target.value)}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              >
                <option value="all">All Bookings</option>
                <option value="yes">With Quotations</option>
                <option value="no">Without Quotations</option>
              </select>

              {/* Date From */}
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                placeholder="From Date"
                className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              />

              {/* Date To */}
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                placeholder="To Date"
                className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              />
            </div>

            {/* Filter Summary and Clear */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <strong>{bookings.length}</strong> of <strong>{allBookings.length}</strong> bookings
              </p>
              {(searchQuery || statusFilter !== 'all' || hasQuotationFilter !== 'all' || dateFilter.from || dateFilter.to) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setHasQuotationFilter('all')
                    setDateFilter({ from: '', to: '' })
                  }}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          <DataTable
            columns={bookingColumns}
            data={bookings.length > 0 ? bookings.map((b) => {
              // Handle different data structures from backend
              const booking = b.booking || b // Backend sometimes nests in 'booking' property
              const partner = booking?.partner || b.partner
              const teamMember = booking?.teamMember || b.teamMember
              
              // Get partner name from various possible structures
              let partnerName = 'Not Assigned'
              if (b.partnerName && b.partnerName !== 'Still not assigned') {
                partnerName = b.partnerName
              } else if (partner) {
                partnerName = partner.profile?.name || partner.name || 'Partner'
                // If there's a team member, show both
                if (teamMember) {
                  partnerName = `${partnerName} (via ${teamMember.name || 'Team Member'})`
                }
              } else if (teamMember) {
                // If only team member is assigned, show team member's partner
                partnerName = teamMember.partner?.profile?.name || teamMember.partner?.name || 'Team Member'
              }
              
              return {
                id: b._id || booking?._id,
                bookingId: (b._id || booking?._id)?.toString().slice(-8) || 'N/A',
                customerName: b.customerName || booking?.user?.name || b.user?.name || 'N/A',
                serviceName: b.serviceName || booking?.subService?.name || b.subService?.name || 'N/A',
                city: (b.location || booking?.location)?.address?.split(',')?.pop()?.trim() || 'N/A',
                status: b.status || booking?.status || 'pending',
                partnerName: partnerName,
                amount: (b.amount || booking?.amount) ? `₹${b.amount || booking?.amount}` : '₹0',
                updatedAt: (b.createdAt || booking?.createdAt) ? new Date(b.createdAt || booking?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A',
                _original: booking || b // Store original booking data for invoice
              }
            }) : fallbackBookings}
            emptyLabel="No bookings to display."
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const booking = row._original || row
                    setSelectedBookingForAssign(booking)
                    // Set default value based on current assignment
                    if (booking.teamMember?._id) {
                      setSelectedAssignValue(`member-${booking.teamMember._id}`)
                    } else if (booking.partner?._id) {
                      setSelectedAssignValue(`partner-${booking.partner._id}`)
                    } else {
                      setSelectedAssignValue('')
                    }
                    setShowAssignModal(true)
                  }}
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-500/20 transition flex items-center gap-2"
                  title="Assign Partner or Team Member"
                >
                  <FiUserPlus /> Assign
                </button>
                <button
                  onClick={() => setSelectedInvoice({ data: row._original || row, type: 'booking' })}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition flex items-center gap-2"
                >
                  <FiFileText /> Invoice
                </button>
                {row.quotations && row.quotations.length > 0 && (
                  <div className="flex items-center gap-2">
                    {row.quotations.length === 1 ? (
                      <button
                        onClick={async () => {
                          try {
                            setLoadingQuotation(true)
                            const quotation = row.quotations[0]
                            console.log('Opening quotation:', quotation)
                            // Try to fetch full details
                            try {
                              const response = await adminApi.getQuotationById(token, quotation._id)
                              console.log('Quotation API response:', response)
                              if (response && response.data) {
                                setSelectedQuotation(response.data)
                              } else {
                                setSelectedQuotation(quotation)
                              }
                            } catch (fetchError) {
                              console.error('Error fetching quotation details:', fetchError)
                              setSelectedQuotation(quotation)
                            }
                            setShowQuotationModal(true)
                          } catch (error) {
                            console.error('Error opening quotation:', error)
                            alert('Error loading quotation: ' + (error.message || 'Unknown error'))
                          } finally {
                            setLoadingQuotation(false)
                          }
                        }}
                        disabled={loadingQuotation}
                        className="px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
                        title="View Quotation"
                      >
                        <FiFile /> View Quotation
                      </button>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={async () => {
                            try {
                              setLoadingQuotation(true)
                              // Show first quotation, but allow viewing others from modal
                              const quotation = row.quotations[0]
                              try {
                                const response = await adminApi.getQuotationById(token, quotation._id)
                                if (response && response.data) {
                                  setSelectedQuotation(response.data)
                                } else {
                                  setSelectedQuotation(quotation)
                                }
                              } catch (fetchError) {
                                setSelectedQuotation(quotation)
                              }
                              setShowQuotationModal(true)
                            } catch (error) {
                              console.error('Error opening quotation:', error)
                            } finally {
                              setLoadingQuotation(false)
                            }
                          }}
                          disabled={loadingQuotation}
                          className="px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
                          title={`View ${row.quotations.length} quotations`}
                        >
                          <FiFile /> Quotations ({row.quotations.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    const booking = row._original || row
                    setSelectedBookingDetails({
                      ...booking,
                      quotations: row.quotations || [],
                      customerName: row.customerName || booking?.user?.name,
                      customerEmail: booking?.user?.email,
                      customerPhone: booking?.user?.phone,
                      serviceName: row.serviceName || booking?.subService?.name,
                      partnerName: row.partnerName || booking?.partner?.profile?.name,
                      amount: row.amount || booking?.amount
                    })
                    setShowBookingDetailsModal(true)
                  }}
                  className="px-3 py-1.5 bg-slate-500/10 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-500/20 transition flex items-center gap-2"
                  title="View Booking Details"
                >
                  <FiEye /> Details
                </button>
              </div>
            )}
          />
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Payment Ledger
              </h2>
              <button className="text-xs text-primary font-semibold">Download CSV</button>
            </div>
            <DataTable
              columns={paymentColumns}
              data={bookingData?.payments ?? []}
              emptyLabel="No payments recorded today."
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Feedback Stream
              </h2>
              <button className="text-xs text-primary font-semibold">View All</button>
            </div>
            <DataTable
              columns={feedbackColumns}
              data={
                bookingData?.feedback ?? [
                  {
                    id: 1,
                    date: '12 Nov, 09:20',
                    customer: 'Sneha Kapoor',
                    service: 'Deep Cleaning (3BHK)',
                    rating: 5,
                    feedback: 'Technicians were on time and extremely thorough.'
                  },
                  {
                    id: 2,
                    date: '11 Nov, 18:45',
                    customer: 'Vikram Jain',
                    service: 'Chimney Service',
                    rating: 4,
                    feedback: 'Quick resolution, but follow-up call was delayed.'
                  }
                ]
              }
              emptyLabel="No feedback received today."
            />
          </div>
        </section>
      </div>

      {/* Manual Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Create Manual Booking</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                  {successMsg}
                </div>
              )}

              {/* User Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {selectedUser && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                    <FiUser className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{selectedUser.name}</p>
                      <p className="text-sm text-slate-600">{selectedUser.email} · {selectedUser.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null)
                        setBookingForm(prev => ({ ...prev, userId: '' }))
                      }}
                      className="ml-auto text-rose-500 hover:text-rose-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {userSearch && !selectedUser && filteredUsers.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredUsers.slice(0, 5).map(user => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-3"
                      >
                        <FiUser className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-600">{user.email} · {user.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bookingForm.subServiceId}
                  onChange={handleSubServiceChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  {subServices.map(subService => (
                    <option key={subService._id} value={subService._id}>
                      {subService.categoryName} → {subService.subCategoryName} → {subService.serviceName} → {subService.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Scheduled Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Scheduled Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={bookingForm.scheduledTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full address"
                  value={bookingForm.location.address}
                  onChange={(e) => setBookingForm(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Landmark"
                    value={bookingForm.location.landmark}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      location: { ...prev.location, landmark: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={bookingForm.location.pincode}
                    onChange={(e) => setBookingForm(prev => ({
                      ...prev,
                      location: { ...prev.location, pincode: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Amount and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={bookingForm.amount}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bookingForm.paymentMode}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="upi">UPI</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="credit card">Credit Card</option>
                  </select>
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  value={bookingForm.discount}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Invoice
          data={selectedInvoice.data}
          type={selectedInvoice.type}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Assign Partner Modal */}
      {showAssignModal && selectedBookingForAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Assign Partner or Team Member</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBookingForAssign(null)
                  setSelectedAssignValue('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Booking ID:</strong> {selectedBookingForAssign._id?.toString().slice(-8) || 'N/A'}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Service:</strong> {selectedBookingForAssign.serviceName || selectedBookingForAssign.subService?.name || 'N/A'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Partner or Team Member
              </label>
              {partners.length === 0 && teamMembers.length === 0 ? (
                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm">
                  No active partners or team members available
                </div>
              ) : (
                <select
                  id="assignSelect"
                  value={selectedAssignValue}
                  onChange={(e) => setSelectedAssignValue(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">-- Select Partner or Team Member --</option>
                  {partners.length > 0 && (
                    <optgroup label="Partners">
                      {partners.map((partner) => {
                        // Handle different partner data structures (backend returns Profile with capital P)
                        const partnerName = partner.Profile?.name || partner.profile?.name || partner.name || partner.profileName || 'Unknown Partner'
                        const partnerPhone = partner.Profile?.phone || partner.phone || partner.profile?.phone || 'N/A'
                        const partnerId = partner.Profile?.id || partner._id || partner.id
                        return (
                          <option key={`partner-${partnerId}`} value={`partner-${partnerId}`}>
                            {partnerName} - {partnerPhone} (Partner)
                          </option>
                        )
                      })}
                    </optgroup>
                  )}
                  {teamMembers.length > 0 && (
                    <optgroup label="Team Members">
                      {teamMembers.map((member) => {
                        const memberName = member.name || 'Team Member'
                        const memberPhone = member.phone || 'N/A'
                        const partnerName = member.partner?.profile?.name || member.partner?.name || 'Unknown Partner'
                        const partnerPhone = member.partner?.phone || member.partner?.profile?.phone || 'N/A'
                        return (
                          <option key={`member-${member._id}`} value={`member-${member._id}`}>
                            {memberName} - {memberPhone} (Team: {partnerName} - {partnerPhone})
                          </option>
                        )
                      })}
                    </optgroup>
                  )}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const assignSelect = document.getElementById('assignSelect')
                  const selectedValue = assignSelect.value
                  
                  if (!selectedValue) {
                    alert('Please select a partner or team member')
                    return
                  }

                  setAssigningPartner(selectedBookingForAssign._id)
                  try {
                    let partnerId = null
                    let teamMemberId = null
                    
                    if (selectedValue.startsWith('partner-')) {
                      partnerId = selectedValue.replace('partner-', '')
                    } else if (selectedValue.startsWith('member-')) {
                      teamMemberId = selectedValue.replace('member-', '')
                      // Get partner from team member
                      const member = teamMembers.find(m => m._id?.toString() === teamMemberId)
                      if (member?.partner) {
                        // Handle both populated partner object and partner ID
                        if (typeof member.partner === 'object' && member.partner._id) {
                          partnerId = member.partner._id.toString()
                        } else {
                          partnerId = member.partner.toString()
                        }
                      }
                    }

                    await adminApi.assignBooking(token, selectedBookingForAssign._id, partnerId, teamMemberId)
                    alert('Assigned successfully!')
                    setShowAssignModal(false)
                    setSelectedBookingForAssign(null)
                    setSelectedAssignValue('')
                    refetch()
                  } catch (error) {
                    alert(error.message || 'Failed to assign')
                  } finally {
                    setAssigningPartner(null)
                  }
                }}
                disabled={assigningPartner === selectedBookingForAssign._id}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigningPartner === selectedBookingForAssign._id ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBookingForAssign(null)
                  setSelectedAssignValue('')
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetailsModal && selectedBookingDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Booking Details</h2>
                <p className="text-sm text-slate-600">Booking ID: {selectedBookingDetails._id?.toString().slice(-8) || 'N/A'}</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingDetailsModal(false)
                  setSelectedBookingDetails(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Customer</h3>
                  <p className="text-slate-900">{selectedBookingDetails.customerName || 'N/A'}</p>
                  <p className="text-sm text-slate-600">{selectedBookingDetails.customerEmail || 'N/A'}</p>
                  <p className="text-sm text-slate-600">{selectedBookingDetails.customerPhone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Service</h3>
                  <p className="text-slate-900">{selectedBookingDetails.serviceName || 'N/A'}</p>
                  <p className="text-sm text-slate-600">Amount: {selectedBookingDetails.amount || '₹0'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Status</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedBookingDetails.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedBookingDetails.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    selectedBookingDetails.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {selectedBookingDetails.status || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Partner</h3>
                  <p className="text-slate-900">{selectedBookingDetails.partnerName || 'Not Assigned'}</p>
                </div>
              </div>

              {/* Pause Details */}
              {selectedBookingDetails.pauseDetails && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <FiClock /> Job Paused
                  </h3>
                  <p className="text-sm text-yellow-700">
                    <strong>Reason:</strong> {selectedBookingDetails.pauseDetails.pauseReason || 'Not specified'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Resume Date:</strong> {selectedBookingDetails.pauseDetails.nextScheduledDate ? new Date(selectedBookingDetails.pauseDetails.nextScheduledDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Resume Time:</strong> {selectedBookingDetails.pauseDetails.nextScheduledTime || 'N/A'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Paused At:</strong> {selectedBookingDetails.pauseDetails.pausedAt ? new Date(selectedBookingDetails.pauseDetails.pausedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}

              {/* Completion Details */}
              {selectedBookingDetails.completedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <FiCheckCircle /> Job Completed
                  </h3>
                  <p className="text-sm text-green-700">
                    <strong>Completed At:</strong> {new Date(selectedBookingDetails.completedAt).toLocaleString()}
                  </p>
                  {selectedBookingDetails.remark && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-green-800">Partner Remark:</p>
                      <p className="text-sm text-green-700 mt-1">{selectedBookingDetails.remark}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Photos */}
              {selectedBookingDetails.photos && selectedBookingDetails.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <FiImage /> Photos ({selectedBookingDetails.photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedBookingDetails.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={photo.startsWith('http') ? photo : `https://nexo.works/${photo.replace(/\\/g, '/')}`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {selectedBookingDetails.videos && selectedBookingDetails.videos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <FiFileText /> Videos ({selectedBookingDetails.videos.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBookingDetails.videos.map((video, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <video
                          src={video.startsWith('http') ? video : `https://nexo.works/${video.replace(/\\/g, '/')}`}
                          controls
                          className="w-full h-full"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotations */}
              {selectedBookingDetails.quotations && selectedBookingDetails.quotations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <FiFile /> Quotations ({selectedBookingDetails.quotations.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedBookingDetails.quotations.map((quotation, index) => (
                      <div key={quotation._id || index} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">#{quotation.quotationNumber || 'N/A'}</h4>
                            <p className="text-sm text-slate-600">Amount: ₹{quotation.totalAmount || 0}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quotation.customerStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              quotation.customerStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              Customer: {quotation.customerStatus || 'pending'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quotation.adminStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                              quotation.adminStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              Admin: {quotation.adminStatus || 'pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                setLoadingQuotation(true)
                                // Fetch full quotation details
                                const response = await adminApi.getQuotationById(token, quotation._id)
                                if (response.success && response.data) {
                                  setSelectedQuotation(response.data)
                                  setShowQuotationModal(true)
                                  setShowBookingDetailsModal(false)
                                } else {
                                  // Fallback to existing quotation data
                                  setSelectedQuotation(quotation)
                                  setShowQuotationModal(true)
                                  setShowBookingDetailsModal(false)
                                }
                              } catch (error) {
                                console.error('Error fetching quotation:', error)
                                // Fallback to existing quotation data
                                setSelectedQuotation(quotation)
                                setShowQuotationModal(true)
                                setShowBookingDetailsModal(false)
                              } finally {
                                setLoadingQuotation(false)
                              }
                            }}
                            disabled={loadingQuotation}
                            className="px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <FiEye /> {loadingQuotation ? 'Loading...' : 'View Details'}
                          </button>
                          {quotation.adminStatus === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await adminApi.approveQuotation(token, quotation._id)
                                    refetch()
                                    setShowBookingDetailsModal(false)
                                    setSelectedBookingDetails(null)
                                  } catch (error) {
                                    alert(error.message || 'Failed to approve quotation')
                                  }
                                }}
                                className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-500/20 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  const reason = prompt('Enter rejection reason:')
                                  if (reason) {
                                    try {
                                      await adminApi.rejectQuotation(token, quotation._id, reason)
                                      refetch()
                                      setShowBookingDetailsModal(false)
                                      setSelectedBookingDetails(null)
                                    } catch (error) {
                                      alert(error.message || 'Failed to reject quotation')
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition"
                              >
                                Reject
                              </button>
                            </>
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

      {/* Quotation Details Modal */}
      {showQuotationModal && selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => {
            setShowQuotationModal(false)
            setSelectedQuotation(null)
          }}
          onAccept={async (quotationId) => {
            try {
              await adminApi.approveQuotation(token, quotationId)
              refetch()
              setShowQuotationModal(false)
              setSelectedQuotation(null)
            } catch (error) {
              console.error('Error approving quotation:', error)
              alert(error.message || 'Failed to approve quotation')
              throw error
            }
          }}
          onReject={async (quotationId, reason) => {
            try {
              await adminApi.rejectQuotation(token, quotationId, reason)
              refetch()
              setShowQuotationModal(false)
              setSelectedQuotation(null)
            } catch (error) {
              console.error('Error rejecting quotation:', error)
              alert(error.message || 'Failed to reject quotation')
              throw error
            }
          }}
          userType="admin"
          token={token}
        />
      )}
    </div>
  )
}

export default CustomerBookings


