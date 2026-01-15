import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  FiDollarSign,
  FiUsers,
  FiBriefcase,
  FiCreditCard,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiHeadphones
} from 'react-icons/fi'
import { usePartnerAuth } from '../../context/PartnerAuthContext.jsx'
import Logo from '../../components/Logo.jsx'
import NotificationBell from '../../components/partner/NotificationBell.jsx'
import NotificationDialog from '../../components/NotificationDialog.jsx'

    const PartnerLayout = () => {
      const { partner, logout, notifications: notificationData } = usePartnerAuth()
      const navigate = useNavigate()
      const location = useLocation()
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
      

  const handleLogout = () => {
    logout()
    navigate('/partner/login', { replace: true })
  }

  const partnerName = partner?.profile?.name || partner?.name || 'Partner'
  const partnerInitial = partnerName.charAt(0).toUpperCase()
  const partnerType = partner?.partnerType || 'individual'
  const showTeamTab = partnerType === 'franchise'

  // Debug logging
  useEffect(() => {
    console.log('Partner Layout - Partner Data:', {
      partnerType,
      showTeamTab,
      hasPartner: !!partner,
      partnerKeys: partner ? Object.keys(partner) : []
    })
  }, [partner, partnerType, showTeamTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
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
            <Logo className="scale-75 origin-left" />
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {partner?.profilePicture ? (
              <img
                src={partner.profilePicture.startsWith('http') ? partner.profilePicture : `http://localhost:5173/uploads/profiles/${partner.profilePicture}`}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold shadow-md">
                {partnerInitial}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex relative flex-1 pt-[64px] lg:pt-0">
        {/* Desktop Sidebar - Fixed/Sticky for all screen sizes */}
        <aside className="hidden lg:flex lg:w-64 flex-col bg-white shadow-xl border-r border-slate-200 fixed top-0 left-0 h-screen overflow-hidden z-40">
          {/* Logo Header - Sticky */}
          <div className="px-4 py-4 border-b border-slate-200 flex-shrink-0 bg-white sticky top-0 z-10">
            <Logo className="scale-75 origin-left" />
          </div>

          {/* Profile Section - Compact */}
          <div className="px-4 py-4 border-b border-slate-200 bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              {partner?.profilePicture ? (
                <img
                  src={partner.profilePicture.startsWith('http') ? partner.profilePicture : `http://localhost:5173/uploads/profiles/${partner.profilePicture}`}
                  alt={partnerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-lg border-2 border-primary/20">
                  {partnerInitial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate text-sm">{partnerName}</p>
                <p className="text-xs text-slate-500 truncate">{partner?.phone || 'N/A'}</p>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <NavLink to="/partner/dashboard" icon={FiHome} label="Dashboard" />
            <NavLink to="/partner/dashboard/profile" icon={FiUser} label="Profile" />
            <NavLink to="/partner/dashboard/wallet" icon={FiDollarSign} label="Wallet" />
            {showTeamTab && <NavLink to="/partner/dashboard/team" icon={FiUsers} label="Team" />}
            <NavLink to="/partner/dashboard/jobs" icon={FiBriefcase} label="Jobs" />
            <NavLink to="/partner/dashboard/subscription" icon={FiCreditCard} label="MG Plan" />
            <NavLink to="/partner/dashboard/spare-parts" icon={FiPackage} label="Spare Parts" />
            <NavLink to="/partner/dashboard/transactions" icon={FiDollarSign} label="Transactions" />
            <NavLink to="/partner/dashboard/support" icon={FiHeadphones} label="Support" />
          </nav>

          {/* Logout Button - Sticky Bottom */}
          <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0 bg-white sticky bottom-0 z-10">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar - Fixed/Sticky Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-80 max-w-[85vw] bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Sidebar Header - Sticky */}
              <div className="px-4 py-4 border-b border-slate-200 flex-shrink-0 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between mb-3">
                  <Logo className="scale-75 origin-left" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    type="button"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-lg">
                  {partner?.profilePicture ? (
                    <img
                      src={partner.profilePicture.startsWith('http') ? partner.profilePicture : `http://localhost:5173/uploads/profiles/${partner.profilePicture}`}
                      alt={partnerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold border-2 border-primary/20">
                      {partnerInitial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{partnerName}</p>
                    <p className="text-xs text-slate-500 truncate">{partner?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation - Scrollable */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <MobileNavLink to="/partner/dashboard" icon={FiHome} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/profile" icon={FiUser} label="Profile" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/wallet" icon={FiDollarSign} label="Wallet" onClick={() => setMobileMenuOpen(false)} />
                {showTeamTab && <MobileNavLink to="/partner/dashboard/team" icon={FiUsers} label="Team" onClick={() => setMobileMenuOpen(false)} />}
                <MobileNavLink to="/partner/dashboard/jobs" icon={FiBriefcase} label="Jobs" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/subscription" icon={FiCreditCard} label="MG Plan" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/spare-parts" icon={FiPackage} label="Spare Parts" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/transactions" icon={FiDollarSign} label="Transactions" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/partner/dashboard/support" icon={FiHeadphones} label="Support" onClick={() => setMobileMenuOpen(false)} />
              </nav>

              {/* Mobile Logout Button - Sticky Bottom */}
              <div className="px-6 py-6 border-t border-slate-200 flex-shrink-0 sticky bottom-0 bg-white z-10">
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                  type="button"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

            {/* Main Content - Responsive Margin */}
            <div className="flex-1 min-w-0 w-full lg:ml-64">
              <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
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

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="relative z-10">{label}</span>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
      )}
    </Link>
  )
}

const MobileNavLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="text-base" />
      {label}
    </Link>
  )
}

export default PartnerLayout

