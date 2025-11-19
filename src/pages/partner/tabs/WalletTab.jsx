import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw, FiPlus, FiX, FiDownload } from 'react-icons/fi'
import { exportToExcel } from '../../../utils/excelExport.js'

const WalletTab = () => {
  const { token } = usePartnerAuth()
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpDescription, setTopUpDescription] = useState('')
  const [topUpLoading, setTopUpLoading] = useState(false)
  const [quickAmounts] = useState([500, 1000, 2000, 5000, 10000])

  useEffect(() => {
    fetchWallet()
  }, [token])

  const fetchWallet = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const response = await partnerApi.getWallet(token)
      setWallet(response?.data || response)
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setTopUpLoading(true)
    try {
      const response = await partnerApi.topUpWallet(
        token,
        parseFloat(topUpAmount),
        topUpDescription || 'Topup',
        `TOPUP-${Date.now()}`
      )
      
      if (response.success || response.message) {
        alert('Wallet topped up successfully!')
        setShowTopUpModal(false)
        setTopUpAmount('')
        setTopUpDescription('')
        await fetchWallet() // Refresh wallet data
      } else {
        alert(response.message || 'Failed to top up wallet')
      }
    } catch (err) {
      console.error('Top-up error:', err)
      alert(err.message || 'Failed to top up wallet')
    } finally {
      setTopUpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchWallet}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  const balance = wallet?.balance || 0
  const transactions = wallet?.transactions || []
  const mgPlan = wallet?.mgPlan || null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Wallet</h1>
          <p className="text-slate-600">Manage your wallet balance and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2 shadow-lg"
          >
            <FiPlus /> Top Up Wallet
          </button>
          <button
            onClick={fetchWallet}
            className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
          >
            <FiRefreshCw className="text-xl text-slate-600" />
          </button>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/80 text-sm mb-1">Current Balance</p>
            <h2 className="text-4xl font-bold">₹{balance.toLocaleString('en-IN')}</h2>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <FiDollarSign className="text-4xl" />
          </div>
        </div>

        {mgPlan && (
          <div className="bg-white/10 rounded-xl p-4 mt-4">
            <p className="text-sm text-white/80 mb-2">Active Plan: {mgPlan.name}</p>
            <div className="flex items-center justify-between text-sm">
              <span>Leads Remaining: {mgPlan.leadsRemaining || 0}</span>
              <span>Lead Fee: ₹{mgPlan.leadFee || 0}</span>
            </div>
          </div>
        )}

        {wallet?.minWalletBalance && balance < wallet.minWalletBalance && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mt-4">
            <p className="text-sm text-yellow-100">
              ⚠️ Wallet balance is below minimum threshold (₹{wallet.minWalletBalance}). 
              Recharge to continue accepting leads.
            </p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
          {transactions.length > 0 && (
            <button
              onClick={() => {
                const exportData = transactions.map(txn => ({
                  'Date & Time': txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : 'N/A',
                  'Type': txn.type?.charAt(0).toUpperCase() + txn.type?.slice(1) || 'N/A',
                  'Amount (₹)': txn.amount || 0,
                  'Balance (₹)': txn.balance || 0,
                  'Description': txn.description || 'N/A',
                  'Reference': txn.reference || 'N/A'
                }))
                exportToExcel(exportData, [
                  { header: 'Date & Time', accessor: 'Date & Time' },
                  { header: 'Type', accessor: 'Type' },
                  { header: 'Amount (₹)', accessor: 'Amount (₹)' },
                  { header: 'Balance (₹)', accessor: 'Balance (₹)' },
                  { header: 'Description', accessor: 'Description' },
                  { header: 'Reference', accessor: 'Reference' }
                ], 'Wallet_Transactions', 'Transactions', {
                  columnWidths: [20, 12, 15, 15, 30, 20]
                })
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2"
              title="Export to Excel"
            >
              <FiDownload /> Export Excel
            </button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FiDollarSign className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((txn, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      txn.type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? (
                      <FiTrendingUp className="text-xl" />
                    ) : (
                      <FiTrendingDown className="text-xl" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{txn.description || 'Transaction'}</p>
                    <p className="text-sm text-slate-500">
                      {txn.createdAt
                        ? new Date(txn.createdAt).toLocaleString('en-IN')
                        : new Date().toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-sm text-slate-500">
                    Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Top Up Wallet</h2>
              <button
                onClick={() => {
                  setShowTopUpModal(false)
                  setTopUpAmount('')
                  setTopUpDescription('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount.toString())}
                      className={`px-3 py-2 rounded-lg font-semibold transition ${
                        topUpAmount === amount.toString()
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  placeholder="Add a note for this transaction"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Current Balance:</span>
                  <span className="font-bold text-slate-800">₹{balance.toLocaleString('en-IN')}</span>
                </div>
                {topUpAmount && parseFloat(topUpAmount) > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">After Top-up:</span>
                    <span className="font-bold text-green-600">
                      ₹{(balance + parseFloat(topUpAmount)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleTopUp}
                  disabled={topUpLoading || !topUpAmount || parseFloat(topUpAmount) <= 0}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {topUpLoading ? 'Processing...' : 'Top Up'}
                </button>
                <button
                  onClick={() => {
                    setShowTopUpModal(false)
                    setTopUpAmount('')
                    setTopUpDescription('')
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletTab

