import React from 'react'

const StatCard = ({ label, value, trend, intent = 'positive', description, icon: Icon, color = 'bg-primary', gradient }) => {
  const trendColor =
    intent === 'negative'
      ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
      : intent === 'warning'
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'

  const iconBg = gradient 
    ? `bg-gradient-to-br ${gradient}`
    : `${color} bg-opacity-10`

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 px-5 py-6 flex flex-col gap-4 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${iconBg} rounded-full -mr-12 -mt-12 opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 mb-2">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${trendColor} inline-flex items-center gap-1`}>
                {trend}
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`text-xl ${gradient ? 'text-white' : 'text-primary'}`} />
          </div>
        )}
      </div>
      
      {/* Visual accent bar */}
      <div className="relative z-10 mt-2">
        <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${gradient ? `bg-gradient-to-r ${gradient}` : color} rounded-full transition-all duration-500`}
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default StatCard


