import React from 'react'
import { indianStates } from '../utils/locationUtils'

const StateSelector = ({ 
  value, 
  onChange, 
  placeholder = "Select State", 
  className = "",
  showCode = false,
  showGSTCode = false,
  disabled = false,
  required = false 
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary ${className}`}
      disabled={disabled}
      required={required}
    >
      <option value="">{placeholder}</option>
      {indianStates.map((state) => (
        <option key={state.code} value={state.name}>
          {showGSTCode 
            ? `${state.name} (GST: ${state.gstCode})`
            : showCode 
            ? `${state.name} (${state.code})` 
            : state.name
          }
        </option>
      ))}
    </select>
  )
}

export default StateSelector