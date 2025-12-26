import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  FiSearch,
  FiFileText,
  FiPrinter,
  FiX
} from 'react-icons/fi'
import { adminApi } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceBooking, setInvoiceBooking] = useState(null)
  const invoiceRef = useRef(null)
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

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    
    // Get the logo URL - try PNG first, fallback to SVG
    const logoUrl = `${window.location.origin}/logo.png`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceBooking._id.slice(-8).toUpperCase()}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #1f2937;
              line-height: 1.4;
              background: #ffffff;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              font-size: 12px;
            }
            
            .invoice-container { 
              max-width: 210mm;
              margin: 0 auto;
              padding: 15mm;
              background: #ffffff;
              min-height: 297mm;
              height: 297mm;
              overflow: hidden;
            }
            
            /* Header Section - Compact */
            .invoice-header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .company-section {
              flex: 1;
            }
            
            .company-logo {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            
            .logo-container {
              width: 60px;
              height: 60px;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.1));
            }
            
            .logo-svg-fallback {
              display: none;
              width: 50px;
              height: 50px;
              filter: drop-shadow(0 1px 4px rgba(59, 130, 246, 0.3));
            }
            
            .company-tagline {
              color: #6b7280;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 5px;
            }
            
            .company-details {
              color: #6b7280;
              font-size: 10px;
              line-height: 1.4;
            }
            
            .company-details strong {
              color: #374151;
              font-weight: 600;
            }
            
            .invoice-meta {
              text-align: right;
              flex-shrink: 0;
            }
            
            .invoice-title {
              font-size: 28px;
              font-weight: 300;
              color: #1f2937;
              margin-bottom: 5px;
              letter-spacing: -0.5px;
            }
            
            .invoice-number {
              font-size: 14px;
              font-weight: 600;
              color: #3b82f6;
              margin-bottom: 8px;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            
            .invoice-date {
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 8px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            
            .status-confirmed { background: #dbeafe; color: #1e40af; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #dc2626; }
            .status-failed { background: #fee2e2; color: #dc2626; }
            
            .payment-failed { background: #fee2e2; color: #dc2626; }
            .payment-completed { background: #d1fae5; color: #065f46; }
            .payment-pending { background: #fef3c7; color: #92400e; }
            
            /* Details Section - Compact */
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 25px;
            }
            
            .detail-section h3 {
              font-size: 11px;
              font-weight: 700;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
              padding-bottom: 4px;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .detail-item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 6px;
              padding: 2px 0;
            }
            
            .detail-label {
              font-size: 11px;
              color: #6b7280;
              font-weight: 500;
              min-width: 80px;
            }
            
            .detail-value {
              font-size: 11px;
              color: #1f2937;
              font-weight: 600;
              text-align: right;
              flex: 1;
            }
            
            .customer-name {
              font-size: 13px !important;
              font-weight: 700 !important;
              color: #1f2937 !important;
              margin-bottom: 2px;
            }
            
            /* Table Section - Compact */
            .services-section {
              margin-bottom: 20px;
            }
            
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              background: #ffffff;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .invoice-table thead {
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            }
            
            .invoice-table th {
              padding: 8px 12px;
              text-align: left;
              font-weight: 700;
              font-size: 10px;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .invoice-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 11px;
              vertical-align: top;
            }
            
            .invoice-table tbody tr:last-child td {
              border-bottom: none;
            }
            
            .service-name {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 2px;
            }
            
            .service-description {
              font-size: 10px;
              color: #6b7280;
              line-height: 1.3;
            }
            
            .quantity-cell, .rate-cell, .amount-cell {
              text-align: right;
              font-weight: 600;
              color: #1f2937;
            }
            
            /* Totals Section - Compact */
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }
            
            .totals-table {
              min-width: 250px;
            }
            
            .totals-table tr {
              border-bottom: 1px solid #f3f4f6;
            }
            
            .totals-table tr:last-child {
              border-bottom: none;
            }
            
            .totals-table td {
              padding: 6px 0;
              font-size: 11px;
            }
            
            .totals-label {
              color: #6b7280;
              font-weight: 500;
              padding-right: 25px;
            }
            
            .totals-value {
              text-align: right;
              font-weight: 600;
              color: #1f2937;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            
            .total-row {
              background: linear-gradient(135deg, #1f2937, #374151);
              color: #ffffff !important;
            }
            
            .total-row td {
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 4px;
            }
            
            .total-row .totals-label,
            .total-row .totals-value {
              color: #ffffff !important;
            }
            
            /* Footer - Compact */
            .invoice-footer {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #f3f4f6;
              text-align: center;
            }
            
            .footer-title {
              font-size: 13px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .footer-text {
              color: #6b7280;
              font-size: 10px;
              line-height: 1.4;
              margin-bottom: 4px;
            }
            
            .footer-contact {
              color: #3b82f6;
              font-weight: 600;
            }
            
            .footer-legal {
              font-size: 9px;
              color: #9ca3af;
              margin-top: 10px;
              font-style: italic;
            }
            
            /* Print Styles - A4 Optimized */
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
                font-size: 11px;
              }
              
              .invoice-container { 
                margin: 0; 
                padding: 0;
                box-shadow: none;
                max-width: none;
                height: auto;
                min-height: auto;
              }
              
              .invoice-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
              
              .invoice-details {
                margin-bottom: 20px;
                gap: 20px;
              }
              
              .services-section {
                margin-bottom: 15px;
              }
              
              .totals-section {
                margin-bottom: 15px;
              }
              
              .invoice-footer {
                margin-top: 15px;
                padding-top: 10px;
              }
              
              .logo-container {
                width: 50px !important;
                height: 50px !important;
              }
              
              .logo-img {
                width: 100% !important;
                height: 100% !important;
              }
              
              .logo-svg-fallback {
                width: 40px !important;
                height: 40px !important;
              }
              
              .invoice-title {
                font-size: 24px;
              }
              
              .invoice-table th,
              .invoice-table td {
                padding: 6px 8px;
              }
            }
          </style>
          <script>
            // Handle logo loading with fallback
            function handleLogoError(img) {
              img.style.display = 'none';
              document.querySelector('.logo-svg-fallback').style.display = 'block';
            }
          </script>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header Section -->
            <div class="invoice-header">
              <div class="company-section">
                <div class="company-logo">
                  <div class="logo-container">
                    <img src="${logoUrl}" alt="Company Logo" class="logo-img" onerror="handleLogoError(this)" />
                    <svg class="logo-svg-fallback" width="50" height="50" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z" fill="#3b82f6"/>
                      <path d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z" fill="#3b82f6"/>
                      <path d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z" fill="#3b82f6"/>
                      <path d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z" fill="#3b82f6"/>
                      <circle cx="24" cy="24" r="3" fill="#ffffff"/>
                    </svg>
                  </div>
                </div>
                <div class="company-tagline">Professional Home Services</div>
                <div class="company-details">
                  <strong>Professional Home Services Private Limited</strong><br>
                  CIN: U74999KA2023PTC123456<br>
                  GSTIN: 29ABCDE1234F1Z5<br>
                  <br>
                  <strong>Registered Office:</strong><br>
                  #123, Tech Park, Whitefield<br>
                  Bangalore, Karnataka - 560066<br>
                  <br>
                  <strong>Contact:</strong> +91-80-4567-8900<br>
                  <strong>Email:</strong> support@company.works<br>
                  <strong>Website:</strong> www.nexo.works
                </div>
              </div>
              
              <div class="invoice-meta">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#INV-${invoiceBooking._id.slice(-8).toUpperCase()}</div>
                <div class="invoice-date">
                  <strong>Date:</strong> ${new Date(invoiceBooking.createdAt || invoiceBooking.scheduledDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div class="status-badge status-${invoiceBooking.status}">
                  ${invoiceBooking.status.toUpperCase()}
                </div>
                ${invoiceBooking.paymentStatus && invoiceBooking.paymentStatus === 'failed' ? `
                  <div class="status-badge payment-failed" style="margin-top: 8px;">
                    PAYMENT FAILED
                  </div>
                ` : invoiceBooking.paymentStatus ? `
                  <div class="status-badge payment-${invoiceBooking.paymentStatus}" style="margin-top: 8px;">
                    PAYMENT ${invoiceBooking.paymentStatus.toUpperCase()}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Details Section -->
            <div class="invoice-details">
              <div class="detail-section">
                <h3>Bill To</h3>
                <div class="detail-item">
                  <div class="detail-value customer-name">${invoiceBooking.customerName || 'Customer'}</div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${invoiceBooking.customerPhone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${invoiceBooking.customerEmail || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${invoiceBooking.location?.address || invoiceBooking.address || 'N/A'}</span>
                </div>
                ${invoiceBooking.location?.landmark ? `
                  <div class="detail-item">
                    <span class="detail-label">Landmark:</span>
                    <span class="detail-value">${invoiceBooking.location.landmark}</span>
                  </div>
                ` : ''}
                <div class="detail-item">
                  <span class="detail-label">Pincode:</span>
                  <span class="detail-value">${invoiceBooking.location?.pincode || 'N/A'}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Service Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">#${invoiceBooking._id.slice(-8).toUpperCase()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Date:</span>
                  <span class="detail-value">${new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Service Time:</span>
                  <span class="detail-value">${invoiceBooking.scheduledTime || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Mode:</span>
                  <span class="detail-value">${invoiceBooking.paymentMode?.toUpperCase() || 'N/A'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Status:</span>
                  <span class="detail-value ${invoiceBooking.paymentStatus === 'failed' ? 'style="color: #dc2626; font-weight: 700;"' : invoiceBooking.paymentStatus === 'completed' ? 'style="color: #065f46; font-weight: 700;"' : ''}">${invoiceBooking.paymentStatus ? invoiceBooking.paymentStatus.toUpperCase() : 'N/A'}</span>
                </div>
                ${invoiceBooking.txnid ? `
                  <div class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${invoiceBooking.txnid}</span>
                  </div>
                ` : ''}
                ${invoiceBooking.partnerName && invoiceBooking.partnerName !== 'Still not assigned' ? `
                  <div class="detail-item">
                    <span class="detail-label">Assigned Partner:</span>
                    <span class="detail-value">${invoiceBooking.partnerName}</span>
                  </div>
                ` : `
                  <div class="detail-item">
                    <span class="detail-label">Assigned Partner:</span>
                    <span class="detail-value">Not Assigned</span>
                  </div>
                `}
              </div>
            </div>

            <!-- Services Section -->
            <div class="services-section">
              <h2 class="section-title">Services & Items</h2>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 15%;">Quantity</th>
                    <th style="width: 17.5%;">Rate</th>
                    <th style="width: 17.5%;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceBooking.cartItems && invoiceBooking.cartItems.length > 0 ? 
                    invoiceBooking.cartItems.map(item => `
                      <tr>
                        <td>
                          <div class="service-name">${item.name || item.serviceName || 'Service'}</div>
                          ${item.description ? `<div class="service-description">${item.description}</div>` : ''}
                        </td>
                        <td class="quantity-cell">${item.quantity || 1}</td>
                        <td class="rate-cell">₹${(item.price || item.amount || 0).toLocaleString('en-IN')}</td>
                        <td class="amount-cell">₹${((item.price || item.amount || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td>
                          <div class="service-name">${invoiceBooking.serviceName || 'Service Booking'}</div>
                          <div class="service-description">Professional home service booking</div>
                        </td>
                        <td class="quantity-cell">1</td>
                        <td class="rate-cell">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                        <td class="amount-cell">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    `
                  }
                </tbody>
              </table>
            </div>

            <!-- Totals Section -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="totals-label">Subtotal:</td>
                  <td class="totals-value">₹${(invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ${invoiceBooking.gstAmount ? `
                  <tr>
                    <td class="totals-label">GST (18%):</td>
                    <td class="totals-value">₹${invoiceBooking.gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                ${invoiceBooking.usewallet && invoiceBooking.usewallet > 0 ? `
                  <tr>
                    <td class="totals-label">Wallet Applied:</td>
                    <td class="totals-value">-₹${invoiceBooking.usewallet.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="totals-label">TOTAL AMOUNT:</td>
                  <td class="totals-value">₹${(invoiceBooking.totalAmount || invoiceBooking.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ${invoiceBooking.paymentStatus === 'failed' ? `
                  <tr>
                    <td colspan="2" style="text-align: center; padding: 12px; background: #fee2e2; color: #dc2626; font-weight: 700; border-radius: 4px; margin-top: 8px;">
                      ⚠️ PAYMENT FAILED - AMOUNT NOT RECEIVED
                    </td>
                  </tr>
                ` : ''}
              </table>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
              <div class="footer-title">Thank You for Choosing Our Services!</div>
              <div class="footer-text">
                For any queries regarding this invoice, please contact us at 
                <span class="footer-contact">support@company.works</span> or call 
                <span class="footer-contact">+91-80-4567-8900</span>
              </div>
              <div class="footer-text">
                Visit our website at <span class="footer-contact">www.nexo.works</span> for more services
              </div>
              <div class="footer-legal">
                This is a computer-generated invoice and does not require a physical signature.<br>
                Subject to Bangalore jurisdiction. Terms and conditions apply.
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadInvoice = () => {
    // For now, trigger print which allows "Save as PDF"
    handlePrintInvoice();
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      {/* Cart Items Display */}
                      {booking.cartItems && booking.cartItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-1">Items ({booking.cartItems.length}):</p>
                          <div className="space-y-1">
                            {booking.cartItems.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-600 truncate">• {item.name || item.serviceName || 'Service'}</span>
                                <span className="text-gray-800 font-medium ml-2">₹{item.price || item.total || item.amount || 0}</span>
                              </div>
                            ))}
                            {booking.cartItems.length > 2 && (
                              <p className="text-xs text-gray-500 italic">
                                +{booking.cartItems.length - 2} more item(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
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
                        ₹{booking.totalAmount?.toLocaleString() || booking.amount?.toLocaleString() || '0'}
                      </div>
                      {booking.totalAmount && booking.amount && booking.totalAmount !== booking.amount && (
                        <div className="text-xs text-gray-500">
                          Base: ₹{booking.amount?.toLocaleString()}
                          {booking.gstAmount && (
                            <span className="block">GST: ₹{booking.gstAmount?.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                      {booking.paymentStatus && (
                        <div className={`text-xs mt-1 ${
                          booking.paymentStatus === 'completed' ? 'text-green-600' :
                          booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {booking.paymentStatus}
                        </div>
                      )}
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
                        
                        {/* Invoice Button - Always show */}
                        <button
                          onClick={() => {
                            setInvoiceBooking(booking);
                            setShowInvoiceModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-xs border border-green-200"
                        >
                          <FiFileText className="text-xs" />
                          Invoice
                        </button>
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
                    <p className="text-sm text-gray-600">Service: <span className="font-medium">{selectedBooking.serviceName}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date: <span className="font-medium">{new Date(selectedBooking.scheduledDate).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600">Time: <span className="font-medium">{selectedBooking.scheduledTime}</span></p>
                    <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{selectedBooking.totalAmount || selectedBooking.amount}</span></p>
                  </div>
                </div>
                
                {/* Cart Items in Modal */}
                {selectedBooking.cartItems && selectedBooking.cartItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Booked Items ({selectedBooking.cartItems.length}):</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedBooking.cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name || item.serviceName || 'Service'}</p>
                            {item.quantity && (
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{item.price || item.total || item.amount || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedBooking.totalAmount && selectedBooking.amount && selectedBooking.totalAmount !== selectedBooking.amount && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{selectedBooking.amount}</span>
                        </div>
                        {selectedBooking.gstAmount && (
                          <div className="flex justify-between">
                            <span>GST (18%):</span>
                            <span>₹{selectedBooking.gstAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                          <span>Total:</span>
                          <span>₹{selectedBooking.totalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-slide-up my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiFileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Invoice</h3>
                  <p className="text-blue-100 text-sm">Booking #{invoiceBooking._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-8">
              <div ref={invoiceRef}>
                <div className="invoice-container">
                  {/* Invoice Header */}
                  <div className="invoice-header text-center mb-8 pb-6 border-b-2 border-primary">
                    <div className="invoice-logo flex justify-center items-center mb-6">
                      <div className="logo-display-container">
                        <img 
                          src="/logo.png" 
                          alt="Company Logo" 
                          className="h-24 w-auto max-w-xs object-contain mx-auto"
                          style={{
                            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden flex justify-center items-center">
                          <svg width="96" height="96" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                            <path d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z" fill="#3b82f6"/>
                            <path d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z" fill="#3b82f6"/>
                            <path d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z" fill="#3b82f6"/>
                            <path d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z" fill="#3b82f6"/>
                            <circle cx="24" cy="24" r="3" fill="#ffffff"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">Professional Home Services</p>
                    <p className="text-sm text-gray-500 mt-2">Invoice Date: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Bill To:</h4>
                      <p className="text-gray-700 font-medium">{invoiceBooking.customerName || 'Customer'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceBooking.customerPhone || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceBooking.customerEmail || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoiceBooking.location?.address || invoiceBooking.address || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-800 mb-3">Invoice Details:</h4>
                      <p className="text-sm text-gray-600">Invoice #: <span className="font-medium text-gray-800">INV-{invoiceBooking._id.slice(-8).toUpperCase()}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Booking ID: <span className="font-medium text-gray-800">#{invoiceBooking._id.slice(-8)}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Date: <span className="font-medium text-gray-800">{new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN')}</span></p>
                      <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-medium capitalize ${invoiceBooking.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{invoiceBooking.status}</span></p>
                      {invoiceBooking.paymentStatus && (
                        <p className="text-sm text-gray-600 mt-1">
                          Payment: 
                          <span className={`font-bold ml-1 ${
                            invoiceBooking.paymentStatus === 'failed' ? 'text-red-600' :
                            invoiceBooking.paymentStatus === 'completed' ? 'text-green-600' :
                            invoiceBooking.paymentStatus === 'pending' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {invoiceBooking.paymentStatus === 'failed' ? 'PAYMENT FAILED' : invoiceBooking.paymentStatus.toUpperCase()}
                          </span>
                        </p>
                      )}
                      {invoiceBooking.partnerName && invoiceBooking.partnerName !== 'Still not assigned' ? (
                        <p className="text-sm text-gray-600 mt-1">Partner: <span className="font-medium text-gray-800">{invoiceBooking.partnerName}</span></p>
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">Partner: <span className="font-medium text-red-600">Not Assigned</span></p>
                      )}
                    </div>
                  </div>

                  {/* Service Details Table */}
                  <table className="w-full border-collapse mb-8">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-4 font-bold text-gray-800 border-b-2 border-gray-300">Service Description</th>
                        <th className="text-center p-4 font-bold text-gray-800 border-b-2 border-gray-300">Quantity</th>
                        <th className="text-right p-4 font-bold text-gray-800 border-b-2 border-gray-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceBooking.cartItems && invoiceBooking.cartItems.length > 0 ? (
                        invoiceBooking.cartItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-4 border-b border-gray-200">
                              <p className="font-medium text-gray-800">{item.name || item.serviceName}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                            </td>
                            <td className="p-4 text-center border-b border-gray-200 text-gray-700">{item.quantity || 1}</td>
                            <td className="p-4 text-right border-b border-gray-200 font-medium text-gray-800">₹{item.price || item.amount || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-4 border-b border-gray-200">
                            <p className="font-medium text-gray-800">{invoiceBooking.serviceName || 'Service'}</p>
                            <p className="text-sm text-gray-600 mt-1">Booking Date: {new Date(invoiceBooking.scheduledDate).toLocaleDateString('en-IN')}</p>
                            {invoiceBooking.scheduledTime && (
                              <p className="text-sm text-gray-600">Time: {invoiceBooking.scheduledTime}</p>
                            )}
                          </td>
                          <td className="p-4 text-center border-b border-gray-200 text-gray-700">1</td>
                          <td className="p-4 text-right border-b border-gray-200 font-medium text-gray-800">₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Total Section */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-2 text-gray-700">
                        <span>Subtotal:</span>
                        <span>₹{invoiceBooking.amount || invoiceBooking.totalAmount || 0}</span>
                      </div>
                      {invoiceBooking.gstAmount > 0 && (
                        <div className="flex justify-between py-2 text-gray-700">
                          <span>GST (18%):</span>
                          <span>₹{invoiceBooking.gstAmount}</span>
                        </div>
                      )}
                      {invoiceBooking.usewallet > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Wallet Used:</span>
                          <span>- ₹{invoiceBooking.usewallet}</span>
                        </div>
                      )}
                      {invoiceBooking.discount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Discount:</span>
                          <span>- ₹{invoiceBooking.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg text-primary">
                        <span>Total Amount:</span>
                        <span>₹{invoiceBooking.totalAmount || invoiceBooking.amount || 0}</span>
                      </div>
                      {invoiceBooking.paymentStatus === 'failed' && (
                        <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                          <p className="text-red-700 font-bold">⚠️ PAYMENT FAILED - AMOUNT NOT RECEIVED</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-6 border-t border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">Thank you for choosing our services!</p>
                    <p className="text-xs text-gray-500">For any queries, contact us at support@company.works | +91 1800-XXX-XXXX</p>
                    <p className="text-xs text-gray-400 mt-2">This is a computer-generated invoice and does not require a signature.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-semibold"
                >
                  <FiPrinter size={20} />
                  Print Invoice
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  <FiDownload size={20} />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerBookings