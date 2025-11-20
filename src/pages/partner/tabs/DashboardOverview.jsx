import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiDollarSign, FiBriefcase, FiTrendingUp, FiPackage, FiUsers, FiCreditCard, FiClock, FiAlertCircle, FiActivity, FiZap, FiAward, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
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

const DashboardOverview = () => {
  const { partner, token } = usePartnerAuth()
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
    teamMembers: 0
  })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    monthlyJobs: [],
    monthlyEarnings: [],
    statusDistribution: [],
    transactionTrend: []
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [avgResponseTime, setAvgResponseTime] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return

      try {
        // Fetch wallet
        const walletRes = await partnerApi.getWallet(token)
        const walletBalance = walletRes?.data?.balance || walletRes?.success?.balance || 0
        const transactions = walletRes?.data?.transactions || walletRes?.transactions || []

        // Fetch bookings
        const bookingsRes = await partnerApi.getBookings(token)
        let allBookings = []
        if (bookingsRes?.bookings) {
          Object.values(bookingsRes.bookings).forEach(statusBookings => {
            if (Array.isArray(statusBookings)) {
              allBookings = allBookings.concat(statusBookings)
            }
          })
        } else if (Array.isArray(bookingsRes)) {
          allBookings = bookingsRes
        } else if (Array.isArray(bookingsRes?.data)) {
          allBookings = bookingsRes.data
        } else if (Array.isArray(bookingsRes?.bookings)) {
          allBookings = bookingsRes.bookings
        }
        
        const totalJobs = allBookings.length
        const completedJobs = allBookings.filter(b => b?.status === 'completed').length
        const pendingJobs = allBookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b?.status)).length

        // Fetch team members count
        let teamMembersCount = 0
        try {
          const teamRes = await partnerApi.getTeamMembers(token)
          const teamMembers = teamRes?.data || teamRes || []
          teamMembersCount = Array.isArray(teamMembers) ? teamMembers.filter(tm => tm.status === 'active').length : 0
        } catch (err) {
          console.error('Error fetching team members:', err)
        }

        // Calculate total earnings from completed jobs
        const totalEarnings = allBookings
          .filter(b => b?.status === 'completed')
          .reduce((sum, b) => sum + (b?.amount || b?.totalAmount || 0), 0)

        setStats({
          walletBalance,
          totalJobs,
          completedJobs,
          pendingJobs,
          totalEarnings,
          teamMembers: teamMembersCount
        })

        // Prepare chart data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentDate = new Date()
        
        // Monthly Jobs Data (last 6 months)
        const monthlyJobsMap = {}
        const monthlyEarningsMap = {}
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
          monthlyJobsMap[monthKey] = { month: monthNames[date.getMonth()], jobs: 0, earnings: 0 }
          monthlyEarningsMap[monthKey] = { month: monthNames[date.getMonth()], earnings: 0 }
        }

        allBookings.forEach(booking => {
          if (booking.createdAt) {
            const date = new Date(booking.createdAt)
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
            if (monthlyJobsMap[monthKey]) {
              monthlyJobsMap[monthKey].jobs++
              if (booking.status === 'completed') {
                monthlyJobsMap[monthKey].earnings += (booking.amount || booking.totalAmount || 0)
                monthlyEarningsMap[monthKey].earnings += (booking.amount || booking.totalAmount || 0)
              }
            }
          }
        })

        const monthlyJobs = Object.values(monthlyJobsMap)
        const monthlyEarnings = Object.values(monthlyEarningsMap)

        // Status Distribution
        const statusCounts = {
          completed: allBookings.filter(b => b?.status === 'completed').length,
          pending: allBookings.filter(b => b?.status === 'pending').length,
          accepted: allBookings.filter(b => b?.status === 'accepted').length,
          in_progress: allBookings.filter(b => b?.status === 'in_progress').length,
          rejected: allBookings.filter(b => b?.status === 'rejected').length
        }

        const statusDistribution = [
          { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
          { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
          { name: 'Accepted', value: statusCounts.accepted, color: '#3b82f6' },
          { name: 'In Progress', value: statusCounts.in_progress, color: '#8b5cf6' },
          { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' }
        ].filter(item => item.value > 0)

        // Transaction Trend (last 30 days)
        const transactionTrendMap = {}
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        for (let i = 29; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateKey = date.toISOString().split('T')[0]
          transactionTrendMap[dateKey] = { date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), credit: 0, debit: 0 }
        }

        transactions.forEach(txn => {
          if (txn.createdAt || txn.timestamp) {
            const date = new Date(txn.createdAt || txn.timestamp)
            if (date >= thirtyDaysAgo) {
              const dateKey = date.toISOString().split('T')[0]
              if (transactionTrendMap[dateKey]) {
                if (txn.type === 'credit') {
                  transactionTrendMap[dateKey].credit += (txn.amount || 0)
                } else if (txn.type === 'debit') {
                  transactionTrendMap[dateKey].debit += (txn.amount || 0)
                }
              }
            }
          }
        })

        const transactionTrend = Object.values(transactionTrendMap)

        // Get recent bookings (last 5)
        const recentBookingsList = allBookings
          .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
          .slice(0, 5)

        // Get recent transactions (last 5)
        const recentTransactionsList = transactions
          .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
          .slice(0, 5)

        // Calculate average response time (time between booking creation and acceptance)
        const acceptedBookings = allBookings.filter(b => 
          b.status === 'accepted' && 
          b.createdAt && 
          (b.acceptedAt || b.updatedAt)
        )
        
        let calculatedAvgResponseTime = null
        if (acceptedBookings.length > 0) {
          const responseTimes = acceptedBookings.map(booking => {
            const createdAt = new Date(booking.createdAt)
            const acceptedAt = new Date(booking.acceptedAt || booking.updatedAt)
            return acceptedAt - createdAt // Time in milliseconds
          })
          
          const avgTimeMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          const avgTimeHours = avgTimeMs / (1000 * 60 * 60)
          
          if (avgTimeHours < 1) {
            const avgTimeMinutes = avgTimeMs / (1000 * 60)
            calculatedAvgResponseTime = `${Math.round(avgTimeMinutes)}m`
          } else {
            calculatedAvgResponseTime = `${avgTimeHours.toFixed(1)}h`
          }
        }

        setChartData({
          monthlyJobs,
          monthlyEarnings,
          statusDistribution,
          transactionTrend
        })
        setRecentBookings(recentBookingsList)
        setRecentTransactions(recentTransactionsList)
        setAvgResponseTime(calculatedAvgResponseTime)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color, children }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference
    
    const colorMap = {
      'blue': { stroke: '#3b82f6', text: 'text-blue-600' },
      'green': { stroke: '#10b981', text: 'text-green-600' },
      'purple': { stroke: '#8b5cf6', text: 'text-purple-600' },
      'emerald': { stroke: '#10b981', text: 'text-emerald-600' },
      'orange': { stroke: '#f59e0b', text: 'text-orange-600' },
      'indigo': { stroke: '#6366f1', text: 'text-indigo-600' }
    }
    
    const colors = colorMap[color] || colorMap.blue
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Calculate percentages
  const completionRate = stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0
  const pendingRate = stats.totalJobs > 0 ? Math.round((stats.pendingJobs / stats.totalJobs) * 100) : 0
  const walletUtilization = Math.min(Math.round((stats.walletBalance / 100000) * 100), 100) // Assuming 1L as reference
  const teamUtilization = Math.min(Math.round((stats.teamMembers / 10) * 100), 100) // Assuming max 10 members
  const earningsProgress = Math.min(Math.round((stats.totalEarnings / 100000) * 100), 100) // Assuming 1L as reference

  const statCards = [
    {
      label: 'Wallet Balance',
      value: `₹${stats.walletBalance.toLocaleString('en-IN')}`,
      icon: FiDollarSign,
      color: 'blue',
      bgColor: 'bg-blue-500',
      link: '/partner/dashboard/wallet',
      percentage: walletUtilization,
      subtitle: 'Balance'
    },
    {
      label: 'Total Jobs',
      value: stats.totalJobs,
      icon: FiBriefcase,
      color: 'green',
      bgColor: 'bg-green-500',
      link: '/partner/dashboard/jobs',
      percentage: completionRate,
      subtitle: `${completionRate}% completed`
    },
    {
      label: 'Completed Jobs',
      value: stats.completedJobs,
      icon: FiTrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-500',
      link: '/partner/dashboard/jobs',
      percentage: completionRate,
      subtitle: 'Success rate'
    },
    {
      label: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`,
      icon: FiDollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      link: '/partner/dashboard/jobs',
      percentage: earningsProgress,
      subtitle: 'Total revenue'
    },
    {
      label: 'Pending Jobs',
      value: stats.pendingJobs,
      icon: FiBriefcase,
      color: 'orange',
      bgColor: 'bg-orange-500',
      link: '/partner/dashboard/jobs',
      percentage: pendingRate,
      subtitle: `${pendingRate}% pending`
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      icon: FiUsers,
      color: 'indigo',
      bgColor: 'bg-indigo-500',
      link: '/partner/dashboard/team',
      percentage: teamUtilization,
      subtitle: 'Active members'
    }
  ]

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header Section with Enhanced Gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-4 sm:p-6 border border-primary/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2 flex items-center gap-2">
              <span>Dashboard Overview</span>
              <span className="text-lg sm:text-xl">📊</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Welcome back, <span className="font-semibold text-primary">{partner?.profile?.name || partner?.name || 'Partner'}</span>! 👋
            </p>
            {/* Quick stats summary */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-800">{completionRate}%</span> completion rate
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-800">{stats.totalJobs}</span> total jobs
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-800">₹{stats.totalEarnings.toLocaleString('en-IN')}</span> earned
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <div className="font-medium text-slate-700 mb-0.5">Today</div>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid with Enhanced Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 border border-slate-200 hover:border-primary/50 group transform hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Decorative background gradient */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bgColor} opacity-5 rounded-full -mr-12 -mt-12 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${card.bgColor} p-2.5 sm:p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-lg sm:text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-0.5">{card.label}</h3>
                        {card.subtitle && (
                          <p className="text-xs text-slate-400">{card.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors mb-4">
                      {card.value}
                    </p>
                  </div>
                  
                  {/* Circular Progress */}
                  <div className="flex-shrink-0">
                    <CircularProgress 
                      percentage={card.percentage} 
                      size={70} 
                      strokeWidth={6}
                      color={card.color}
                    >
                      <span className={`text-xs sm:text-sm font-bold ${card.color === 'blue' ? 'text-blue-600' : card.color === 'green' ? 'text-green-600' : card.color === 'purple' ? 'text-purple-600' : card.color === 'emerald' ? 'text-emerald-600' : card.color === 'orange' ? 'text-orange-600' : 'text-indigo-600'}`}>
                        {card.percentage}%
                      </span>
                    </CircularProgress>
                  </div>
                </div>
                
                {/* Bottom accent bar */}
                <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${card.bgColor} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${card.percentage}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts Section - Responsive Grid with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Jobs Trend */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBriefcase className="text-blue-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Monthly Jobs Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.monthlyJobs}>
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
                <Bar dataKey="jobs" fill="#3b82f6" name="Jobs" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs Status Distribution */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTrendingUp className="text-purple-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Jobs Status Distribution</h2>
            </div>
            {chartData.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusDistribution.map((entry, index) => (
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
              <div className="flex flex-col items-center justify-center h-[250px] text-slate-400">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <FiTrendingUp className="text-2xl text-purple-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No data available</p>
                <p className="text-xs text-slate-400 mt-1">Start completing jobs to see statistics</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Earnings Trend */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="text-green-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Monthly Earnings Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Earnings (₹)"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Trend */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiTrendingUp className="text-orange-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Transaction Trend (Last 30 Days)</h2>
            </div>
            {chartData.transactionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData.transactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="credit" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Credits" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="debit" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Debits" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-slate-400">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <FiTrendingUp className="text-2xl text-orange-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No transaction data</p>
                <p className="text-xs text-slate-400 mt-1">Transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Insights */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-lg">
                  <FiZap className="text-white text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Performance Insights</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Average Response Time */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-700">Avg Response Time</span>
                  <FiClock className="text-blue-600 text-sm" />
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {avgResponseTime || '0h'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {avgResponseTime ? 'Based on accepted jobs' : 'No accepted jobs yet'}
                </p>
              </div>

              {/* Success Rate */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700">Success Rate</span>
                  <FiAward className="text-emerald-600 text-sm" />
                </div>
                <p className="text-2xl font-bold text-emerald-900">
                  {completionRate}%
                </p>
                <p className="text-xs text-emerald-600 mt-1">{stats.completedJobs} completed</p>
              </div>

              {/* Monthly Growth */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-purple-700">Monthly Growth</span>
                  <FiTrendingUp className="text-purple-600 text-sm" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {chartData.monthlyJobs.length > 1 ? 
                    Math.round(((chartData.monthlyJobs[chartData.monthlyJobs.length - 1]?.jobs || 0) / Math.max(chartData.monthlyJobs[chartData.monthlyJobs.length - 2]?.jobs || 1, 1)) * 100) : 0}%
                </p>
                <p className="text-xs text-purple-600 mt-1">vs last month</p>
              </div>

              {/* Active Jobs */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-700">Active Jobs</span>
                  <FiActivity className="text-orange-600 text-sm" />
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.pendingJobs}
                </p>
                <p className="text-xs text-orange-600 mt-1">In progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiActivity className="text-purple-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Recent Activity</h2>
              </div>
              <Link to="/partner/dashboard/jobs" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => {
                  const statusColors = {
                    completed: 'bg-green-100 text-green-700 border-green-200',
                    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    accepted: 'bg-blue-100 text-blue-700 border-blue-200',
                    in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
                    rejected: 'bg-red-100 text-red-700 border-red-200'
                  }
                  const statusColor = statusColors[booking.status] || statusColors.pending
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 ${booking.status === 'completed' ? 'bg-green-500' : booking.status === 'in_progress' ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {booking.serviceName || booking.serviceCategory || 'Service'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor} font-medium`}>
                            {booking.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">
                          ₹{(booking.amount || booking.totalAmount || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FiBriefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-lg">
              <FiZap className="text-white text-lg" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/partner/dashboard/wallet"
              className="group p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 text-center transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FiDollarSign className="text-xl sm:text-2xl text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-blue-800">View Wallet</p>
              </div>
          </Link>
          <Link
            to="/partner/dashboard/jobs"
              className="group p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 text-center transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-green-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FiBriefcase className="text-xl sm:text-2xl text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-green-800">Manage Jobs</p>
              </div>
          </Link>
          <Link
            to="/partner/dashboard/spare-parts"
              className="group p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 text-center transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FiPackage className="text-xl sm:text-2xl text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-purple-800">Spare Parts</p>
              </div>
          </Link>
          <Link
            to="/partner/dashboard/transactions"
              className="group p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-300 text-center transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-orange-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <FiTrendingUp className="text-xl sm:text-2xl text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-orange-800">Transactions</p>
              </div>
          </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions Summary */}
      {recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FiCreditCard className="text-emerald-600 text-lg" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Recent Transactions</h2>
              </div>
              <Link to="/partner/dashboard/transactions" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <FiArrowRight className="text-xs" />
              </Link>
            </div>
            
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((txn, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {txn.type === 'credit' ? (
                        <FiTrendingUp className={`text-lg ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <FiTrendingUp className={`text-lg rotate-180 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {txn.description || txn.type === 'credit' ? 'Credit' : 'Debit'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{(txn.amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardOverview
