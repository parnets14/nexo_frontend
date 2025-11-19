import React from 'react'
import { FiAlertOctagon, FiClock, FiRefreshCcw, FiShield } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'

const refundColumns = [
  { header: 'Refund ID', accessor: 'refundId' },
  { header: 'Booking', accessor: 'bookingId' },
  { header: 'Customer', accessor: 'customer' },
  { header: 'Reason', accessor: 'reason' },
  { header: 'Channel', accessor: 'channel' },
  { header: 'Amount', accessor: 'amount' },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
          value === 'Auto Refunded'
            ? 'bg-emerald-500/10 text-emerald-600'
            : value === 'Manual Review'
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-slate-200 text-slate-700'
        }`}
      >
        {value}
      </span>
    )
  },
  { header: 'SLA', accessor: 'sla' }
]

const exceptionColumns = [
  { header: 'Case', accessor: 'caseId' },
  { header: 'Booking', accessor: 'bookingId' },
  { header: 'Escalation Level', accessor: 'level' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Owner', accessor: 'owner' },
  { header: 'Status', accessor: 'status' }
]

const fallbackRefunds = [
  {
    id: 1,
    refundId: 'RF-2210',
    bookingId: 'BK-2991',
    customer: 'Megha Patil',
    reason: 'Technician no-show',
    channel: 'Auto',
    amount: '₹1,299',
    status: 'Auto Refunded',
    sla: 'Closed in 1.8 hrs'
  },
  {
    id: 2,
    refundId: 'RF-2206',
    bookingId: 'BK-2986',
    customer: 'Arjun Desai',
    reason: 'Quality dispute',
    channel: 'Manual',
    amount: '₹2,450',
    status: 'Manual Review',
    sla: 'Awaiting Finance (4.2 hrs)'
  },
  {
    id: 3,
    refundId: 'RF-2201',
    bookingId: 'BK-2978',
    customer: 'Latika Rao',
    reason: 'Double charge',
    channel: 'Auto',
    amount: '₹1,049',
    status: 'Auto Refunded',
    sla: 'Closed in 35 mins'
  }
]

const RefundManagement = () => {
  const { data: refundData, isLoading, error } = useAdminData((token) =>
    adminApi.fetchModuleData('/refunds', token)
  )

  const stats = [
    {
      label: 'Auto Closure Rate',
      value: refundData?.autoRate ?? '76%',
      trend: 'Policy engine handling majority scenarios',
      icon: FiRefreshCcw,
      description: 'Within defined risk guardrails'
    },
    {
      label: 'Average Turnaround',
      value: refundData?.turnaround ?? '2.1 hrs',
      trend: 'Manual queue aging at 6.4 hrs',
      icon: FiClock,
      description: 'From request to settlement',
      intent: refundData?.turnaround > 3 ? 'warning' : 'positive'
    },
    {
      label: 'Finance Exceptions',
      value: refundData?.exceptions ?? 12,
      trend: 'Escalated to level-2 for approval',
      icon: FiAlertOctagon,
      description: 'Needs manual override',
      intent: 'warning'
    },
    {
      label: 'Chargeback Prevention',
      value: refundData?.chargebackAvoided ?? '₹4.6L',
      trend: 'By proactive customer engagement',
      icon: FiShield,
      description: 'Month to date'
    }
  ]

  return (
    <div>
      <ModuleHeader
        title="Refund Management"
        subtitle="Track refund automation logs, manual overrides, and finance escalations with granular audit trails."
        actions={
          <button className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition">
            Configure Policies
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Refund Ledger
            </h2>
            {error && <span className="text-xs text-rose-500">Refund service offline.</span>}
            {isLoading && <span className="text-xs text-slate-400">Syncing latest refunds...</span>}
          </div>
          <DataTable
            columns={refundColumns}
            data={refundData?.refunds ?? fallbackRefunds}
            emptyLabel="No refunds recorded today."
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Manual Overrides
              </h2>
              <button className="text-xs text-primary font-semibold">New Override</button>
            </div>
            <DataTable
              columns={exceptionColumns}
              data={
                refundData?.exceptionsList ?? [
                  {
                    id: 1,
                    caseId: 'EX-1982',
                    bookingId: 'BK-2986',
                    level: 'Finance L2',
                    amount: '₹2,450',
                    owner: 'Sana Qureshi',
                    status: 'Pending'
                  },
                  {
                    id: 2,
                    caseId: 'EX-1979',
                    bookingId: 'BK-2971',
                    level: 'Ops L1',
                    amount: '₹980',
                    owner: 'Raghav Iyer',
                    status: 'Approved'
                  }
                ]
              }
              emptyLabel="No manual overrides pending."
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">Risk & Escalation Engine</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Every refund request is scored on past incidents, ticket sentiment, wallet health, and policy
              compliance. Higher risk cases auto-assign to finance controllers.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Auto-close low-risk refunds instantly</li>
              <li>• Dual-auth approvals above ₹5,000</li>
              <li>• SLA breach alerts for pending overrides</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RefundManagement


