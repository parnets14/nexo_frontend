import React, { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiDollarSign, FiMessageCircle, FiX, FiSearch, FiUser, FiMapPin, FiFileText, FiUserPlus, FiDownload } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import Invoice from '../../components/Invoice.jsx'
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
    render: (value) => (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
          value === 'In Progress'
            ? 'bg-amber-500/10 text-amber-600'
            : value === 'Completed'
            ? 'bg-emerald-500/10 text-emerald-600'
            : value === 'Payment Pending'
            ? 'bg-primary/10 text-primary'
            : 'bg-slate-200 text-slate-700'
        }`}
      >
        {value}
      </span>
    )
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

  const { data: bookingData, isLoading, error, refetch } = useAdminData(
    (token) => adminApi.fetchBookings(token, { page: 1, limit: 20 }),
    [] // Empty deps array - only fetch once on mount
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
  const bookings = bookingData?.data || []
  const bookingCount = bookingData?.count || bookings.length || 0
  const monthlyBookingCount = bookingData?.monthlyBookingCount || {}

  // Calculate stats from actual booking data
  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length
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
                  const exportData = bookings.length > 0 ? bookings.map((b) => {
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
    </div>
  )
}

export default CustomerBookings


