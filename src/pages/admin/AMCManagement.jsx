import React from 'react'
import { FiCalendar, FiClock, FiFileText, FiRefreshCcw } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'

const contractColumns = [
  { header: 'Contract ID', accessor: 'contractId' },
  { header: 'Client', accessor: 'clientName' },
  { header: 'Asset Count', accessor: 'assetCount' },
  { header: 'Coverage', accessor: 'coverage' },
  { header: 'Next Visit', accessor: 'nextVisit' },
  { header: 'Renewal Date', accessor: 'renewalDate' },
  {
    header: 'SLA Score',
    accessor: 'slaScore',
    render: (value) => (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {value}%
      </span>
    )
  }
]

const renewalColumns = [
  { header: 'Client', accessor: 'client' },
  { header: 'Contract', accessor: 'contract' },
  { header: 'Value', accessor: 'value' },
  { header: 'Renewal Probability', accessor: 'probability' },
  { header: 'Owner', accessor: 'owner' },
  { header: 'Status', accessor: 'status' }
]

const fallbackContracts = [
  {
    id: 1,
    contractId: 'AMC-2042',
    clientName: 'Axis Bank - Mumbai',
    assetCount: 128,
    coverage: 'HVAC + Electrical',
    nextVisit: '14 Nov',
    renewalDate: '12 Jan 2026',
    slaScore: 96
  },
  {
    id: 2,
    contractId: 'AMC-2038',
    clientName: 'Mantri Heights',
    assetCount: 86,
    coverage: 'Lifts + DG + Fire Safety',
    nextVisit: '16 Nov',
    renewalDate: '04 Feb 2026',
    slaScore: 91
  },
  {
    id: 3,
    contractId: 'AMC-2030',
    clientName: 'Delight Hotels',
    assetCount: 210,
    coverage: 'Kitchen + HVAC',
    nextVisit: '18 Nov',
    renewalDate: '28 Dec 2025',
    slaScore: 88
  }
]

const AMCManagement = () => {
  const { data: amcData, isLoading, error } = useAdminData((token) =>
    adminApi.fetchModuleData('/amc/contracts', token)
  )

  const stats = [
    {
      label: 'Active Contracts',
      value: amcData?.activeContracts ?? 62,
      trend: '12 in onboarding',
      icon: FiFileText,
      description: 'Covering 1,860 assets'
    },
    {
      label: 'Renewals Due (30d)',
      value: amcData?.renewalsDue ?? 9,
      trend: '₹1.8Cr at risk',
      icon: FiRefreshCcw,
      intent: amcData?.renewalsDue > 10 ? 'warning' : 'positive',
      description: 'Triggered for proactive outreach'
    },
    {
      label: 'Adherence',
      value: amcData?.slaAdherence ?? '93%',
      trend: '4 priority tickets escalated',
      icon: FiClock,
      description: 'Weighted across service tiers'
    },
    {
      label: 'Scheduled Visits',
      value: amcData?.visitsScheduled ?? 38,
      trend: 'Auto-routed to partner clusters',
      icon: FiCalendar,
      description: 'Next 7 days'
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
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Contract Portfolio
            </h2>
            {error && <span className="text-xs text-rose-500">Unable to fetch live data.</span>}
            {isLoading && <span className="text-xs text-slate-400">Syncing contracts...</span>}
          </div>
          <DataTable
            columns={contractColumns}
            data={amcData?.contracts ?? fallbackContracts}
            emptyLabel="No active contracts found."
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Renewal Radar
              </h2>
              <button className="text-xs text-primary font-semibold">Export Pipeline</button>
            </div>
            <DataTable
              columns={renewalColumns}
              data={
                amcData?.renewals ?? [
                  {
                    id: 1,
                    client: 'Axis Bank - Mumbai',
                    contract: 'AMC-2042',
                    value: '₹72L',
                    probability: '78%',
                    owner: 'Riya Sen',
                    status: 'Proposal Sent'
                  },
                  {
                    id: 2,
                    client: 'Mantri Heights',
                    contract: 'AMC-2038',
                    value: '₹38L',
                    probability: '64%',
                    owner: 'Karan Patel',
                    status: 'Negotiation'
                  }
                ]
              }
              emptyLabel="No renewals in the pipeline."
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">Workflow Automation</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Every contract is mapped to asset registers, preventive schedules, task templates, and SLA
              alerts. Ops teams only intervene when exceptions spike.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Auto-ticketing for preventive visits</li>
              <li>• Asset QR logs for technicians</li>
              <li>• Renewal nudges to customer + finance teams</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AMCManagement


