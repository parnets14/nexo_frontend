import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiPlus,
  FiAlertCircle,
  FiMail
} from 'react-icons/fi'
import { useVendorAuth } from '../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../services/vendorApi.js'
import Logo from '../../components/Logo.jsx'
import NotificationBell from '../../components/vendor/NotificationBell.jsx'
import NotificationDialog from '../../components/NotificationDialog.jsx'

const VendorLayout = () => {
  const { vendor, token, logout, updateVendor, notifications: notificationData } = useVendorAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountStatus, setAccountStatus] = useState(vendor?.status)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const statusCheckRef = useRef(false) // Prevent concurrent status checks
  const vendorRef = useRef(vendor) // Store latest vendor to avoid dependency issues
  const updateVendorRef = useRef(updateVendor) // Store latest updateVendor

  // Update refs when values change
  useEffect(() => {
    vendorRef.current = vendor
    updateVendorRef.current = updateVendor
  }, [vendor, updateVendor])

  // Check vendor status function - can be called manually or by interval
  const checkVendorStatus = useCallback(async (force = false) => {
    if (!token) {
      setCheckingStatus(false)
      return
    }

    // Prevent concurrent calls
    if (statusCheckRef.current && !force) {
      return
    }

    statusCheckRef.current = true
    setCheckingStatus(true)

    try {
      // Fetch profile to get current status (middleware allows this even if suspended)
      const response = await vendorApi.getProfile(token)
      
      if (response.success && response.vendor) {
        const currentStatus = response.vendor.status
        setAccountStatus(currentStatus)
        // Update vendor in context with latest data
        if (updateVendorRef.current) {
          updateVendorRef.current({ ...response.vendor })
        }
      } else {
        // Fallback to stored status
        setAccountStatus(vendorRef.current?.status || 'active')
      }
    } catch (error) {
      console.error('Error checking vendor status:', error)
      // If 403 error, account is likely suspended
      if (error.status === 403 || error.data?.status) {
        setAccountStatus(error.data?.status || 'suspended')
        if (vendorRef.current && updateVendorRef.current) {
          updateVendorRef.current({ status: error.data?.status || 'suspended' })
        }
      } else {
        // If other error, use stored status
        setAccountStatus(vendorRef.current?.status || 'active')
      }
    } finally {
      setCheckingStatus(false)
      statusCheckRef.current = false
    }
  }, [token]) // Only depend on token, use refs for vendor and updateVendor

  // Check vendor status on mount and periodically (reduced frequency)
  useEffect(() => {
    if (!token) return

    checkVendorStatus(true) // Initial check
    
    // Check status every 5 minutes instead of 2 minutes to further reduce API calls
    const interval = setInterval(() => {
      checkVendorStatus(false)
    }, 300000) // 5 minutes
    
    return () => {
      clearInterval(interval)
      statusCheckRef.current = false // Reset on cleanup
    }
  }, [token, checkVendorStatus])

  // Listen for status change notifications from Firebase
  useEffect(() => {
    if (!notificationData?.currentNotification) return

    const notification = notificationData.currentNotification
    const title = notification.title || ''
    const message = notification.message || ''
    const notificationType = notification.type || ''
    const isStatusChange = notification.isStatusChange === true
    
    // Check if this is a status change notification
    // Check by type first (more reliable), then by title/message
    const isStatusNotification = 
      isStatusChange ||
      notificationType === 'status-change' ||
      notificationType === 'alert' ||
      (title.toLowerCase().includes('account') && 
       (title.toLowerCase().includes('activated') || 
        title.toLowerCase().includes('suspended') || 
        title.toLowerCase().includes('deactivated'))) ||
      (message.toLowerCase().includes('account') &&
       (message.toLowerCase().includes('activated') || 
        message.toLowerCase().includes('suspended') || 
        message.toLowerCase().includes('deactivated')))

    if (isStatusNotification) {
      console.log('Status change notification detected, refreshing vendor status...')
      // Immediately check status when status change notification is received
      setTimeout(() => {
        checkVendorStatus(true)
      }, 1000) // Delay to ensure backend has updated the status
    }
  }, [notificationData?.currentNotification, checkVendorStatus])

  // Also listen for custom event from useNotifications hook
  useEffect(() => {
    const handleStatusChange = () => {
      console.log('Status change event received, refreshing vendor status...')
      setTimeout(() => {
        checkVendorStatus(true)
      }, 1000)
    }

    window.addEventListener('vendorStatusChange', handleStatusChange)
    return () => {
      window.removeEventListener('vendorStatusChange', handleStatusChange)
    }
  }, [checkVendorStatus])

  const handleLogout = () => {
    logout()
    navigate('/vendor/login', { replace: true })
  }

  const vendorName = vendor?.name || vendor?.companyName || 'Vendor'
  const vendorInitial = vendorName.charAt(0).toUpperCase()

  // Check if account is suspended or inactive
  const isAccountBlocked = accountStatus === 'suspended' || accountStatus === 'inactive'

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600"
          >
            Loading...
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  // Show blocked message if account is suspended/inactive
  if (isAccountBlocked) {
    return (
      <motion.div
        key="blocked-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4"
      >
        <motion.div
          key={`blocked-card-${accountStatus}`}
          initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: -90 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 15, 
            stiffness: 200,
            delay: 0.2,
            duration: 0.8
          }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 md:p-12 text-center"
        >
          <motion.div
            key={`alert-icon-${accountStatus}`}
            initial={{ scale: 0, rotate: -360, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              damping: 10, 
              stiffness: 150, 
              delay: 0.4 
            }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 via-red-200 to-red-300 rounded-full flex items-center justify-center shadow-xl"
          >
            <motion.div
              animate={{ 
                rotate: [0, -20, 20, -20, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.8, 
                delay: 1.0, 
                repeat: 3,
                ease: "easeInOut"
              }}
            >
              <FiAlertCircle className="text-5xl text-red-600" />
            </motion.div>
          </motion.div>
          
          <motion.h1
            key={`title-${accountStatus}`}
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.6,
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="text-4xl font-bold text-slate-800 mb-4"
          >
            Account {accountStatus === 'suspended' ? 'Suspended' : 'Blocked'}
          </motion.h1>
          
          <motion.p
            key={`description-${accountStatus}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.7,
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="text-lg text-slate-600 mb-6"
          >
            Your vendor account has been {accountStatus === 'suspended' ? 'suspended' : 'blocked'}.
          </motion.p>
          
          <motion.div
            key="contact-box"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.7,
              type: 'spring',
              stiffness: 200
            }}
            className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 mb-8 shadow-md"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-700 mb-4 font-medium"
            >
              Please contact Nexo Admin to resolve this issue and restore access to your account.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.9,
                type: 'spring',
                stiffness: 300
              }}
              className="flex items-center justify-center gap-3 text-slate-700"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
                className="p-2 bg-white rounded-full shadow-md"
              >
                <FiMail className="text-red-600 text-xl" />
              </motion.div>
              <span className="text-lg">Email: <motion.a 
                href="mailto:support@nexo.works" 
                className="text-primary hover:underline font-semibold inline-block"
                whileHover={{ scale: 1.1, color: '#2563eb' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                support@nexo.works
              </motion.a></span>
            </motion.div>
          </motion.div>
          
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 1.0,
              type: 'spring',
              stiffness: 200
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.08, 
                boxShadow: '0 15px 30px rgba(59, 130, 246, 0.3)',
                y: -2
              }}
              whileTap={{ scale: 0.92, y: 0 }}
              onClick={handleLogout}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <motion.span
                animate={{ x: [0, -3, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <FiLogOut />
              </motion.span>
              <span>Logout</span>
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.08, 
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
                y: -2,
                backgroundColor: '#e2e8f0'
              }}
              whileTap={{ scale: 0.92, y: 0 }}
              onClick={() => window.location.href = 'mailto:support@nexo.works?subject=Account Access Issue'}
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <FiMail />
              </motion.span>
              <span>Contact Admin</span>
            </motion.button>
          </motion.div>
          
          {accountStatus === 'suspended' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-sm text-slate-500"
            >
              If you believe this is an error, please contact our support team immediately.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-md border-b border-slate-200 fixed top-0 left-0 right-0 z-40 w-full">
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold shadow-md">
              {vendorInitial}
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative flex-1 pt-[64px] lg:pt-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 flex-col bg-white shadow-xl border-r border-slate-200 fixed top-0 left-0 h-screen overflow-visible z-30">
          <div className="px-4 py-4 border-b border-slate-200 flex-shrink-0 bg-white sticky top-0 z-10">
            <Logo className="scale-75 origin-left" />
          </div>

          <div className="px-4 py-4 border-b border-slate-200 bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0 relative overflow-visible">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-lg border-2 border-primary/20">
                {vendorInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate text-sm">{vendorName}</p>
                <p className="text-xs text-slate-500 truncate">{vendor?.email || 'N/A'}</p>
              </div>
              <NotificationBell />
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <NavLink to="/vendor/dashboard" icon={FiHome} label="Dashboard" />
            <NavLink to="/vendor/dashboard/spare-parts" icon={FiPackage} label="Spare Parts" />
            <NavLink to="/vendor/dashboard/add-spare-part" icon={FiPlus} label="Add Spare Part" />
            <NavLink to="/vendor/dashboard/bookings" icon={FiShoppingCart} label="Bookings" />
            <NavLink to="/vendor/dashboard/transactions" icon={FiDollarSign} label="Transactions" />
          </nav>

          <div className="px-4 py-4 border-t border-slate-200 flex-shrink-0 bg-white sticky bottom-0 z-10">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-80 max-w-[85vw] bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold border-2 border-primary/20">
                    {vendorInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{vendorName}</p>
                    <p className="text-xs text-slate-500 truncate">{vendor?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <MobileNavLink to="/vendor/dashboard" icon={FiHome} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/vendor/dashboard/spare-parts" icon={FiPackage} label="Spare Parts" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/vendor/dashboard/add-spare-part" icon={FiPlus} label="Add Spare Part" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/vendor/dashboard/bookings" icon={FiShoppingCart} label="Bookings" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink to="/vendor/dashboard/transactions" icon={FiDollarSign} label="Transactions" onClick={() => setMobileMenuOpen(false)} />
              </nav>

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

        <div className="flex-1 min-w-0 w-full lg:ml-64">
          <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Notification Dialog - positioned outside main layout to avoid overflow issues */}
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

export default VendorLayout

