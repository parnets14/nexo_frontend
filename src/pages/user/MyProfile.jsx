import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCamera, FiSave, FiCheckCircle, FiShield, FiEdit3, FiLock, FiEye, FiEyeOff, FiHome, FiUsers, FiBriefcase } from 'react-icons/fi';
import axios from 'axios';
import { userApi } from '../../services/userApi';
import { useUserAuth } from '../../context/UserAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo-backend-testing.onrender.com' : window.location.origin);

const MyProfile = () => {
  const { checkAuth } = useUserAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    userType: 'home',
    companyDetails: {
      companyName: '',
      companySize: '',
      industry: '',
      gstNumber: '',
      contactPerson: '',
      designation: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/user/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Ensure profile has all required fields with defaults
      const userData = response.data.user;
      console.log('Fetched user data:', userData); // Debug log
      
      const profileData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        profilePicture: userData.profilePicture || '',
        userType: userData.userType || 'home', // Default to 'home' if not set
        companyDetails: userData.companyDetails || {
          companyName: '',
          companySize: '',
          industry: '',
          gstNumber: '',
          contactPerson: '',
          designation: ''
        }
      };
      
      console.log('Setting profile data:', profileData); // Debug log
      setProfile(profileData);
      
      if (userData.profilePicture) {
        setImagePreview(userData.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleCompanyDetailsChange = (e) => {
    setProfile({
      ...profile,
      companyDetails: {
        ...profile.companyDetails,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setProfile({ ...profile, profilePicture: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('userType', profile.userType);
      
      // Add company details if user type is company
      if (profile.userType === 'company') {
        formData.append('companyDetails', JSON.stringify(profile.companyDetails));
      }
      
      if (profile.profilePicture instanceof File) {
        formData.append('profilePicture', profile.profilePicture);
      }

      await axios.put(
        `${API_BASE_URL}/api/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchProfile();
      await checkAuth(); // Update navbar with new profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem('userToken');
      await userApi.changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <FiCheckCircle size={24} />
          <div>
            <p className="font-semibold">Profile Updated!</p>
            <p className="text-sm text-green-100">Your changes have been saved successfully.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FiUser size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Manage your personal information and account settings
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary-light/20 ring-4 ring-white shadow-xl">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
                      <FiUser size={48} className="text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-3 bg-primary rounded-xl cursor-pointer hover:bg-primary-dark transition-all shadow-lg group-hover:scale-110 transform duration-300">
                  <FiCamera className="text-white" size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.name || 'User'}</h2>
                <p className="text-gray-600 mb-3">{profile.email || 'No email provided'}</p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <FiShield size={16} />
                  <span className="font-medium">Verified Account</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiEdit3 size={16} className="text-primary" />
                Full Name *
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiEdit3 size={16} className="text-primary" />
                Email Address *
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* User Type Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiEdit3 size={20} className="text-primary" />
                Account Type *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Choose your account type to get personalized services and AMC plans
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'home', label: 'Home', icon: FiHome, desc: 'Personal/Residential' },
                  { value: 'pg', label: 'PG/Hostel', icon: FiUsers, desc: 'Paying Guest/Hostel' },
                  { value: 'company', label: 'Business', icon: FiBriefcase, desc: 'Company/Organization' }
                ].map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = profile.userType === type.value;
                  
                  return (
                    <div
                      key={type.value}
                      onClick={() => setProfile({ ...profile, userType: type.value })}
                      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                          isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent size={24} />
                        </div>
                        <h3 className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {type.label}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <FiCheckCircle className="text-primary" size={20} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current Selection Display */}
              <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" size={16} />
                  <span className="text-sm font-medium text-gray-700">
                    Current selection: <span className="text-primary font-bold">
                      {profile.userType === 'home' ? 'Home (Personal/Residential)' : 
                       profile.userType === 'pg' ? 'PG/Hostel (Paying Guest/Hostel)' : 
                       'Business (Company/Organization)'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Company Details (Show only if userType is company) */}
            {profile.userType === 'company' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FiBriefcase className="text-blue-600" size={20} />
                  <h3 className="text-lg font-bold text-blue-900">Company Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={profile.companyDetails.companyName}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Enter company name"
                      required={profile.userType === 'company'}
                    />
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      name="companySize"
                      value={profile.companyDetails.companySize}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="">Select company size</option>
                      <option value="small">Small (1-50 employees)</option>
                      <option value="medium">Medium (51-200 employees)</option>
                      <option value="large">Large (201-1000 employees)</option>
                      <option value="enterprise">Enterprise (1000+ employees)</option>
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={profile.companyDetails.industry}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g., Technology, Healthcare, Manufacturing"
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={profile.companyDetails.gstNumber}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Enter GST number (optional)"
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={profile.companyDetails.contactPerson}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Primary contact person name"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={profile.companyDetails.designation}
                      onChange={handleCompanyDetailsChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g., Manager, Director, Owner"
                    />
                  </div>
                </div>

                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Business Account Benefits:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Access to business AMC plans</li>
                        <li>• Priority customer support</li>
                        <li>• Bulk service discounts</li>
                        <li>• Dedicated account manager</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiShield size={16} className="text-gray-400" />
                Phone Number (Verified)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <FiCheckCircle size={14} className="text-green-500" />
                <span>Phone number is verified and cannot be changed</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full bg-gradient-to-r from-primary/10 to-primary-light/10 p-6 border-b border-gray-200 flex items-center justify-between hover:from-primary/15 hover:to-primary-light/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FiLock className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                <p className="text-gray-600 text-sm mt-0.5">Update your account password</p>
              </div>
            </div>
            <div className={`transform transition-transform ${showPasswordSection ? 'rotate-180' : ''}`}>
              <FiEdit3 className="text-primary" size={20} />
            </div>
          </button>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiLock size={16} className="text-primary" />
                  Current Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiLock size={16} className="text-primary" />
                  New Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiLock size={16} className="text-primary" />
                  Confirm New Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">Passwords do not match</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <FiLock size={20} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Info Card */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-[#152d47] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <FiShield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Account Security</h3>
              <p className="text-blue-100 mb-4">
                Your account is secured with phone verification. Keep your profile information up to date for the best experience.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                  ✓ Phone Verified
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                  ✓ Active Account
                </div>
                {profile.password && (
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                    ✓ Password Set
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
