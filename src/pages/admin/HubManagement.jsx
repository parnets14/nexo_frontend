import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiRefreshCw, FiUsers, FiSearch } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { adminApi } from '../../services/adminApi.js'
import { useAdminData } from '../../hooks/useAdminData.js'

const HubManagement = () => {
  const { token } = useAdminAuth()
  const [showModal, setShowModal] = useState(false)
  const [showAreaModal, setShowAreaModal] = useState(false)
  const [editingHub, setEditingHub] = useState(null)
  const [editingArea, setEditingArea] = useState(null)
  const [selectedHubForArea, setSelectedHubForArea] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hubForm, setHubForm] = useState({
    name: '',
    description: '',
    city: '',
    state: '',
    status: 'active'
  })
  const [areaForm, setAreaForm] = useState({
    areaName: '',
    pinCodesText: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch all hubs dynamically
  const { data: hubsData, isLoading: hubsLoading, error: hubsError, refresh: refreshHubs } = useAdminData(
    (token) => adminApi.fetchHubs(token, { search: searchQuery }),
    [searchQuery]
  )

  // Fetch partners for assignment
  const { data: partnersData } = useAdminData(
    (token) => adminApi.fetchPartners(token),
    []
  )

  const hubs = hubsData?.data || []
  const partners = partnersData?.partners || []

  const resetForm = () => {
    setHubForm({
      name: '',
      description: '',
      city: '',
      state: '',
      status: 'active'
    })
    setEditingHub(null)
  }

  const resetAreaForm = () => {
    setAreaForm({
      areaName: '',
      pinCodesText: ''
    })
    setEditingArea(null)
    setSelectedHubForArea(null)
  }

  const openCreateHub = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditHub = (hub) => {
    setHubForm({
      name: hub.name || '',
      description: hub.description || '',
      city: hub.city || '',
      state: hub.state || '',
      status: hub.status || 'active'
    })
    setEditingHub(hub)
    setShowModal(true)
  }

  const openAddArea = (hub) => {
    resetAreaForm()
    setSelectedHubForArea(hub)
    setShowAreaModal(true)
  }

  const openEditArea = (hub, area) => {
    setAreaForm({
      areaName: area.areaName || '',
      pinCodesText: area.pinCodes?.join(', ') || ''
    })
    setEditingArea(area)
    setSelectedHubForArea(hub)
    setShowAreaModal(true)
  }

  const handleHubSubmit = async (e) => {
    e.preventDefault()
    if (!hubForm.name.trim()) {
      alert('Hub name is required')
      return
    }

    setSubmitting(true)
    try {
      if (editingHub) {
        await adminApi.updateHub(token, editingHub._id, hubForm)
      } else {
        await adminApi.createHub(token, {
          ...hubForm,
          areas: [] // Start with empty areas, can be added later
        })
      }
      setShowModal(false)
      resetForm()
      refreshHubs()
    } catch (err) {
      alert(err.message || 'Failed to save hub')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAreaSubmit = async (e) => {
    e.preventDefault()
    if (!areaForm.areaName.trim() || !areaForm.pinCodesText.trim()) {
      alert('Area name and pin codes are required')
      return
    }

    const pinCodes = Array.from(
      new Set(
        areaForm.pinCodesText
          .split(/[\s,]+/)
          .map((pin) => pin.trim())
          .filter((pin) => pin.length > 0 && /^\d{6}$/.test(pin))
      )
    )

    if (pinCodes.length === 0) {
      alert('Please add at least one valid 6-digit pin code')
      return
    }

    setSubmitting(true)
    try {
      if (editingArea) {
        await adminApi.updateAreaInHub(token, selectedHubForArea._id, editingArea._id, {
          areaName: areaForm.areaName.trim(),
          pinCodes
        })
      } else {
        await adminApi.addAreaToHub(token, selectedHubForArea._id, {
          areaName: areaForm.areaName.trim(),
          pinCodes
        })
      }
      setShowAreaModal(false)
      resetAreaForm()
      refreshHubs()
    } catch (err) {
      alert(err.message || 'Failed to save area')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (hubId) => {
    if (!window.confirm('Are you sure you want to delete this hub? This action cannot be undone.')) return
    try {
      await adminApi.deleteHub(token, hubId)
      refreshHubs()
    } catch (err) {
      alert(err.message || 'Failed to delete hub')
    }
  }

  const handleDeleteArea = async (hubId, areaId) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return
    try {
      await adminApi.deleteAreaFromHub(token, hubId, areaId)
      refreshHubs()
    } catch (err) {
      alert(err.message || 'Failed to delete area')
    }
  }

  const getAllPinCodes = (hub) => {
    return hub.areas?.reduce((all, area) => [...all, ...(area.pinCodes || [])], []) || []
  }

  return (
    <div>
      <ModuleHeader
        title="Hub Management"
        subtitle="Create and manage service hubs with pin codes. Hubs can be assigned to partners in Partner Control."
      />

      {/* Search and Create */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hubs by name, city, or state..."
                className="w-full md:w-96 pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={openCreateHub}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition"
          >
            <FiPlus /> Create Hub
          </button>
        </div>
      </div>

      {/* Hubs List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              All Hubs ({hubs.length})
            </h2>
            <p className="text-xs text-slate-400">
              Manage hubs and their area-wise pin codes
            </p>
          </div>
          <button
            onClick={refreshHubs}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {hubsLoading ? (
          <div className="text-sm text-slate-400 py-8 text-center">Loading hubs...</div>
        ) : hubsError ? (
          <div className="text-sm text-rose-500 py-8 text-center">
            Failed to load hubs: {hubsError}
          </div>
        ) : hubs.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">
            {searchQuery ? 'No hubs found matching your search.' : 'No hubs created yet. Create your first hub above.'}
          </div>
        ) : (
          <div className="space-y-4">
            {hubs.map((hub) => {
              const allPinCodes = getAllPinCodes(hub)
              const assignedPartnersCount = hub.assignedPartners?.length || 0
              
              return (
                <div key={hub._id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FiMapPin className="text-primary text-xl" />
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{hub.name}</h3>
                          {(hub.city || hub.state) && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {[hub.city, hub.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          hub.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {hub.status}
                        </span>
                      </div>
                      
                      {hub.description && (
                        <p className="text-sm text-slate-600 mt-2">{hub.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin /> {hub.areas?.length || 0} Area{hub.areas?.length === 1 ? '' : 's'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin /> {allPinCodes.length} Pin Code{allPinCodes.length === 1 ? '' : 's'}
                        </span>
                        {assignedPartnersCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FiUsers /> {assignedPartnersCount} Partner{assignedPartnersCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openAddArea(hub)}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition"
                        title="Add Area"
                      >
                        <FiPlus className="inline mr-1" /> Area
                      </button>
                      <button
                        onClick={() => openEditHub(hub)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition"
                        title="Edit Hub"
                      >
                        <FiEdit2 className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(hub._id)}
                        className="p-2 hover:bg-rose-100 rounded-lg transition"
                        title="Delete Hub"
                      >
                        <FiTrash2 className="text-rose-600" />
                      </button>
                    </div>
                  </div>

                  {/* Areas List */}
                  {hub.areas && hub.areas.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Areas
                      </h4>
                      {hub.areas.map((area) => (
                        <div key={area._id} className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{area.areaName}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {area.pinCodes?.length || 0} pin code{area.pinCodes?.length === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditArea(hub, area)}
                                className="p-1.5 hover:bg-slate-100 rounded transition"
                                title="Edit Area"
                              >
                                <FiEdit2 className="text-slate-600 text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteArea(hub._id, area._id)}
                                className="p-1.5 hover:bg-rose-100 rounded transition"
                                title="Delete Area"
                              >
                                <FiTrash2 className="text-rose-600 text-sm" />
                              </button>
                            </div>
                          </div>
                          {area.pinCodes && area.pinCodes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {area.pinCodes.map((pin) => (
                                <span
                                  key={pin}
                                  className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary"
                                >
                                  {pin}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-center py-4 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500">No areas added yet. Click "Add Area" to get started.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Hub Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingHub ? 'Edit Hub' : 'Create Hub'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleHubSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hub Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hubForm.name}
                  onChange={(e) => setHubForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                  placeholder="e.g., Whitefield"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={hubForm.description}
                  onChange={(e) => setHubForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  rows={3}
                  placeholder="Hub description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={hubForm.city}
                    onChange={(e) => setHubForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g., Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={hubForm.state}
                    onChange={(e) => setHubForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="e.g., Karnataka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={hubForm.status}
                  onChange={(e) => setHubForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingHub ? 'Update Hub' : 'Create Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Area Modal */}
      {showAreaModal && selectedHubForArea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingArea ? 'Edit Area' : 'Add Area'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Hub: {selectedHubForArea.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowAreaModal(false)
                  resetAreaForm()
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAreaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Area Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={areaForm.areaName}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, areaName: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                  placeholder="e.g., Whitefield Main, ITPL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pin Codes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={areaForm.pinCodesText}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, pinCodesText: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  rows={4}
                  required
                  placeholder="Enter pin codes separated by commas or spaces (e.g., 560066, 560067, 560087)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate multiple pin codes with commas or spaces. Each pin code must be 6 digits.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAreaModal(false)
                    resetAreaForm()
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingArea ? 'Update Area' : 'Add Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HubManagement
