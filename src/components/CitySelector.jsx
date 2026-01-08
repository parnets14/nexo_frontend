import React from 'react'
import { getCitiesByState } from '../utils/locationUtils'

const CitySelector = ({ 
  state,
  value, 
  onChange, 
  placeholder = "Select City", 
  className = "",
  disabled = false,
  required = false,
  allowCustom = true
}) => {
  const cities = state ? getCitiesByState(state) : []
  
  if (allowCustom) {
    return (
      <>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={state ? `Enter city in ${state}` : placeholder}
          className={`w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary ${className}`}
          disabled={disabled}
          required={required}
          list={state ? `cities-${state.replace(/\s+/g, '-')}` : undefined}
        />
        
        {/* Datalist for autocomplete */}
        {state && cities.length > 0 && (
          <datalist id={`cities-${state.replace(/\s+/g, '-')}`}>
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        )}
      </>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary ${className}`}
      disabled={disabled || !state}
      required={required}
    >
      <option value="">{state ? placeholder : "Select state first"}</option>
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  )
}

export default CitySelector