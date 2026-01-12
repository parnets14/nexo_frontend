import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaBullseye,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaSave,
  FaTimes
} from 'react-icons/fa'
import { useAdminAuth } from '../../context/AdminAuthContext'

const LeadPlanManagement = () => {
  const { token } = useAdminAuth()
  const [leadPlans, setLeadPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    leads: '',
    leadFee: '',
    description: '',
    features: '',
    leadQuality: 'standard',
    responseTime: '24 hours',
    supportLevel: 'basic',
    partnerType: 'individual',
    validityType: 'monthly',
    validityMonths: '1',
    termsAndConditions: '',
    isActive: true,
    isDefault: false
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:9088' : window.location.origin)

  // Fetch lead plans
  const fetchLeadPlans = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/admin/lead-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLeadPlans(result.data || [])
        } else {
          setError(result.message || 'Failed to fetch lead plans')
        }
      } else {
        setError('Failed to fetch lead plans')
      }
    } catch (err) {
      console.error('Error fetching lead plans:', err)
      setError('Error fetching lead plans')
    } finally {
      setLoading(false)
    }
  }

  // Create default lead plans
  const createDefaultPlans = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/admin/lead-plans/ensure-defaults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchLeadPlans()
          alert(`Default plans created: ${result.data.created.join(', ')}`)
        }
      }
    } catch (err) {
      console.error('Error creating default plans:', err)
      setError('Error creating default plans')
    } finally {
      setLoading(false)
    }
  }

  // Create or update lead plan
  const handleSavePlan = async () => {
    try {
      setLoading(true)
      
      const planData = {
        ...formData,
        price: Number(formData.price),
        leads: Number(formData.leads),
        leadFee: Number(formData.leadFee),
        validityMonths: Number(formData.validityMonths),
        features: formData.features.split('\n').filter(f => f.trim())
      }

      const url = selectedPlan 
        ? `${API_BASE_URL}/api/admin/lead-plans/${selectedPlan._id}`
        : `${API_BASE_URL}/api/admin/lead-plans`
      
      const method = selectedPlan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchLeadPlans()
          setShowCreateModal(false)
          setShowEditModal(false)
          setSelectedPlan(null)
          resetForm()
          alert(`Lead plan ${selectedPlan ? 'updated' : 'created'} successfully`)
        } else {
          setError(result.message || 'Failed to save lead plan')
        }
      } else {
        setError('Failed to save lead plan')
      }
    } catch (err) {
      console.error('Error saving lead plan:', err)
      setError('Error saving lead plan')
    } finally {
      setLoading(false)
    }
  }

  // Delete lead plan
  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this lead plan?')) return

    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/api/admin/lead-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await fetchLeadPlans()
          alert('Lead plan deleted successfully')
        } else {
          setError(result.message || 'Failed to delete lead plan')
        }
      } else {
        setError('Failed to delete lead plan')
      }
    } catch (err) {
      console.error('Error deleting lead plan:', err)
      setError('Error deleting lead plan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      leads: '',
      leadFee: '',
      description: '',
      features: '',
      leadQuality: 'standard',
      responseTime: '24 hours',
      supportLevel: 'basic',
      partnerType: 'individual',
      validityType: 'monthly',
      validityMonths: '1',
      termsAndConditions: '',
      isActive: true,
      isDefault: false
    })
  }

  const openEditModal = (plan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      leads: plan.leads.toString(),
      leadFee: plan.leadFee.toString(),
      description: plan.description || '',
      features: plan.features?.join('\n') || '',
      leadQuality: plan.leadQuality || 'standard',
      responseTime: plan.responseTime || '24 hours',
      supportLevel: plan.supportLevel || 'basic',
      partnerType: plan.partnerType || 'individual',
      validityType: plan.validityType || 'monthly',
      validityMonths: plan.validityMonths?.toString() || '1',
      termsAndConditions: plan.termsAndConditions || '',
      isActive: plan.isActive !== false,
      isDefault: plan.isDefault || false
    })
    setShowEditModal(true)
  }

  useEffect(() => {
    fetchLeadPlans()
  }, [])

  const stats = {
    totalPlans: leadPlans.length,
    activePlans: leadPlans.filter(p => p.isActive).length,
    totalRevenue: leadPlans.reduce((sum, p) => sum + (p.price || 0), 0),
    avgPrice: leadPlans.length > 0 ? Math.round(leadPlans.reduce((sum, p) => sum + (p.price || 0), 0) / leadPlans.length) : 0
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Plan Management</h1>
          <p className="text-gray-600">Manage lead plans for partner subscriptions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={createDefaultPlans}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaCheckCircle />
            Create Defaults
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus />
            Add Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
            </div>
            <FaBullseye className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="text-3xl text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.avgPrice.toLocaleString()}</p>
            </div>
            <FaChartLine className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Plans Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lead Plans</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-gray-400" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : leadPlans.length === 0 ? (
          <div className="text-center py-12">
            <FaBullseye className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No lead plans found</p>
            <p className="text-gray-400 text-sm">Create your first lead plan to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leadPlans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{plan.icon || '📦'}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{plan.price?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.leads}</div>
                      <div className="text-sm text-gray-500">leads/month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.leadQuality === 'exclusive' ? 'bg-purple-100 text-purple-800' :
                        plan.leadQuality === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.leadQuality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{plan.partnerType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {plan.isDefault && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPlan ? 'Edit Lead Plan' : 'Create Lead Plan'}
                </h2>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                    <select
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plan</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leads per Month</label>
                    <input
                      type="number"
                      value={formData.leads}
                      onChange={(e) => setFormData(prev => ({ ...prev, leads: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.leadFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, leadFee: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Quality</label>
                    <select
                      value={formData.leadQuality}
                      onChange={(e) => setFormData(prev => ({ ...prev, leadQuality: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Level</label>
                    <select
                      value={formData.supportLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, supportLevel: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="priority">Priority</option>
                      <option value="dedicated">Dedicated</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
                    <select
                      value={formData.partnerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnerType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="individual">Individual</option>
                      <option value="franchise">Franchise</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <input
                    type="text"
                    value={formData.responseTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, responseTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Plan description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Email support&#10;Basic analytics&#10;Standard lead quality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Lead plan terms and conditions..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Default Plan</span>
                  </label>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedPlan(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {selectedPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LeadPlanManagement