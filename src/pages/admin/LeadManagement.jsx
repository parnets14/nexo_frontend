import React, { useState, useMemo } from 'react'
import { 
  FiAward, 
  FiCompass, 
  FiGitMerge, 
  FiTarget, 
  FiFilter, 
  FiDownload,
  FiRefreshCw,
  FiX,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPlus,
  FiSearch,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiFileText
} from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const LeadManagement = () => {
  const { token } = useAdminAuth()
  const [filters, setFilters] = useState({
    status: 'all',
    city: '',
    allocationStrategy: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showGetLeadModal, setShowGetLeadModal] = useState(false)
  const [formStep, setFormStep] = useState(1) // 1 = partner verification, 2 = lead form
  const [partnerSearch, setPartnerSearch] = useState('')
  const [verifiedPartner, setVerifiedPartner] = useState(null)
  const [searchingPartner, setSearchingPartner] = useState(false)
  const [leadFormData, setLeadFormData] = useState({
    category: '',
    service: '',
    subService: '',
    city: '',
    address: '',
    landmark: '',
    pincode: '',
    value: '',
    allocationStrategy: 'rule_based',
    priority: 'medium',
    description: ''
  })
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [subServices, setSubServices] = useState([])
  const [submittingLead, setSubmittingLead] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadDetails, setShowLeadDetails] = useState(false)

  // Create filter params
  const filterParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 50
    }
    
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status
    }
    if (filters.city && filters.city.trim()) {
      params.city = filters.city.trim()
    }
    if (filters.allocationStrategy && filters.allocationStrategy !== 'all') {
      params.allocationStrategy = filters.allocationStrategy
    }
    
    return params
  }, [filters.status, filters.city, filters.allocationStrategy, currentPage])

  const filterParamsKey = useMemo(() => JSON.stringify(filterParams), [filterParams])

  // Fetch data
  const { data: leadsData, isLoading: leadsLoading, error: leadsError, refresh: refreshLeads } = useAdminData(
    (token) => adminApi.fetchLeads(token, filterParams),
    [filterParamsKey]
  )

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAdminData(
    (token) => adminApi.fetchLeadAnalytics(token),
    []
  )

  const { data: bidsData, isLoading: bidsLoading, error: bidsError } = useAdminData(
    (token) => adminApi.fetchBids(token, { page: 1, limit: 50 }),
    []
  )

  const isLoading = leadsLoading || analyticsLoading || bidsLoading
  const error = leadsError || analyticsError || bidsError

  // Extract data
  const leads = Array.isArray(leadsData?.data) ? leadsData.data : []
  const bids = Array.isArray(bidsData?.data) ? bidsData.data : []
  const analytics = analyticsData || {}
  const pagination = leadsData?.pagination || {}

  // Debug logging
  React.useEffect(() => {
    if (leadsData) {
      console.log('🔍 Lead Management - API Response:', {
        success: leadsData.success,
        hasData: !!leadsData.data,
        dataType: Array.isArray(leadsData.data) ? 'array' : typeof leadsData.data,
        dataLength: leadsData.data?.length || 0,
        pagination: leadsData.pagination,
        firstLead: leadsData.data?.[0]
      })
    }
    if (leadsError) {
      console.error('❌ Lead Management - Error:', leadsError)
    }
    console.log('🔍 Extracted leads:', leads.length, leads)
  }, [leadsData, leadsError, leads])

  // Stats
  const stats = [
    {
      label: 'Lead Pool',
      value: analytics.active || 0,
      trend: analytics.highValueLeads ? `${analytics.highValueLeads} high-value leads awaiting bids` : null,
      icon: FiTarget,
      description: analytics.cityCount ? `Across ${analytics.cityCount} cities` : 'Active leads'
    },
    {
      label: 'Conversion Rate',
      value: analytics.conversion || '0%',
      trend: analytics.convertedLeads30d ? `${analytics.convertedLeads30d} converted (30d)` : null,
      icon: FiAward,
      description: 'Rolling 30-day window'
    },
    {
      label: 'Avg Allocation Time',
      value: analytics.allocationTime || '0m 0s',
      trend: 'Includes dispute overrides',
      icon: FiCompass,
      description: 'From ingestion to assignment'
    },
    {
      label: 'Bid Health',
      value: analytics.bidParticipation || '0.0 bids/lead',
      trend: 'Maintaining fair marketplace',
      icon: FiGitMerge,
      description: 'Ensures SLA coverage'
    }
  ]

  // Lead columns
  const leadColumns = [
    { header: 'Lead ID', accessor: 'leadId' },
    { header: 'Source', accessor: 'source', render: (value) => {
      const sourceColors = {
        'Partner Registration': 'bg-purple-500/10 text-purple-600',
        'Plan Subscription': 'bg-blue-500/10 text-blue-600',
        'Customer Enquiry': 'bg-green-500/10 text-green-600',
        'Booking': 'bg-indigo-500/10 text-indigo-600',
        'Manual': 'bg-gray-500/10 text-gray-600'
      }
      return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${sourceColors[value] || 'bg-slate-200 text-slate-700'}`}>
          {value}
        </span>
      )
    }},
    { 
      header: 'Partner/Customer', 
      accessor: 'partnerName',
      render: (value, row) => {
        const name = row.partnerName || row.customerName || 'N/A'
        const phone = row.partnerPhone || row.customerPhone || ''
        const email = row.partnerEmail || row.customerEmail || ''
        
        if (name === 'N/A') return <span className="text-slate-400">N/A</span>
        
        return (
          <div className="text-sm">
            <div className="font-semibold text-slate-900">{name}</div>
            {phone && <div className="text-xs text-slate-500">{phone}</div>}
            {email && <div className="text-xs text-slate-400">{email}</div>}
          </div>
        )
      }
    },
    { header: 'Service', accessor: 'service' },
    { header: 'City', accessor: 'city' },
    { header: 'Value', accessor: 'value' },
    { header: 'Allocation', accessor: 'allocationStrategy' },
    { header: 'Assigned To', accessor: 'assignedPartner' },
    { header: 'Bids', accessor: 'bids' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          'Pending': 'bg-slate-500/10 text-slate-600',
          'Awaiting Bid': 'bg-amber-500/10 text-amber-600',
          'Bidding': 'bg-blue-500/10 text-blue-600',
          'Assigned': 'bg-indigo-500/10 text-indigo-600',
          'Converted': 'bg-emerald-500/10 text-emerald-600',
          'Escalated': 'bg-rose-500/10 text-rose-600',
          'Cancelled': 'bg-gray-500/10 text-gray-600',
          'Expired': 'bg-orange-500/10 text-orange-600'
        }
        return (
          <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[value] || 'bg-slate-200 text-slate-700'}`}>
            {value}
          </span>
        )
      }
    }
  ]

  // Bid columns
  const bidColumns = [
    { header: 'Lead', accessor: 'lead' },
    { header: 'Partner', accessor: 'partner' },
    { header: 'Bid Amount', accessor: 'amount' },
    { header: 'Score', accessor: 'score' },
    { header: 'ETA', accessor: 'eta' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          'Pending': 'bg-amber-500/10 text-amber-600',
          'Accepted': 'bg-emerald-500/10 text-emerald-600',
          'Rejected': 'bg-rose-500/10 text-rose-600',
          'Withdrawn': 'bg-gray-500/10 text-gray-600'
        }
        return (
          <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[value] || 'bg-slate-200 text-slate-700'}`}>
            {value}
          </span>
        )
      }
    }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      city: '',
      allocationStrategy: 'all'
    })
    setCurrentPage(1)
  }

  const handleExportBids = () => {
    try {
      let csvContent = 'Lead Bidding Activity Export\n'
      csvContent += `Exported At: ${new Date().toLocaleString('en-IN')}\n\n`
      csvContent += 'Lead,Partner,Bid Amount,Score,ETA,Status,Submitted At\n'
      
      bids.forEach(bid => {
        const submittedAt = bid.submittedAt ? new Date(bid.submittedAt).toLocaleString('en-IN') : 'N/A'
        csvContent += `${bid.lead},${bid.partner},${bid.amount},${bid.score},${bid.eta},${bid.status},${submittedAt}\n`
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bids-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting bids:', error)
      alert('Failed to export bids. Please try again.')
    }
  }

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    if (!window.confirm(`Change lead status to ${newStatus}?`)) return
    
    try {
      await adminApi.updateLeadStatus(token, leadId, newStatus)
      alert('Lead status updated successfully!')
      refreshLeads()
    } catch (err) {
      alert('Failed to update lead status: ' + (err.message || 'Unknown error'))
    }
  }

  // Fetch categories when modal opens
  React.useEffect(() => {
    if (showGetLeadModal && formStep === 2 && categories.length === 0) {
      const loadCategories = async () => {
        try {
          const data = await adminApi.fetchCategories(token)
          if (data?.data) {
            setCategories(data.data)
          }
        } catch (err) {
          console.error('Error loading categories:', err)
        }
      }
      loadCategories()
    }
  }, [showGetLeadModal, formStep, token])

  // Handle partner search
  const handleSearchPartner = async () => {
    if (!partnerSearch.trim()) {
      alert('Please enter partner phone number or ID')
      return
    }

    setSearchingPartner(true)
    try {
      const partnersData = await adminApi.fetchPartners(token, { 
        search: partnerSearch.trim(),
        limit: 10 
      })
      
      if (partnersData?.data && partnersData.data.length > 0) {
        const partner = partnersData.data[0]
        setVerifiedPartner(partner)
        setFormStep(2)
      } else {
        alert('Partner not found. Please check the phone number or ID.')
      }
    } catch (err) {
      alert('Error searching partner: ' + (err.message || 'Unknown error'))
    } finally {
      setSearchingPartner(false)
    }
  }

  // Handle category change
  const handleCategoryChange = async (categoryId) => {
    setLeadFormData(prev => ({ ...prev, category: categoryId, service: '', subService: '' }))
    setServices([])
    setSubServices([])
    
    if (categoryId) {
      try {
        // Fetch services for this category
        const category = categories.find(c => c._id === categoryId)
        if (category?.services) {
          setServices(category.services || [])
        }
      } catch (err) {
        console.error('Error loading services:', err)
      }
    }
  }

  // Handle service change
  const handleServiceChange = (serviceId) => {
    setLeadFormData(prev => ({ ...prev, service: serviceId, subService: '' }))
    setSubServices([])
    
    if (serviceId) {
      const service = services.find(s => s._id === serviceId)
      if (service?.subServices) {
        setSubServices(service.subServices || [])
      }
    }
  }

  // Handle lead form submission
  const handleSubmitLead = async (e) => {
    e.preventDefault()
    
    if (!verifiedPartner) {
      alert('Please verify partner first')
      return
    }

    if (!leadFormData.category || !leadFormData.city || !leadFormData.value) {
      alert('Please fill all required fields')
      return
    }

    setSubmittingLead(true)
    try {
      // Create a booking first (required for lead creation)
      // For now, we'll create a lead directly with manual data
      const leadData = {
        partnerId: verifiedPartner._id,
        category: leadFormData.category,
        service: leadFormData.service,
        subService: leadFormData.subService,
        city: leadFormData.city,
        address: leadFormData.address,
        landmark: leadFormData.landmark,
        pincode: leadFormData.pincode,
        value: parseFloat(leadFormData.value),
        allocationStrategy: leadFormData.allocationStrategy,
        priority: leadFormData.priority,
        description: leadFormData.description
      }

      // Create lead via API
      const response = await adminApi.createManualLead(token, leadData)
      
      if (response.success) {
        alert('Lead created successfully!')
        setShowGetLeadModal(false)
        setFormStep(1)
        setVerifiedPartner(null)
        setPartnerSearch('')
        setLeadFormData({
          category: '',
          service: '',
          subService: '',
          city: '',
          address: '',
          landmark: '',
          pincode: '',
          value: '',
          allocationStrategy: 'rule_based',
          priority: 'medium',
          description: ''
        })
        refreshLeads()
      }
    } catch (err) {
      alert('Failed to create lead: ' + (err.message || 'Unknown error'))
    } finally {
      setSubmittingLead(false)
    }
  }

  const renderLeadActions = (lead) => {
    // Map display status to backend status format
    const statusMap = {
      'Pending': 'pending',
      'Awaiting Bid': 'awaiting_bid',
      'Bidding': 'bidding',
      'Assigned': 'assigned',
      'Converted': 'converted',
      'Escalated': 'escalated',
      'Cancelled': 'cancelled',
      'Expired': 'expired'
    }
    
    const currentStatus = statusMap[lead.status] || lead.status?.toLowerCase().replace(' ', '_') || 'pending'
    
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedLead(lead)
            setShowLeadDetails(true)
          }}
          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
          title="View Details"
        >
          <FiFileText className="w-4 h-4" />
        </button>
        <select
          value={currentStatus}
          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
          className="text-xs px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="pending">Pending</option>
          <option value="awaiting_bid">Awaiting Bid</option>
          <option value="bidding">Bidding</option>
          <option value="assigned">Assigned</option>
          <option value="converted">Converted</option>
          <option value="escalated">Escalated</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>
    )
  }

  return (
    <div>
      <ModuleHeader
        title="Lead Management"
        subtitle="Automate allocation logic, manage partner bidding, and maximize conversion across acquisition funnels."
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                if (window.confirm('This will create leads from all pending bookings. Continue?')) {
                  try {
                    await adminApi.syncBookingsToLeads(token)
                    alert('Leads synced successfully!')
                    refreshLeads()
                  } catch (err) {
                    alert('Failed to sync leads: ' + (err.message || 'Unknown error'))
                  }
                }
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition inline-flex items-center gap-2"
            >
              <FiRefreshCw /> Sync from Bookings
            </button>
            <button className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition inline-flex items-center gap-2">
              <FiSettings /> Configure Allocation Rules
          </button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshLeads}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4 text-slate-600" />
            </button>
            {(filters.status !== 'all' || filters.city || filters.allocationStrategy !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition inline-flex items-center gap-1"
              >
                <FiX className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="awaiting_bid">Awaiting Bid</option>
              <option value="bidding">Bidding</option>
              <option value="assigned">Assigned</option>
              <option value="converted">Converted</option>
              <option value="escalated">Escalated</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              City
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Filter by city..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Allocation Strategy
            </label>
            <select
              value={filters.allocationStrategy}
              onChange={(e) => handleFilterChange('allocationStrategy', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="all">All Strategies</option>
              <option value="instant_assign">Instant Assign</option>
              <option value="tiered_bid">Tiered Bid</option>
              <option value="rule_based">Rule Based</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Leads Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {error && <span className="text-xs text-rose-500">Error: {error}</span>}
              {isLoading && <span className="text-xs text-slate-400">Loading leads...</span>}
              {!isLoading && !error && (
                <span className="text-xs text-slate-500">
                  {pagination.total || 0} total leads
                </span>
              )}
            </div>
          </div>
          
          <DataTable
            columns={leadColumns}
            data={leads}
            emptyLabel="No leads available. Try syncing from bookings or creating a manual lead."
            renderActions={renderLeadActions}
          />
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bidding Activity */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Bidding Activity
              </h2>
              <button 
                onClick={handleExportBids}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <FiDownload className="w-3 h-3" /> Download Logs
              </button>
            </div>
            <DataTable
              columns={bidColumns}
              data={bids}
              emptyLabel="No bids registered."
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">Allocation Intelligence</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Blend skill matrices, SLA history, proximity, and wallet health before assigning leads.
              Override manually when enterprise SLAs demand it.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Auto-standby pool when primary declines</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Bid ceilings to maintain margin guardrails</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Quality scores updated post each job</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Get Lead Modal */}
      {showGetLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FiTarget className="w-5 h-5" />
                {formStep === 1 ? 'Verify Partner' : 'Create Lead'}
              </h2>
              <button
                onClick={() => {
                  setShowGetLeadModal(false)
                  setFormStep(1)
                  setVerifiedPartner(null)
                  setPartnerSearch('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {formStep === 1 ? (
                // Step 1: Partner Verification
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Step 1:</strong> Verify the partner by entering their phone number or partner ID.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FiUser className="w-4 h-4 inline mr-1" />
                      Partner Phone Number or ID
                    </label>
                    <input
                      type="text"
                      value={partnerSearch}
                      onChange={(e) => setPartnerSearch(e.target.value)}
                      placeholder="Enter phone number (e.g., 9876543210) or partner ID"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchPartner()}
                    />
                  </div>

                  {verifiedPartner && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-900">Partner Verified</span>
                      </div>
                      <p className="text-sm text-emerald-700">
                        <strong>Name:</strong> {verifiedPartner.profile?.name || 'N/A'}<br />
                        <strong>Phone:</strong> {verifiedPartner.phone || 'N/A'}<br />
                        <strong>Status:</strong> {verifiedPartner.profileStatus || 'N/A'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowGetLeadModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSearchPartner}
                      disabled={searchingPartner || !partnerSearch.trim()}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {searchingPartner ? (
                        <>
                          <FiClock className="w-4 h-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <FiSearch className="w-4 h-4" />
                          Verify Partner
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Lead Form
                <form onSubmit={handleSubmitLead} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Step 2:</strong> Fill in the lead details below.
                    </p>
                    {verifiedPartner && (
                      <p className="text-xs text-blue-600 mt-1">
                        Partner: {verifiedPartner.profile?.name || verifiedPartner.phone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={leadFormData.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {services.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Service
                        </label>
                        <select
                          value={leadFormData.service}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select Service</option>
                          {services.map(svc => (
                            <option key={svc._id} value={svc._id}>{svc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {subServices.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Sub Service
                        </label>
                        <select
                          value={leadFormData.subService}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, subService: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select Sub Service</option>
                          {subServices.map(sub => (
                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <FiMapPin className="w-4 h-4 inline mr-1" />
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={leadFormData.city}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                        placeholder="Enter city"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <FiDollarSign className="w-4 h-4 inline mr-1" />
                        Lead Value (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={leadFormData.value}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, value: e.target.value }))}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter lead value"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Allocation Strategy
                      </label>
                      <select
                        value={leadFormData.allocationStrategy}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, allocationStrategy: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="rule_based">Rule Based</option>
                        <option value="instant_assign">Instant Assign</option>
                        <option value="tiered_bid">Tiered Bid</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={leadFormData.priority}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <FiMapPin className="w-4 h-4 inline mr-1" />
                        Address
                      </label>
                      <input
                        type="text"
                        value={leadFormData.address}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter full address"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={leadFormData.landmark}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, landmark: e.target.value }))}
                        placeholder="Enter landmark"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={leadFormData.pincode}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Enter pincode"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <FiFileText className="w-4 h-4 inline mr-1" />
                        Description
                      </label>
                      <textarea
                        value={leadFormData.description}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter lead description or notes"
                        rows="3"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGetLeadModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {submittingLead ? (
                        <>
                          <FiClock className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="w-4 h-4" />
                          Create Lead
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLeadDetails(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Lead Details</h2>
              <button
                onClick={() => setShowLeadDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lead Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Lead ID</label>
                  <div className="text-sm font-semibold text-slate-900">{selectedLead.leadId}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Source</label>
                  <div className="text-sm text-slate-700">{selectedLead.source}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Service</label>
                  <div className="text-sm text-slate-700">{selectedLead.service}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">City</label>
                  <div className="text-sm text-slate-700">{selectedLead.city}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Value</label>
                  <div className="text-sm font-semibold text-primary">{selectedLead.value}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <div className="text-sm text-slate-700">{selectedLead.status}</div>
                </div>
              </div>

              {/* Partner/Customer Information */}
              {(selectedLead.partnerName || selectedLead.customerName) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    {selectedLead.source === 'Partner Registration' || selectedLead.source === 'Plan Subscription' ? 'Partner Information' : 'Customer Information'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                      <div className="text-sm text-slate-900 font-semibold">
                        {selectedLead.partnerName || selectedLead.customerName}
                      </div>
                    </div>
                    {(selectedLead.partnerPhone || selectedLead.customerPhone) && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                        <div className="text-sm text-slate-700">
                          {selectedLead.partnerPhone || selectedLead.customerPhone}
                        </div>
                      </div>
                    )}
                    {(selectedLead.partnerEmail || selectedLead.customerEmail) && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                        <div className="text-sm text-slate-700">
                          {selectedLead.partnerEmail || selectedLead.customerEmail}
                        </div>
                      </div>
                    )}
                    {selectedLead.partnerId && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Partner ID</label>
                        <div className="text-sm text-slate-700">{selectedLead.partnerId}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedLead.description && (
                <div className="border-t border-slate-200 pt-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Description</label>
                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                    {selectedLead.description}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Additional Information</label>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLead.metadata, null, 2)}</pre>
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

export default LeadManagement
