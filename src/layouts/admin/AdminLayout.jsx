import React, { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FiHome,
  FiUsers,
  FiClipboard,
  FiSettings,
  FiBell,
  FiRefreshCw,
  FiPackage,
  FiBriefcase,
  FiTrendingUp,
  FiLogOut,
  FiAward,
  FiDollarSign,
  FiTag,
  FiMapPin,
  FiStar,
  FiCreditCard,
  FiMessageSquare
} from 'react-icons/fi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const navItems = [
  { label: 'Overview', icon: FiHome, to: '/admin/dashboard' },
  { label: 'Partner Control', icon: FiUsers, to: '/admin/partners' },
  { label: 'Customer Bookings', icon: FiClipboard, to: '/admin/bookings' },
  { label: 'Category Management', icon: FiTag, to: '/admin/categories' },
  { label: 'Popular Services', icon: FiStar, to: '/admin/popular-services' },
  { label: 'Subscription Plans', icon: FiAward, to: '/admin/subscription-plans' },
  { label: 'Featured Reviews', icon: FiMessageSquare, to: '/admin/featured-reviews' },
  { label: 'Hub Management', icon: FiMapPin, to: '/admin/hubs' },
  { label: 'Spare Parts', icon: FiPackage, to: '/admin/spares' },
  { label: 'AMC Management', icon: FiBriefcase, to: '/admin/amc' },
  { label: 'Lead Management', icon: FiTrendingUp, to: '/admin/leads' },
  { label: 'MG Plans', icon: FiAward, to: '/admin/mg-plans' },
  { label: 'Fee Management', icon: FiDollarSign, to: '/admin/fees' },
  { label: 'Fee Transactions', icon: FiCreditCard, to: '/admin/fee-transactions' },
  { label: 'Reports', icon: FiSettings, to: '/admin/reports' },
  { label: 'Notifications', icon: FiBell, to: '/admin/notifications' },
  { label: 'Refund Management', icon: FiRefreshCw, to: '/admin/refunds' }
]

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumb = useMemo(() => {
    const active = navItems.find((item) => location.pathname.startsWith(item.to))
    return active?.label ?? 'Overview'
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-slate-900 text-white">
          <div className="px-6 py-6 border-b border-slate-800">
            <h1 className="text-2xl font-semibold tracking-tight">Nexo Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Operations Control Center</p>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="px-6 py-6 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Admin / {breadcrumb}</p>
                <h2 className="text-xl font-semibold text-slate-800">Admin Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{admin?.name ?? 'Admin'}</p>
                  <p className="text-xs text-slate-400">{admin?.role ?? 'Super Admin'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center uppercase font-bold shadow-inner">
                  {(admin?.name?.[0] ?? 'A').toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <nav className="lg:hidden bg-white border-b border-slate-200">
            <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`
                    }
                  >
                    <Icon className="text-sm" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </nav>

          <main className="px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout


