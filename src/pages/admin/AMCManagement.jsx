import { useState, useEffect } from 'react'
import { FiCalendar, FiFileText, FiDollarSign, FiUsers, FiCreditCard, FiUserPlus, FiX } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

// AMC Management component for handling plan subscriptions and partner assignments

const AMCManagement = () => {
  const { token } = useAdminAuth()
  // Removed the non-existent /amc/contracts endpoint call
  const amcData = null
  const isLoading = false
  const error = null
  
  const [subscribers, setSubscribers] = useState([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    totalSubscribers: 0,
    activeSubscriptions: 0
  })
  const [partners, setPartners] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState('')
  const [assigningPartner, setAssigningPartner] = useState(false)

  // Fetch AMC subscribers and calculate stats
  useEffect(() => {
    const fetchSubscribers = async () => {
      if (!token) {
        console.log('No token available, skipping AMC subscribers fetch')
        return
      }

      setLoadingSubscribers(true)
      try {
        console.log('Fetching AMC subscribers with token:', token ? 'Present' : 'Missing')
        const data = await adminApi.fetchAMCSubscribers(token)
        console.log('AMC subscribers response:', data)
        
        if (data && data.success) {
          const subs = data.data || []
          setSubscribers(subs)
          
          // Calculate stats
          const totalRevenue = subs.reduce((sum, sub) => sum + (sub.amount || 0), 0)
          const activeCount = subs.filter(sub => sub.status === 'active').length
          
          setPaymentStats({
            totalRevenue,
            totalSubscribers: subs.length,
            activeSubscriptions: activeCount
          })
        }
      } catch (err) {
        console.error('Error fetching subscribers:', err)
        console.error('Error details:', err)
        // Don't show error to user if it's just an auth issue
        if (err.message && !err.message.includes('Authentication')) {
          alert('Error loading AMC subscribers: ' + err.message)
        }
      } finally {
        setLoadingSubscribers(false)
      }
    }

    const fetchPartners = async () => {
      if (!token) {
        console.log('No token available, skipping partners fetch')
        return
      }

      try {
        const data = await adminApi.fetchPartners(token, { status: 'active', limit: 100 })
        if (data && data.success) {
          setPartners(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching partners:', err)
      }
    }

    if (token) {
      fetchSubscribers()
      fetchPartners()
    }
  }, [token])

  const handleAssignPartner = (subscription) => {
    setSelectedSubscription(subscription)
    setSelectedPartner('')
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedPartner || !selectedSubscription) return

    setAssigningPartner(true)
    try {
      console.log('Assigning partner with data:', {
        userId: selectedSubscription.userId,
        subscriptionId: selectedSubscription._id || selectedSubscription.txnid,
        partnerId: selectedPartner,
        token: token ? 'Present' : 'Missing'
      })

      const response = await adminApi.assignAMCSubscriptionToPartner(token, {
        userId: selectedSubscription.userId,
        subscriptionId: selectedSubscription._id || selectedSubscription.txnid,
        partnerId: selectedPartner
      })

      console.log('Assignment response:', response)

      if (response.success) {
        // Refresh subscribers list
        const data = await adminApi.fetchAMCSubscribers(token)
        if (data.success) {
          setSubscribers(data.data || [])
        }
        setShowAssignModal(false)
        setSelectedSubscription(null)
        setSelectedPartner('')
      }
    } catch (err) {
      console.error('Error assigning partner:', err)
      alert('Error assigning partner: ' + err.message)
    } finally {
      setAssigningPartner(false)
    }
  }

  const stats = [
    {
      label: 'Plan Subscribers',
      value: paymentStats.totalSubscribers || 0,
      trend: `${paymentStats.activeSubscriptions || 0} active`,
      icon: FiUsers,
      intent: paymentStats.totalSubscribers > 0 ? 'positive' : 'neutral',
      description: 'Users with AMC plans'
    },
    {
      label: 'AMC Revenue',
      value: paymentStats.totalRevenue > 0 
        ? `₹${(paymentStats.totalRevenue / 1000).toFixed(1)}K` 
        : '₹0',
      trend: 'From plan subscriptions',
      icon: FiDollarSign,
      intent: paymentStats.totalRevenue > 0 ? 'positive' : 'neutral',
      description: 'Total revenue generated'
    },
    {
      label: 'Assigned Subscriptions',
      value: subscribers.filter(sub => sub.assignedPartner).length || 0,
      trend: `${subscribers.length - subscribers.filter(sub => sub.assignedPartner).length || 0} unassigned`,
      icon: FiFileText,
      intent: subscribers.filter(sub => sub.assignedPartner).length > 0 ? 'positive' : 'neutral',
      description: 'Subscriptions with assigned partners'
    },
    {
      label: 'Active Partners',
      value: partners.length || 0,
      trend: 'Available for assignment',
      icon: FiCalendar,
      description: 'Partners ready to handle AMC services'
    }
  ]

  const subscriberColumns = [
    { header: 'User Name', accessor: 'userName' },
    { header: 'Contact', accessor: 'userPhone' },
    { header: 'Plan', accessor: 'planName' },
    { 
      header: 'Amount', 
      accessor: 'amount',
      render: (value) => (
        <span className="font-semibold text-primary">
          ₹{value?.toLocaleString('en-IN') || 0}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (value) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : value === 'expired'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value || 'pending'}
        </span>
      )
    },
    { 
      header: 'Assigned Partner', 
      accessor: 'assignedPartner',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {value ? (
            <span className="text-sm text-slate-600">{value}</span>
          ) : (
            <span className="text-xs text-slate-400">Not assigned</span>
          )}
          <button
            onClick={() => handleAssignPartner(row)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Assign Partner"
          >
            <FiUserPlus className="w-4 h-4 text-primary" />
          </button>
        </div>
      )
    },
    { 
      header: 'Subscribed On', 
      accessor: 'subscribedAt',
      render: (value) => value 
        ? new Date(value).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'N/A'
    }
  ]

  return (
    <div>
      <ModuleHeader
        title="AMC Management"
        subtitle="Coordinate multi-asset contracts, recurring maintenance routines, and SLA commitments with predictive renewal insights."
        actions={
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition">
            New AMC Contract
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-10">
        {/* AMC Plan Subscribers Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                AMC Plan Subscribers
              </h2>
              <p className="text-xs text-slate-400 mt-1">Users who purchased AMC plans via payment gateway</p>
            </div>
            {loadingSubscribers && <span className="text-xs text-slate-400">Loading subscribers...</span>}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loadingSubscribers ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12">
                <FiCreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No AMC plan subscribers yet</p>
                <p className="text-sm text-slate-400 mt-1">Users who purchase plans will appear here</p>
              </div>
            ) : (
              <DataTable
                columns={subscriberColumns}
                data={subscribers}
                emptyLabel="No subscribers found."
              />
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Partner Assignment Overview
            </h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Assignment Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Subscriptions:</span>
                    <span className="font-semibold">{subscribers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Assigned:</span>
                    <span className="font-semibold text-green-600">
                      {subscribers.filter(sub => sub.assignedPartner).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Unassigned:</span>
                    <span className="font-semibold text-orange-600">
                      {subscribers.length - subscribers.filter(sub => sub.assignedPartner).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Available Partners:</span>
                    <span className="font-semibold text-blue-600">{partners.length}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm">
                    Bulk Assign Partners
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm">
                    Export Assignment Report
                  </button>
                  <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm">
                    Partner Performance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Recent Partner Assignments
              </h2>
              <button className="text-xs text-primary font-semibold">View All</button>
            </div>
            {subscribers.filter(sub => sub.assignedPartner && sub.assignedAt).length > 0 ? (
              <div className="space-y-3">
                {subscribers
                  .filter(sub => sub.assignedPartner && sub.assignedAt)
                  .slice(0, 5)
                  .map((sub, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{sub.userName}</p>
                        <p className="text-sm text-slate-600">{sub.planName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-800">{sub.assignedPartner}</p>
                        <p className="text-xs text-slate-500">
                          {sub.assignedAt ? new Date(sub.assignedAt).toLocaleDateString('en-IN') : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No partner assignments yet</p>
                <p className="text-xs text-slate-400 mt-1">Assignments will appear here once partners are assigned</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">AMC Management</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Efficiently manage AMC plan subscriptions and partner assignments. Ensure customers get the best service by assigning the right partners.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Assign partners based on location and expertise</li>
              <li>• Track subscription status and partner performance</li>
              <li>• Monitor revenue from AMC plan sales</li>
              <li>• Automated notifications for assignments</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Partner Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Assign Partner</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer Details
                </label>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <p><strong>Name:</strong> {selectedSubscription?.userName}</p>
                  <p><strong>Phone:</strong> {selectedSubscription?.userPhone}</p>
                  <p><strong>Plan:</strong> {selectedSubscription?.planName}</p>
                  <p><strong>Amount:</strong> ₹{selectedSubscription?.amount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Partner
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a partner...</option>
                  {partners.map((partner) => (
                    <option key={partner._id} value={partner._id}>
                      {partner.profile?.name || partner.phone} - {partner.profile?.city || 'No city'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!selectedPartner || assigningPartner}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {assigningPartner && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {assigningPartner ? 'Assigning...' : 'Assign Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AMCManagement


