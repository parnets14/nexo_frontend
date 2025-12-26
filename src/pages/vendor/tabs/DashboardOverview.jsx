import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useVendorAuth } from '../../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../../services/vendorApi.js'
import { 
  FiPackage, 
  FiShoppingCart, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiActivity,
  FiRefreshCw,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi'
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
  const { token, vendor } = useVendorAuth()
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    monthlyRevenue: [],
    bookingStatus: [],
    monthlyBookings: []
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [trends, setTrends] = useState({
    revenueTrend: 0,
    bookingsTrend: 0
  })

  const fetchDashboardData = useCallback(async () => {
    if (!token) return

    try {
      const [sparePartsRes, bookingsRes, transactionRes] = await Promise.all([
        vendorApi.getSpareParts(token),
        vendorApi.getBookings(token),
        vendorApi.getTransactionStats(token)
      ])

      const spareParts = sparePartsRes.data || sparePartsRes.spareParts || []
      const bookings = bookingsRes.data || bookingsRes.bookings || []
      const transactionData = transactionRes.data || transactionRes || {}

      // Calculate statistics
      const totalRevenue = transactionData.totalCredits || 0
      const totalDebits = transactionData.totalDebits || 0
      const balance = transactionData.balance || (totalRevenue - totalDebits)
      
      const completedBookings = bookings.filter(b => b.status === 'completed').length
      const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
      
      // Calculate average order value
      const completedOrders = bookings.filter(b => b.status === 'completed' && b.totalAmount)
      const avgOrderValue = completedOrders.length > 0
        ? completedOrders.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / completedOrders.length
        : 0

      // Low stock items (assuming stock < 10 is low)
      const lowStockItems = spareParts.filter(sp => (sp.stock || 0) < 10).length

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenueData = calculateMonthlyData(bookings, [])
      
      // Booking status distribution
      const bookingStatusData = [
        { name: 'Completed', value: completedBookings, color: '#10b981' },
        { name: 'Pending', value: pendingBookings, color: '#f59e0b' },
        { name: 'Cancelled', value: cancelledBookings, color: '#ef4444' }
      ]

      // Monthly bookings trend
      const monthlyBookingsData = calculateMonthlyBookings(bookings)

      // Calculate trends (compare with previous period)
      const revenueTrend = calculateTrend(monthlyRevenueData)
      const bookingsTrend = calculateTrend(monthlyBookingsData)

      setStats({
        totalSpareParts: spareParts.length,
        totalBookings: bookings.length,
        totalRevenue: balance,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        monthlyRevenue: monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue || 0,
        averageOrderValue: avgOrderValue,
        lowStockItems
      })

      setChartData({
        monthlyRevenue: monthlyRevenueData,
        bookingStatus: bookingStatusData,
        monthlyBookings: monthlyBookingsData
      })

      setTrends({
        revenueTrend,
        bookingsTrend
      })

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5))

      // Get recent transactions (last 5)
      try {
        const transactionsRes = await vendorApi.getTransactions(token)
        const transactionList = transactionsRes.data || transactionsRes.transactions || []
        setRecentTransactions(transactionList.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch recent transactions:', error)
        setRecentTransactions([])
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [token]) // Only depend on token

  useEffect(() => {
    if (!token) return
    
    fetchDashboardData()
    // Refresh every 5 minutes instead of 2 minutes to reduce API calls
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 300000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [token, fetchDashboardData]) // Include fetchDashboardData in dependencies

  const calculateMonthlyData = (bookings, transactions = []) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      // Calculate revenue for this month
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.orderDate || b.createdAt)
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear() &&
               b.status === 'completed'
      })
      
      const revenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      
      months.push({
        month: monthName,
        revenue: Math.round(revenue)
      })
    }
    
    return months
  }

  const calculateMonthlyBookings = (bookings) => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.orderDate || b.createdAt)
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear()
      })
      
      months.push({
        month: monthName,
        bookings: monthBookings.length
      })
    }
    
    return months
  }

  const calculateTrend = (data) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1]?.revenue || data[data.length - 1]?.bookings || 0
    const previous = data[data.length - 2]?.revenue || data[data.length - 2]?.bookings || 0
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: FiDollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      trend: trends.revenueTrend,
      subtitle: `₹${stats.monthlyRevenue.toLocaleString('en-IN')} this month`
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FiShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: trends.bookingsTrend,
      subtitle: `${stats.completedBookings} completed`
    },
    {
      title: 'Spare Parts',
      value: stats.totalSpareParts,
      icon: FiPackage,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      subtitle: stats.lowStockItems > 0 ? `${stats.lowStockItems} low stock` : 'All in stock'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingBookings,
      icon: FiClock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      subtitle: 'Requires attention'
    }
  ]

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {vendor?.name || 'Vendor'}!
          </h1>
          <p className="text-slate-600">Here's what's happening with your business today</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                <stat.icon className={`${stat.color} text-xl`} />
              </div>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  stat.trend >= 0 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {stat.trend >= 0 ? (
                    <FiTrendingUp className="w-3 h-3" />
                  ) : (
                    <FiTrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.trend)}%
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
              {stat.value}
            </p>
            {stat.subtitle && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                <p className="text-xs text-slate-500">{stat.subtitle}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Revenue Trend</h2>
              <p className="text-sm text-slate-600">Last 6 months</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          {chartData.monthlyRevenue.length > 0 && chartData.monthlyRevenue.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center py-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FiBarChart2 className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">No Revenue Data</p>
              <p className="text-sm text-slate-500">Revenue data will appear here once you start receiving payments</p>
            </div>
          )}
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Booking Status</h2>
              <p className="text-sm text-slate-600">Distribution overview</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiActivity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          {chartData.bookingStatus.length > 0 && chartData.bookingStatus.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.bookingStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.bookingStatus.map((entry, index) => (
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
            <div className="flex flex-col items-center justify-center h-[250px] text-center py-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FiActivity className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-1">No Booking Data</p>
              <p className="text-sm text-slate-500">Booking statistics will appear here once you receive orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
            <Link
              to="/vendor/dashboard/bookings"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              View all
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FiShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">No Recent Bookings</p>
                <p className="text-sm text-slate-500 mb-4">Your recent bookings will appear here</p>
                <Link
                  to="/vendor/dashboard/add-spare-part"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  <FiPackage className="w-4 h-4" />
                  Add Spare Parts
                </Link>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking._id || booking.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      booking.status === 'completed' ? 'bg-emerald-100' :
                      booking.status === 'pending' ? 'bg-amber-100' :
                      booking.status === 'cancelled' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <FiShoppingCart className={`w-4 h-4 ${
                        booking.status === 'completed' ? 'text-emerald-600' :
                        booking.status === 'pending' ? 'text-amber-600' :
                        booking.status === 'cancelled' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                        {booking.sparePart?.name || booking.sparePartName || 'Spare Part'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-600">
                          {booking.customer?.name || 'Customer'}
                        </p>
                        <span className="text-slate-300">•</span>
                        <p className="text-xs text-slate-500">
                          {new Date(booking.orderDate || booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="font-bold text-slate-800 text-lg">
                      ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
            <Link
              to="/vendor/dashboard/transactions"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              View all
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FiDollarSign className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">No Recent Transactions</p>
                <p className="text-sm text-slate-500 mb-4">Transaction history will appear here</p>
                <Link
                  to="/vendor/dashboard/bookings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  View Bookings
                </Link>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction._id || transaction.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-lg shadow-sm ${
                      transaction.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <FiTrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FiTrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
                        {transaction.description || (transaction.type === 'credit' ? 'Payment Received' : 'Payment Sent')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <FiCalendar className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.transactionDate || transaction.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${
                    transaction.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
            <p className="text-sm text-slate-600">Get things done faster</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <FiActivity className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/vendor/dashboard/add-spare-part"
            className="group relative p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <FiPackage className="text-2xl text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">Add Spare Part</p>
              <p className="text-xs text-slate-600">Add new inventory item</p>
            </div>
          </Link>
          <Link
            to="/vendor/dashboard/bookings"
            className="group relative p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <FiShoppingCart className="text-2xl text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">View Bookings</p>
              <p className="text-xs text-slate-600">Manage all orders</p>
            </div>
          </Link>
          <Link
            to="/vendor/dashboard/transactions"
            className="group relative p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <FiDollarSign className="text-2xl text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">View Transactions</p>
              <p className="text-xs text-slate-600">Track payments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
