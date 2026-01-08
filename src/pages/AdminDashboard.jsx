import React from 'react'
import { motion } from 'framer-motion'
import {
  FaUserShield,
  FaClipboardList,
  FaCalendarCheck,
  FaCogs,
  FaProjectDiagram,
  FaChartPie,
  FaBell,
  FaUndoAlt,
  FaWallet,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaLink,
  FaTools,
  FaUserFriends,
  FaBolt,
  FaStar,
  FaTasks
} from 'react-icons/fa'
import SEO from '../components/SEO'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'

const AdminDashboard = () => {
  const whatsappNumber = '+15558136145'
  const handleWhatsAppClick = useWhatsAppClick()

  const modules = [
    {
      title: 'Partner Control',
      icon: FaUserShield,
      badge: 'KYC • Wallet • Penalties • Payouts',
      description:
        'Unified workspace to manage partner lifecycle — from automated KYC approvals to wallet settlements, penalty levies, and payout releases.',
      capabilities: [
        'Real-time KYC verification & escalation routing',
        'Partner wallet ledger with adjustment controls',
        'Penalty engine with slabs, auto-debit & dispute workflow'
      ],
      highlights: [
        { icon: FaWallet, text: 'Wallet balance snapshots & freeze/unfreeze' },
        { icon: FaBalanceScale, text: 'Compliance scorecard per partner' }
      ]
    },
    {
      title: 'Customer Bookings',
      icon: FaClipboardList,
      badge: 'Bookings • Payments • Feedback',
      description:
        'Full booking pipeline visibility with SLA timers, payment confirmations, refund status, and customer feedback loops.',
      capabilities: [
        'Smart filters by city, service, SLA breach risk',
        'Integrated payment ledger with settlements view',
        'Post-service feedback capture & escalation triggers'
      ],
      highlights: [
        { icon: FaCalendarCheck, text: 'Live booking tracker with status timeline' },
        { icon: FaFileInvoiceDollar, text: 'Payment reconciliation by gateway' }
      ]
    },
    {
      title: 'Spare Parts',
      icon: FaTools,
      badge: 'Inventory • Suppliers • Procurement',
      description:
        'Central inventory and supplier linkage ensuring critical spares are always available with minimum reorder automation.',
      capabilities: [
        'Multi-location inventory & threshold alerts',
        'Supplier SLAs, lead time tracking, price locking',
        'Technician part request approvals & usage logs'
      ],
      highlights: [
        { icon: FaLink, text: 'Vendor contracts & compliance score' },
        { icon: FaTasks, text: 'Auto PO creation for low stock' }
      ]
    },
    {
      title: 'AMC Management',
      icon: FaCogs,
      badge: 'Contracts • Renewals • SLA',
      description:
        'AMC pipeline with contract templates, site asset logs, renewal nudges, and SLA performance dashboards.',
      capabilities: [
        'Customer asset registry with maintenance calendars',
        'Renewal probability scoring & reminders',
        'SLA breach alerts with penalty auto-calculation'
      ],
      highlights: [
        { icon: FaProjectDiagram, text: 'Contract stage Kanban and priorities' },
        { icon: FaBolt, text: 'Preventive visit scheduler with routing' }
      ]
    },
    {
      title: 'Lead Management',
      icon: FaProjectDiagram,
      badge: 'Allocation • Bidding • Conversion',
      description:
        'Rule-based lead allocation and bidding workflows to ensure partners compete fairly while maintaining SLAs & pricing range.',
      capabilities: [
        'Weighted scoring across expertise, ratings & availability',
        'Bid ceilings, auto-reject, and manual override options',
        'Lead-to-booking conversion analytics by cohort'
      ],
      highlights: [
        { icon: FaUserFriends, text: 'Partner standby pool & auto-reassignment' },
        { icon: FaStar, text: 'Quality score tracking after each job' }
      ]
    },
    {
      title: 'Reports',
      icon: FaChartPie,
      badge: 'Revenue • Penalties • Ratings',
      description:
        'Decision-grade analytics with exportable dashboards across revenue, penalties, customer NPS, partner earnings, and operational load.',
      capabilities: [
        'Category/geo/time revenue deep-dives',
        'Penalty vs payout correlation visuals',
        'Feedback sentiment & repeat issue clustering'
      ],
      highlights: [
        { icon: FaBolt, text: 'Realtime KPIs with threshold alerts' },
        { icon: FaFileInvoiceDollar, text: 'Finance-ready exports & audit logs' }
      ]
    },
    {
      title: 'Notifications',
      icon: FaBell,
      badge: 'WhatsApp • SMS • Templates',
      description:
        'Omnichannel communication center with templates, dynamic tokens, journey automation, and compliance guardrails.',
      capabilities: [
        'Template builder with live preview & versioning',
        'Audience segmentation (role, status, sentiment)',
        'Journey automation with trigger-condition-action logic'
      ],
      highlights: [
        { icon: FaLink, text: 'Integrated with partner & customer events' },
        { icon: FaTasks, text: 'A/B experiments on message copy' }
      ]
    },
    {
      title: 'Refund Management',
      icon: FaUndoAlt,
      badge: 'Auto Logs • Overrides • Escalations',
      description:
        'Transparent refund center tracking automated triggers and manual overrides with full audit trails and SLA timers.',
      capabilities: [
        'Refund categorisation by reason & source',
        'Automation rules for auto-approvals with risk scoring',
        'Escalation matrix for finance and partner settlements'
      ],
      highlights: [
        { icon: FaClipboardList, text: 'Approval matrix with dual-auth flows' },
        { icon: FaBalanceScale, text: 'Chargeback prevention intelligence' }
      ]
    }
  ]

  const automationFlows = [
    {
      title: 'Partner Onboarding Journey',
      steps: [
        'Instant document scan & KYC scoring',
        'Compliance checklist auto-generated',
        'Ops review → Approval → Training assignment',
        'Wallet activation with welcome credits'
      ]
    },
    {
      title: 'Booking Lifecycle Automation',
      steps: [
        'Lead captured → Allocation rules triggered',
        'Technician assignment + spare reservation',
        'Service completion proof upload workflow',
        'Auto-close with payment + feedback capture'
      ]
    },
    {
      title: 'Refund Safety Net',
      steps: [
        'Issue logged by support or system trigger',
        'Eligibility check across policy & risk score',
        'Auto refund or manual escalation path',
        'Notifications to customer, finance & partner'
      ]
    }
  ]

  const quickMetrics = [
    {
      label: 'Allocation Accuracy',
      value: '96%',
      trend: '+4.2%',
      description: 'Lead-to-tech matches with first-time resolution'
    },
    {
      label: 'Refund Turnaround',
      value: '2.1 hrs',
      trend: '-35%',
      description: 'Average time from request to refund closure'
    },
    {
      label: 'Template Reuse',
      value: '83%',
      trend: '+18%',
      description: 'Automated notifications that use dynamic tokens'
    }
  ]

  return (
    <>
      <SEO
        title="Admin Dashboard | Nexo Operations Control Center"
        description="Complete admin dashboard for partners, bookings, spare parts, AMC, leads, reports, notifications and refund orchestration."
        keywords="admin dashboard, partner management, booking control, AMC tracking, operations panel"
        url="/admin-dashboard"
      />

      <div className="bg-gray-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
          >
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide"
                >
                  <FaBolt className="text-yellow-300" />
                  Admin Command Center
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                >
                  One dashboard to govern partners, bookings, revenue,
                  notifications and refunds in real time.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-base sm:text-lg text-white/80 leading-relaxed"
                >
                  Designed for Nexo operations teams to monitor critical KPIs, automate escalations,
                  and orchestrate partner & customer journeys without switching tools.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    onClick={handleWhatsAppClick}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-primary font-semibold rounded-full shadow-lg text-center"
                  >
                    Request Live Demo
                  </motion.button>
                  <motion.a
                    href="mailto:ops@nexo.in?subject=Nexo%20Admin%20Dashboard%20Feature%20Sheet"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border border-white/60 text-white font-semibold rounded-full text-center"
                  >
                    Request Feature Sheet
                  </motion.a>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="lg:col-span-5 bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaChartPie className="text-yellow-300" /> Ops Health Snapshot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/70">Service SLA Adherence</p>
                    <p className="text-3xl font-bold mt-1">94%</p>
                    <span className="text-xs text-emerald-200">+6% vs last week</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/70">Net Promoter Score</p>
                    <p className="text-3xl font-bold mt-1">58</p>
                    <span className="text-xs text-yellow-200">Stable trend</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/70">Partner Compliance</p>
                    <p className="text-3xl font-bold mt-1">98%</p>
                    <span className="text-xs text-emerald-200">+12 cleared audits</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/70">Refund Automation</p>
                    <p className="text-3xl font-bold mt-1">76%</p>
                    <span className="text-xs text-emerald-200">Auto-closed within SLA</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.15),transparent_55%)]" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {quickMetrics.map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100"
              >
                <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                  {metric.label}
                </p>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-bold text-primary">{metric.value}</span>
                  <span className="text-xs font-semibold text-emerald-500">{metric.trend}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">Core Modules</h2>
            <p className="mt-4 text-gray-600">
              Each module plugs into the same data spine, so operators see unified customer,
              partner, and finance context at every step.
            </p>
          </div>

          <div className="grid gap-8">
            {modules.map((module, idx) => {
              const Icon = module.icon
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="grid lg:grid-cols-12 gap-8 p-6 sm:p-8">
                    <div className="lg:col-span-4 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-primary">{module.title}</h3>
                          <p className="text-xs font-semibold uppercase text-primary/70 tracking-wide">
                            {module.badge}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="lg:col-span-5">
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                        Capabilities
                      </h4>
                      <ul className="space-y-3">
                        {module.capabilities.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 bg-primary/5 rounded-2xl p-3"
                          >
                            <span className="mt-1">
                              <FaStar className="w-4 h-4 text-primary" />
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Ops Highlights
                      </h4>
                      <div className="space-y-3">
                        {module.highlights.map((highlight) => {
                          const HighlightIcon = highlight.icon
                          return (
                            <div
                              key={highlight.text}
                              className="flex items-start gap-3 bg-white border border-primary/10 rounded-2xl p-3 shadow-sm"
                            >
                              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                <HighlightIcon className="w-4 h-4" />
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{highlight.text}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                Automations that keep ops ahead
              </h2>
              <p className="mt-4 text-gray-600">
                Pre-built playbooks align partners, customers and finance — reducing manual toil and
                ensuring SLA-first responses.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {automationFlows.map((flow, index) => (
                <motion.div
                  key={flow.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-3xl p-6 sm:p-8 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-primary mb-5 leading-snug">{flow.title}</h3>
                  <div className="space-y-4">
                    {flow.steps.map((step) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="mt-1 text-primary">
                          <FaBolt className="w-4 h-4" />
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-5"
            >
              <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <FaUserShield /> Role-Based Guardrails
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Granular permissions, audit logs, and approval layers ensure compliance while
                keeping operations nimble. Combine global policies with team-specific overrides.
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• Tiered access (Super Admin → Ops Lead → Support → Finance)</li>
                <li>• Timestamped activity feed with rollback capability</li>
                <li>• Policy packs for geography, business unit, or franchise</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <FaChartPie /> Insights & Continuous Improvement
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Drill into performance drivers with configurable dashboards, anomaly detection, and
                weekly digest reports for leadership.
              </p>
              <ul className="space-y-3 text-sm text-white/80">
                <li>• Category-wise revenue, penalties & ratings in one view</li>
                <li>• Forecasting widgets for capacity & spare parts demand</li>
                <li>• Export-ready packs for finance, CX, and partner success</li>
              </ul>
            </motion.div>
          </div>
        </section>

        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                <h3 className="text-2xl font-semibold text-primary">Launch Plan & Next Steps</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The dashboard ships with a modular architecture — start with core booking controls,
                  plug in partner & refunds, and progressively activate automations as processes are
                  fleshed out.
                </p>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>1. Align role matrix & data sources</li>
                  <li>2. Configure service categories, penalty slabs, wallet rules</li>
                  <li>3. Connect notification templates & CRM events</li>
                  <li>4. Run sandbox drills before go-live</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 sm:p-8 space-y-5">
                <h4 className="text-lg font-semibold text-primary">Need custom workflows?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our ops engineers can extend the dashboard with bespoke automations, BI embeds, or
                  partner marketplace integrations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex-1 text-center bg-primary text-white px-5 py-3 rounded-full font-semibold shadow-lg hover:bg-primary-dark transition"
                  >
                    Chat on WhatsApp
                  </button>
                  <a
                    href="mailto:ops@nexo.in?subject=Nexo%20Admin%20Dashboard%20Customisation"
                    className="flex-1 text-center border border-primary text-primary px-5 py-3 rounded-full font-semibold hover:bg-primary/10 transition"
                  >
                    Email Ops Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AdminDashboard


