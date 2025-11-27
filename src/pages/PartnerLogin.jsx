import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiLock, FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { usePartnerAuth } from '../context/PartnerAuthContext.jsx'
import { partnerApi } from '../services/partnerApi.js'

const PartnerLogin = () => {
  const navigate = useNavigate()
  const { login, error, clearError } = usePartnerAuth()
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [formData, setFormData] = useState({
    phone: '',
    otp: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // OTP Timer
  React.useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpTimer])

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!formData.phone || formData.phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number')
      return
    }

    setSubmitting(true)
    try {
      const response = await partnerApi.sendOTP(formData.phone)
      if (response.success) {
        // Display OTP on screen (remove in production)
        if (response.otp) {
          alert(`OTP for testing: ${response.otp}`)
          // Or you could set it to state: setDisplayedOtp(response.otp)
        }
        setOtpSent(true)
        setStep(2)
        setOtpTimer(60) // 60 seconds timer
      } else {
        setLocalError(response.message || 'Failed to send OTP')
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    if (otpTimer > 0) return

    setSubmitting(true)
    setLocalError(null)
    try {
      const response = await partnerApi.resendOTP(formData.phone)
      if (response.success) {
        setOtpTimer(60)
      } else {
        setLocalError(response.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!formData.otp || formData.otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP')
      return
    }

    setSubmitting(true)
    
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
      await login(formData.phone, formData.otp)
      
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
      
      navigate('/partner/dashboard', { replace: true })
    } catch (err) {
      setLocalError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, name === 'otp' ? 6 : 10) }))
    setLocalError(null)
    if (error) {
      clearError()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <FiLock className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Partner Login</h1>
            <p className="text-slate-300">Welcome back! Please login to continue</p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {localError || error}
            </div>
          )}

          {/* Phone Step */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={submitting}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 text-center">
                  OTP sent to +91 {formData.phone}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setFormData((prev) => ({ ...prev, otp: '' }))
                    setOtpSent(false)
                    setOtpTimer(0)
                  }}
                  className="text-slate-300 hover:text-white transition"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || submitting}
                  className="text-primary hover:text-primary-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Login
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/partner/onboard')}
                className="text-primary hover:text-primary-light font-semibold transition"
              >
                Register as Partner
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PartnerLogin

