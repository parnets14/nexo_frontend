import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiRefreshCw, FiCheck, FiHome, FiBriefcase, FiUsers, FiMoreHorizontal } from 'react-icons/fi';
import { userApi } from '../services/userApi.js';
import { useUserAuth } from '../context/UserAuthContext';

const UserRegister = () => {
  const navigate = useNavigate();
  const { checkAuth } = useUserAuth();
  const [step, setStep] = useState(1); // 1: details, 2: otp verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    referalCode: '',
    userType: 'home',
    // Company details (only for company users)
    companyName: '',
    companySize: '',
    industry: '',
    gstNumber: '',
    contactPerson: '',
    designation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [displayedOtp, setDisplayedOtp] = useState(null);

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

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else if (name === 'otp') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 6) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setLocalError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    // Additional validation for company users
    if (formData.userType === 'company') {
      if (!formData.companyName || !formData.contactPerson) {
        setLocalError('Company name and contact person are required for company registration');
        return;
      }
    }

    if (formData.phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Sending OTP to:', formData.phone);
      // First send OTP
      const otpResponse = await userApi.sendOTP(formData.phone);
      console.log('OTP Response:', otpResponse);
      if (otpResponse.success) {
        // Display OTP on screen for testing
        if (otpResponse.otp) {
          setDisplayedOtp(otpResponse.otp);
        }
        setStep(2);
        setOtpTimer(60);
      } else {
        setLocalError(otpResponse.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setLocalError(err.message || 'Failed to connect to server. Please check if backend is running on port 9000.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setSubmitting(true);
    setLocalError(null);
    try {
      const response = await userApi.sendOTP(formData.phone);
      if (response.success) {
        // Display OTP on screen for testing
        if (response.otp) {
          setDisplayedOtp(response.otp);
        }
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

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.otp || formData.otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    try {
      // First verify OTP
      const verifyResponse = await userApi.verifyOTP(formData.phone, formData.otp);
      
      if (verifyResponse.success || verifyResponse.token) {
        // OTP verified, now complete registration
        const registerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          referalCode: formData.referalCode,
          userType: formData.userType,
          // Include company details if user type is company
          ...(formData.userType === 'company' && {
            companyDetails: {
              companyName: formData.companyName,
              companySize: formData.companySize,
              industry: formData.industry,
              gstNumber: formData.gstNumber,
              contactPerson: formData.contactPerson,
              designation: formData.designation
            }
          })
        };

        const registerResponse = await userApi.register(registerData);
        
        if (registerResponse.token) {
          localStorage.setItem('userToken', registerResponse.token);
          await checkAuth(); // Update auth context
          navigate('/user/dashboard', { replace: true });
        } else if (verifyResponse.token) {
          // Use token from verify if register didn't return one
          localStorage.setItem('userToken', verifyResponse.token);
          await checkAuth(); // Update auth context
          navigate('/user/dashboard', { replace: true });
        } else {
          setLocalError('Registration completed but login failed. Please login manually.');
          setTimeout(() => navigate('/user/login'), 2000);
        }
      } else {
        setLocalError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setLocalError(err.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Create Account</h1>
            <p className="text-white/90 font-medium">Join Nexo and book services easily</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6 gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary text-white' : 'bg-white/20 text-slate-400'
            }`}>
              {step > 1 ? <FiCheck size={16} /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-white/20'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary text-white' : 'bg-white/20 text-slate-400'
            }`}>
              2
            </div>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {localError}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  I am registering as *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'home', label: 'Home', icon: FiHome, desc: 'Personal use' },
                    { value: 'pg', label: 'PG/Hostel', icon: FiUsers, desc: 'Paying guest' },
                    { value: 'company', label: 'Company', icon: FiBriefcase, desc: 'Business use' },
                    { value: 'other', label: 'Other', icon: FiMoreHorizontal, desc: 'Other purpose' }
                  ].map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          formData.userType === type.value
                            ? 'border-primary bg-primary/20 text-white'
                            : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                        }`}
                        disabled={submitting}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="text-lg" />
                          <span className="font-semibold text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs opacity-80">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                    placeholder="Enter your full name"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email Address *
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
                  Phone Number *
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

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                    placeholder="Create a password (min 6 characters)"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                    placeholder="Confirm your password"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Company-specific fields */}
              {formData.userType === 'company' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-white/20 pt-4"
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/90 mb-3">Company Details</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={onChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                        placeholder="Enter company name"
                        required={formData.userType === 'company'}
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={onChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                        placeholder="Contact person name"
                        required={formData.userType === 'company'}
                        disabled={submitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Company Size
                        </label>
                        <select
                          name="companySize"
                          value={formData.companySize}
                          onChange={onChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                          disabled={submitting}
                        >
                          <option value="" className="bg-gray-800">Select size</option>
                          <option value="small" className="bg-gray-800">Small (1-50)</option>
                          <option value="medium" className="bg-gray-800">Medium (51-200)</option>
                          <option value="large" className="bg-gray-800">Large (201-1000)</option>
                          <option value="enterprise" className="bg-gray-800">Enterprise (1000+)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Designation
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={onChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                          placeholder="Your designation"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={onChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                          placeholder="e.g., IT, Manufacturing, Healthcare"
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          GST Number (Optional)
                        </label>
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={onChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                          placeholder="GST registration number"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  name="referalCode"
                  value={formData.referalCode}
                  onChange={onChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                  placeholder="Enter referral code if you have one"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndComplete} className="space-y-6">
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
                  OTP sent to +91 {formData.phone}
                </p>
                {displayedOtp && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                    <p className="text-xs text-white/70 text-center mb-1">Testing OTP:</p>
                    <p className="text-2xl font-bold text-white text-center tracking-widest">
                      {displayedOtp}
                    </p>
                  </div>
                )}
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
                  ← Back
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
                    Complete Registration
                    <FiCheck />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-white/90 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/user/login')}
                className="text-white font-bold hover:underline transition"
              >
                Login
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

export default UserRegister;
