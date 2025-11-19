import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiDollarSign, FiBriefcase, FiTrendingUp, FiPackage, FiUsers, FiCreditCard } from 'react-icons/fi'

const DashboardOverview = () => {
  const { partner, token } = usePartnerAuth()
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
    teamMembers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return

      try {
        // Fetch wallet (already includes all transactions - team members don't have separate wallets)
        const walletRes = await partnerApi.getWallet(token)
        const walletBalance = walletRes?.data?.balance || walletRes?.success?.balance || 0

        // Fetch bookings (now includes team member bookings from backend)
        const bookingsRes = await partnerApi.getBookings(token)
        // Handle different response structures
        let allBookings = []
        if (bookingsRes?.bookings) {
          // If bookings are organized by status
          Object.values(bookingsRes.bookings).forEach(statusBookings => {
            if (Array.isArray(statusBookings)) {
              allBookings = allBookings.concat(statusBookings)
            }
          })
        } else if (Array.isArray(bookingsRes)) {
          allBookings = bookingsRes
        } else if (Array.isArray(bookingsRes?.data)) {
          allBookings = bookingsRes.data
        } else if (Array.isArray(bookingsRes?.bookings)) {
          allBookings = bookingsRes.bookings
        }
        
        const totalJobs = allBookings.length
        const completedJobs = allBookings.filter(b => b?.status === 'completed').length
        const pendingJobs = allBookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b?.status)).length

        // Fetch team members count
        let teamMembersCount = 0
        try {
          const teamRes = await partnerApi.getTeamMembers(token)
          const teamMembers = teamRes?.data || teamRes || []
          teamMembersCount = Array.isArray(teamMembers) ? teamMembers.filter(tm => tm.status === 'active').length : 0
        } catch (err) {
          console.error('Error fetching team members:', err)
        }

        setStats({
          walletBalance,
          totalJobs,
          completedJobs,
          pendingJobs,
          totalEarnings: walletBalance, // Simplified
          teamMembers: teamMembersCount
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  const statCards = [
    {
      label: 'Wallet Balance',
      value: `₹${stats.walletBalance.toLocaleString('en-IN')}`,
      icon: FiDollarSign,
      color: 'bg-blue-500',
      link: '/partner/dashboard/wallet'
    },
    {
      label: 'Total Jobs',
      value: stats.totalJobs,
      icon: FiBriefcase,
      color: 'bg-green-500',
      link: '/partner/dashboard/jobs'
    },
    {
      label: 'Completed Jobs',
      value: stats.completedJobs,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      link: '/partner/dashboard/jobs'
    },
    {
      label: 'Pending Jobs',
      value: stats.pendingJobs,
      icon: FiBriefcase,
      color: 'bg-orange-500',
      link: '/partner/dashboard/jobs'
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      icon: FiUsers,
      color: 'bg-indigo-500',
      link: '/partner/dashboard/team'
    },
    {
      label: 'Subscription',
      value: 'Active',
      icon: FiCreditCard,
      color: 'bg-pink-500',
      link: '/partner/dashboard/subscription'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back, {partner?.profile?.name || partner?.name || 'Partner'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border border-slate-200 hover:border-primary/50 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon className="text-2xl" />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-primary transition">
                  View →
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{card.label}</h3>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/partner/dashboard/wallet"
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center"
          >
            <FiDollarSign className="text-2xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-blue-800">View Wallet</p>
          </Link>
          <Link
            to="/partner/dashboard/jobs"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-center"
          >
            <FiBriefcase className="text-2xl text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-800">Manage Jobs</p>
          </Link>
          <Link
            to="/partner/dashboard/spare-parts"
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-center"
          >
            <FiPackage className="text-2xl text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-purple-800">Spare Parts</p>
          </Link>
          <Link
            to="/partner/dashboard/transactions"
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-center"
          >
            <FiTrendingUp className="text-2xl text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-orange-800">Transactions</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview

