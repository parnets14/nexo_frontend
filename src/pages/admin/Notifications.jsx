import React from 'react'
import { FiMessageCircle, FiSend, FiSettings, FiZap } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'

const templateColumns = [
  { header: 'Template', accessor: 'name' },
  { header: 'Channel', accessor: 'channel' },
  { header: 'Audience', accessor: 'audience' },
  { header: 'Last Updated', accessor: 'updatedAt' },
  { header: 'Owner', accessor: 'owner' },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          value === 'Active'
            ? 'bg-emerald-500/10 text-emerald-600'
            : value === 'Draft'
            ? 'bg-slate-200 text-slate-700'
            : 'bg-amber-500/10 text-amber-600'
        }`}
      >
        {value}
      </span>
    )
  }
]

const automationColumns = [
  { header: 'Flow', accessor: 'flow' },
  { header: 'Trigger', accessor: 'trigger' },
  { header: 'Audience', accessor: 'audience' },
  { header: 'Channels', accessor: 'channels' },
  { header: 'Sends (7d)', accessor: 'sends' },
  { header: 'Status', accessor: 'status' }
]

const fallbackTemplates = [
  {
    id: 1,
    name: 'Booking Confirmation',
    channel: 'WhatsApp',
    audience: 'Customer',
    updatedAt: '12 Nov, 10:12',
    owner: 'CX Ops',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Partner Allocation Alert',
    channel: 'SMS + WhatsApp',
    audience: 'Partner',
    updatedAt: '11 Nov, 18:04',
    owner: 'Partner Ops',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Refund Initiated',
    channel: 'WhatsApp',
    audience: 'Customer',
    updatedAt: '10 Nov, 16:40',
    owner: 'Finance',
    status: 'Draft'
  }
]

const Notifications = () => {
  const { data: commsData, isLoading, error } = useAdminData((token) =>
    adminApi.fetchModuleData('/notifications/templates', token)
  )

  const stats = [
    {
      label: 'Templates Live',
      value: commsData?.templateCount ?? 48,
      trend: '8 pending WhatsApp approval',
      icon: FiMessageCircle,
      description: 'Across partners, customers, finance'
    },
    {
      label: 'Automation Journeys',
      value: commsData?.journeys ?? 14,
      trend: '3 paused due to SLA breach',
      icon: FiSettings,
      description: 'Trigger-condition-action flows'
    },
    {
      label: 'Messages Sent (24h)',
      value: commsData?.messagesSent ?? '18,240',
      trend: 'Delivery rate 97.4%',
      icon: FiSend,
      description: 'WhatsApp + SMS combined'
    },
    {
      label: 'Tokenized Content',
      value: commsData?.tokenUsage ?? '83%',
      trend: 'Personalized with real-time data',
      icon: FiZap,
      description: 'Dynamic placeholders'
    }
  ]

  return (
    <div>
      <ModuleHeader
        title="Notifications"
        subtitle="Build and orchestrate WhatsApp and SMS templates with audit-ready versions, journey automation, and compliance guardrails."
        actions={
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition">
            Create Template
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
              Template Library
            </h2>
            {error && (
              <span className="text-xs text-rose-500">Template sync failed. Showing cached data.</span>
            )}
            {isLoading && <span className="text-xs text-slate-400">Loading templates...</span>}
          </div>
          <DataTable
            columns={templateColumns}
            data={commsData?.templates ?? fallbackTemplates}
            emptyLabel="No templates created."
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Journey Automation
              </h2>
              <button className="text-xs text-primary font-semibold">New Flow</button>
            </div>
            <DataTable
              columns={automationColumns}
              data={
                commsData?.journeySummary ?? [
                  {
                    id: 1,
                    flow: 'Lead Allocated → Partner Reminder',
                    trigger: 'No bid in 15 mins',
                    audience: 'Partner',
                    channels: 'WhatsApp + Push',
                    sends: '546',
                    status: 'Active'
                  },
                  {
                    id: 2,
                    flow: 'Service Completed → Feedback',
                    trigger: 'Job completion event',
                    audience: 'Customer',
                    channels: 'WhatsApp + Email',
                    sends: '1,824',
                    status: 'Active'
                  }
                ]
              }
              emptyLabel="No automation journeys configured."
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">Compliance Guardrails</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Centralized audit logs, template versioning, and opt-out controls ensure every WhatsApp or SMS
              message adheres to regulatory requirements.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Maintain DLT IDs and expiry alerts</li>
              <li>• Auto-block sending if opt-out thresholds exceeded</li>
              <li>• Attach escalation notes for manual overrides</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Notifications


