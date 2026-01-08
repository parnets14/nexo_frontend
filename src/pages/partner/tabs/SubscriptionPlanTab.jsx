import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiCreditCard, FiCheck, FiX, FiRefreshCw, FiCalendar, FiTarget, FiTrendingUp } from 'react-icons/fi'

const SubscriptionPlanTab = () => {
  const { token, partner } = usePartnerAuth()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [availablePlans, setAvailablePlans] = useState([])
  const [currentLeadPlan, setCurrentLeadPlan] = useState(null)
  const [availableLeadPlans, setAvailableLeadPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlans()
  }, [token])

  const fetchPlans = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      // Pass partner type to filter available plans
      const partnerType = partner?.partnerType || null
      const [currentRes, plansRes, currentLeadRes, leadPlansRes] = await Promise.all([
        partnerApi.getCurrentPlan(token).catch(() => null),
        partnerApi.getMGPlans(token, partnerType).catch(() => null),
        partnerApi.getCurrentLeadPlan(token).catch(() => null),
        partnerApi.getLeadPlans(token).catch(() => null)
      ])

      if (currentRes?.data) {
        setCurrentPlan(currentRes.data)
      } else if (currentRes) {
        setCurrentPlan(currentRes)
      }

      if (plansRes?.data) {
        setAvailablePlans(plansRes.data)
      } else if (plansRes) {
        setAvailablePlans(Array.isArray(plansRes) ? plansRes : [])
      }

      if (currentLeadRes?.data) {
        setCurrentLeadPlan(currentLeadRes.data)
      } else if (currentLeadRes) {
        setCurrentLeadPlan(currentLeadRes)
      }

      if (leadPlansRes?.data) {
        setAvailableLeadPlans(leadPlansRes.data)
      } else if (leadPlansRes) {
        setAvailableLeadPlans(Array.isArray(leadPlansRes) ? leadPlansRes : [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    if (!token) return

    try {
      const response = await partnerApi.subscribeToPlan(token, planId)
      if (response.success) {
        alert('Successfully subscribed to plan!')
        fetchPlans()
      }
    } catch (err) {
      alert(err.message || 'Failed to subscribe to plan')
    }
  }

  const handleRenew = async () => {
    if (!token) return

    try {
      const response = await partnerApi.renewPlan(token)
      if (response.success) {
        alert('Plan renewed successfully!')
        fetchPlans()
      }
    } catch (err) {
      alert(err.message || 'Failed to renew plan')
    }
  }

  const handleSubscribeToLeadPlan = async (planId) => {
    if (!token) return

    try {
      const response = await partnerApi.subscribeToLeadPlan(token, planId)
      if (response.success) {
        alert('Successfully subscribed to lead plan!')
        fetchPlans()
      }
    } catch (err) {
      alert(err.message || 'Failed to subscribe to lead plan')
    }
  }

  const handleRenewLeadPlan = async () => {
    if (!token) return

    try {
      const response = await partnerApi.renewLeadPlan(token)
      if (response.success) {
        alert('Lead plan renewed successfully!')
        fetchPlans()
      }
    } catch (err) {
      alert(err.message || 'Failed to renew lead plan')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Subscription Plans</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage your MG and Lead plan subscriptions</p>
        </div>
        <button
          onClick={fetchPlans}
          className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg sm:text-xl text-slate-600" />
        </button>
      </div>

      {/* MG Plan Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FiCreditCard className="text-primary" />
          MG Plan
        </h2>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold">Current Plan</h2>
                {currentPlan.plan?.partnerType && (
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full font-semibold">
                    {currentPlan.plan.partnerType === 'individual' ? '👤 Individual' : 
                     currentPlan.plan.partnerType === 'franchise' ? '🏢 Franchise' : 
                     '👥 Both'}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-white/80">{currentPlan.plan?.name || currentPlan.name || 'MG Plan'}</p>
            </div>
            <div className="bg-white/20 p-3 sm:p-4 rounded-xl self-start sm:self-auto">
              <FiCreditCard className="text-3xl sm:text-4xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Leads Guaranteed</p>
              <p className="text-2xl font-bold">{currentPlan.leadsGuaranteed || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Leads Used</p>
              <p className="text-2xl font-bold">{currentPlan.leadsUsed || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Leads Remaining</p>
              <p className="text-2xl font-bold">{currentPlan.leadsRemaining || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-white/80 mb-1">Lead Fee</p>
              <p className="text-lg sm:text-xl font-bold">₹{currentPlan.leadFee || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-white/80 mb-1">Commission</p>
              <p className="text-lg sm:text-xl font-bold">{currentPlan.commission || 0}%</p>
            </div>
          </div>

          {currentPlan.expiresAt && (
            <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-lg sm:text-xl" />
                <p className="text-sm sm:text-base font-semibold">Plan Expires</p>
              </div>
              <p className="text-base sm:text-lg">
                {new Date(currentPlan.expiresAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {currentPlan.daysUntilRenewal !== undefined && currentPlan.daysUntilRenewal <= 7 && (
                <button
                  onClick={handleRenew}
                  className="mt-3 sm:mt-4 w-full py-2 bg-white text-primary rounded-lg text-sm sm:text-base font-semibold hover:bg-white/90 transition"
                >
                  Renew Plan
                </button>
              )}
            </div>
          )}

          {currentPlan.isExpired && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-100">⚠️ Your plan has expired. Please renew to continue.</p>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      {!currentPlan && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Available Plans</h2>
            {partner?.partnerType && (
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                partner.partnerType === 'individual' 
                  ? 'bg-slate-100 text-slate-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {partner.partnerType === 'individual' ? '👤 Individual' : '🏢 Franchise'}
              </span>
            )}
          </div>
          {error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : availablePlans.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <FiCreditCard className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No plans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {availablePlans.map((plan, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-200 rounded-xl p-4 sm:p-6 hover:border-primary transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">{plan.name || 'Plan'}</h3>
                    {plan.partnerType && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                        plan.partnerType === 'individual' 
                          ? 'bg-slate-100 text-slate-700' 
                          : plan.partnerType === 'franchise' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {plan.partnerType === 'individual' ? '👤 Individual' : 
                         plan.partnerType === 'franchise' ? '🏢 Franchise' : 
                         '👥 Both'}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4">
                    ₹{plan.price?.toLocaleString('en-IN') || 0}
                  </p>
                  <ul className="space-y-2 mb-4 sm:mb-6">
                    <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                      <FiCheck className="text-green-600 flex-shrink-0" />
                      {plan.leads || 0} Leads Guaranteed
                    </li>
                    <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                      <FiCheck className="text-green-600 flex-shrink-0" />
                      Lead Fee: ₹{plan.leadFee || 0}
                    </li>
                    <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                      <FiCheck className="text-green-600 flex-shrink-0" />
                      Commission: {plan.commission || 0}%
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan._id || plan.id)}
                    className="w-full py-2.5 sm:py-3 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-dark transition"
                  >
                    Subscribe Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Lead Plan Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FiTarget className="text-green-600" />
          Lead Plan
        </h2>

        {/* Current Lead Plan */}
        {currentLeadPlan && currentLeadPlan.currentPlan && (
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold">Current Lead Plan</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    currentLeadPlan.subscription?.status === 'active' ? 'bg-green-500/20 text-green-100' :
                    currentLeadPlan.subscription?.status === 'expired' ? 'bg-red-500/20 text-red-100' :
                    'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {currentLeadPlan.subscription?.status === 'active' ? 'Active' :
                     currentLeadPlan.subscription?.status === 'expired' ? 'Expired' :
                     'Pending'}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-white/80">{currentLeadPlan.currentPlan.name || 'Lead Plan'}</p>
              </div>
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl self-start sm:self-auto">
                <FiTarget className="text-3xl sm:text-4xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Total Leads</p>
                <p className="text-2xl font-bold">{currentLeadPlan.subscription?.leadsQuota || 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Leads Used</p>
                <p className="text-2xl font-bold">{currentLeadPlan.subscription?.leadsUsed || 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/80 mb-1">Leads Remaining</p>
                <p className="text-2xl font-bold">{currentLeadPlan.subscription?.leadsRemaining || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-white/80 mb-1">Plan Price</p>
                <p className="text-lg sm:text-xl font-bold">₹{currentLeadPlan.currentPlan?.price || 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-white/80 mb-1">Lead Quality</p>
                <p className="text-lg sm:text-xl font-bold">{currentLeadPlan.currentPlan?.leadQuality || 'Standard'}</p>
              </div>
            </div>

            {currentLeadPlan.subscription?.subscribedAt && (
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-lg sm:text-xl" />
                  <p className="text-sm sm:text-base font-semibold">Subscription Details</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Subscribed On</p>
                    <p className="text-sm">
                      {new Date(currentLeadPlan.subscription.subscribedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {currentLeadPlan.subscription?.expiresAt && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Expires On</p>
                      <p className="text-sm">
                        {new Date(currentLeadPlan.subscription.expiresAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
                {currentLeadPlan.subscription?.isExpired === false && currentLeadPlan.subscription?.expiresAt && (
                  <button
                    onClick={handleRenewLeadPlan}
                    className="mt-3 sm:mt-4 w-full py-2 bg-white text-green-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-white/90 transition"
                  >
                    Renew Lead Plan
                  </button>
                )}
              </div>
            )}

            {currentLeadPlan.subscription?.isExpired && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-100">⚠️ Your lead plan has expired. Please renew to continue receiving leads.</p>
              </div>
            )}
          </div>
        )}

        {/* Available Lead Plans */}
        {(!currentLeadPlan || !currentLeadPlan.currentPlan) && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Available Lead Plans</h3>
            </div>
            {error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : availableLeadPlans.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <FiTarget className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No lead plans available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {availableLeadPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="border-2 border-slate-200 rounded-xl p-4 sm:p-6 hover:border-green-500 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800">{plan.name || 'Lead Plan'}</h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold flex-shrink-0">
                        Leads
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-3 sm:mb-4">
                      ₹{plan.price?.toLocaleString('en-IN') || 0}
                    </p>
                    <ul className="space-y-2 mb-4 sm:mb-6">
                      <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                        <FiCheck className="text-green-600 flex-shrink-0" />
                        {plan.leads || 0} Total Leads
                      </li>
                      <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                        <FiCheck className="text-green-600 flex-shrink-0" />
                        Valid for {plan.validityMonths || 1} month{(plan.validityMonths || 1) > 1 ? 's' : ''}
                      </li>
                      <li className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                        <FiCheck className="text-green-600 flex-shrink-0" />
                        {plan.leadQuality || 'Premium'} lead quality
                      </li>
                    </ul>
                    <button
                      onClick={() => handleSubscribeToLeadPlan(plan._id || plan.id)}
                      className="w-full py-2.5 sm:py-3 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition"
                    >
                      Subscribe Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionPlanTab

