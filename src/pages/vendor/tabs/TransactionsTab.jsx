import React, { useEffect, useState } from 'react'
import { useVendorAuth } from '../../../context/VendorAuthContext.jsx'
import { vendorApi } from '../../../services/vendorApi.js'
import { FiDollarSign, FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const TransactionsTab = () => {
  const { token } = useVendorAuth()
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    balance: 0
  })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [token, typeFilter, statusFilter])

  const fetchTransactions = async () => {
    if (!token) return

    setLoading(true)
    try {
      const params = {}
      if (typeFilter !== 'all') {
        params.type = typeFilter
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const response = await vendorApi.getTransactions(token, params)
      setTransactions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!token) return

    try {
      const response = await vendorApi.getTransactionStats(token)
      setStats(response.data || {})
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error)
    }
  }

  const getTypeColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Transactions</h1>
          <p className="text-slate-600">View your transaction history</p>
        </div>
        <button
          onClick={() => {
            fetchTransactions()
            fetchStats()
          }}
          className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 self-start sm:self-auto"
        >
          <FiRefreshCw className="text-lg text-slate-600" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Total Credits</p>
            <FiTrendingUp className="text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{stats.totalCredits?.toLocaleString('en-IN') || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Total Debits</p>
            <FiTrendingDown className="text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ₹{stats.totalDebits?.toLocaleString('en-IN') || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-600">Balance</p>
            <FiDollarSign className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-primary">
            ₹{stats.balance?.toLocaleString('en-IN') || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
          <FiDollarSign className="text-4xl mx-auto mb-2 opacity-50 text-slate-400" />
          <p className="text-slate-500">No transactions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹
                      {transaction.amount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.reference || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsTab

