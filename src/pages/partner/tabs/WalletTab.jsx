import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw, FiPlus, FiX, FiDownload } from 'react-icons/fi'
import { exportToExcel } from '../../../utils/excelExport.js'
import PartnerWalletPayment from '../../../components/PartnerWalletPayment.jsx'

const WalletTab = () => {
  const { token } = usePartnerAuth()
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showPayUPayment, setShowPayUPayment] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpDescription, setTopUpDescription] = useState('')
  const [topUpLoading, setTopUpLoading] = useState(false)
  const [quickAmounts] = useState([500, 1000, 2000, 5000, 10000])
  const [lastRefresh, setLastRefresh] = useState(null)

  // Check for payment success/failure from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amount = urlParams.get('amount');
    const txnid = urlParams.get('txnid');
    const reason = urlParams.get('reason');

    if (paymentStatus === 'success' && amount) {
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-lg">✅</div>
          <div>
            <div class="font-semibold">Payment Successful!</div>
            <div class="text-sm opacity-90">₹${parseFloat(amount).toLocaleString('en-IN')} added to wallet</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);

      // Refresh wallet data
      fetchWallet();
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      // Show failure notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="text-lg">❌</div>
          <div>
            <div class="font-semibold">Payment Failed</div>
            <div class="text-sm opacity-90">${reason || 'Please try again'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchWallet()
  }, [token])

  // Add a focus event listener to refresh wallet when tab becomes visible
  useEffect(() => {
    const handleFocus = () => {
      console.log('Wallet tab focused, refreshing data...')
      fetchWallet()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing wallet data...')
        fetchWallet()
      }
    }

    const handleWalletUpdate = (event) => {
      console.log('Wallet update event received:', event.detail)
      // Show a brief notification that wallet is being refreshed
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'
      notification.textContent = 'Refreshing wallet data...'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 2000)
      
      fetchWallet()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('walletUpdated', handleWalletUpdate)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('walletUpdated', handleWalletUpdate)
    }
  }, [token])

  const fetchWallet = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching wallet data...')
      const response = await partnerApi.getWallet(token)
      console.log('💰 Wallet response:', response)
      
      const walletData = response?.data || response
      console.log('💳 Wallet data:', walletData)
      console.log('📊 Transactions count:', walletData?.transactions?.length || 0)
      
      setWallet(walletData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('❌ Wallet fetch error:', err)
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

    const amount = parseFloat(topUpAmount);
    
    // Validation
    if (amount < 10) {
      alert('Minimum top-up amount is ₹10');
      return;
    }
    
    if (amount > 100000) {
      alert('Maximum top-up amount is ₹1,00,000');
      return;
    }

    // Close modal and show PayU payment
    setShowTopUpModal(false);
    setShowPayUPayment(true);
  }

  const handlePaymentSuccess = (paymentData) => {
    setShowPayUPayment(false);
    setTopUpAmount('');
    setTopUpDescription('');
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-lg">✅</div>
        <div>
          <div class="font-semibold">Payment Successful!</div>
          <div class="text-sm opacity-90">Wallet will be updated shortly</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);

    // Refresh wallet data after a short delay
    setTimeout(() => {
      fetchWallet();
    }, 2000);
  };

  const handlePaymentFailure = (error) => {
    setShowPayUPayment(false);
    
    // Show error message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-lg">❌</div>
        <div>
          <div class="font-semibold">Payment Failed</div>
          <div class="text-sm opacity-90">${error?.message || 'Please try again'}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  const handlePaymentCancel = () => {
    setShowPayUPayment(false);
  };

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
  const transactions = (wallet?.transactions || []).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.timestamp || 0)
    const dateB = new Date(b.createdAt || b.timestamp || 0)
    return dateB - dateA // Sort newest first
  })
  const mgPlan = wallet?.mgPlan || null

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Wallet</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage your wallet balance and transactions</p>
          {lastRefresh && (
            <p className="text-xs text-slate-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2 shadow-lg text-sm sm:text-base"
          >
            <FiPlus /> <span className="hidden sm:inline">Top Up Wallet</span><span className="sm:hidden">Top Up</span>
          </button>
          <button
            onClick={fetchWallet}
            disabled={loading}
            className="p-2.5 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 disabled:opacity-50"
            title="Refresh wallet data"
          >
            <FiRefreshCw className={`text-lg sm:text-xl text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                try {
                  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                    (import.meta.env.DEV ? 'http://localhost:9088' : window.location.origin);
                  
                  const response = await fetch(`${API_BASE_URL}/api/partner/wallet/topup`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      amount: 10,
                      type: 'debit',
                      description: 'Test debit transaction',
                      reference: `TEST-DEBIT-${Date.now()}`
                    })
                  });
                  
                  const data = await response.json();
                  console.log('Test debit response:', data);
                  
                  if (data.success) {
                    alert('Test debit successful! Check wallet transactions.');
                    fetchWallet();
                  } else {
                    alert('Test debit failed: ' + (data.message || 'Unknown error'));
                  }
                } catch (err) {
                  console.error('Test debit error:', err);
                  alert('Test debit error: ' + err.message);
                }
              }}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
              title="Test debit transaction (Dev only)"
            >
              Test Debit ₹10
            </button>
          )}
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-white/80 text-xs sm:text-sm mb-1">Current Balance</p>
            <h2 className="text-3xl sm:text-4xl font-bold">₹{balance.toLocaleString('en-IN')}</h2>
          </div>
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl">
            <FiDollarSign className="text-3xl sm:text-4xl" />
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
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Recent Transactions</h2>
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
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 self-start sm:self-auto"
              title="Export to Excel"
            >
              <FiDownload /> <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
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
            {console.log('📊 Displaying transactions:', transactions.length, 'total transactions')}
            {transactions.slice(0, 10).map((txn, index) => {
              console.log(`Transaction ${index}:`, {
                type: txn.type,
                amount: txn.amount,
                description: txn.description,
                createdAt: txn.createdAt,
                balance: txn.balance
              })
              return (
              <div
                key={txn._id || txn.transactionId || index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div
                    className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                      txn.type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? (
                      <FiTrendingUp className="text-lg sm:text-xl" />
                    ) : (
                      <FiTrendingDown className="text-lg sm:text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">{txn.description || 'Transaction'}</p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {txn.createdAt
                        ? new Date(txn.createdAt).toLocaleString('en-IN')
                        : new Date().toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p
                    className={`font-bold text-lg sm:text-xl ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 my-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Top Up Wallet</h2>
              <button
                onClick={() => {
                  setShowTopUpModal(false)
                  setTopUpAmount('')
                  setTopUpDescription('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="text-lg sm:text-xl" />
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
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
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
                  {topUpLoading ? 'Processing...' : 'Proceed to Payment'}
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

      {/* PayU Payment Modal */}
      {showPayUPayment && (
        <PartnerWalletPayment
          amount={parseFloat(topUpAmount)}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
          title="Wallet Top-up"
          description={`Add ₹${parseFloat(topUpAmount).toLocaleString('en-IN')} to your wallet`}
        />
      )}
    </div>
  )
}

export default WalletTab

