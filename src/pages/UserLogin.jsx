import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiLock, FiMail, FiArrowRight, FiRefreshCw, FiUser } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { userApi } from '../services/userApi.js';
import { useUserAuth } from '../context/UserAuthContext';

const UserLogin = () => {
  const navigate = useNavigate();
  const { checkAuth } = useUserAuth();
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [step, setStep] = useState(1); // 1: phone/email, 2: otp
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP Timer
  React.useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.phone || formData.phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Sending login OTP to:', formData.phone);
      const response = await userApi.sendLoginOTP(formData.phone);
      console.log('OTP Response:', response);
      if (response.success) {
        setStep(2);
        setOtpTimer(60);
      } else {
        setLocalError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP Error:', err);
      setLocalError(err.message || 'Failed to connect to server. Please check if backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setSubmitting(true);
    setLocalError(null);
    try {
      const response = await userApi.sendLoginOTP(formData.phone);
      if (response.success) {
        setOtpTimer(60);
      } else {
        setLocalError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.otp || formData.otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    try {
      const response = await userApi.verifyOTP(formData.phone, formData.otp);
      if (response.token) {
        localStorage.setItem('userToken', response.token);
        await checkAuth(); // Update auth context
        
        // Check if profile is complete
        if (response.isProfileComplete === false) {
          // Show a brief message before redirecting
          setLocalError(null);
          // Redirect to profile completion page for new users
          navigate('/user/complete-profile', { replace: true });
        } else {
          // Check for redirect URL
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectUrl, { replace: true });
          } else {
            navigate('/user/dashboard', { replace: true });
          }
        }
      } else {
        setLocalError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLocalError(null);

    setSubmitting(true);
    try {
      const response = await userApi.loginWithPassword(formData.email, formData.password);
      if (response.token) {
        localStorage.setItem('userToken', response.token);
        await checkAuth(); // Update auth context
        
        // Check for redirect URL
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl, { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } else {
        setLocalError('Invalid credentials');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'otp') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, name === 'otp' ? 6 : 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setLocalError(null);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-primary via-primary-dark to-slate-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Animated Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              width: '100%',
              top: `${20 + i * 20}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-4 shadow-lg">
              <FiUser className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">User Login</h1>
            <p className="text-white/90 font-medium">Welcome back! Please login to continue</p>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {localError}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => {
                setLoginMethod('otp');
                setStep(1);
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                loginMethod === 'otp'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/50'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Login with OTP
            </button>
            <button
              onClick={() => {
                setLoginMethod('password');
                setStep(1);
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                loginMethod === 'password'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/50'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Login with Password
            </button>
          </div>

          {/* OTP Login - Phone Step */}
          {loginMethod === 'otp' && step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
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

          {/* OTP Login - OTP Step */}
          {loginMethod === 'otp' && step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15 text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={submitting}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-white/80 text-center font-medium">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaWhatsapp className="text-green-400 text-lg" />
                    <span>OTP sent to your WhatsApp</span>
                  </div>
                  <span className="text-white/70">+91 {formData.phone}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormData((prev) => ({ ...prev, otp: '' }));
                    setOtpTimer(0);
                  }}
                  className="text-white/90 hover:text-white transition font-medium"
                >
                  ← Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || submitting}
                  className="text-white font-semibold hover:text-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
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

          {/* Password Login */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                    placeholder="Enter your email"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                    placeholder="Enter your password"
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
                    Logging in...
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
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-white/90 font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/user/register')}
                className="text-white font-bold hover:underline transition"
              >
                Sign Up
              </button>
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-white/80 hover:text-white transition font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
