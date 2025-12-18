import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiUserX, FiUsers, FiSearch, FiChevronLeft, FiChevronRight, FiAward, FiDownload } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { exportToExcel } from '../../utils/excelExport.js'

const walletColumns = [
  { header: 'Partner', accessor: 'partnerName' },
  { header: 'Txn ID', accessor: 'transactionId' },
  { header: 'Type', accessor: 'type' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Balance', accessor: 'balance' },
  { header: 'Initiated By', accessor: 'initiatedBy' }
]

const teamMemberColumns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Phone', accessor: 'phone' },
  { header: 'Email', accessor: 'email' },
  { header: 'Partner', accessor: 'partnerName' },
  { header: 'Role', accessor: 'role' },
  { header: 'Status', accessor: 'status' },
  { header: 'Joined Date', accessor: 'joinedDate' }
]

// Team Members List Component
const TeamMembersList = ({ token }) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    
    const fetchTeamMembers = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminApi.fetchTeamMembers(token, { status: 'all' })
        const members = data?.data || data?.teamMembers || []
        setTeamMembers(Array.isArray(members) ? members : [])
      } catch (err) {
        console.error('Fetch team members error:', err)
        setError(err.message || 'Failed to fetch team members')
        setTeamMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [token])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-500">Loading team members...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-rose-500 text-sm">{error}</p>
      </div>
    )
  }

  const formattedTeamMembers = teamMembers.map(member => ({
    id: member._id,
    name: member.name || 'N/A',
    phone: member.phone || 'N/A',
    email: member.email || 'N/A',
    partnerName: member.partner?.profile?.name || member.partner?.Profile?.name || member.partner?.name || 'N/A',
    role: member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'N/A',
    status: member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'N/A',
    joinedDate: member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-IN') : 'N/A'
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {teamMembers.length > 0 && (
          <button
            onClick={() => {
              const exportData = teamMembers.map(member => ({
                'Name': member.name || 'N/A',
                'Phone': member.phone || 'N/A',
                'Email': member.email || 'N/A',
                'Partner Name': member.partner?.profile?.name || member.partner?.Profile?.name || member.partner?.name || 'N/A',
                'Partner Phone': member.partner?.phone || member.partner?.Profile?.phone || 'N/A',
                'Role': member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'N/A',
                'Status': member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'N/A',
                'Qualification': member.qualification || 'N/A',
                'Experience': member.experience || 'N/A',
                'City': member.city || 'N/A',
                'Joined Date': member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-IN') : 'N/A'
              }))
              exportToExcel(exportData, [
                { header: 'Name', accessor: 'Name' },
                { header: 'Phone', accessor: 'Phone' },
                { header: 'Email', accessor: 'Email' },
                { header: 'Partner Name', accessor: 'Partner Name' },
                { header: 'Partner Phone', accessor: 'Partner Phone' },
                { header: 'Role', accessor: 'Role' },
                { header: 'Status', accessor: 'Status' },
                { header: 'Qualification', accessor: 'Qualification' },
                { header: 'Experience', accessor: 'Experience' },
                { header: 'City', accessor: 'City' },
                { header: 'Joined Date', accessor: 'Joined Date' }
              ], 'Team_Members_List', 'Team Members', {
                columnWidths: [20, 15, 25, 25, 15, 15, 12, 20, 15, 15, 15]
              })
            }}
            disabled={teamMembers.length === 0}
            className="text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition px-3 py-1.5 border border-primary rounded-lg hover:bg-primary/10"
            title="Export Team Members to Excel"
          >
            <FiDownload className="w-4 h-4" />
            Export Team Members
          </button>
        )}
      </div>
      <DataTable
        columns={teamMemberColumns}
        data={formattedTeamMembers}
        emptyLabel="No team members found."
      />
    </div>
  )
}

const PartnerControl = () => {
  const { token } = useAdminAuth()
  const navigate = useNavigate()
  
  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState('')
  
  // Data state
  const [partnersData, setPartnersData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletTransactions, setWalletTransactions] = useState([])
  const [walletTransactionsLoading, setWalletTransactionsLoading] = useState(false)
  const [revenueStats, setRevenueStats] = useState({
    totalRegistrationFees: 0,
    totalSecurityDeposit: 0,
    totalToolkitFees: 0,
    totalMGPlanRevenue: 0,
    totalPartnerEarnings: 0,
    totalRevenue: 0
  })

  // Fetch partners with search and pagination
  useEffect(() => {
    if (!token) return
    
    const fetchPartners = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminApi.fetchPartners(token, {
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          status: statusFilter
        })
        setPartnersData(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch partners')
        console.error('Fetch partners error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search query
      const timer = setTimeout(() => {
      fetchPartners()
    }, searchQuery ? 500 : 0) // 500ms debounce for search, immediate for other changes

      return () => clearTimeout(timer)
  }, [currentPage, searchQuery, statusFilter, token, pageSize])

  // Fetch revenue statistics
  useEffect(() => {
    if (!token) return
    
    const fetchRevenueStats = async () => {
      try {
        const data = await adminApi.fetchPartnerRevenueStats(token)
        if (data?.success && data?.stats) {
          setRevenueStats(data.stats)
        }
      } catch (err) {
        console.error('Fetch revenue stats error:', err)
      }
    }

    fetchRevenueStats()
  }, [token])

  // Fetch wallet transactions
  useEffect(() => {
    if (!token) return
    
    const fetchWalletTransactions = async () => {
      setWalletTransactionsLoading(true)
      try {
        const data = await adminApi.fetchAllWalletTransactions(token, { limit: 50 })
        setWalletTransactions(data?.transactions || data?.success || [])
    } catch (err) {
        console.error('Fetch wallet transactions error:', err)
        setWalletTransactions([])
    } finally {
        setWalletTransactionsLoading(false)
      }
    }

    fetchWalletTransactions()
  }, [token])

  // Extract data from backend response
  const partners = partnersData?.partners || []
  const totalPartners = partnersData?.total || 0
  const totalPages = partnersData?.totalPages || 0

  const handlePartnerClick = (partner) => {
    const partnerId = partner._id || partner.id
    if (partnerId) {
      navigate(`/admin/partners/${partnerId}`)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePaymentApproval = async (partnerId, partnerName) => {
    if (!confirm(`Are you sure you want to approve payment for ${partnerName}?`)) {
      return
    }

    try {
      const paymentData = {
        paymentApproved: true,
        approvedBy: 'Admin',
        approvedAt: new Date().toISOString()
      }

      const response = await adminApi.approvePartnerPayment(token, partnerId, paymentData)

      if (response.success) {
        alert(`Payment approved successfully for ${partnerName}!`)
        // Refresh the partners list
        fetchAllPartners()
      } else {
        alert(`Failed to approve payment: ${response.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Payment approval error:', error)
      alert(`Error approving payment: ${error.message}`)
    }
  }

  const handleExportToExcel = () => {
    if (!walletTransactions || walletTransactions.length === 0) {
      alert('No transactions to export')
      return
    }

    // Prepare data for Excel
    const excelData = walletTransactions.map((txn) => ({
      'Transaction ID': txn.transactionId || 'N/A',
      'Partner Name': txn.partnerName || 'N/A',
      'Type': txn.type ? txn.type.charAt(0).toUpperCase() + txn.type.slice(1) : 'N/A',
      'Amount (₹)': txn.amount || 0,
      'Balance (₹)': txn.balance || 0,
      'Description': txn.description || '',
      'Reference': txn.reference || '',
      'Initiated By': txn.initiatedBy || 'System',
      'Date': txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : 'N/A'
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Wallet Transactions')

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Transaction ID
      { wch: 25 }, // Partner Name
      { wch: 12 }, // Type
      { wch: 15 }, // Amount
      { wch: 15 }, // Balance
      { wch: 30 }, // Description
      { wch: 20 }, // Reference
      { wch: 15 }, // Initiated By
      { wch: 25 }  // Date
    ]
    ws['!cols'] = colWidths

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `wallet-transactions-${date}.xlsx`

    // Write and download
    XLSX.writeFile(wb, filename)
  }

  // Use revenue stats from API (calculated from ALL partners, not just current page)
  const totalRegistrationFees = revenueStats.totalRegistrationFees
  const totalSecurityDeposit = revenueStats.totalSecurityDeposit
  const totalToolkitFees = revenueStats.totalToolkitFees
  const totalMGPlanRevenue = revenueStats.totalMGPlanRevenue
  const totalPartnerEarnings = revenueStats.totalPartnerEarnings
  const totalRevenue = revenueStats.totalRevenue

  const partnerStats = [
    {
      label: 'Total Partners',
      value: totalPartners,
      trend: 'Across all service categories',
      description: 'Total registered partners',
      icon: FiUsers
    },
    {
      label: 'Active Partners',
      value: partners.filter(p => {
        const status = p.Profile?.KYC?.status || p.kyc?.status || p.status || 'pending'
        return status === 'approved'
      }).length,
      trend: 'Verified and active',
      icon: FiCheckCircle,
      description: 'Approved partners',
      intent: 'positive'
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      trend: `Reg: ₹${totalRegistrationFees.toLocaleString('en-IN')} | SD: ₹${totalSecurityDeposit.toLocaleString('en-IN')} | TK: ₹${totalToolkitFees.toLocaleString('en-IN')}`,
      description: 'All revenue streams combined',
      icon: FiAward,
      intent: 'positive'
    },
    {
      label: 'Registration Fees',
      value: `₹${totalRegistrationFees.toLocaleString('en-IN')}`,
      trend: 'Partner onboarding fees',
      description: 'Total registration revenue',
      icon: FiCheckCircle,
      intent: 'positive'
    },
    {
      label: 'Security Deposit',
      value: `₹${totalSecurityDeposit.toLocaleString('en-IN')}`,
      trend: 'Refundable deposits',
      description: 'Total security deposits',
      icon: FiCheckCircle,
      intent: 'positive'
    },
    {
      label: 'Toolkit Fees',
      value: `₹${totalToolkitFees.toLocaleString('en-IN')}`,
      trend: 'Equipment & tools',
      description: 'Total toolkit revenue',
      icon: FiCheckCircle,
      intent: 'positive'
    },
    {
      label: 'MG Plan Revenue',
      value: `₹${totalMGPlanRevenue.toLocaleString('en-IN')}`,
      trend: 'From MG plan subscriptions',
      description: 'Total MG plan revenue',
      icon: FiAward,
      intent: 'positive'
    },
    {
      label: 'Suspended Accounts',
      value: partnersData?.suspended ?? 0,
      trend: 'Auto-suspend post SLA breach',
      intent: 'warning',
      icon: FiUserX,
      description: 'Auto-suspend post SLA breach'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <ModuleHeader
          title="Partner Control"
          subtitle="Manage the partner lifecycle end-to-end with unified KYC, wallet management, penalty controls, and payouts."
        />
        <button
          onClick={() => navigate('/admin/partners/manual-register')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2 font-semibold shadow-sm"
        >
          <FiUsers className="w-5 h-5" />
          Add New Partner
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {partnerStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-5">
          {/* Search and Filter Section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, city, pincode..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  Showing {partners.length} of {totalPartners} partners
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
              )}
            </div>
          </div>

          {/* Partner Ledger */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Partner Ledger
              </h2>
              <div className="flex items-center gap-3">
                {error && (
                  <span className="text-xs text-rose-500">
                    {error}
                  </span>
                )}
                {partners.length > 0 && (
                  <button
                    onClick={() => {
                      // Fetch all partners for export (not just current page)
                      const fetchAllPartners = async () => {
                        try {
                          const data = await adminApi.fetchPartners(token, {
                            page: 1,
                            limit: 1000, // Get all partners
                            search: searchQuery,
                            status: statusFilter
                          })
                          const allPartners = data?.partners || []
                          const exportData = allPartners.map(partner => {
                            const mgPlan = partner.mgPlan || partner.mgPlanSummary
                            const leadsGuaranteed = mgPlan?.leads || partner.mgPlanLeadQuota || 0
                            const leadsUsed = partner.mgPlanLeadsUsed || 0
                            const leadsRemaining = Math.max(leadsGuaranteed - leadsUsed, 0)
                            return {
                              'Partner ID': partner.Profile?.id || partner._id || partner.id || 'N/A',
                              'Name': partner.Profile?.name || partner.profile?.name || 'N/A',
                              'Email': partner.Profile?.email || partner.profile?.email || 'N/A',
                              'Phone': partner.Profile?.phone || partner.phone || 'N/A',
                              'Partner Type': (partner.partnerType || partner.Profile?.partnerType || 'individual') === 'franchise' ? 'Franchise' : 'Individual',
                              'City': partner.Profile?.address?.split(',')?.pop()?.trim() || partner.profile?.city || 'N/A',
                              'Total Earnings (₹)': partner.Earnings?.totalEarnings || 0,
                              'KYC Status': partner.Profile?.KYC?.status || partner.kyc?.status || partner.status || 'pending',
                              'Payment Status': (partner.registerAmount > 0 && partner.payId && partner.payId !== 'N/A') ? 'Verified' : 'Pending',
                              'Status': (partner.Profile?.KYC?.status === 'approved' || partner.kyc?.status === 'approved') ? 'Active' : (partner.Profile?.KYC?.status === 'Pending' || partner.kyc?.status === 'Pending') ? 'KYC Pending' : 'Inactive',
                              'Registration Amount (₹)': partner.registerAmount || 0,
                              'Security Deposit (₹)': partner.securityDeposit || 0,
                              'Toolkit Price (₹)': partner.toolkitPrice || 0,
                              'Pay ID': partner.payId || 'N/A',
                              'Paid By': partner.paidBy || 'N/A',
                              'MG Plan': mgPlan?.name || 'No Plan',
                              'Leads Guaranteed': leadsGuaranteed,
                              'Leads Used': leadsUsed,
                              'Leads Remaining': leadsRemaining,
                              'Plan Expires': partner.mgPlanExpiresAt ? new Date(partner.mgPlanExpiresAt).toLocaleDateString('en-IN') : 'N/A'
                            }
                          })
                          exportToExcel(exportData, [
                            { header: 'Partner ID', accessor: 'Partner ID' },
                            { header: 'Name', accessor: 'Name' },
                            { header: 'Email', accessor: 'Email' },
                            { header: 'Phone', accessor: 'Phone' },
                            { header: 'Partner Type', accessor: 'Partner Type' },
                            { header: 'City', accessor: 'City' },
                            { header: 'Total Earnings (₹)', accessor: 'Total Earnings (₹)' },
                            { header: 'KYC Status', accessor: 'KYC Status' },
                            { header: 'Payment Status', accessor: 'Payment Status' },
                            { header: 'Status', accessor: 'Status' },
                            { header: 'Registration Amount (₹)', accessor: 'Registration Amount (₹)' },
                            { header: 'Security Deposit (₹)', accessor: 'Security Deposit (₹)' },
                            { header: 'Toolkit Price (₹)', accessor: 'Toolkit Price (₹)' },
                            { header: 'Pay ID', accessor: 'Pay ID' },
                            { header: 'Paid By', accessor: 'Paid By' },
                            { header: 'MG Plan', accessor: 'MG Plan' },
                            { header: 'Leads Guaranteed', accessor: 'Leads Guaranteed' },
                            { header: 'Leads Used', accessor: 'Leads Used' },
                            { header: 'Leads Remaining', accessor: 'Leads Remaining' },
                            { header: 'Plan Expires', accessor: 'Plan Expires' }
                          ], 'Partners_List', 'Partners', {
                            columnWidths: [15, 25, 25, 15, 15, 20, 18, 15, 15, 20, 18, 18, 15, 15, 15, 15, 15, 15, 15, 15]
                          })
                        } catch (err) {
                          console.error('Export error:', err)
                          alert('Failed to export partners. Please try again.')
                        }
                      }
                      fetchAllPartners()
                    }}
                    disabled={isLoading || partners.length === 0}
                    className="text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition px-3 py-1.5 border border-primary rounded-lg hover:bg-primary/10"
                    title="Export Partners to Excel"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export Partners
                  </button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-500">Loading partners...</p>
              </div>
            ) : partners.length > 0 ? (
            <div className="space-y-4">
                {partners.map((partner) => {
                // Calculate MG Plan status
                const mgPlan = partner.mgPlan || partner.mgPlanSummary
                const leadsGuaranteed = mgPlan?.leads || partner.mgPlanLeadQuota || 0
                const leadsUsed = partner.mgPlanLeadsUsed || 0
                const leadsRemaining = Math.max(leadsGuaranteed - leadsUsed, 0)
                const now = new Date()
                const expiresAt = partner.mgPlanExpiresAt
                const isExpired = expiresAt ? now > new Date(expiresAt) : false
                const daysUntilRenewal = expiresAt 
                  ? Math.ceil((new Date(expiresAt) - now) / (1000 * 60 * 60 * 24))
                  : 0
                const needsRenewal = isExpired || daysUntilRenewal <= 7
                const planStatus = !mgPlan ? 'No Plan' : isExpired ? 'Expired' : needsRenewal ? 'Needs Renewal' : 'Active'
                
                  // Debug: Log partner structure to find partnerType location
                  if (!partner._partnerTypeLogged) {
                    console.log('Partner structure:', {
                      hasPartnerType: !!partner.partnerType,
                      partnerType: partner.partnerType,
                      hasProfilePartnerType: !!partner.Profile?.partnerType,
                      profilePartnerType: partner.Profile?.partnerType,
                      partnerKeys: Object.keys(partner),
                      profileKeys: partner.Profile ? Object.keys(partner.Profile) : []
                    })
                    partner._partnerTypeLogged = true
                  }

                  const partnerData = {
                  id: partner.Profile?.id || partner._id || partner.id,
                  _id: partner.Profile?.id || partner._id || partner.id,
                  name: partner.Profile?.name || partner.profile?.name || 'N/A',
                  city: partner.Profile?.address?.split(',')?.pop()?.trim() || partner.profile?.city || partner.profile?.address?.split(',')?.pop()?.trim() || 'N/A',
                  walletBalance: partner.Earnings?.totalEarnings ? `₹${partner.Earnings.totalEarnings.toLocaleString('en-IN')}` : '₹0',
                  totalEarnings: partner.Earnings?.totalEarnings || 0,
                  complianceScore: (partner.Profile?.KYC?.status === 'approved' || partner.kyc?.status === 'approved' || partner.status === 'approved') ? '100%' : '0%',
                  status: (partner.Profile?.KYC?.status === 'approved' || partner.kyc?.status === 'approved' || partner.status === 'approved') ? 'Active' : (partner.Profile?.KYC?.status === 'pending' || partner.kyc?.status === 'pending' || partner.status === 'pending') ? 'KYC Pending' : 'Inactive',
                  kycStatus: partner.Profile?.KYC?.status || partner.kyc?.status || partner.status || 'pending',
                  email: partner.Profile?.email || partner.profile?.email || 'N/A',
                  phone: partner.Profile?.phone || partner.phone || 'N/A',
                  partnerType: partner.partnerType || partner.Profile?.partnerType || 'individual',
                  // Registration data - access from root level, not Profile
                  registerAmount: partner.registerAmount || 0,
                  securityDeposit: partner.securityDeposit || 0,
                  toolkitPrice: partner.toolkitPrice || 0,
                  payId: partner.payId || 'N/A',
                  paidBy: partner.paidBy || 'N/A',
                  paymentStatus: (partner.registerAmount > 0 && partner.payId && partner.payId !== 'N/A') ? 'Verified' : 'Pending',
                  mgPlan: mgPlan ? {
                    name: mgPlan.name || 'N/A',
                    status: planStatus,
                    leadsGuaranteed,
                    leadsUsed,
                    leadsRemaining,
                    leadsCarryForward: leadsRemaining > 0 ? leadsRemaining : 0,
                    isExpired,
                    daysUntilRenewal: daysUntilRenewal > 0 ? daysUntilRenewal : 0
                  } : null
                }

                  return (
                <div
                      key={partnerData.id}
                      onClick={() => handlePartnerClick(partnerData)}
                  className="block bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                          <p className="text-sm font-semibold text-slate-900">{partnerData.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                            {partnerData.id?.toString().slice(-8) || 'N/A'} • {partnerData.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Total Earnings</p>
                          <p className="text-lg font-semibold text-primary">{partnerData.walletBalance}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          Compliance {partnerData.complianceScore}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold ${
                            partnerData.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                              : partnerData.status === 'KYC Pending' || partnerData.kycStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                          {partnerData.status}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold ${
                        partnerData.partnerType === 'franchise'
                          ? 'bg-purple-500/10 text-purple-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {partnerData.partnerType === 'franchise' ? 'Franchise' : 'Individual'}
                    </span>
                    {/* Registration Data Display */}
                    {partnerData.registerAmount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold">
                        Reg: ₹{partnerData.registerAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                    {partnerData.securityDeposit > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                        SD: ₹{partnerData.securityDeposit.toLocaleString('en-IN')}
                      </span>
                    )}
                    {partnerData.toolkitPrice > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 font-semibold">
                        TK: ₹{partnerData.toolkitPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                        {partnerData.mgPlan && (
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                              partnerData.mgPlan.status === 'Active'
                            ? 'bg-purple-500/10 text-purple-600'
                                : partnerData.mgPlan.status === 'Needs Renewal'
                            ? 'bg-amber-500/10 text-amber-600'
                                : partnerData.mgPlan.status === 'Expired'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }`}
                            title={`${partnerData.mgPlan.name} Plan - ${partnerData.mgPlan.leadsUsed}/${partnerData.mgPlan.leadsGuaranteed} leads used${partnerData.mgPlan.leadsCarryForward > 0 ? ` (${partnerData.mgPlan.leadsCarryForward} carry forward)` : ''}`}
                      >
                        <FiAward className="w-3 h-3" />
                            {partnerData.mgPlan.name} {partnerData.mgPlan.status !== 'No Plan' && `(${partnerData.mgPlan.leadsRemaining} left)`}
                      </span>
                    )}
                    {/* Payment Status and Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                      {partnerData.paymentStatus === 'Pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePaymentApproval(partnerData.id, partnerData.name)
                          }}
                          className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                          title="Approve Payment"
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Approve Payment
                        </button>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        partnerData.paymentStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {partnerData.paymentStatus}
                      </span>
                      {partnerData.payId && partnerData.payId !== 'N/A' && (
                        <span className="text-xs text-slate-500">
                          Pay ID: {partnerData.payId}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        Click to view details →
                      </span>
                    </div>
                  </div>
                </div>
                  )
                })}
                              </div>
                            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <p className="text-slate-500">
                  {searchQuery ? `No partners found matching "${searchQuery}"` : 'No partners found'}
                </p>
                                </div>
                              )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                              </div>
                <div className="flex items-center gap-2">
                    <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                    </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                    <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                    </button>
                      )
                    })}
                  </div>
                    <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          {/* Team Members Section */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Team Members
              </h2>
            </div>
            <TeamMembersList token={token} />
          </div>

          {/* Wallet Transactions */}
          <div className="space-y-4 mt-8">
                        <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Wallet Transactions
              </h2>
              <button 
                onClick={handleExportToExcel}
                disabled={walletTransactionsLoading || !walletTransactions || walletTransactions.length === 0}
                className="text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition"
              >
                <FiDownload className="w-4 h-4" />
                Export to Excel
              </button>
                        </div>
            {walletTransactionsLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-500">Loading transactions...</p>
                  </div>
                ) : (
              <DataTable
                columns={walletColumns}
                data={walletTransactions.map((txn) => ({
                  id: txn.id || txn.transactionId,
                  partnerName: txn.partnerName || 'N/A',
                  transactionId: txn.transactionId || 'N/A',
                  type: txn.type ? txn.type.charAt(0).toUpperCase() + txn.type.slice(1) : 'N/A',
                  amount: `₹${(txn.amount || 0).toLocaleString('en-IN')}`,
                  balance: `₹${(txn.balance || 0).toLocaleString('en-IN')}`,
                  initiatedBy: txn.initiatedBy || 'System'
                }))}
                emptyLabel="No recent transactions recorded."
              />
                )}
              </div>
                  </div>
    </div>
  )
}

export default PartnerControl
