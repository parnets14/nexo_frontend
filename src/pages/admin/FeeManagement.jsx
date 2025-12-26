import React, { useState } from 'react'
import { FiDollarSign, FiSave, FiRefreshCw, FiInfo } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const FeeManagement = () => {
  const { token } = useAdminAuth()
  const [selectedPartnerType, setSelectedPartnerType] = useState('individual')
  const [formData, setFormData] = useState({
    individual: {
      registrationFee: '',
      securityDeposit: '',
      toolkitPrice: '',
      registrationFeeRefundable: false,
      securityDepositRefundable: false,
      toolkitPriceRefundable: false
    },
    franchise: {
      registrationFee: '',
      securityDeposit: '',
      toolkitPrice: '',
      registrationFeeRefundable: false,
      securityDepositRefundable: false,
      toolkitPriceRefundable: false
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: feesData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.fetchFees(token),
    []
  )

  // Update form when data is loaded
  React.useEffect(() => {
    if (feesData?.data) {
      setFormData({
        individual: {
          registrationFee: feesData.data.individual?.registrationFee || feesData.data.registrationFee || '',
          securityDeposit: feesData.data.individual?.securityDeposit || feesData.data.securityDeposit || '',
          toolkitPrice: feesData.data.individual?.toolkitPrice || feesData.data.toolkitPrice || '',
          registrationFeeRefundable: feesData.data.individual?.registrationFeeRefundable || feesData.data.registrationFeeRefundable || false,
          securityDepositRefundable: feesData.data.individual?.securityDepositRefundable || feesData.data.securityDepositRefundable || false,
          toolkitPriceRefundable: feesData.data.individual?.toolkitPriceRefundable || feesData.data.toolkitPriceRefundable || false
        },
        franchise: {
          registrationFee: feesData.data.franchise?.registrationFee || feesData.data.registrationFee || '',
          securityDeposit: feesData.data.franchise?.securityDeposit || feesData.data.securityDeposit || '',
          toolkitPrice: feesData.data.franchise?.toolkitPrice || feesData.data.toolkitPrice || '',
          registrationFeeRefundable: feesData.data.franchise?.registrationFeeRefundable || feesData.data.registrationFeeRefundable || false,
          securityDepositRefundable: feesData.data.franchise?.securityDepositRefundable || feesData.data.securityDepositRefundable || false,
          toolkitPriceRefundable: feesData.data.franchise?.toolkitPriceRefundable || feesData.data.toolkitPriceRefundable || false
        }
      })
    }
  }, [feesData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const currentData = formData[selectedPartnerType]
      await adminApi.updateFees(token, {
        partnerType: selectedPartnerType,
        registrationFee: Number(currentData.registrationFee),
        securityDeposit: Number(currentData.securityDeposit),
        toolkitPrice: Number(currentData.toolkitPrice),
        registrationFeeRefundable: currentData.registrationFeeRefundable,
        securityDepositRefundable: currentData.securityDepositRefundable,
        toolkitPriceRefundable: currentData.toolkitPriceRefundable
      })
      
      setSuccessMsg(`${selectedPartnerType === 'individual' ? 'Individual' : 'Franchise'} partner fees updated successfully!`)
      refresh()
      
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update fees')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (feesData?.data) {
      setFormData({
        individual: {
          registrationFee: feesData.data.individual?.registrationFee || feesData.data.registrationFee || '',
          securityDeposit: feesData.data.individual?.securityDeposit || feesData.data.securityDeposit || '',
          toolkitPrice: feesData.data.individual?.toolkitPrice || feesData.data.toolkitPrice || '',
          registrationFeeRefundable: feesData.data.individual?.registrationFeeRefundable || feesData.data.registrationFeeRefundable || false,
          securityDepositRefundable: feesData.data.individual?.securityDepositRefundable || feesData.data.securityDepositRefundable || false,
          toolkitPriceRefundable: feesData.data.individual?.toolkitPriceRefundable || feesData.data.toolkitPriceRefundable || false
        },
        franchise: {
          registrationFee: feesData.data.franchise?.registrationFee || feesData.data.registrationFee || '',
          securityDeposit: feesData.data.franchise?.securityDeposit || feesData.data.securityDeposit || '',
          toolkitPrice: feesData.data.franchise?.toolkitPrice || feesData.data.toolkitPrice || '',
          registrationFeeRefundable: feesData.data.franchise?.registrationFeeRefundable || feesData.data.registrationFeeRefundable || false,
          securityDepositRefundable: feesData.data.franchise?.securityDepositRefundable || feesData.data.securityDepositRefundable || false,
          toolkitPriceRefundable: feesData.data.franchise?.toolkitPriceRefundable || feesData.data.toolkitPriceRefundable || false
        }
      })
    }
    setErrorMsg('')
    setSuccessMsg('')
  }

  const calculateTotal = () => {
    const currentData = formData[selectedPartnerType]
    const regFee = Number(currentData.registrationFee) || 0
    const secDeposit = Number(currentData.securityDeposit) || 0
    return regFee + secDeposit
  }

  const currentFormData = formData[selectedPartnerType]

  return (
    <div>
      <ModuleHeader
        title="Fee Management"
        subtitle="Manage registration fee, security deposit, and toolkit pricing for partner onboarding."
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl">
          Error loading fees: {error}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Fee Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Update Fees</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Partner Type Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerType('individual')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition ${
                    selectedPartnerType === 'individual'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Individual Partner
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPartnerType('franchise')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition ${
                    selectedPartnerType === 'franchise'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Franchise Partner
                </button>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg mb-6 text-sm">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Registration Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={currentFormData.registrationFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], registrationFee: e.target.value } }))}
                      className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="500"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    One-time registration fee charged to {selectedPartnerType === 'individual' ? 'individual' : 'franchise'} partners during onboarding
                  </p>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="registrationFeeRefundable"
                      checked={currentFormData.registrationFeeRefundable}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], registrationFeeRefundable: e.target.checked } }))}
                      className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="registrationFeeRefundable" className="flex-1 cursor-pointer">
                      <span className="text-sm font-semibold text-slate-700">Registration Fee is Refundable</span>
                    </label>
                  </div>
                </div>

                {/* Security Deposit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Security Deposit (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={currentFormData.securityDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], securityDeposit: e.target.value } }))}
                      className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="1000"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Security deposit amount collected from {selectedPartnerType === 'individual' ? 'individual' : 'franchise'} partners
                  </p>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="securityDepositRefundable"
                      checked={currentFormData.securityDepositRefundable}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], securityDepositRefundable: e.target.checked } }))}
                      className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="securityDepositRefundable" className="flex-1 cursor-pointer">
                      <span className="text-sm font-semibold text-slate-700">Security Deposit is Refundable</span>
                    </label>
                  </div>
                </div>

                {/* Toolkit Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Toolkit Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={currentFormData.toolkitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], toolkitPrice: e.target.value } }))}
                      className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                      placeholder="2499"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Price for professional toolkit (optional purchase during onboarding)
                  </p>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="toolkitPriceRefundable"
                      checked={currentFormData.toolkitPriceRefundable}
                      onChange={(e) => setFormData(prev => ({ ...prev, [selectedPartnerType]: { ...prev[selectedPartnerType], toolkitPriceRefundable: e.target.checked } }))}
                      className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="toolkitPriceRefundable" className="flex-1 cursor-pointer">
                      <span className="text-sm font-semibold text-slate-700">Toolkit Price is Refundable</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Update Fees
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className={`bg-gradient-to-br border rounded-2xl p-6 sticky top-6 ${
              selectedPartnerType === 'individual'
                ? 'from-primary/10 to-primary/5 border-primary/20'
                : 'from-purple-500/10 to-purple-500/5 border-purple-500/20'
            }`}>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FiDollarSign className={`w-5 h-5 ${selectedPartnerType === 'individual' ? 'text-primary' : 'text-purple-600'}`} />
                Fee Summary
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {selectedPartnerType === 'individual' ? 'Individual Partner' : 'Franchise Partner'} Fees
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Registration Fee</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{(Number(currentFormData.registrationFee) || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Security Deposit</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{(Number(currentFormData.securityDeposit) || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Toolkit Price</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{(Number(currentFormData.toolkitPrice) || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className={`border-t pt-4 mt-4 ${selectedPartnerType === 'individual' ? 'border-primary/20' : 'border-purple-500/20'}`}>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Total Onboarding Fee</p>
                    <p className={`text-2xl font-bold ${selectedPartnerType === 'individual' ? 'text-primary' : 'text-purple-600'}`}>
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      (Registration + Security Deposit)
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-slate-500 mb-2 font-semibold">Refundable Status</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Registration Fee:</span>
                      <span className={`text-xs font-semibold ${currentFormData.registrationFeeRefundable ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {currentFormData.registrationFeeRefundable ? '✓ Refundable' : '✗ Non-Refundable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Security Deposit:</span>
                      <span className={`text-xs font-semibold ${currentFormData.securityDepositRefundable ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {currentFormData.securityDepositRefundable ? '✓ Refundable' : '✗ Non-Refundable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Toolkit Price:</span>
                      <span className={`text-xs font-semibold ${currentFormData.toolkitPriceRefundable ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {currentFormData.toolkitPriceRefundable ? '✓ Refundable' : '✗ Non-Refundable'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>Toolkit is optional. Total onboarding fee = Registration Fee + Security Deposit</p>
                      {(currentFormData.registrationFeeRefundable || currentFormData.securityDepositRefundable || currentFormData.toolkitPriceRefundable) && (
                        <p className="mt-2 text-emerald-700 font-semibold">
                          ✓ Refundable fees will be displayed to {selectedPartnerType === 'individual' ? 'individual' : 'franchise'} partners during onboarding
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeManagement

