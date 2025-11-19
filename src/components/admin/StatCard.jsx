import React from 'react'

const StatCard = ({ label, value, trend, intent = 'positive', description, icon: Icon }) => {
  const trendColor =
    intent === 'negative'
      ? 'text-rose-500 bg-rose-500/10'
      : intent === 'warning'
      ? 'text-amber-500 bg-amber-500/10'
      : 'text-emerald-500 bg-emerald-500/10'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-6 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="text-xl" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trendColor}`}>{trend}</span>
        )}
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  )
}

export default StatCard


