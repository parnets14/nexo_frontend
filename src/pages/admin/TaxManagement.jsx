import React, { useState, useEffect } from 'react'
import { 
  FiPercent, 
  FiSave, 
  FiRefreshCw, 
  FiInfo, 
  FiPlus, 
  FiTrash2, 
  FiEdit3,
  FiActivity,
  FiTrendingUp,
  FiSettings,
  FiDollarSign
} from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StateSelector from '../../components/StateSelector.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const TaxManagement = () => {
  const { token } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('settings')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Tax Settings State
  const [taxSettings, setTaxSettings] = useState({
    gst: {
      enabled: true,
      totalRate: 18,
      breakdown: {
        enabled: true,
        sgstRate: 9,
        cgstRate: 9,
        igstRate: 18
      },
      applicableOn: ['services', 'subscriptions', 'amc_plans'],
      stateConfiguration: {
        businessState: 'Maharashtra',
        enableInterStateIGST: true
      }
    },
    serviceTax: {
      enabled: false,
      rate: 0,
      applicableOn: ['services']
    },
    platformFee: {
      enabled: true,
      rate: 2.5,
      type: 'percentage',
      applicableOn: ['services', 'bookings']
    },
    paymentGatewayFee: {
      enabled: true,
      rate: 2.0,
      type: 'percentage',
      applicableOn: ['all']
    },
    customTaxes: [],
    exemptions: {
      minimumAmount: 0,
      exemptServices: [],
      exemptCategories: []
    },
    displaySettings: {
      showTaxBreakdown: true,
      showInclusivePrice: false,
      taxLabel: 'Tax',
      gstLabel: 'GST'
    },
    calculationRules: {
      roundingMethod: 'round',
      decimalPlaces: 2,
      compoundTax: false
    }
  })

  // Custom Tax Form State
  const [customTaxForm, setCustomTaxForm] = useState({
    name: '',
    rate: '',
    type: 'percentage',
    description: '',
    isActive: true
  })
  const [editingTaxIndex, setEditingTaxIndex] = useState(-1)

  // Tax Calculator State
  const [calculator, setCalculator] = useState({
    baseAmount: '',
    entityType: 'services',
    customerState: 'Maharashtra',
    result: null
  })

  const { data: taxData, isLoading, error, refresh } = useAdminData(
    (token) => adminApi.getTaxSettings(token),
    []
  )

  // Load tax settings when data is fetched
  useEffect(() => {
    if (taxData?.data) {
      setTaxSettings(taxData.data)
    }
  }, [taxData])

  const handleSaveSettings = async () => {
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      await adminApi.updateTaxSettings(token, taxSettings)
      setSuccessMsg('Tax settings updated successfully!')
      refresh()
      
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    } catch (err) {
      console.error('Tax settings update error:', err);
      setErrorMsg(err.message || 'Failed to update tax settings')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCustomTax = async () => {
    if (!customTaxForm.name || !customTaxForm.rate) {
      setErrorMsg('Name and rate are required for custom tax')
      return
    }

    try {
      const newTax = {
        ...customTaxForm,
        rate: parseFloat(customTaxForm.rate)
      }

      if (editingTaxIndex >= 0) {
        // Update existing tax
        const updatedTaxes = [...taxSettings.customTaxes]
        updatedTaxes[editingTaxIndex] = newTax
        setTaxSettings(prev => ({ ...prev, customTaxes: updatedTaxes }))
        setEditingTaxIndex(-1)
      } else {
        // Add new tax
        setTaxSettings(prev => ({
          ...prev,
          customTaxes: [...prev.customTaxes, newTax]
        }))
      }

      setCustomTaxForm({
        name: '',
        rate: '',
        type: 'percentage',
        description: '',
        isActive: true
      })
      setSuccessMsg('Custom tax added successfully!')
    } catch (err) {
      setErrorMsg('Failed to add custom tax')
    }
  }

  const handleEditCustomTax = (index) => {
    const tax = taxSettings.customTaxes[index]
    setCustomTaxForm({
      name: tax.name,
      rate: tax.rate.toString(),
      type: tax.type,
      description: tax.description || '',
      isActive: tax.isActive
    })
    setEditingTaxIndex(index)
  }

  const handleDeleteCustomTax = (index) => {
    const updatedTaxes = taxSettings.customTaxes.filter((_, i) => i !== index)
    setTaxSettings(prev => ({ ...prev, customTaxes: updatedTaxes }))
    setSuccessMsg('Custom tax deleted successfully!')
  }

  const handleCalculateTax = async () => {
    if (!calculator.baseAmount) {
      setErrorMsg('Please enter a base amount')
      return
    }

    try {
      const result = await adminApi.calculateTax(token, {
        baseAmount: parseFloat(calculator.baseAmount),
        entityType: calculator.entityType,
        options: {
          customerState: calculator.customerState
        }
      })
      setCalculator(prev => ({ ...prev, result: result.data }))
    } catch (err) {
      setErrorMsg('Failed to calculate tax')
    }
  }

  const applicableOnOptions = [
    { value: 'services', label: 'Services' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'amc_plans', label: 'AMC Plans' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'registration_fees', label: 'Registration Fees' },
    { value: 'toolkit', label: 'Toolkit' },
    { value: 'spare_parts', label: 'Spare Parts' },
    { value: 'all', label: 'All' }
  ]

  const entityTypeOptions = [
    { value: 'services', label: 'Services' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'amc_plans', label: 'AMC Plans' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'registration_fees', label: 'Registration Fees' }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <ModuleHeader
        title="Tax Management"
        subtitle="Configure tax rates, fees, and calculation rules for all services and transactions."
      />

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiSettings className="w-5 h-5" />
            Tax Settings
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === 'calculator'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiActivity className="w-5 h-5" />
            Tax Calculator
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === 'analytics'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiTrendingUp className="w-5 h-5" />
            Analytics
          </button>
        </div>
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

      {/* Tax Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* GST Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiPercent className="w-5 h-5 text-primary" />
                GST Configuration (SGST/CGST/IGST)
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="gstEnabled"
                    checked={taxSettings.gst.enabled}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      gst: { ...prev.gst, enabled: e.target.checked }
                    }))}
                    className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="gstEnabled" className="font-semibold text-slate-700">
                    Enable GST
                  </label>
                </div>

                {taxSettings.gst.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Total GST Rate (%)
                        </label>
                        <input
                          type="number"
                          value={taxSettings.gst.totalRate}
                          onChange={(e) => {
                            const totalRate = parseFloat(e.target.value) || 0;
                            const halfRate = totalRate / 2;
                            setTaxSettings(prev => ({
                              ...prev,
                              gst: { 
                                ...prev.gst, 
                                totalRate,
                                breakdown: {
                                  ...prev.gst.breakdown,
                                  sgstRate: halfRate,
                                  cgstRate: halfRate,
                                  igstRate: totalRate
                                }
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                          placeholder="18"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Business State
                        </label>
                        <StateSelector
                          value={taxSettings.gst.stateConfiguration?.businessState || 'Maharashtra'}
                          onChange={(value) => setTaxSettings(prev => ({
                            ...prev,
                            gst: { 
                              ...prev.gst, 
                              stateConfiguration: {
                                ...prev.gst.stateConfiguration,
                                businessState: value
                              }
                            }
                          }))}
                          placeholder="Select your business state"
                          className="border-2 border-slate-300 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        id="gstBreakdownEnabled"
                        checked={taxSettings.gst.breakdown?.enabled || false}
                        onChange={(e) => setTaxSettings(prev => ({
                          ...prev,
                          gst: { 
                            ...prev.gst, 
                            breakdown: {
                              ...prev.gst.breakdown,
                              enabled: e.target.checked
                            }
                          }
                        }))}
                        className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="gstBreakdownEnabled" className="flex-1 cursor-pointer">
                        <span className="text-sm font-semibold text-slate-700">Enable SGST/CGST/IGST Breakdown</span>
                        <p className="text-xs text-slate-600 mt-1">
                          Automatically split GST into SGST+CGST for intra-state and IGST for inter-state transactions
                        </p>
                      </label>
                    </div>

                    {taxSettings.gst.breakdown?.enabled && (
                      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                        <h4 className="font-semibold text-slate-800">GST Breakdown Configuration</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              SGST Rate (%)
                            </label>
                            <input
                              type="number"
                              value={taxSettings.gst.breakdown?.sgstRate || 0}
                              onChange={(e) => setTaxSettings(prev => ({
                                ...prev,
                                gst: { 
                                  ...prev.gst, 
                                  breakdown: {
                                    ...prev.gst.breakdown,
                                    sgstRate: parseFloat(e.target.value) || 0
                                  }
                                }
                              }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="9"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <p className="text-xs text-slate-500 mt-1">State GST (Intra-state)</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              CGST Rate (%)
                            </label>
                            <input
                              type="number"
                              value={taxSettings.gst.breakdown?.cgstRate || 0}
                              onChange={(e) => setTaxSettings(prev => ({
                                ...prev,
                                gst: { 
                                  ...prev.gst, 
                                  breakdown: {
                                    ...prev.gst.breakdown,
                                    cgstRate: parseFloat(e.target.value) || 0
                                  }
                                }
                              }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="9"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <p className="text-xs text-slate-500 mt-1">Central GST (Intra-state)</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              IGST Rate (%)
                            </label>
                            <input
                              type="number"
                              value={taxSettings.gst.breakdown?.igstRate || 0}
                              onChange={(e) => setTaxSettings(prev => ({
                                ...prev,
                                gst: { 
                                  ...prev.gst, 
                                  breakdown: {
                                    ...prev.gst.breakdown,
                                    igstRate: parseFloat(e.target.value) || 0
                                  }
                                }
                              }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="18"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <p className="text-xs text-slate-500 mt-1">Integrated GST (Inter-state)</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <FiInfo className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <div className="text-xs text-amber-700">
                            <p className="font-semibold mb-1">GST Calculation Logic:</p>
                            <p>• Same State: SGST ({taxSettings.gst.breakdown?.sgstRate || 0}%) + CGST ({taxSettings.gst.breakdown?.cgstRate || 0}%) = {(taxSettings.gst.breakdown?.sgstRate || 0) + (taxSettings.gst.breakdown?.cgstRate || 0)}%</p>
                            <p>• Different State: IGST ({taxSettings.gst.breakdown?.igstRate || 0}%)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Applicable On
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {applicableOnOptions.map(option => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={taxSettings.gst.applicableOn.includes(option.value)}
                              onChange={(e) => {
                                const newApplicableOn = e.target.checked
                                  ? [...taxSettings.gst.applicableOn, option.value]
                                  : taxSettings.gst.applicableOn.filter(item => item !== option.value)
                                setTaxSettings(prev => ({
                                  ...prev,
                                  gst: { ...prev.gst, applicableOn: newApplicableOn }
                                }))
                              }}
                              className="w-4 h-4 text-primary border border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Platform Fee Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5 text-primary" />
                Platform Fee Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="platformFeeEnabled"
                    checked={taxSettings.platformFee.enabled}
                    onChange={(e) => setTaxSettings(prev => ({
                      ...prev,
                      platformFee: { ...prev.platformFee, enabled: e.target.checked }
                    }))}
                    className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="platformFeeEnabled" className="font-semibold text-slate-700">
                    Enable Platform Fee
                  </label>
                </div>

                {taxSettings.platformFee.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Fee Rate
                        </label>
                        <input
                          type="number"
                          value={taxSettings.platformFee.rate}
                          onChange={(e) => setTaxSettings(prev => ({
                            ...prev,
                            platformFee: { ...prev.platformFee, rate: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                          placeholder="2.5"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Fee Type
                        </label>
                        <select
                          value={taxSettings.platformFee.type}
                          onChange={(e) => setTaxSettings(prev => ({
                            ...prev,
                            platformFee: { ...prev.platformFee, type: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Custom Taxes */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiPlus className="w-5 h-5 text-primary" />
                Custom Taxes
              </h3>

              {/* Add Custom Tax Form */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Tax Name"
                    value={customTaxForm.name}
                    onChange={(e) => setCustomTaxForm(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={customTaxForm.rate}
                    onChange={(e) => setCustomTaxForm(prev => ({ ...prev, rate: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    min="0"
                    step="0.1"
                  />
                  <select
                    value={customTaxForm.type}
                    onChange={(e) => setCustomTaxForm(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <button
                    onClick={handleAddCustomTax}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    {editingTaxIndex >= 0 ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Custom Taxes List */}
              {taxSettings.customTaxes.length > 0 && (
                <div className="space-y-2">
                  {taxSettings.customTaxes.map((tax, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-slate-900">{tax.name}</span>
                        <span className="text-slate-600 ml-2">
                          {tax.rate}{tax.type === 'percentage' ? '%' : '₹'}
                        </span>
                        {tax.description && (
                          <p className="text-xs text-slate-500 mt-1">{tax.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCustomTax(index)}
                          className="p-2 text-slate-600 hover:text-primary transition"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomTax(index)}
                          className="p-2 text-slate-600 hover:text-rose-600 transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tax Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-primary" />
                Tax Summary
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">GST Configuration</p>
                  {taxSettings.gst.enabled ? (
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {taxSettings.gst.totalRate}%
                      </p>
                      {taxSettings.gst.breakdown?.enabled && (
                        <div className="text-xs text-slate-600 mt-1 space-y-1">
                          <p>SGST: {taxSettings.gst.breakdown.sgstRate}%</p>
                          <p>CGST: {taxSettings.gst.breakdown.cgstRate}%</p>
                          <p>IGST: {taxSettings.gst.breakdown.igstRate}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">Disabled</p>
                  )}
                </div>

                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Platform Fee</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {taxSettings.platformFee.enabled 
                      ? `${taxSettings.platformFee.rate}${taxSettings.platformFee.type === 'percentage' ? '%' : '₹'}`
                      : 'Disabled'
                    }
                  </p>
                </div>

                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Payment Gateway Fee</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {taxSettings.paymentGatewayFee.enabled 
                      ? `${taxSettings.paymentGatewayFee.rate}${taxSettings.paymentGatewayFee.type === 'percentage' ? '%' : '₹'}`
                      : 'Disabled'
                    }
                  </p>
                </div>

                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Custom Taxes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {taxSettings.customTaxes.filter(tax => tax.isActive).length}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-primary/20">
                <button
                  onClick={handleSaveSettings}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-primary" />
              Tax Calculator
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Base Amount (₹)
                </label>
                <input
                  type="number"
                  value={calculator.baseAmount}
                  onChange={(e) => setCalculator(prev => ({ ...prev, baseAmount: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="1000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Entity Type
                </label>
                <select
                  value={calculator.entityType}
                  onChange={(e) => setCalculator(prev => ({ ...prev, entityType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                >
                  {entityTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Customer State
                </label>
                <StateSelector
                  value={calculator.customerState}
                  onChange={(value) => setCalculator(prev => ({ ...prev, customerState: value }))}
                  placeholder="Select customer state"
                  className="border-2 border-slate-300 focus:border-primary"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used to determine SGST+CGST (same state) vs IGST (different state)
                </p>
              </div>

              <button
                onClick={handleCalculateTax}
                className="w-full px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2"
              >
                <FiActivity className="w-5 h-5" />
                Calculate Tax
              </button>
            </div>
          </div>

          {calculator.result && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Tax Calculation Result
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">Base Amount:</span>
                  <span className="font-semibold">₹{calculator.result.baseAmount.toLocaleString('en-IN')}</span>
                </div>

                {calculator.result.taxBreakdown.gst && (
                  <>
                    {calculator.result.taxBreakdown.gst.type === 'SGST+CGST' ? (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">SGST ({calculator.result.taxBreakdown.gst.sgst.rate}%):</span>
                          <span className="font-semibold">₹{calculator.result.taxBreakdown.gst.sgst.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-200">
                          <span className="text-slate-600">CGST ({calculator.result.taxBreakdown.gst.cgst.rate}%):</span>
                          <span className="font-semibold">₹{calculator.result.taxBreakdown.gst.cgst.amount.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : calculator.result.taxBreakdown.gst.type === 'IGST' ? (
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-600">IGST ({calculator.result.taxBreakdown.gst.igst.rate}%):</span>
                        <span className="font-semibold">₹{calculator.result.taxBreakdown.gst.igst.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-600">GST ({calculator.result.taxBreakdown.gst.totalRate}%):</span>
                        <span className="font-semibold">₹{calculator.result.taxBreakdown.gst.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </>
                )}

                {calculator.result.taxBreakdown.platformFee && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Platform Fee ({calculator.result.taxBreakdown.platformFee.rate}%):</span>
                    <span className="font-semibold">₹{calculator.result.taxBreakdown.platformFee.amount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {calculator.result.taxBreakdown.paymentGatewayFee && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Payment Gateway Fee ({calculator.result.taxBreakdown.paymentGatewayFee.rate}%):</span>
                    <span className="font-semibold">₹{calculator.result.taxBreakdown.paymentGatewayFee.amount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-4 font-bold text-lg">
                  <span className="text-slate-900">Total Amount:</span>
                  <span className="text-primary">₹{calculator.result.finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-primary" />
            Tax Analytics
          </h3>
          <p className="text-slate-600">Tax analytics and reporting features will be available here.</p>
        </div>
      )}
    </div>
  )
}

export default TaxManagement