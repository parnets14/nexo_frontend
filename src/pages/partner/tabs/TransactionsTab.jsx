import React, { useEffect, useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext.jsx'
import { partnerApi } from '../../../services/partnerApi.js'
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiFilter, FiDownload, FiUser, FiFileText } from 'react-icons/fi'
import Invoice from '../../../components/Invoice.jsx'
import { exportToExcel } from '../../../utils/excelExport.js'

const TransactionsTab = () => {
  const { token } = usePartnerAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, credit, debit
  const [selectedInvoice, setSelectedInvoice] = useState(null) // For invoice modal

  useEffect(() => {
    fetchTransactions()
  }, [token])

  const fetchTransactions = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const response = await partnerApi.getTransactions(token)
      const txnList = response?.transactions || response?.data || []
      setTransactions(txnList)
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true
    return txn.type === filter
  })

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Transactions</h1>
          <p className="text-slate-600">View all your wallet transactions</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200"
        >
          <FiRefreshCw className="text-xl text-slate-600" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Total Credits</p>
            <FiTrendingUp className="text-green-600 text-xl" />
          </div>
          <p className="text-2xl font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Total Debits</p>
            <FiTrendingDown className="text-red-600 text-xl" />
          </div>
          <p className="text-2xl font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Net Balance</p>
            <FiTrendingUp className="text-primary text-xl" />
          </div>
          <p className="text-2xl font-bold text-primary">
            ₹{(totalCredit - totalDebit).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <FiFilter className="text-slate-600" />
            <div className="flex gap-2">
              {['all', 'credit', 'debit'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const exportData = filteredTransactions.map(txn => ({
                'Date & Time': txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : 'N/A',
                'Type': txn.type?.charAt(0).toUpperCase() + txn.type?.slice(1) || 'N/A',
                'Amount (₹)': txn.amount || 0,
                'Balance (₹)': txn.balance || 0,
                'Description': txn.description || 'N/A',
                'Reference': txn.reference || 'N/A',
                'Transaction ID': txn.transactionId || txn._id || 'N/A'
              }))
              exportToExcel(exportData, [
                { header: 'Date & Time', accessor: 'Date & Time' },
                { header: 'Type', accessor: 'Type' },
                { header: 'Amount (₹)', accessor: 'Amount (₹)' },
                { header: 'Balance (₹)', accessor: 'Balance (₹)' },
                { header: 'Description', accessor: 'Description' },
                { header: 'Reference', accessor: 'Reference' },
                { header: 'Transaction ID', accessor: 'Transaction ID' }
              ], 'Transactions', 'Transactions', {
                columnWidths: [20, 12, 15, 15, 30, 20, 25]
              })
            }}
            disabled={filteredTransactions.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to Excel"
          >
            <FiDownload /> Export Excel
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">All Transactions</h2>
        </div>
        {error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FiTrendingUp className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTransactions.map((txn, index) => (
              <div
                key={index}
                className="p-6 hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{txn.description || 'Transaction'}</p>
                      {txn.teamMember && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1">
                          <FiUser className="text-xs" />
                          {txn.teamMember.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-slate-500">
                        {txn.createdAt
                          ? new Date(txn.createdAt).toLocaleString('en-IN')
                          : txn.timestamp
                          ? new Date(txn.timestamp).toLocaleString('en-IN')
                          : 'N/A'}
                      </p>
                      {txn.transactionId && (
                        <p className="text-xs text-slate-400">ID: {txn.transactionId}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-sm text-slate-500">
                    Balance: ₹{txn.balance?.toLocaleString('en-IN') || 0}
                  </p>
                  <button
                    onClick={() => setSelectedInvoice({ data: txn, type: 'transaction' })}
                    className="mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition flex items-center gap-2"
                  >
                    <FiFileText /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Invoice
          data={selectedInvoice.data}
          type={selectedInvoice.type}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}

export default TransactionsTab

