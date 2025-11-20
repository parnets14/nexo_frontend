import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { partnerApi } from '../services/partnerApi.js'
import { useNotifications } from '../hooks/useNotifications'

const PartnerAuthContext = createContext(null)

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  partner: null,
  token: null,
  error: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: Boolean(action.payload?.token),
        partner: action.payload?.partner ?? null,
        token: action.payload?.token ?? null
      }
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        partner: action.payload.partner,
        token: action.payload.token,
        error: null
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        partner: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'UPDATE_PARTNER':
      return {
        ...state,
        partner: { ...state.partner, ...action.payload }
      }
    default:
      return state
  }
}

export const PartnerAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = localStorage.getItem('nexo_partner_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'INIT', payload: parsed })
      } catch (error) {
        console.error('Failed to parse partner auth cache', error)
        localStorage.removeItem('nexo_partner_auth')
        dispatch({ type: 'INIT', payload: null })
      }
    } else {
      dispatch({ type: 'INIT', payload: null })
    }
  }, [])

  // Initialize notifications
  const notifications = useNotifications(partnerApi, state.token, state.isAuthenticated)

  const value = useMemo(
    () => ({
      ...state,
      notifications,
      login: async (phone, otp) => {
        dispatch({ type: 'LOGIN_START' })
        try {
          const response = await partnerApi.verifyOTP(phone, otp)
          if (response.success && response.partner) {
            const payload = {
              token: response.partner.token,
              partner: response.partner
            }
            localStorage.setItem('nexo_partner_auth', JSON.stringify(payload))
            dispatch({ type: 'LOGIN_SUCCESS', payload })
            
            return payload
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          const message = error?.message ?? 'Unable to login'
          dispatch({ type: 'LOGIN_ERROR', payload: message })
          throw new Error(message)
        }
      },
      logout: () => {
        localStorage.removeItem('nexo_partner_auth')
        dispatch({ type: 'LOGOUT' })
      },
      clearError: () => dispatch({ type: 'LOGIN_ERROR', payload: null }),
      updatePartner: (partnerData) => {
        const saved = localStorage.getItem('nexo_partner_auth')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            parsed.partner = { ...parsed.partner, ...partnerData }
            localStorage.setItem('nexo_partner_auth', JSON.stringify(parsed))
            dispatch({ type: 'UPDATE_PARTNER', payload: partnerData })
          } catch (error) {
            console.error('Failed to update partner data', error)
          }
        }
      }
    }),
    [state, notifications]
  )

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>
}

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext)
  if (!context) {
    throw new Error('usePartnerAuth must be used within PartnerAuthProvider')
  }
  return context
}

