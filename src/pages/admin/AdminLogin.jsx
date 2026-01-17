import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLock, FiMail, FiShield } from 'react-icons/fi'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { adminApi } from '../../services/adminApi'

const AdminLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error, clearError } = useAdminAuth()
  const [formState, setFormState] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  const onChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    setLocalError(null)
    if (error) {
      clearError()
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setLocalError(null)
    
    // Request notification permission immediately on button click (user interaction context)
    // This must be called before any async operations to maintain user interaction context
    let permissionPromise = null;
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      
      // Try to request permission if default or denied (some browsers allow re-requesting)
      if (currentPermission === 'default' || currentPermission === 'denied') {
        try {
          permissionPromise = Notification.requestPermission();
        } catch (error) {
          console.error('Cannot request notification permission:', error);
        }
      }
    }
    
    try {
      await login(adminApi.login, formState)
      
      // Wait for permission request to complete if it was initiated
      if (permissionPromise) {
        const permission = await permissionPromise;
        if (permission === 'granted') {
          // Trigger notification initialization
          setTimeout(() => {
            window.dispatchEvent(new Event('notificationPermissionGranted'));
          }, 500);
        }
      }
      
      const redirectTo = location.state?.from?.pathname ?? '/admin/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/30 to-slate-950 opacity-70 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
            <FiShield className="text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Nexo Admin Access</h1>
            <p className="text-sm text-white/60 mt-2">
              Secure sign-in for operations and leadership teams.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Work Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-white/40" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={formState.email}
                onChange={onChange}
                className="w-full bg-white/10 border border-white/10 text-white placeholder:text-white/40 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/15 transition"
                placeholder="ops@nexo.in"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-white/40" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formState.password}
                onChange={onChange}
                className="w-full bg-white/10 border border-white/10 text-white placeholder:text-white/40 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/15 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {(error || localError) && (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3">
              {localError || error}
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl py-3 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? 'Verifying access...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/40 text-center leading-relaxed">
          Nexo Admin Console is restricted to authorized personnel. All access is monitored and logged
          for compliance.
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin


