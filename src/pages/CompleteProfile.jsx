import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiArrowRight, FiRefreshCw, FiHome, FiBriefcase, FiUsers, FiMoreHorizontal } from 'react-icons/fi';
import { userApi } from '../services/userApi.js';
import { useUserAuth } from '../context/UserAuthContext';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { checkAuth } = useUserAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!formData.name || !formData.email) {
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

    setSubmitting(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setLocalError('Authentication required. Please login again.');
        navigate('/user/login');
        return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
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

      const response = await userApi.updateProfileData(token, updateData);
      
      if (response.success) {
        await checkAuth(); // Update auth context
        navigate('/user/dashboard', { replace: true });
      } else {
        setLocalError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setLocalError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip profile completion and go to dashboard
    navigate('/user/dashboard', { replace: true });
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
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Complete Your Profile</h1>
            <p className="text-white/90 font-medium">Help us serve you better by completing your profile</p>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {localError}
            </div>
          )}

          <form onSubmit={handleCompleteProfile} className="space-y-4">
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
                  placeholder="Enter your email address"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Company Details (only shown for company users) */}
            {formData.userType === 'company' && (
              <>
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
                    required
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
                    placeholder="Enter contact person name"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <option value="">Select size</option>
                      <option value="small">Small (1-50)</option>
                      <option value="medium">Medium (51-200)</option>
                      <option value="large">Large (201-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
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

                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="e.g., Technology"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={onChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/15"
                      placeholder="GST number (optional)"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/30"
                disabled={submitting}
              >
                Skip for now
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;