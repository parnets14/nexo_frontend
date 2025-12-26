import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const MGPlanManagement = () => {
  const { token } = useAdminAuth()
  const { data: plansData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchMGPlans(token),
    []
  )
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    leads: '',
    commission: '',
    leadFee: '',
    minWalletBalance: '',
    description: '',
    refundPolicy: '',
    features: '',
    validityType: 'monthly',
    validityMonths: '',
    partnerType: 'individual',
    isDefault: false,
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  const plans = plansData?.data || []

  const handleCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      leads: '',
      commission: '',
      leadFee: '',
      minWalletBalance: '',
      description: '',
      refundPolicy: '',
      features: '',
      validityType: 'monthly',
      validityMonths: '',
      partnerType: 'individual',
      isDefault: false,
      isActive: true
    })
    setShowModal(true)
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price,
      leads: plan.leads,
      commission: plan.commission,
      leadFee: plan.leadFee ?? '',
      minWalletBalance: plan.minWalletBalance ?? '',
      description: plan.description || '',
      refundPolicy: plan.refundPolicy || '',
      features: plan.features?.join('\n') || '',
      validityType: plan.validityType || 'monthly',
      validityMonths: plan.validityType === 'custom' ? (plan.validityMonths || '') : '',
      partnerType: plan.partnerType || 'individual',
      isDefault: plan.isDefault || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true
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
        leads: Number(formData.leads),
        commission: Number(formData.commission),
        leadFee: formData.leadFee === '' ? undefined : Number(formData.leadFee),
        minWalletBalance: formData.minWalletBalance === '' ? undefined : Number(formData.minWalletBalance),
        features: formData.features.split('\n').filter(f => f.trim()),
        validityType: formData.validityType,
        validityMonths: formData.validityType === 'custom' && formData.validityMonths ? Number(formData.validityMonths) : undefined
      }

      if (editingPlan) {
        await adminApi.updateMGPlan(token, editingPlan._id, submitData)
      } else {
        await adminApi.createMGPlan(token, submitData)
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
      await adminApi.deleteMGPlan(token, planId)
      refresh()
    } catch (err) {
      alert(err.message || 'Failed to delete plan')
    }
  }

  const getPlanIcon = (name) => {
    if (!name) return '📋'
    const nameLower = name.toLowerCase()
    if (nameLower.includes('silver')) return '🥈'
    if (nameLower.includes('gold')) return '🥇'
    if (nameLower.includes('platinum')) return '💎'
    if (nameLower.includes('basic')) return '📦'
    if (nameLower.includes('premium')) return '⭐'
    if (nameLower.includes('enterprise') || nameLower.includes('business')) return '🏢'
    if (nameLower.includes('starter')) return '🚀'
    if (nameLower.includes('pro')) return '💼'
    // Default icon based on first letter or use a generic icon
    return '📋'
  }

  return (
    <div>
      <ModuleHeader
        title="MG Plan Management"
        subtitle="Manage Minimum Guarantee plans for partners - pricing, leads, and commission rates."
      />

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
        >
          <FiPlus /> Create New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          Error loading plans: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getPlanIcon(plan.name)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {plan.isDefault && (
                      <span className="text-xs text-primary font-semibold">Default Plan</span>
                    )}
                  </div>
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
                  <div className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    <span className="text-gray-700">{plan.leads} Guaranteed Leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    <span className="text-gray-700">{plan.commission}% Commission Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    <span className="text-gray-700">Lead Fee ₹{(plan.leadFee ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" />
                    <span className="text-gray-700">Min Wallet ₹{(plan.minWalletBalance ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-blue-500" />
                    <span className="text-gray-700">
                      Validity: {
                        plan.validityType === 'monthly' ? '1 Month' :
                        plan.validityType === 'quarterly' ? '3 Months' :
                        plan.validityType === 'yearly' ? '12 Months' :
                        plan.validityType === 'custom' ? `${plan.validityMonths || 1} Month(s)` :
                        '1 Month'
                      }
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mt-3">{plan.description}</p>
                )}
                {plan.refundPolicy && (
                  <p className="text-xs text-gray-500 mt-2 italic">{plan.refundPolicy}</p>
                )}

                {plan.features?.length ? (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Highlights</p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <FiCheckCircle className="text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-3 border-t flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-gray-500/10 text-gray-600'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plan.partnerType === 'franchise'
                        ? 'bg-purple-500/10 text-purple-600'
                        : plan.partnerType === 'both'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-slate-500/10 text-slate-600'
                    }`}
                  >
                    {plan.partnerType === 'franchise' ? 'Franchise' : plan.partnerType === 'both' ? 'Both' : 'Individual'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.trim() }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter plan name (e.g., Silver, Gold, Platinum, Basic, Premium, etc.)"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  You can use the same name for different partner types (e.g., "Silver" for Individual and "Silver" for Franchise)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Partner Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.partnerType}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  required
                >
                  <option value="individual">Individual Partner</option>
                  <option value="franchise">Franchise Partner</option>
                  <option value="both">Both (Individual & Franchise)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select which partner type can subscribe to this plan
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="1000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guaranteed Leads <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.leads}
                  onChange={(e) => setFormData(prev => ({ ...prev, leads: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="20"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Commission (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="5"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.leadFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, leadFee: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="50"
                    min="0"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Wallet Balance (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minWalletBalance}
                    onChange={(e) => setFormData(prev => ({ ...prev, minWalletBalance: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="20"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  rows={3}
                  placeholder="Plan description..."
                />
              </div>

              {/* Plan Validity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Validity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.validityType}
                  onChange={(e) => setFormData(prev => ({ ...prev, validityType: e.target.value, validityMonths: e.target.value === 'custom' ? prev.validityMonths : '' }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  required
                >
                  <option value="monthly">Monthly (1 Month)</option>
                  <option value="quarterly">Quarterly (3 Months)</option>
                  <option value="yearly">Yearly (12 Months)</option>
                  <option value="custom">Custom Duration</option>
                </select>
                {formData.validityType === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Duration (Months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.validityMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, validityMonths: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="Enter number of months"
                      min="1"
                      required={formData.validityType === 'custom'}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the number of months for plan validity
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Select how long the plan remains valid after subscription
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Policy
                </label>
                <textarea
                  value={formData.refundPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, refundPolicy: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  rows={2}
                  placeholder="Refund policy details..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700">Set as Default Plan</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50"
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

export default MGPlanManagement

