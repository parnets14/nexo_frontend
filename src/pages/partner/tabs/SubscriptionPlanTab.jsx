import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiCreditCard, FiCheck, FiX, FiRefreshCw, FiCalendar } from 'react-icons/fi'

const SubscriptionPlanTab = () => {
  const { token } = usePartnerAuth()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [availablePlans, setAvailablePlans] = useState([])
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
      const [currentRes, plansRes] = await Promise.all([
        partnerApi.getCurrentPlan(token).catch(() => null),
        partnerApi.getMGPlans(token).catch(() => null)
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
    } catch (err) {
      setError(err.message || 'Failed to fetch subscription plans')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Subscription Plan</h1>
          <p className="text-slate-600">Manage your subscription and plan details</p>
        </div>
        <button
          onClick={fetchPlans}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
        >
          <FiRefreshCw className="text-xl text-slate-600" />
        </button>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Plan</h2>
              <p className="text-white/80">{currentPlan.name || 'MG Plan'}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <FiCreditCard className="text-4xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Lead Fee</p>
              <p className="text-xl font-bold">₹{currentPlan.leadFee || 0}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Commission</p>
              <p className="text-xl font-bold">{currentPlan.commission || 0}%</p>
            </div>
          </div>

          {currentPlan.expiresAt && (
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-xl" />
                <p className="font-semibold">Plan Expires</p>
              </div>
              <p className="text-lg">
                {new Date(currentPlan.expiresAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {currentPlan.daysUntilRenewal !== undefined && currentPlan.daysUntilRenewal <= 7 && (
                <button
                  onClick={handleRenew}
                  className="mt-4 w-full py-2 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition"
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
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Available Plans</h2>
          {error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : availablePlans.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <FiCreditCard className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No plans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans.map((plan, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-200 rounded-xl p-6 hover:border-primary transition"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name || 'Plan'}</h3>
                  <p className="text-3xl font-bold text-primary mb-4">
                    ₹{plan.price?.toLocaleString('en-IN') || 0}
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-slate-600">
                      <FiCheck className="text-green-600" />
                      {plan.leads || 0} Leads Guaranteed
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <FiCheck className="text-green-600" />
                      Lead Fee: ₹{plan.leadFee || 0}
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <FiCheck className="text-green-600" />
                      Commission: {plan.commission || 0}%
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan._id || plan.id)}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
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
  )
}

export default SubscriptionPlanTab

