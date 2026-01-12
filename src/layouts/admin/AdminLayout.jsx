import React, { useMemo, useEffect, useState } from 'react'
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
  FiMessageSquare,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiMap,
  FiPercent,
  FiTarget
} from 'react-icons/fi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import NotificationBell from '../../components/admin/NotificationBell.jsx'
import NotificationDialog from '../../components/NotificationDialog.jsx'

const navItems = [
  { label: 'Overview', icon: FiHome, to: '/admin/dashboard' },
  { label: 'Partner Control', icon: FiUsers, to: '/admin/partners' },
  { label: 'Partner Earnings', icon: FiDollarSign, to: '/admin/partner-earnings' },
  { label: 'Vendor Management', icon: FiShoppingBag, to: '/admin/vendors' },
  { label: 'Customers', icon: FiUsers, to: '/admin/customers' },
  { label: 'Customer Bookings', icon: FiClipboard, to: '/admin/customer-bookings' },
  { label: 'Category Management', icon: FiTag, to: '/admin/categories' },
  { label: 'Popular Services', icon: FiStar, to: '/admin/popular-services' },

  { label: 'AMC Plans', icon: FiBriefcase, to: '/admin/amc-plans' },
  { label: 'Featured Reviews', icon: FiMessageSquare, to: '/admin/featured-reviews' },
  { label: 'Hub Management', icon: FiMapPin, to: '/admin/hubs' },
  { label: 'City Management', icon: FiMap, to: '/admin/cities' },
  { label: 'Spare Parts', icon: FiPackage, to: '/admin/spares' },
  { label: 'AMC Management', icon: FiBriefcase, to: '/admin/amc' },
  { label: 'Lead Management', icon: FiTrendingUp, to: '/admin/leads' },
  { label: 'MG Plans', icon: FiAward, to: '/admin/mg-plans' },
  { label: 'Lead Plans', icon: FiTarget, to: '/admin/lead-plans' },
  { label: 'Fee Management', icon: FiDollarSign, to: '/admin/fees' },
  { label: 'Tax Management', icon: FiPercent, to: '/admin/tax-management' },
  { label: 'Fee Transactions', icon: FiCreditCard, to: '/admin/fee-transactions' },
  { label: 'Support Management', icon: FiMessageSquare, to: '/admin/support' },
  { label: 'Reports', icon: FiSettings, to: '/admin/reports' },
  { label: 'Notifications', icon: FiBell, to: '/admin/notifications' },
  { label: 'Refund Management', icon: FiRefreshCw, to: '/admin/refunds' },
  { label: 'WhatsApp Settings', icon: FiMessageSquare, to: '/admin/whatsapp-settings' }
]

const AdminLayout = () => {
      const { admin, logout, notifications: notificationData } = useAdminAuth()
      const navigate = useNavigate()
      const location = useLocation()
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
      

  const breadcrumb = useMemo(() => {
    const active = navItems.find((item) => location.pathname.startsWith(item.to))
    return active?.label ?? 'Overview'
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Mobile Header - Fixed/Sticky */}
      <header className="lg:hidden bg-white shadow-md border-b border-slate-200 fixed top-0 left-0 right-0 z-[60] w-full">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              type="button"
            >
              {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Nexo Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center uppercase font-bold shadow-inner text-sm">
              {(admin?.name?.[0] ?? 'A').toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative flex-1 pt-[64px] lg:pt-0">
        {/* Desktop Sidebar - Fixed/Sticky */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-slate-900 text-white fixed top-0 left-0 h-screen overflow-hidden z-40">
          {/* Logo Header - Sticky */}
          <div className="px-6 py-6 border-b border-slate-800 flex-shrink-0 bg-slate-900 sticky top-0 z-10">
            <h1 className="text-2xl font-semibold tracking-tight">Nexo Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Operations Control Center</p>
          </div>
          
          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="text-lg transition-transform duration-200 group-hover:scale-110" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          
          {/* Logout Button - Sticky Bottom */}
          <div className="px-6 py-6 border-t border-slate-800 flex-shrink-0 bg-slate-900 sticky bottom-0 z-10">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              type="button"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar - Fixed/Sticky Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-80 max-w-[85vw] bg-slate-900 text-white h-full shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Sidebar Header - Sticky */}
              <div className="px-6 py-6 border-b border-slate-800 flex-shrink-0 sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight">Nexo Admin</h1>
                    <p className="text-sm text-slate-400 mt-1">Operations Control Center</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition text-white"
                    type="button"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Mobile Navigation - Scrollable */}
              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
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

              {/* Mobile Logout Button - Sticky Bottom */}
              <div className="px-6 py-6 border-t border-slate-800 flex-shrink-0 sticky bottom-0 bg-slate-900 z-10">
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 transition text-white"
                  type="button"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Responsive Margin */}
        <div className="flex-1 min-w-0 w-full lg:ml-72 xl:ml-80">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
            <div className="px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Admin / {breadcrumb}</p>
                <h2 className="text-xl font-semibold text-slate-800">Admin Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
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

          {/* Mobile Navigation Bar - Sticky */}
          <nav className="lg:hidden bg-white border-b border-slate-200 sticky top-[64px] z-[55]">
            <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
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

          <main className="px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
            <Outlet />
          </main>
        </div>
      </div>
      <NotificationDialog
        notification={notificationData?.currentNotification}
        onClose={notificationData?.closeNotificationDialog || (() => {})}
        onMarkAsRead={notificationData?.markNotificationAsRead || (() => {})}
      />
    </div>
  )
}

export default AdminLayout


