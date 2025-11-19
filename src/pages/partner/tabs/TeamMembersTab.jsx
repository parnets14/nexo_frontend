import React, { useState, useEffect } from 'react'
import { FiUsers, FiUserPlus, FiMail, FiPhone, FiEdit2, FiTrash2, FiX, FiCamera, FiFileText, FiTag, FiMap, FiShield, FiMapPin, FiActivity, FiClock, FiCreditCard, FiDownload } from 'react-icons/fi'
import Logo from '../../../components/Logo.jsx'
import TeamMemberIDCard from '../../../components/TeamMemberIDCard.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const TeamMembersTab = () => {
  const { token } = usePartnerAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMemberActivities, setSelectedMemberActivities] = useState(null)
  const [memberActivities, setMemberActivities] = useState({})
  const [loadingActivities, setLoadingActivities] = useState({})
  const [selectedMemberForIDCard, setSelectedMemberForIDCard] = useState(null)
  
  useEffect(() => {
    if (token) {
      fetchTeamMembers()
      fetchAvailableHubs()
      fetchCategories()
    }
  }, [token])

  const fetchTeamMembers = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await partnerApi.getTeamMembers(token)
      const members = response?.data || response || []
      setTeamMembers(Array.isArray(members) ? members : [])
    } catch (err) {
      console.error('Failed to fetch team members:', err)
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableHubs = async () => {
    try {
      const response = await partnerApi.getAvailableHubs(token)
      // Handle response structure: { success: true, data: [...] }
      const hubs = response?.data || response || []
      setAvailableHubs(Array.isArray(hubs) ? hubs : [])
    } catch (err) {
      console.error('Failed to fetch hubs:', err)
      setAvailableHubs([])
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await partnerApi.getCategories(token)
      // Handle different response structures: { success: true, categories: [...] } or { data: [...] }
      const categories = response?.categories || response?.data || response || []
      setAvailableCategories(Array.isArray(categories) ? categories : [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setAvailableCategories([])
    }
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    qualification: '',
    experience: '',
    address: '',
    city: '',
    pincode: '',
    role: 'technician',
    profilePicture: null,
    categories: [],
    categoryNames: [],
    hubs: []
  })
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
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
  const [availableHubs, setAvailableHubs] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  const [showKYC, setShowKYC] = useState(false)

  const handleAddMember = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields')
      return
    }

    if (!token) {
      alert('Authentication required')
      return
    }

    setLoading(true)
    try {
      const memberData = {
        ...formData,
        profilePicture: formData.profilePicture,
        kycData: kycData
      }

      const response = await partnerApi.addTeamMember(token, memberData)
      
      if (response.success) {
        // Refresh team members list
        await fetchTeamMembers()
        // Reset form
        setFormData({ 
          name: '', email: '', phone: '', whatsappNumber: '', qualification: '', 
          experience: '', address: '', city: '', pincode: '', role: 'technician', 
          profilePicture: null, categories: [], categoryNames: [], hubs: []
        })
        setProfilePicturePreview(null)
        setKycData({
          panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
          drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
          accountHolderName: '', bankName: ''
        })
        setKycPreviews({})
        setShowAddModal(false)
        setShowKYC(false)
        alert('Team member added successfully!')
      } else {
        alert(response.message || 'Failed to add team member')
      }
    } catch (err) {
      console.error('Failed to add team member:', err)
      alert(err.message || 'Failed to add team member')
    } finally {
      setLoading(false)
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      whatsappNumber: member.whatsappNumber || '',
      qualification: member.qualification || '',
      experience: member.experience || '',
      address: member.address || '',
      city: member.city || '',
      pincode: member.pincode || '',
      role: member.role || 'technician',
      profilePicture: null,
      categories: member.categories || [],
      categoryNames: member.categoryNames || [],
      hubs: member.hubs || []
    })
    setProfilePicturePreview(member.profilePicture || null)
    setKycData(member.kycData || {
      panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
      drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
      accountHolderName: '', bankName: ''
    })
    setKycPreviews(member.kyc || {})
    setShowAddModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file })
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

  const handleCategoryToggle = (categoryId, categoryName) => {
    const categories = formData.categories || []
    if (categories.includes(categoryId)) {
      setFormData(prev => ({
        ...prev,
        categories: (prev.categories || []).filter(id => id !== categoryId),
        categoryNames: (prev.categoryNames || []).filter(name => name !== categoryName)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), categoryId],
        categoryNames: [...(prev.categoryNames || []), categoryName]
      }))
    }
  }

  const handleHubToggle = (hubId) => {
    const hubs = formData.hubs || []
    if (hubs.includes(hubId)) {
      setFormData(prev => ({
        ...prev,
        hubs: (prev.hubs || []).filter(id => id !== hubId)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        hubs: [...(prev.hubs || []), hubId]
      }))
    }
  }

  const handleUpdateMember = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields')
      return
    }

    if (!token || !editingMember) {
      alert('Authentication required')
      return
    }

    const memberId = editingMember._id || editingMember.id
    if (!memberId) {
      alert('Invalid team member')
      return
    }

    setLoading(true)
    try {
      const memberData = {
        ...formData,
        profilePicture: formData.profilePicture,
        kycData: kycData
      }

      const response = await partnerApi.updateTeamMember(token, memberId, memberData)
      
      if (response.success) {
        // Refresh team members list
        await fetchTeamMembers()
        // Reset form
        setFormData({ 
          name: '', email: '', phone: '', whatsappNumber: '', qualification: '', 
          experience: '', address: '', city: '', pincode: '', role: 'technician', 
          profilePicture: null, categories: [], categoryNames: [], hubs: []
        })
        setProfilePicturePreview(null)
        setKycData({
          panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
          drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
          accountHolderName: '', bankName: ''
        })
        setKycPreviews({})
        setEditingMember(null)
        setShowAddModal(false)
        setShowKYC(false)
        alert('Team member updated successfully!')
      } else {
        alert(response.message || 'Failed to update team member')
      }
    } catch (err) {
      console.error('Failed to update team member:', err)
      alert(err.message || 'Failed to update team member')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMember = async (member) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return
    }

    if (!token) {
      alert('Authentication required')
      return
    }

    const memberId = member._id || member.id
    if (!memberId) {
      alert('Invalid team member')
      return
    }

    setLoading(true)
    try {
      const response = await partnerApi.deleteTeamMember(token, memberId)
      
      if (response.success) {
        // Refresh team members list
        await fetchTeamMembers()
        alert('Team member deleted successfully!')
      } else {
        alert(response.message || 'Failed to delete team member')
      }
    } catch (err) {
      console.error('Failed to delete team member:', err)
      alert(err.message || 'Failed to delete team member')
    } finally {
      setLoading(false)
    }
  }

  const handleViewActivities = async (member) => {
    const memberId = member._id || member.id
    if (!memberId || !token) return

    if (memberActivities[memberId]) {
      setSelectedMemberActivities(member)
      return
    }

    setLoadingActivities(prev => ({ ...prev, [memberId]: true }))
    try {
      const response = await partnerApi.getTeamMemberActivities(token, memberId)
      const activities = response?.data || response || []
      setMemberActivities(prev => ({ ...prev, [memberId]: activities }))
      setSelectedMemberActivities(member)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setMemberActivities(prev => ({ ...prev, [memberId]: [] }))
      setSelectedMemberActivities(member)
    } finally {
      setLoadingActivities(prev => ({ ...prev, [memberId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Team Members</h1>
          <p className="text-slate-600">Manage your team members and technicians</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null)
            setFormData({ 
              name: '', email: '', phone: '', whatsappNumber: '', qualification: '', 
              experience: '', address: '', city: '', pincode: '', role: 'technician', 
              profilePicture: null, categories: [], categoryNames: [], hubs: [] 
            })
            setProfilePicturePreview(null)
            setKycData({
              panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
              drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
              accountHolderName: '', bankName: ''
            })
            setKycPreviews({})
            setShowKYC(false)
            setShowAddModal(true)
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2"
        >
          <FiUserPlus /> Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Total Members</p>
            <FiUsers className="text-primary text-xl" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{teamMembers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Active Members</p>
            <FiUsers className="text-green-600 text-xl" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {teamMembers.filter((m) => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Technicians</p>
            <FiUsers className="text-blue-600 text-xl" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {teamMembers.filter((m) => m.role === 'technician').length}
          </p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {teamMembers.length > 0 && (
          <div className="p-4 border-b border-slate-200 flex items-center justify-end">
            <button
              onClick={() => {
                const exportData = teamMembers.map(member => ({
                  'Name': member.name || 'N/A',
                  'Phone': member.phone || 'N/A',
                  'Email': member.email || 'N/A',
                  'WhatsApp': member.whatsappNumber || 'N/A',
                  'Role': member.role || 'N/A',
                  'Status': member.status || 'N/A',
                  'Qualification': member.qualification || 'N/A',
                  'Experience': member.experience || 'N/A',
                  'Address': member.address || 'N/A',
                  'City': member.city || 'N/A',
                  'Pincode': member.pincode || 'N/A',
                  'Categories': member.categoryNames?.join(', ') || 'N/A',
                  'Joined Date': member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-IN') : 'N/A'
                }))
                exportToExcel(exportData, [
                  { header: 'Name', accessor: 'Name' },
                  { header: 'Phone', accessor: 'Phone' },
                  { header: 'Email', accessor: 'Email' },
                  { header: 'WhatsApp', accessor: 'WhatsApp' },
                  { header: 'Role', accessor: 'Role' },
                  { header: 'Status', accessor: 'Status' },
                  { header: 'Qualification', accessor: 'Qualification' },
                  { header: 'Experience', accessor: 'Experience' },
                  { header: 'Address', accessor: 'Address' },
                  { header: 'City', accessor: 'City' },
                  { header: 'Pincode', accessor: 'Pincode' },
                  { header: 'Categories', accessor: 'Categories' },
                  { header: 'Joined Date', accessor: 'Joined Date' }
                ], 'Team_Members', 'Team Members', {
                  columnWidths: [20, 15, 25, 15, 12, 12, 20, 15, 30, 15, 10, 30, 15]
                })
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2"
              title="Export to Excel"
            >
              <FiDownload /> Export Excel
            </button>
          </div>
        )}
        {teamMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiUsers className="text-4xl mx-auto mb-2 opacity-50" />
            <p className="mb-4">No team members added yet</p>
            <button
              onClick={() => {
                setEditingMember(null)
                setFormData({ 
                  name: '', email: '', phone: '', whatsappNumber: '', qualification: '', 
                  experience: '', address: '', city: '', pincode: '', role: 'technician', 
                  profilePicture: null, categories: [], categoryNames: [], hubs: [] 
                })
                setProfilePicturePreview(null)
                setKycData({
                  panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
                  drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
                  accountHolderName: '', bankName: ''
                })
                setKycPreviews({})
                setShowKYC(false)
                setShowAddModal(true)
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Add Your First Team Member
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-500">
            <p>Loading team members...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {teamMembers.map((member) => {
              const memberId = member._id || member.id
              const categoryNames = member.categoryNames || (member.categories && member.categories.map(c => typeof c === 'object' ? c.name : c)) || []
              const hubs = member.hubs || []
              
              return (
                <div key={memberId} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Profile Image */}
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xl border-2 border-primary/20">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">
                            {member.role || 'technician'}
                          </span>
                          {member.kyc && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center gap-1">
                              <FiShield className="text-xs" />
                              KYC
                            </span>
                          )}
                          {member.status === 'active' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-2">
                          {member.email && (
                            <span className="flex items-center gap-1">
                              <FiMail className="text-xs" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <FiPhone className="text-xs" />
                              {member.phone}
                            </span>
                          )}
                          {member.city && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="text-xs" />
                              {member.city}
                            </span>
                          )}
                        </div>
                        {categoryNames.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {categoryNames.map((cat, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                                <FiTag className="text-xs" />
                                {typeof cat === 'object' ? cat.name : cat}
                              </span>
                            ))}
                          </div>
                        )}
                        {hubs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hubs.map((hub, idx) => {
                              const hubName = typeof hub === 'object' ? hub.name : (availableHubs.find(h => (h._id || h.id) === hub)?.name || hub)
                              const hubCity = typeof hub === 'object' ? hub.city : (availableHubs.find(h => (h._id || h.id) === hub)?.city || '')
                              return (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center gap-1">
                                  <FiMap className="text-xs" />
                                  {hubName} {hubCity && `(${hubCity})`}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {/* Nexo Logo Badge */}
                      <div className="hidden md:block opacity-40">
                        <Logo className="scale-50" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMemberForIDCard(member)}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition"
                        title="View ID Card"
                      >
                        <FiCreditCard />
                      </button>
                      <button
                        onClick={() => handleViewActivities(member)}
                        className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition"
                        title="View Activities"
                      >
                        <FiActivity />
                      </button>
                      <button
                        onClick={() => handleEditMember(member)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        title="Edit Member"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                        title="Delete Member"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMember(null)
                  setFormData({ name: '', email: '', phone: '', role: 'technician', profilePicture: null })
                  setProfilePicturePreview(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-2xl border-2 border-primary/20">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <label className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition flex items-center gap-2">
                    <FiCamera />
                    {profilePicturePreview ? 'Change' : 'Upload'} Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter phone number"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="WhatsApp number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Qualification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="City"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>

              {/* Categories Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Categories</label>
                <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => {
                    const isSelected = (formData.categories || []).includes(cat._id || cat.id)
                    return (
                        <label
                          key={cat._id || cat.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer border-2 transition ${
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
                          <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                        </label>
                      )
                    })
                ) : (
                  <div className="col-span-2 text-center text-sm text-slate-500 py-4">
                    No service categories available
                  </div>
                )}
                </div>
              </div>

              {/* Hubs Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Hubs</label>
                <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  {availableHubs.length > 0 ? (
                    availableHubs.map((hub) => {
                      const isSelected = (formData.hubs || []).includes(hub._id || hub.id)
                      return (
                        <label
                          key={hub._id || hub.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer border-2 transition ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'bg-white border-slate-200 hover:border-primary/50'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-medium text-slate-800">{hub.name}</span>
                            <span className="text-xs text-slate-500 ml-2">{hub.city}, {hub.state}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleHubToggle(hub._id || hub.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                        </label>
                      )
                    })
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-4">
                      No service hubs available
                    </div>
                  )}
                </div>
              </div>

              {/* KYC Section Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowKYC(!showKYC)}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FiShield />
                    KYC Documents {showKYC ? '(Hide)' : '(Show)'}
                  </span>
                  <span>{showKYC ? '−' : '+'}</span>
                </button>
              </div>

              {/* KYC Documents */}
              {showKYC && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800">KYC Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Card</label>
                      {kycPreviews.panCard && (
                        <img src={kycPreviews.panCard} alt="PAN" className="w-full h-20 object-cover rounded mb-1" />
                      )}
                      <label className="block w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-primary transition text-center text-xs">
                        <FiFileText className="inline mr-1" />
                        {kycPreviews.panCard ? 'Change' : 'Upload'} PAN
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKYCFileChange('panCard', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Front</label>
                      {kycPreviews.aadhaar && (
                        <img src={kycPreviews.aadhaar} alt="Aadhaar" className="w-full h-20 object-cover rounded mb-1" />
                      )}
                      <label className="block w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-primary transition text-center text-xs">
                        <FiFileText className="inline mr-1" />
                        {kycPreviews.aadhaar ? 'Change' : 'Upload'} Aadhaar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKYCFileChange('aadhaar', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Back</label>
                      {kycPreviews.aadhaarback && (
                        <img src={kycPreviews.aadhaarback} alt="Aadhaar Back" className="w-full h-20 object-cover rounded mb-1" />
                      )}
                      <label className="block w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-primary transition text-center text-xs">
                        <FiFileText className="inline mr-1" />
                        {kycPreviews.aadhaarback ? 'Change' : 'Upload'} Aadhaar Back
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKYCFileChange('aadhaarback', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque</label>
                      {kycPreviews.chequeImage && (
                        <img src={kycPreviews.chequeImage} alt="Cheque" className="w-full h-20 object-cover rounded mb-1" />
                      )}
                      <label className="block w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:border-primary transition text-center text-xs">
                        <FiFileText className="inline mr-1" />
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
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={kycData.accountNumber}
                        onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={kycData.ifscCode}
                        onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingMember ? handleUpdateMember : handleAddMember}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (editingMember ? 'Update' : 'Add') + ' Member'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMember(null)
                    setFormData({ 
                      name: '', email: '', phone: '', whatsappNumber: '', qualification: '', 
                      experience: '', address: '', city: '', pincode: '', role: 'technician', 
                      profilePicture: null, categories: [], categoryNames: [], hubs: [] 
                    })
                    setProfilePicturePreview(null)
                    setKycData({
                      panCard: null, aadhaar: null, aadhaarback: null, chequeImage: null,
                      drivingLicence: null, bill: null, accountNumber: '', ifscCode: '',
                      accountHolderName: '', bankName: ''
                    })
                    setKycPreviews({})
                    setShowKYC(false)
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {selectedMemberForIDCard && (
        <TeamMemberIDCard
          member={selectedMemberForIDCard}
          partner={null}
          onClose={() => setSelectedMemberForIDCard(null)}
        />
      )}

      {/* Activity Modal */}
      {selectedMemberActivities && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedMemberActivities.name}'s Activities
                </h2>
                <p className="text-sm text-slate-600 mt-1">View all bookings and activities</p>
              </div>
              <button
                onClick={() => setSelectedMemberActivities(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {loadingActivities[selectedMemberActivities._id || selectedMemberActivities.id] ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Loading activities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const memberId = selectedMemberActivities._id || selectedMemberActivities.id
                  const activities = memberActivities[memberId] || []
                  
                  if (activities.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500">
                        <FiActivity className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No activities found for this team member</p>
                      </div>
                    )
                  }

                  return activities.map((activity, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">
                            {activity.subService?.name || activity.service?.name || 'Service'}
                          </h4>
                          {activity.user && (
                            <p className="text-sm text-slate-600 mt-1">
                              Customer: {activity.user.name} ({activity.user.phone})
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        {activity.scheduledDate && (
                          <div>
                            <p className="text-slate-500">Scheduled Date</p>
                            <p className="font-medium">{new Date(activity.scheduledDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {activity.scheduledTime && (
                          <div>
                            <p className="text-slate-500">Time</p>
                            <p className="font-medium">{activity.scheduledTime}</p>
                          </div>
                        )}
                        {activity.amount && (
                          <div>
                            <p className="text-slate-500">Amount</p>
                            <p className="font-medium">₹{activity.amount}</p>
                          </div>
                        )}
                        {activity.completedAt && (
                          <div>
                            <p className="text-slate-500">Completed</p>
                            <p className="font-medium">{new Date(activity.completedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      {activity.location && (
                        <div className="mt-3 text-sm">
                          <p className="text-slate-500">Location</p>
                          <p className="font-medium">
                            {activity.location.address}, {activity.location.city} - {activity.location.pincode}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamMembersTab

