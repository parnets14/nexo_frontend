import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiX } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const AMCPlanManagement = () => {
  const { token } = useAdminAuth()
  const { data: plansData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchAMCPlans(token),
    []
  )
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priceDisplay: '',
    features: '',
    description: '',
    isActive: true,
    displayOrder: 0,
    highlight: false,
    highlightText: '',
    whatsappNumber: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Extract plans - handle different response structures
  const plans = React.useMemo(() => {
    if (!plansData) {
      return []
    }
    
    if (typeof plansData === 'string' && plansData.trim().startsWith('<!')) {
      console.error('❌ API returned HTML instead of JSON')
      return []
    }
    
    if (typeof plansData !== 'object' || plansData === null) {
      return []
    }
    
    if (Array.isArray(plansData)) {
      return plansData
    }
    
    if (plansData.success && Array.isArray(plansData.data)) {
      return plansData.data
    }
    
    if (Array.isArray(plansData.data)) {
      return plansData.data
    }
    
    return []
  }, [plansData])

  const handleCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      priceDisplay: '',
      features: '',
      description: '',
      isActive: true,
      displayOrder: plans.length,
      highlight: false,
      highlightText: '',
      whatsappNumber: ''
    })
    setShowModal(true)
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      price: plan.price || '',
      priceDisplay: plan.priceDisplay || `₹${plan.price || ''}`,
      features: plan.features?.join('\n') || '',
      description: plan.description || '',
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      displayOrder: plan.displayOrder || 0,
      highlight: plan.highlight || false,
      highlightText: plan.highlightText || '',
      whatsappNumber: plan.whatsappNumber || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        priceDisplay: formData.priceDisplay || `₹${Number(formData.price).toLocaleString('en-IN')}`,
        features: formData.features.split('\n').filter(f => f.trim()),
        displayOrder: Number(formData.displayOrder) || 0
      }

      if (editingPlan) {
        await adminApi.updateAMCPlan(token, editingPlan._id, submitData)
      } else {
        await adminApi.createAMCPlan(token, submitData)
      }
      
      setShowModal(false)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to save plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await adminApi.deleteAMCPlan(token, planId)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to delete plan')
    }
  }

  return (
    <div>
      <ModuleHeader
        title="AMC Plans Management"
        subtitle="Manage AMC plans displayed on the Corporate AMC page - Choose the plan that fits your business needs."
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {plans.length > 0 && (
            <span>Total Plans: <strong>{plans.length}</strong></span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
          >
            <FiPlus /> Create New Plan
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          <p className="font-semibold mb-2">Error loading plans</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-slate-700 mb-2">No AMC plans found</p>
          <p className="text-slate-600 mb-6">Create your first AMC plan to get started.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
            >
              <FiPlus /> Create First Plan
            </button>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition inline-flex items-center gap-2"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition ${
                plan.highlight ? 'border-primary scale-105' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-1">{plan.name}</h3>
                  {plan.highlightText && (
                    <span className="text-xs text-primary font-semibold">{plan.highlightText}</span>
                  )}
                  {!plan.isActive && (
                    <span className="text-xs text-rose-600 font-semibold ml-2">Inactive</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <FiEdit2 className="text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-2 hover:bg-rose-50 rounded-lg transition"
                  >
                    <FiTrash2 className="text-rose-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {plan.priceDisplay || `₹${plan.price?.toLocaleString('en-IN') || 0}`}
                  </div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs text-gray-500">
                  Display Order: {plan.displayOrder}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlan ? 'Edit AMC Plan' : 'Create AMC Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Basic, Standard, Premium"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      const price = e.target.value
                      setFormData(prev => ({ 
                        ...prev, 
                        price,
                        priceDisplay: prev.priceDisplay || `₹${Number(price).toLocaleString('en-IN')}`
                      }))
                    }}
                    required
                    min="0"
                    step="0.01"
                    placeholder="2500"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price Display
                  </label>
                  <input
                    type="text"
                    value={formData.priceDisplay}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceDisplay: e.target.value }))}
                    placeholder="₹2,500 (auto-generated if empty)"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Features <span className="text-rose-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(One per line)</span>
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  required
                  rows="6"
                  placeholder="Monthly inspection&#10;Basic repairs included&#10;Electrical maintenance&#10;Plumbing maintenance&#10;AC service (quarterly)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Optional description for the plan"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="919590926068"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.highlight}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight: e.target.checked }))}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-slate-700">Highlight</span>
                  </label>
                </div>
              </div>

              {formData.highlight && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Highlight Text
                  </label>
                  <input
                    type="text"
                    value={formData.highlightText}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlightText: e.target.value }))}
                    placeholder="e.g., Most Popular, Recommended"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AMCPlanManagement

