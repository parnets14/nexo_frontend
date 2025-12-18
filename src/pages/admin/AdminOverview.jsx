import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiCheckCircle, FiClock, FiExternalLink, FiTrendingUp, FiUsers, FiBriefcase, FiDollarSign, FiShield, FiBarChart2, FiPieChart, FiInbox, FiUser, FiPackage, FiRefreshCw, FiBell, FiArrowRight } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const quickLinks = [
  { 
    title: 'Review pending KYC', 
    to: '/admin/partners',
    icon: FiShield,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    description: 'Verify partner documents'
  },
  { 
    title: 'Monitor live bookings', 
    to: '/admin/customer-bookings',
    icon: FiBriefcase,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    description: 'Track active orders'
  },
  { 
    title: 'Update spare inventory', 
    to: '/admin/spares',
    icon: FiPackage,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    description: 'Manage stock levels'
  },
  { 
    title: 'Check AMC renewals', 
    to: '/admin/amc',
    icon: FiRefreshCw,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    description: 'Review contracts'
  },
  { 
    title: 'Optimize lead allocation', 
    to: '/admin/leads',
    icon: FiTrendingUp,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    description: 'Assign leads efficiently'
  },
  { 
    title: 'Send broadcast notification', 
    to: '/admin/notifications',
    icon: FiBell,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    description: 'Notify all users'
  }
]

// Empty State Component
const EmptyChartState = ({ icon: Icon, title, description, iconColor = 'text-slate-400', bgColor = 'bg-slate-50' }) => (
  <div className="flex flex-col items-center justify-center h-[250px] py-8">
    <div className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mb-4 relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full opacity-50"></div>
      <Icon className={`${iconColor} text-3xl relative z-10`} />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 text-center max-w-xs">{description}</p>
  </div>
)

