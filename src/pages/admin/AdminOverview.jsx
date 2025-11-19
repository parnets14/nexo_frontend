import React from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiCheckCircle, FiClock, FiExternalLink } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'

const quickLinks = [
  { title: 'Review pending KYC', to: '/admin/partners' },
  { title: 'Monitor live bookings', to: '/admin/bookings' },
  { title: 'Update spare inventory', to: '/admin/spares' },
  { title: 'Check AMC renewals', to: '/admin/amc' },
  { title: 'Optimize lead allocation', to: '/admin/leads' },
  { title: 'Send broadcast notification', to: '/admin/notifications' }
]

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

  // Extract data from backend response format
  // getDashboardCounts returns: { success: true, data: { counts: {...}, bookingStats: {...} } }
  const countsData = counts?.data?.counts || counts?.counts || {}
  const bookingStats = counts?.data?.bookingStats || counts?.bookingStats || {}
  
  // getDashboardAnalytics returns: { partnerStats: {...}, kycStats: {...}, registrationStats: {...} }
  const partnerStats = analytics?.partnerStats || {}
  const kycStats = analytics?.kycStats || {}

  const metrics = [
    {
      label: 'Total Bookings',
      value: countsData?.bookings ?? bookingStats?.total ?? 0,
      trend: bookingStats?.completed ? `${bookingStats.completed} completed` : null,
      description: 'Across all categories and cities'
    },
    {
      label: 'Total Partners',
      value: countsData?.partners ?? partnerStats?.total ?? 0,
      trend: partnerStats?.byStatus ? Object.entries(partnerStats.byStatus).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ') : null,
      description: 'Active and pending partners'
    },
    {
      label: 'Total Users',
      value: countsData?.users ?? 0,
      trend: null,
      description: 'Registered customers'
    },
    {
      label: 'KYC Pending',
      value: kycStats?.verificationStats?.pending ?? kycStats?.byStatus?.Pending ?? kycStats?.byStatus?.pending ?? 0,
      trend: kycStats?.verificationStats?.verified ? `${kycStats.verificationStats.verified} verified` : null,
      description: 'Awaiting verification',
      intent: (kycStats?.verificationStats?.pending ?? kycStats?.byStatus?.Pending ?? kycStats?.byStatus?.pending ?? 0) > 10 ? 'warning' : 'positive'
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
      <div className="space-y-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
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
                    className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm"
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

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Quick Actions
            </h2>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.to}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-primary/60 hover:text-primary transition"
                >
                  <span className="text-sm font-medium">{link.title}</span>
                  <FiExternalLink className="text-base" />
                </Link>
              ))}
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


