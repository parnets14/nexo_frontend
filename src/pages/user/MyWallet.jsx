import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiPlus, FiArrowUp, FiArrowDown, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { userApi } from '../../services/userApi';

const MyWallet = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchWalletData();
    checkPaymentStatus();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        const response = await userApi.getProfile(token);
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const paymentAmount = urlParams.get('amount');
    const reason = urlParams.get('reason');

    if (payment === 'success') {
      setPaymentStatus({
        type: 'success',
        message: `₹${paymentAmount} added successfully to your wallet!`
      });
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh wallet data
      setTimeout(() => {
        fetchWalletData();
        setPaymentStatus(null);
      }, 3000);
    } else if (payment === 'failed') {
      setPaymentStatus({
        type: 'error',
        message: `Payment failed: ${reason || 'Unknown error'}`
      });
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  };

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const userId = user?._id || localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.error('No token or userId found');
        setLoading(false);
        return;
      }

      const response = await userApi.getWalletDetails(token, userId);
      
      if (response.success) {
        setBalance(response.data.balance || 0);
        setTransactions(response.data.transactions || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setBalance(0);
      setTransactions([]);
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('userToken');
      const userId = user?._id || localStorage.getItem('userId');

      if (!token || !userId) {
        alert('Please login to continue');
        setProcessing(false);
        return;
      }

      // Initiate payment
      const response = await userApi.initiateWalletPayment(token, parseFloat(amount), userId);

      if (response.success) {
        // Create a form and submit to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.action;

        // Add all payment data as hidden fields
        Object.keys(response.data).forEach(key => {
          if (key !== 'action') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = response.data[key];
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert('Failed to initiate payment. Please try again.');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Notification */}
      {paymentStatus && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
          paymentStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-3 animate-slide-in`}>
          {paymentStatus.type === 'success' ? (
            <FiCheckCircle size={24} />
          ) : (
            <FiXCircle size={24} />
          )}
          <p className="font-medium">{paymentStatus.message}</p>
        </div>
      )}

      {/* Balance Card */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-blue-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="text-white/80" size={20} />
                <p className="text-white/80 text-sm font-medium">Available Balance</p>
              </div>
              <h1 className="text-5xl font-bold mb-2">₹{balance.toFixed(2)}</h1>
              <p className="text-white/60 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <FiPlus size={20} />
              Add Money
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Total Spent</p>
              <p className="text-2xl font-bold">
                ₹{transactions
                  .filter(t => t.type === 'Debit')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-xs mb-1">Total Added</p>
              <p className="text-2xl font-bold">
                ₹{transactions
                  .filter(t => t.type === 'Credit')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowAddMoney(true)}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <FiPlus className="text-green-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800 mb-1">Add Money</h3>
          <p className="text-sm text-gray-500">Top up your wallet</p>
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <FiArrowUp className="text-blue-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₹{transactions
              .filter(t => t.type === 'Debit')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <FiArrowDown className="text-purple-600 mb-3" size={32} />
          <h3 className="font-semibold text-gray-800 mb-1">Total Added</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₹{transactions
              .filter(t => t.type === 'Credit')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        </div>
        
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'Credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'Credit' ? (
                        <FiArrowDown size={20} />
                      ) : (
                        <FiArrowUp size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {transaction.description || (transaction.type === 'Credit' ? 'Money Added' : 'Payment')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.transactionId && (
                        <p className="text-xs text-gray-400 mt-1">
                          ID: {transaction.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${
                    transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Money to Wallet</h2>
            
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoney(false);
                    setAmount('');
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    'Add Money'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWallet;