const AdminOverview = () => {
  const { data: analytics, isLoading, error } = useAdminData(
    (token) => adminApi.fetchDashboard(token),
    [] // Only fetch once on mount
  )
  const {
    data: counts,
    isLoading: countsLoading,
    error: countsError
  } = useAdminData(
    (token) => adminApi.fetchDashboardCounts(token),
    [] // Only fetch once on mount
  )
  const {
    data: revenueStats,
    isLoading: revenueLoading,
    error: revenueError
  } = useAdminData(
    (token) => adminApi.fetchPartnerRevenueStats(token),
    [] // Only fetch once on mount
  )

  const [chartData, setChartData] = useState({
    monthlyBookings: [],
    monthlyRevenue: [],
    bookingStatusDistribution: [],
    partnerStatusDistribution: [],
    kycStatusDistribution: []
  })

  // Extract data from backend response format
  // getDashboardCounts returns: { success: true, data: { counts: {...}, bookingStats: {...}, charts: {...} } }
  const countsData = counts?.data?.counts || counts?.counts || {}
  const bookingStats = counts?.data?.bookingStats || counts?.bookingStats || counts?.data?.charts?.bookingStats?.[0] || {}
  const monthlyBookingData = counts?.data?.charts?.monthlyBookings || counts?.data?.monthlyBookingData || []
  const monthlyRevenueData = counts?.data?.charts?.monthlyRevenue || counts?.data?.monthlyRevenueData || []
  
  // getDashboardAnalytics returns: { partnerStats: {...}, kycStats: {...}, registrationStats: {...} }
  const partnerStats = analytics?.partnerStats || analytics?.data?.partnerStats || {}
  const kycStats = analytics?.kycStats || analytics?.data?.kycStats || {}
  const registrationStats = analytics?.registrationStats || analytics?.data?.registrationStats || {}

  // Process chart data
  useEffect(() => {
    // Only process when both loading states are false
    if (countsLoading || isLoading) return
    
    // Process data even if empty to initialize charts
    try {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      // Monthly Bookings Chart
      const monthlyBookingsMap = {}
      const currentDate = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        monthlyBookingsMap[monthKey] = { 
          month: monthNames[date.getMonth()], 
          bookings: 0 
        }
      }
      
      if (Array.isArray(monthlyBookingData) && monthlyBookingData.length > 0) {
        monthlyBookingData.forEach(item => {
          if (item && item._id && item._id.year && item._id.month) {
            const monthKey = `${item._id.year}-${item._id.month}`
            if (monthlyBookingsMap[monthKey]) {
              monthlyBookingsMap[monthKey].bookings = item.count || item.bookings || 0
            }
          } else if (item && item.month) {
            // Handle alternative format: { month: "Jan", bookings: 5 }
            const monthKey = Object.keys(monthlyBookingsMap).find(key => 
              monthlyBookingsMap[key].month === item.month
            )
            if (monthKey) {
              monthlyBookingsMap[monthKey].bookings = item.bookings || item.count || 0
            }
          }
        })
      }
      
      // Monthly Revenue Chart
      const monthlyRevenueMap = {}
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        monthlyRevenueMap[monthKey] = { 
          month: monthNames[date.getMonth()], 
          revenue: 0 
        }
      }
      
      if (Array.isArray(monthlyRevenueData) && monthlyRevenueData.length > 0) {
        monthlyRevenueData.forEach(item => {
          if (item && item._id && item._id.year && item._id.month) {
            const monthKey = `${item._id.year}-${item._id.month}`
            if (monthlyRevenueMap[monthKey]) {
              monthlyRevenueMap[monthKey].revenue = item.revenue || item.totalRevenue || 0
            }
          } else if (item && item.month) {
            // Handle alternative format: { month: "Jan", revenue: 5000 }
            const monthKey = Object.keys(monthlyRevenueMap).find(key => 
              monthlyRevenueMap[key].month === item.month
            )
            if (monthKey) {
              monthlyRevenueMap[monthKey].revenue = item.revenue || item.totalRevenue || 0
            }
          }
        })
      }

      // Booking Status Distribution
      const bookingStatusDistribution = []
      if (bookingStats && typeof bookingStats === 'object') {
        const statusColors = {
          completed: '#10b981',
          pending: '#f59e0b',
          accepted: '#3b82f6',
          in_progress: '#8b5cf6',
          inProgress: '#8b5cf6',
          cancelled: '#ef4444',
          canceled: '#ef4444',
          rejected: '#dc2626',
          assigned: '#6366f1',
          started: '#ec4899'
        }
        
        // Handle both object format { completed: 5, pending: 3 } and array format
        if (Array.isArray(bookingStats)) {
          bookingStats.forEach(stat => {
            if (stat && typeof stat === 'object') {
              Object.entries(stat).forEach(([status, count]) => {
                if (typeof count === 'number' && count > 0 && status !== 'total') {
                  bookingStatusDistribution.push({
                    name: status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                    value: count,
                    color: statusColors[status] || statusColors[status.toLowerCase()] || '#6b7280'
                  })
                }
              })
            }
          })
        } else {
          Object.entries(bookingStats).forEach(([status, count]) => {
            if (typeof count === 'number' && count > 0 && status !== 'total' && status !== 'bookings') {
              const displayName = status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1').trim()
              bookingStatusDistribution.push({
                name: displayName,
                value: count,
                color: statusColors[status] || statusColors[status.toLowerCase()] || '#6b7280'
              })
            }
          })
        }
      }

      // Partner Status Distribution
      const partnerStatusDistribution = []
      const partnerStatusData = partnerStats?.byStatus || partnerStats?.data?.byStatus || {}
      if (partnerStatusData && typeof partnerStatusData === 'object' && Object.keys(partnerStatusData).length > 0) {
        const statusColors = {
          active: '#10b981',
          pending: '#f59e0b',
          inactive: '#6b7280',
          suspended: '#ef4444',
          verified: '#10b981',
          unverified: '#f59e0b',
          'null': '#3b82f6', // Default color for null status
          'undefined': '#3b82f6'
        }
        
        const statusLabels = {
          active: 'Active',
          pending: 'Pending',
          inactive: 'Inactive',
          suspended: 'Suspended',
          verified: 'Verified',
          unverified: 'Unverified',
          'null': 'Active', // Treat null as Active (default status)
          'undefined': 'Active'
        }
        
        Object.entries(partnerStatusData).forEach(([status, count]) => {
          if (count && count > 0 && status !== 'total') {
            // Handle null/undefined status - treat as Active
            const normalizedStatus = (status === null || status === 'null' || status === 'undefined' || status === undefined) ? 'active' : status.toLowerCase()
            const displayName = statusLabels[normalizedStatus] || statusLabels[status] || 
                               (status === null || status === 'null' || status === undefined ? 'Active' : 
                                status.charAt(0).toUpperCase() + status.slice(1))
            
            partnerStatusDistribution.push({
              name: displayName,
              value: count,
              color: statusColors[normalizedStatus] || statusColors[status] || statusColors[status?.toLowerCase()] || '#3b82f6'
            })
          }
        })
      }

      // KYC Status Distribution
      const kycStatusDistribution = []
      const kycStatusData = kycStats?.byStatus || kycStats?.data?.byStatus || {}
      if (kycStatusData && typeof kycStatusData === 'object' && Object.keys(kycStatusData).length > 0) {
        const statusColors = {
          Verified: '#10b981',
          verified: '#10b981',
          Pending: '#f59e0b',
          pending: '#f59e0b',
          Rejected: '#ef4444',
          rejected: '#ef4444',
          'Not Submitted': '#6b7280',
          'not submitted': '#6b7280',
          'Not submitted': '#6b7280',
          null: '#6b7280',
          '': '#6b7280'
        }
        
        Object.entries(kycStatusData).forEach(([status, count]) => {
          if (count && count > 0 && status !== 'total') {
            const displayName = status === null || status === 'null' || status === '' ? 'Not Submitted' : 
                               status.charAt(0).toUpperCase() + status.slice(1)
            kycStatusDistribution.push({
              name: displayName,
              value: count,
              color: statusColors[status] || statusColors[status?.toLowerCase()] || '#6b7280'
            })
          }
        })
      }
      
      // Also check verificationStats as fallback
      if (kycStatusDistribution.length === 0 && kycStats?.verificationStats) {
        const verificationStats = kycStats.verificationStats
        if (verificationStats.verified > 0 || verificationStats.pending > 0) {
          if (verificationStats.verified > 0) {
            kycStatusDistribution.push({
              name: 'Verified',
              value: verificationStats.verified,
              color: '#10b981'
            })
          }
          if (verificationStats.pending > 0) {
            kycStatusDistribution.push({
              name: 'Pending',
              value: verificationStats.pending,
              color: '#f59e0b'
            })
          }
        }
      }

      setChartData({
        monthlyBookings: Object.values(monthlyBookingsMap),
        monthlyRevenue: Object.values(monthlyRevenueMap),
        bookingStatusDistribution,
        partnerStatusDistribution,
        kycStatusDistribution
      })
    } catch (error) {
      console.error('Error processing chart data:', error)
      // Set empty data on error to prevent crashes
      setChartData({
        monthlyBookings: [],
        monthlyRevenue: [],
        bookingStatusDistribution: [],
        partnerStatusDistribution: [],
        kycStatusDistribution: []
      })
    }
  }, [counts, countsLoading, isLoading, analytics, bookingStats, partnerStats, kycStats, monthlyBookingData, monthlyRevenueData])

  // Calculate partner status summary
  const getPartnerTrend = () => {
    if (!partnerStats?.byStatus) return null
    
    const statusData = partnerStats.byStatus
    
    // Filter out null keys and create meaningful summary
    const validStatuses = Object.entries(statusData)
      .filter(([key]) => {
        // Filter out 'total' and null/undefined keys
        if (key === 'total' || key === null || key === undefined) return false
        // Filter out string 'null' or 'undefined'
        if (key === 'null' || key === 'undefined') return false
        return true
      })
      .map(([key, value]) => ({ key, value }))
      .filter(item => item.value > 0)
    
    // Handle null status (when backend returns null as key)
    const nullStatusCount = statusData[null] || statusData['null'] || statusData[undefined] || statusData['undefined'] || 0
    
    if (validStatuses.length === 0 && nullStatusCount > 0) {
      // If only null status exists, treat as active
      return `${nullStatusCount} active`
    }
    
    if (validStatuses.length > 0) {
      const summary = validStatuses.slice(0, 2).map(({ key, value }) => {
        const statusLabel = key === 'active' || key === 'Active' ? 'active' :
                           key === 'pending' || key === 'Pending' ? 'pending' :
                           key === 'inactive' || key === 'Inactive' ? 'inactive' :
                           key === 'suspended' || key === 'Suspended' ? 'suspended' :
                           key.toLowerCase()
        return `${value} ${statusLabel}`
      }).join(', ')
      return summary
    }
    
    // If we have null status but no valid statuses, show it as active
    if (nullStatusCount > 0) {
      return `${nullStatusCount} active`
    }
    
    return null
  }

  // Calculate booking completion rate
  const getBookingTrend = () => {
    const total = countsData?.bookings ?? bookingStats?.total ?? 0
    const completed = bookingStats?.completed ?? 0
    if (total > 0 && completed > 0) {
      const percentage = Math.round((completed / total) * 100)
      return `${completed} completed (${percentage}%)`
    }
    return bookingStats?.completed ? `${bookingStats.completed} completed` : null
  }

  const revenueData = revenueStats?.stats || {}
  
  const metrics = [
    {
      label: 'Total Bookings',
      value: countsData?.bookings ?? bookingStats?.total ?? 0,
      trend: getBookingTrend(),
      description: 'Across all categories and cities',
      icon: FiBriefcase,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Partners',
      value: countsData?.partners ?? partnerStats?.total ?? 0,
      trend: getPartnerTrend(),
      description: 'Active and pending partners',
      icon: FiUsers,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      label: 'Total Revenue',
      value: `₹${((revenueData.totalRevenue || 0) / 1000).toFixed(0)}K`,
      trend: `Reg: ₹${((revenueData.totalRegistrationFees || 0) / 1000).toFixed(0)}K | MG: ₹${((revenueData.totalMGPlanRevenue || 0) / 1000).toFixed(0)}K`,
      description: 'Revenue from approved partners',
      icon: FiDollarSign,
      color: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-emerald-600',
      intent: 'positive'
    },
    {
      label: 'Registration Fees',
      value: `₹${((revenueData.totalRegistrationFees || 0) / 1000).toFixed(0)}K`,
      trend: `SD: ₹${((revenueData.totalSecurityDeposit || 0) / 1000).toFixed(0)}K | TK: ₹${((revenueData.totalToolkitFees || 0) / 1000).toFixed(0)}K`,
      description: 'Revenue from approved partners only',
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      intent: 'positive'
    },
    {
      label: 'MG Plan Revenue',
      value: `₹${((revenueData.totalMGPlanRevenue || 0) / 1000).toFixed(0)}K`,
      trend: revenueData.totalMGPlanRevenue > 0 ? 'From subscriptions' : 'No subscriptions yet',
      description: 'Minimum guarantee plans',
      icon: FiTrendingUp,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      intent: 'positive'
    },
    {
      label: 'Total Users',
      value: countsData?.users ?? 0,
      trend: null,
      description: 'Registered customers',
      icon: FiUser,
      color: 'bg-cyan-500',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      label: 'KYC Pending',
      value: kycStats?.verificationStats?.pending ?? kycStats?.byStatus?.Pending ?? kycStats?.byStatus?.pending ?? 0,
      trend: kycStats?.verificationStats?.verified ? `${kycStats.verificationStats.verified} verified` : null,
      description: 'Awaiting verification',
      intent: (kycStats?.verificationStats?.pending ?? kycStats?.byStatus?.Pending ?? kycStats?.byStatus?.pending ?? 0) > 10 ? 'warning' : 'positive',
      icon: FiShield,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-amber-600'
    }
  ]

  const pendingKycCount = kycStats?.verificationStats?.pending ?? kycStats?.byStatus?.Pending ?? kycStats?.byStatus?.pending ?? 0
  const pendingBookings = bookingStats?.pending ?? 0

  const moduleHealth = [
    {
      name: 'Partner Control',
      status: pendingKycCount > 10 ? 'Needs attention' : 'On track',
      icon: pendingKycCount > 10 ? FiAlertTriangle : FiCheckCircle,
      description:
        pendingKycCount > 10
          ? `${pendingKycCount} KYC verifications pending.`
          : 'All partner wallet reconciliations and KYCs are on schedule.',
      tone: pendingKycCount > 10 ? 'warning' : 'success'
    },
    {
      name: 'Customer Bookings',
      status: pendingBookings > 0 ? `${pendingBookings} pending` : 'Within SLA',
      icon: pendingBookings > 5 ? FiAlertTriangle : FiCheckCircle,
      description:
        pendingBookings > 5
          ? `${pendingBookings} bookings pending assignment.`
          : 'All in-progress bookings are meeting SLA thresholds.',
      tone: pendingBookings > 5 ? 'warning' : 'success'
    },
    {
      name: 'Service Management',
      status: countsData?.subServices ? `${countsData.subServices} services` : 'Active',
      icon: FiClock,
      description:
        countsData?.subServices
          ? `${countsData.subServices} sub-services available across all categories.`
          : 'Service catalog is active.',
      tone: 'success'
    }
  ]

  const renderBody = () => {
    if (isLoading || countsLoading) {
      return (
        <div className="flex justify-center items-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Syncing live metrics...</p>
          </div>
        </div>
      )
    }

    if (error || countsError) {
      return (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          Unable to fetch dashboard analytics. {error || countsError}
        </div>
      )
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 sm:p-8 border border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="text-lg font-bold text-slate-800">
                  ₹{((revenueStats?.stats?.totalRevenue || bookingStats?.totalRevenue || countsData?.totalRevenue || 0) / 100000).toFixed(1)}L
                </p>
                {revenueStats?.stats && (
                  <p className="text-xs text-slate-500 mt-1">
                    Reg: ₹{((revenueStats.stats.totalRegistrationFees || 0) / 1000).toFixed(0)}K | 
                    MG: ₹{((revenueStats.stats.totalMGPlanRevenue || 0) / 1000).toFixed(0)}K
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Monthly Bookings Trend */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBriefcase className="text-blue-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Monthly Bookings Trend</h2>
              </div>
              {chartData.monthlyBookings.length > 0 && chartData.monthlyBookings.some(item => item.bookings > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={FiBarChart2}
                  title="No Booking Data"
                  description="Booking data will appear here once customers start making bookings."
                  iconColor="text-blue-400"
                  bgColor="bg-blue-50"
                />
              )}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FiDollarSign className="text-emerald-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Monthly Revenue Trend</h2>
              </div>
              {chartData.monthlyRevenue.length > 0 && chartData.monthlyRevenue.some(item => item.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData.monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => `₹${(value / 1000).toFixed(1)}K`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={FiTrendingUp}
                  title="No Revenue Data"
                  description="Revenue trends will be displayed here once transactions are recorded."
                  iconColor="text-emerald-400"
                  bgColor="bg-emerald-50"
                />
              )}
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiTrendingUp className="text-purple-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Booking Status Distribution</h2>
              </div>
              {chartData.bookingStatusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.bookingStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.bookingStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={FiPieChart}
                  title="No Booking Status Data"
                  description="Booking status breakdown will appear here once bookings are created."
                  iconColor="text-purple-400"
                  bgColor="bg-purple-50"
                />
              )}
            </div>
          </div>

          {/* Partner Status Distribution */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FiUsers className="text-indigo-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Partner Status Distribution</h2>
              </div>
              {chartData.partnerStatusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.partnerStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.partnerStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={FiUsers}
                  title="No Partner Data"
                  description="Partner status distribution will be shown here once partners are registered."
                  iconColor="text-indigo-400"
                  bgColor="bg-indigo-50"
                />
              )}
            </div>
          </div>

        </div>

        {/* Module Health & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Module Health
            </h2>
            <div className="space-y-4">
              {moduleHealth.map((module) => {
                const Icon = module.icon
                const textColor =
                  module.tone === 'warning'
                    ? 'text-amber-500'
                    : module.tone === 'info'
                    ? 'text-primary'
                    : 'text-emerald-500'
                return (
                  <div
                    key={module.name}
                    className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${textColor} bg-slate-100`}
                      >
                        <Icon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
                          {module.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">{module.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-lg">
                  <FiArrowRight className="text-white text-lg" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
              </div>
              
              <div className="grid gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                <Link
                  key={link.title}
                  to={link.to}
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl border border-slate-200 hover:border-transparent hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-white hover:bg-gradient-to-r hover:from-white hover:to-slate-50"
                    >
                      {/* Icon with gradient background */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                        <Icon className="text-white text-lg" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{link.description}</p>
                        )}
                      </div>
                      
                      {/* Arrow icon */}
                      <div className="flex-shrink-0">
                        <FiArrowRight className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 text-lg" />
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
                </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ModuleHeader
        title="Operations Overview"
        subtitle="Real-time health snapshot across partners, bookings, workflows, and financial controls."
      />
      {renderBody()}
    </div>
  )
}

export default AdminOverview


