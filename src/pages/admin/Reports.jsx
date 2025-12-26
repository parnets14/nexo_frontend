import React, { useState } from 'react'
import { FiBarChart2, FiDownload, FiPieChart, FiTrendingUp, FiX, FiCalendar, FiMail } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const metricBlocks = [
  { label: 'Revenue', key: 'revenue', intent: 'positive', icon: FiTrendingUp },
  { label: 'Penalties', key: 'penalties', intent: 'warning', icon: FiBarChart2 },
  { label: 'Refunds', key: 'refunds', intent: 'negative', icon: FiPieChart },
  { label: 'Average Rating', key: 'ratings', intent: 'positive', icon: FiTrendingUp }
]

const Reports = () => {
  const { token } = useAdminAuth()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleEmail, setScheduleEmail] = useState('')
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly')
  const [isExporting, setIsExporting] = useState(false)

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useAdminData(
    (token) => adminApi.fetchRevenueAnalytics(token),
    [] // Only fetch once on mount
  )
  const { data: userAnalytics, isLoading: userLoading, error: userError } = useAdminData(
    (token) => adminApi.fetchUserAnalytics(token),
    [] // Only fetch once on mount
  )
  const { data: partnerPerformance, isLoading: partnerLoading, error: partnerError } = useAdminData(
    (token) => adminApi.fetchPartnerPerformance(token),
    [] // Only fetch once on mount
  )
  const { data: categoryRevenue, isLoading: categoryLoading, error: categoryError } = useAdminData(
    (token) => adminApi.fetchCategoryRevenue(token),
    [] // Only fetch once on mount
  )

  const isLoading = revenueLoading || userLoading || partnerLoading || categoryLoading
  const error = revenueError || userError || partnerError || categoryError

  // Extract data from backend response
  const revenue = revenueData || {}
  const users = userAnalytics || {}
  const partners = partnerPerformance || []
  const categoryBreakdown = Array.isArray(categoryRevenue) ? categoryRevenue : []

  const summaryStats = [
    {
      label: 'Total Revenue',
      value: revenue?.totalRevenue ? `₹${(revenue.totalRevenue / 100000).toFixed(1)}L` : '₹0',
      trend: revenue?.transactionCount ? `${revenue.transactionCount} transactions` : null,
      description: 'After refunds and penalties',
      icon: FiTrendingUp
    },
    {
      label: 'Successful Transactions',
      value: revenue?.successfulTransactions ?? 0,
      trend: revenue?.failedTransactions ? `${revenue.failedTransactions} failed` : null,
      description: 'Payment gateway success rate',
      icon: FiBarChart2,
      intent: 'positive'
    },
    {
      label: 'Total Users',
      value: users?.totalUsers ?? 0,
      trend: users?.newUsers ? `${users.newUsers} new (30d)` : null,
      description: 'Registered customers',
      icon: FiPieChart
    },
    {
      label: 'User Retention',
      value: users?.userRetentionRate ? `${users.userRetentionRate.toFixed(1)}%` : '0%',
      trend: users?.activeUsers ? `${users.activeUsers} active` : null,
      description: 'Active user percentage',
      icon: FiTrendingUp
    }
  ]

  // Calculate max revenue for percentage calculation
  const maxRevenue = categoryBreakdown.length > 0 
    ? Math.max(...categoryBreakdown.map(cat => cat.revenue || 0))
    : 1

  const renderLoading = () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Export dashboard data to CSV
  const handleExportDashboard = async () => {
    setIsExporting(true)
    try {
      // Prepare export data
      const exportData = {
        summary: {
          totalRevenue: revenue?.totalRevenue || 0,
          transactionCount: revenue?.transactionCount || 0,
          successfulTransactions: revenue?.successfulTransactions || 0,
          failedTransactions: revenue?.failedTransactions || 0,
          totalUsers: users?.totalUsers || 0,
          activeUsers: users?.activeUsers || 0,
          newUsers: users?.newUsers || 0,
          userRetentionRate: users?.userRetentionRate || 0
        },
        categoryRevenue: categoryBreakdown,
        partnerPerformance: partners,
        exportedAt: new Date().toISOString()
      }

      // Convert to CSV format
      let csvContent = 'Reports & Analytics Dashboard Export\n'
      csvContent += `Exported At: ${new Date().toLocaleString('en-IN')}\n\n`
      
      // Summary Section
      csvContent += 'SUMMARY STATISTICS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Revenue,₹${(exportData.summary.totalRevenue || 0).toLocaleString('en-IN')}\n`
      csvContent += `Total Transactions,${exportData.summary.transactionCount}\n`
      csvContent += `Successful Transactions,${exportData.summary.successfulTransactions}\n`
      csvContent += `Failed Transactions,${exportData.summary.failedTransactions}\n`
      csvContent += `Total Users,${exportData.summary.totalUsers}\n`
      csvContent += `Active Users,${exportData.summary.activeUsers}\n`
      csvContent += `New Users (30d),${exportData.summary.newUsers}\n`
      csvContent += `User Retention Rate,${exportData.summary.userRetentionRate.toFixed(2)}%\n\n`

      // Category Revenue Section
      if (categoryBreakdown.length > 0) {
        csvContent += 'CATEGORY-WISE REVENUE\n'
        csvContent += 'Category,Revenue,Penalties,Rating,Booking Count\n'
        categoryBreakdown.forEach(cat => {
          csvContent += `${cat.category},₹${(cat.revenue || 0).toLocaleString('en-IN')},₹${(cat.penalties || 0).toLocaleString('en-IN')},${cat.rating || 0},${cat.bookingCount || 0}\n`
        })
        csvContent += '\n'
      }

      // Partner Performance Section
      if (partners.length > 0) {
        csvContent += 'PARTNER PERFORMANCE\n'
        csvContent += 'Partner Name,Rating,Completion Rate,Total Earnings,Completed Bookings,Cancelled Bookings\n'
        partners.forEach(partner => {
          csvContent += `${partner.name || 'Unknown'},${partner.rating || 0},${partner.completionRate?.toFixed(2) || 0}%,₹${(partner.totalEarnings || 0).toLocaleString('en-IN')},${partner.completedBookings || 0},${partner.cancelledBookings || 0}\n`
        })
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting dashboard:', error)
      alert('Failed to export dashboard. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle schedule digest
  const handleScheduleDigest = () => {
    setShowScheduleModal(true)
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Implement backend API call to schedule email digest
    alert(`Email digest scheduled for ${scheduleEmail} (${scheduleFrequency}). This feature will be implemented soon.`)
    setShowScheduleModal(false)
    setScheduleEmail('')
  }

  return (
    <div>
      <ModuleHeader
        title="Reports & Analytics"
        subtitle="Get finance-ready metrics by category, city, partner performance, penalties, and customer satisfaction."
        actions={
          <>
            <button 
              onClick={handleScheduleDigest}
              className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition inline-flex items-center gap-2"
            >
              <FiCalendar /> Schedule Digest
            </button>
            <button 
              onClick={handleExportDashboard}
              disabled={isExporting || isLoading}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload /> {isExporting ? 'Exporting...' : 'Export Dashboard'}
            </button>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {summaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {isLoading ? (
        renderLoading()
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          Unable to fetch live analytics. {error}
        </div>
      ) : (
        <div className="space-y-10">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
              Category-wise Revenue Snapshot
            </h2>
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No category revenue data available
              </div>
            ) : (
              <div className="space-y-6">
                {categoryBreakdown.map((entry) => {
                  const percentage = maxRevenue > 0 ? (entry.revenue / maxRevenue) * 100 : 0
                  return (
                    <div key={entry.categoryId || entry.category} className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{entry.category}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">
                            Revenue: {entry.revenueFormatted || `₹${(entry.revenue || 0).toLocaleString('en-IN')}`} • Penalties: {entry.penaltiesFormatted || `₹${(entry.penalties || 0).toLocaleString('en-IN')}`}
                          </p>
                        </div>
                        {entry.rating > 0 && (
                          <div className="text-sm font-semibold text-primary">Rating {entry.rating}</div>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="grid lg:grid-cols-3 gap-6">
            {metricBlocks.map((block) => (
              <div key={block.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{block.label}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Trendline (12 weeks)</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <block.icon />
                  </div>
                </div>
                <div className="mt-5 h-28">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center text-sm text-primary font-semibold">
                    <span>Coming soon</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* Schedule Digest Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FiMail className="w-5 h-5" />
                Schedule Email Digest
              </h2>
              <button
                onClick={() => {
                  setShowScheduleModal(false)
                  setScheduleEmail('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Frequency
                </label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-semibold mb-1">Coming Soon</p>
                <p>Email digest scheduling will be available soon. You'll receive automated reports with all analytics data.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setScheduleEmail('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports


