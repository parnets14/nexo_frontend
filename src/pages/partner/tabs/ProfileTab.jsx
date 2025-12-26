import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiCamera, 
  FiFileText, FiCreditCard, FiShield, FiCheckCircle, FiXCircle, FiClock,
  FiTag, FiPackage, FiMap, FiPrinter, FiAward
} from 'react-icons/fi'
import Logo from '../../../components/Logo.jsx'
import PartnerIDCard from '../../../components/PartnerIDCard.jsx'

const ProfileTab = () => {
  const { partner, token, updatePartner } = usePartnerAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingKYC, setEditingKYC] = useState(false)
  const [editingCategories, setEditingCategories] = useState(false)
  const [editingHubs, setEditingHubs] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    qualification: '',
    experience: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    gstNumber: ''
  })
  
  const [kycData, setKycData] = useState({
    panCard: null,
    aadhaar: null,
    aadhaarback: null,
    chequeImage: null,
    drivingLicence: null,
    bill: null,
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  })
  
  const [kycPreviews, setKycPreviews] = useState({})
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [availableHubs, setAvailableHubs] = useState([])
  const [selectedHubs, setSelectedHubs] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showIDCard, setShowIDCard] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchAvailableHubs()
    fetchCategories()
  }, [token])

  // Update selected hubs when profile is loaded
  useEffect(() => {
    if (profile && availableHubs.length > 0) {
      // Get hubs from profile response
      const partnerHubs = profile?.hubs || partner?.hubs || []
      console.log('Profile Hubs:', partnerHubs)
      console.log('Available Hubs:', availableHubs)
      
      if (partnerHubs.length > 0) {
        const hubIds = partnerHubs.map(h => {
          // Handle both populated objects and IDs
          if (typeof h === 'string') return h
          if (h && typeof h === 'object') {
            return h._id?.toString() || h.id?.toString() || h.toString()
          }
          return h?.toString()
        }).filter(Boolean)
        console.log('Setting selected hubs:', hubIds)
        setSelectedHubs(hubIds)
      } else {
        console.log('No hubs found in profile')
        setSelectedHubs([])
      }
    }
  }, [profile, availableHubs, partner])

  const fetchProfile = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await partnerApi.getProfile(token)
      if (response.success && response.profile) {
        const prof = response.profile
        setProfile(prof)
        
        // Set form data
        setFormData({
          name: prof.name || '',
          email: prof.email || prof.profile?.email || '',
          phone: prof.phone || '',
          whatsappNumber: prof.whatsappNumber || '',
          qualification: prof.qualification || '',
          experience: prof.experience || '',
          address: prof.address || prof.profile?.address || '',
          landmark: prof.landmark || prof.profile?.landmark || '',
          pincode: prof.pincode || prof.profile?.pincode || '',
          city: prof.city || prof.profile?.city || '',
          gstNumber: prof.gstNumber || prof.profile?.gstNumber || ''
        })
        
        // Set profile picture
        if (prof.profilePicture) {
          const imageUrl = prof.profilePicture.startsWith('http') 
            ? prof.profilePicture 
            : `https://nexo.works/${prof.profilePicture}`
          setProfilePicturePreview(imageUrl)
        }
        
        // Set KYC data
        if (prof.kyc) {
          setKycData(prev => ({
            ...prev,
            accountNumber: prof.bankDetails?.accountNumber || '',
            ifscCode: prof.bankDetails?.ifscCode || '',
            accountHolderName: prof.bankDetails?.accountHolderName || '',
            bankName: prof.bankDetails?.bankName || ''
          }))
          
          // Set KYC previews
          const previews = {}
          if (prof.kyc.panCard) previews.panCard = getImageUrl(prof.kyc.panCard)
          if (prof.kyc.aadhaar) previews.aadhaar = getImageUrl(prof.kyc.aadhaar)
          if (prof.kyc.aadhaarback) previews.aadhaarback = getImageUrl(prof.kyc.aadhaarback)
          if (prof.kyc.chequeImage) previews.chequeImage = getImageUrl(prof.kyc.chequeImage)
          if (prof.kyc.drivingLicence) previews.drivingLicence = getImageUrl(prof.kyc.drivingLicence)
          if (prof.kyc.bill) previews.bill = getImageUrl(prof.kyc.bill)
          setKycPreviews(previews)
        }
        
        // Set categories
        if (prof.category && prof.category.length > 0) {
          const categoryIds = prof.category.map(c => c._id || c)
          setSelectedCategories(categoryIds)
          setSelectedCategoryNames(prof.categoryNames || prof.category.map(c => c.name || '').filter(Boolean))
        }
        if (prof.subcategory) {
          setSelectedSubcategories(Array.isArray(prof.subcategory) ? prof.subcategory : [prof.subcategory])
        }
        if (prof.service) {
          setSelectedServices(Array.isArray(prof.service) ? prof.service : [prof.service])
        }
        
        // Hubs will be set in the useEffect hook when both profile and availableHubs are loaded
        console.log('Profile loaded with hubs:', prof.hubs)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableHubs = async () => {
    if (!token) return
    try {
      const response = await partnerApi.getAvailableHubs(token)
      const hubs = response?.data || response || []
      setAvailableHubs(Array.isArray(hubs) ? hubs : [])
    } catch (err) {
      console.error('Failed to fetch hubs:', err)
    }
  }

  const fetchCategories = async () => {
    if (!token) return
    try {
      const response = await partnerApi.getCategories(token)
      const categories = response?.data || response || []
      setAvailableCategories(Array.isArray(categories) ? categories : [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `https://nexo.works/${path}`
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleKYCFileChange = (field, file) => {
    if (file) {
      setKycData(prev => ({ ...prev, [field]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setKycPreviews(prev => ({ ...prev, [field]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const formDataToSend = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture)
      }

      const response = await partnerApi.updateProfile(token, formDataToSend)
      
      if (response.success) {
        setSuccess('Profile updated successfully!')
        setEditing(false)
        updatePartner(response.profile || formData)
        fetchProfile()
      } else {
        setError(response.message || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveKYC = async () => {
    if (!token) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await partnerApi.updateKYC(token, kycData)
      
      if (response.success) {
        setSuccess('KYC documents updated successfully!')
        setEditingKYC(false)
        fetchProfile()
      } else {
        setError(response.message || 'Failed to update KYC')
      }
    } catch (err) {
      setError(err.message || 'Failed to update KYC')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCategories = async () => {
    if (!token) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await partnerApi.selectCategoryAndService(token, {
        partnerId: partner?._id || profile?.id,
        category: selectedCategories,
        categoryNames: selectedCategoryNames,
        subcategory: selectedSubcategories,
        service: selectedServices
      })
      
      if (response.success) {
        setSuccess('Categories and services updated successfully!')
        setEditingCategories(false)
        fetchProfile()
      } else {
        setError(response.message || 'Failed to update categories')
      }
    } catch (err) {
      setError(err.message || 'Failed to update categories')
    } finally {
      setSaving(false)
    }
  }

  const handleHubToggle = async (hubId) => {
    if (!token) return

    try {
      const hubIdStr = hubId?.toString()
      const isSelected = selectedHubs.some(sh => sh?.toString() === hubIdStr)
      
      if (isSelected) {
        await partnerApi.unassignHub(token, hubIdStr)
        setSelectedHubs(prev => prev.filter(id => id?.toString() !== hubIdStr))
      } else {
        await partnerApi.assignHub(token, hubIdStr)
        setSelectedHubs(prev => [...prev, hubIdStr])
      }
      setSuccess(`Hub ${isSelected ? 'unassigned' : 'assigned'} successfully!`)
      // Refresh profile to get updated hubs
      setTimeout(() => fetchProfile(), 500)
    } catch (err) {
      setError(err.message || 'Failed to update hub assignment')
    }
  }

  const handleCategoryToggle = (categoryId, categoryName) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
      setSelectedCategoryNames(prev => prev.filter(name => name !== categoryName))
    } else {
      setSelectedCategories(prev => [...prev, categoryId])
      setSelectedCategoryNames(prev => [...prev, categoryName])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const profileImage = profilePicturePreview || profile?.profilePicture || null
  const displayName = formData.name || partner?.profile?.name || partner?.name || 'Partner'
  const displayInitial = displayName.charAt(0).toUpperCase()
  const kycStatus = profile?.kyc?.status || 'pending'

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Profile</h1>
            <p className="text-sm sm:text-base text-slate-600">Manage your complete profile information</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!editing && (
              <>
                <button
                  onClick={() => setShowIDCard(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiAward /> ID Card
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiEdit2 /> <span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">Edit</span>
                </button>
              </>
            )}
          </div>
        </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-white">{displayInitial}</span>
              )}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-primary-dark transition shadow-lg">
                <FiCamera className="text-base sm:text-lg" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 justify-center md:justify-start">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{displayName}</h2>
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {kycStatus === 'approved' ? '✓ Verified' : kycStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-slate-600">
              {formData.email && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FiMail className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{formData.email}</span>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <FiPhone className="text-slate-400 flex-shrink-0" />
                  <span>+91 {formData.phone}</span>
                </div>
              )}
              {formData.city && (
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:col-span-2">
                  <FiMapPin className="text-slate-400 flex-shrink-0" />
                  <span>{formData.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block flex-shrink-0">
            <Logo className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!editing}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Landmark</label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              disabled={!editing}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
            />
          </div>
        </div>

        {editing && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                fetchProfile()
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiX /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Categories & Services */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Categories & Services</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Select your service categories and services</p>
          </div>
          {!editingCategories && (
            <button
              onClick={() => setEditingCategories(true)}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm sm:text-base self-start sm:self-auto"
            >
              <FiEdit2 /> Edit
            </button>
          )}
        </div>

        {selectedCategoryNames.length > 0 ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Selected Categories:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryNames.map((name, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                    <FiTag /> {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No categories selected</p>
        )}

        {editingCategories && (
          <div className="mt-4 sm:mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Categories:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-lg">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat._id || cat.id)
                  return (
                    <label
                      key={cat._id || cat.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(cat._id || cat.id, cat.name)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="font-medium text-slate-800">{cat.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveCategories}
                disabled={saving || selectedCategories.length === 0}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <FiSave /> Save Categories
              </button>
              <button
                onClick={() => {
                  setEditingCategories(false)
                  fetchProfile()
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Hubs */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Service Hubs</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your assigned service hubs</p>
          </div>
          {!editingHubs && (
            <button
              onClick={() => setEditingHubs(true)}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm sm:text-base self-start sm:self-auto"
            >
              <FiEdit2 /> Edit
            </button>
          )}
        </div>

        {selectedHubs.length > 0 ? (
          <div className="space-y-3">
            {availableHubs
              .filter(hub => {
                const hubId = (hub._id || hub.id)?.toString()
                return selectedHubs.some(sh => sh?.toString() === hubId)
              })
              .map((hub) => (
                <div key={hub._id || hub.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiMap className="text-primary text-lg sm:text-xl flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{hub.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">{hub.city}, {hub.state}</p>
                    </div>
                  </div>
                  {editingHubs && (
                    <button
                      onClick={() => handleHubToggle((hub._id || hub.id)?.toString())}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition text-sm sm:text-base w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No hubs assigned</p>
        )}

        {editingHubs && (
          <div className="mt-4 sm:mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Available Hubs:</label>
              <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-lg">
                {availableHubs.map((hub) => {
                  const hubId = (hub._id || hub.id)?.toString()
                  const isSelected = selectedHubs.some(sh => sh?.toString() === hubId)
                  return (
                    <div
                      key={hub._id || hub.id}
                      className={`p-3 rounded-lg border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{hub.name}</p>
                        <p className="text-xs sm:text-sm text-slate-500 truncate">{hub.city}, {hub.state}</p>
                      </div>
                      <button
                        onClick={() => handleHubToggle(hub._id || hub.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base w-full sm:w-auto ${
                          isSelected
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Assign'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setEditingHubs(false)
                fetchProfile()
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition text-sm sm:text-base w-full sm:w-auto"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* KYC Documents */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">KYC Documents</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Upload and manage your KYC documents</p>
            {profile?.kyc?.status && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  profile.kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                  profile.kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.kyc.status.charAt(0).toUpperCase() + profile.kyc.status.slice(1)}
                </span>
                {profile.kyc.remarks && (
                  <span className="text-xs text-slate-500 break-words">({profile.kyc.remarks})</span>
                )}
              </div>
            )}
          </div>
          {!editingKYC && (
            <button
              onClick={() => setEditingKYC(true)}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm sm:text-base self-start sm:self-auto"
            >
              <FiEdit2 /> <span className="hidden sm:inline">{profile?.kyc ? 'Update KYC' : 'Upload KYC'}</span><span className="sm:hidden">{profile?.kyc ? 'Update' : 'Upload'}</span>
            </button>
          )}
        </div>

        {editingKYC ? (
          <div className="space-y-4 sm:space-y-6">
            {/* KYC Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  PAN Card <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.panCard && (
                    <img src={kycPreviews.panCard} alt="PAN Card" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.panCard ? 'Change' : 'Upload'} PAN Card
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('panCard', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Aadhaar Card (Front) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.aadhaar && (
                    <img src={kycPreviews.aadhaar} alt="Aadhaar Front" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.aadhaar ? 'Change' : 'Upload'} Aadhaar Front
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('aadhaar', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Aadhaar Card (Back) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.aadhaarback && (
                    <img src={kycPreviews.aadhaarback} alt="Aadhaar Back" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.aadhaarback ? 'Change' : 'Upload'} Aadhaar Back
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('aadhaarback', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cancelled Cheque <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.chequeImage && (
                    <img src={kycPreviews.chequeImage} alt="Cheque" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.chequeImage ? 'Change' : 'Upload'} Cheque
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('chequeImage', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Driving Licence <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.drivingLicence && (
                    <img src={kycPreviews.drivingLicence} alt="Driving Licence" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.drivingLicence ? 'Change' : 'Upload'} Driving Licence
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('drivingLicence', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Utility Bill <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {kycPreviews.bill && (
                    <img src={kycPreviews.bill} alt="Utility Bill" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="block w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition text-center">
                    <FiFileText className="inline text-slate-400 mr-2" />
                    {kycPreviews.bill ? 'Change' : 'Upload'} Utility Bill
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKYCFileChange('bill', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t border-slate-200 pt-4 sm:pt-6">
              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">Bank Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kycData.accountNumber}
                    onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kycData.ifscCode}
                    onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kycData.accountHolderName}
                    onChange={(e) => setKycData({ ...kycData, accountHolderName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kycData.bankName}
                    onChange={(e) => setKycData({ ...kycData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveKYC}
                disabled={saving}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <FiSave /> {saving ? 'Saving...' : 'Save KYC'}
              </button>
              <button
                onClick={() => {
                  setEditingKYC(false)
                  fetchProfile()
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile?.kyc?.panCard && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="text-primary" />
                  <span className="font-semibold text-slate-800">PAN Card</span>
                </div>
                <img src={getImageUrl(profile.kyc.panCard)} alt="PAN" className="w-full h-24 object-cover rounded" />
              </div>
            )}
            {profile?.kyc?.aadhaar && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="text-primary" />
                  <span className="font-semibold text-slate-800">Aadhaar Front</span>
                </div>
                <img src={getImageUrl(profile.kyc.aadhaar)} alt="Aadhaar" className="w-full h-24 object-cover rounded" />
              </div>
            )}
            {profile?.kyc?.chequeImage && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCreditCard className="text-primary" />
                  <span className="font-semibold text-slate-800">Cheque</span>
                </div>
                <img src={getImageUrl(profile.kyc.chequeImage)} alt="Cheque" className="w-full h-24 object-cover rounded" />
              </div>
            )}
            {!profile?.kyc && (
              <p className="text-slate-500 text-center py-4 md:col-span-3">No KYC documents uploaded yet</p>
            )}
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {showIDCard && profile && (
        <PartnerIDCard
          profile={profile}
          partner={partner}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </div>
  )
}

export default ProfileTab
