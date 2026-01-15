import { useState } from 'react';
import { FiAlertOctagon, FiClock, FiRefreshCcw, FiShield, FiEye, FiCheck, FiX, FiEdit2, FiDollarSign } from 'react-icons/fi';
import ModuleHeader from '../../components/admin/ModuleHeader.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import { useAdminData } from '../../hooks/useAdminData.js';
import { adminApi } from '../../services/adminApi.js';
import toast from 'react-hot-toast';

const RefundManagement = () => {
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: refundData, isLoading, error } = useAdminData(
    (token) => adminApi.fetchModuleData('/refunds?limit=50', token),
    [refreshKey]
  );

  const { data: statsData } = useAdminData(
    (token) => adminApi.fetchModuleData('/refunds/statistics', token),
    [refreshKey]
  );

  const refunds = refundData?.data?.refunds || [];
  const stats = statsData?.data || {};

  const handleViewDetails = async (refund) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refund._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSelectedRefund(result.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      toast.error('Failed to fetch refund details');
    }
  };

  const handleAdjustAmount = (refund) => {
    setSelectedRefund(refund);
    setAdjustedAmount(refund.finalRefundAmount.toString());
    setAdminNotes(refund.adminNotes || '');
    setShowAdjustModal(true);
  };

  const submitAdjustment = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${selectedRefund._id}/amount`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adjustedAmount: parseFloat(adjustedAmount), adminNotes })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Refund amount adjusted');
        setShowAdjustModal(false);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Failed to adjust');
      }
    } catch (error) {
      toast.error('Failed to adjust refund amount');
    }
  };

  const handleApprove = async (refund) => {
    if (!confirm(`Approve refund of ₹${refund.finalRefundAmount}?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refund._id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMode: 'original_payment_method' })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Refund approved');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve refund');
    }
  };

  const handleProcess = (refund) => {
    setSelectedRefund(refund);
    setTransactionId('');
    setRefundToWallet(false);
    setShowProcessModal(true);
  };

  const submitProcess = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${selectedRefund._id}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: refundToWallet ? undefined : transactionId,
          refundToWallet
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Refund processed');
        setShowProcessModal(false);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Failed to process');
      }
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const handleReject = async (refund) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/refunds/${refund._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Refund rejected');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Failed to reject');
      }
    } catch (error) {
      toast.error('Failed to reject refund');
    }
  };

  const refundColumns = [
    { 
      header: 'Refund ID', 
      accessor: 'refundNumber',
      render: (value) => <span className="font-mono text-sm font-semibold">{value}</span>
    },
    { 
      header: 'Customer', 
      accessor: 'customerDetails',
      render: (value) => (
        <div>
          <div className="font-medium">{value?.name}</div>
          <div className="text-xs text-slate-500">{value?.phone}</div>
        </div>
      )
    },
    { 
      header: 'Original', 
      accessor: 'originalAmount',
      render: (value) => <span className="font-medium">₹{value?.toFixed(2)}</span>
    },
    { 
      header: 'Visiting', 
      accessor: 'visitingCharge',
      render: (value) => <span className="text-rose-600 font-medium">-₹{value?.toFixed(2)}</span>
    },
    { 
      header: 'Refund', 
      accessor: 'finalRefundAmount',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-emerald-600">₹{value?.toFixed(2)}</div>
          {row.adminAdjustedAmount !== null && (
            <div className="text-xs text-amber-600">Adjusted</div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const colors = {
          pending: 'bg-amber-500/10 text-amber-600',
          approved: 'bg-blue-500/10 text-blue-600',
          processing: 'bg-purple-500/10 text-purple-600',
          completed: 'bg-emerald-500/10 text-emerald-600',
          rejected: 'bg-rose-500/10 text-rose-600',
          failed: 'bg-red-500/10 text-red-600'
        };
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colors[value] || 'bg-slate-200 text-slate-700'}`}>
            {value?.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleViewDetails(row)} className="p-1.5 rounded-lg hover:bg-slate-100" title="View">
            <FiEye size={16} />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => handleAdjustAmount(row)} className="p-1.5 rounded-lg hover:bg-slate-100 text-amber-600" title="Adjust">
                <FiEdit2 size={16} />
              </button>
              <button onClick={() => handleApprove(row)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve">
                <FiCheck size={16} />
              </button>
              <button onClick={() => handleReject(row)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Reject">
                <FiX size={16} />
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <button onClick={() => handleProcess(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Process">
              <FiDollarSign size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const statCards = [
    {
      label: 'Total Refunds',
      value: stats.totalRefunds || 0,
      trend: `₹${(stats.totalRefundAmount || 0).toFixed(2)} total`,
      icon: FiRefreshCcw
    },
    {
      label: 'Pending',
      value: stats.pendingRefunds || 0,
      trend: 'Awaiting review',
      icon: FiClock,
      intent: stats.pendingRefunds > 5 ? 'warning' : 'neutral'
    },
    {
      label: 'Non-Refundable',
      value: `₹${(stats.totalNonRefundable || 0).toFixed(2)}`,
      trend: 'Visiting charges',
      icon: FiAlertOctagon
    },
    {
      label: 'SLA Compliance',
      value: `${stats.slaComplianceRate || 100}%`,
      trend: 'Within 24 hours',
      icon: FiShield,
      intent: stats.slaComplianceRate >= 95 ? 'positive' : 'warning'
    }
  ];

  return (
    <div>
      <ModuleHeader
        title="Refund Management"
        subtitle="Manage customer refund requests with automatic visiting charge deduction."
        actions={
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition"
          >
            Refresh
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Refund Requests
            </h2>
            {error && <span className="text-xs text-rose-500">Failed to load.</span>}
            {isLoading && <span className="text-xs text-slate-400">Loading...</span>}
          </div>
          <DataTable columns={refundColumns} data={refunds} emptyLabel="No refund requests found." />
        </section>
      </div>

      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Refund - {selectedRefund.refundNumber}</h3>
              <button onClick={() => setShowDetailsModal(false)}><FiX size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Price Breakdown</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Original:</span>
                    <span className="font-medium">₹{selectedRefund.originalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Visiting Charge:</span>
                    <span>-₹{selectedRefund.visitingCharge?.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2"></div>
                  <div className="flex justify-between text-lg font-bold text-emerald-600">
                    <span>Final Refund:</span>
                    <span>₹{selectedRefund.finalRefundAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Adjust Amount</h3>
              <button onClick={() => setShowAdjustModal(false)}><FiX size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(e.target.value)}
                  max={selectedRefund.refundableAmount}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdjustModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={submitAdjustment} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Process Refund</h3>
              <button onClick={() => setShowProcessModal(false)}><FiX size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-bold text-emerald-600">₹{selectedRefund.finalRefundAmount?.toFixed(2)}</span>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={refundToWallet}
                  onChange={(e) => setRefundToWallet(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Refund to Wallet</span>
              </label>
              {!refundToWallet && (
                <div>
                  <label className="block text-sm font-medium mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowProcessModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button
                  onClick={submitProcess}
                  disabled={!refundToWallet && !transactionId}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
                >
                  Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
