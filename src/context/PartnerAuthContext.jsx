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
    const initAuth = async () => {
      const saved = localStorage.getItem('nexo_partner_auth')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          dispatch({ type: 'INIT', payload: parsed })
          
          // Fetch fresh profile data to ensure we have the latest partnerType
          if (parsed.token) {
            try {
              const profileResponse = await partnerApi.getProfile(parsed.token)
              if (profileResponse.success && profileResponse.profile) {
                const updatedPartner = {
                  ...parsed.partner,
                  ...profileResponse.profile,
                  profile: {
                    ...parsed.partner?.profile,
                    ...profileResponse.profile
                  }
                }
                const updatedPayload = {
                  token: parsed.token,
                  partner: updatedPartner
                }
                localStorage.setItem('nexo_partner_auth', JSON.stringify(updatedPayload))
                dispatch({ type: 'UPDATE_PARTNER', payload: updatedPartner })
              }
            } catch (profileError) {
              console.error('Failed to fetch profile on init:', profileError)
              // Continue with cached data if profile fetch fails
            }
          }
        } catch (error) {
          console.error('Failed to parse partner auth cache', error)
          localStorage.removeItem('nexo_partner_auth')
          dispatch({ type: 'INIT', payload: null })
        }
      } else {
        dispatch({ type: 'INIT', payload: null })
      }
    }
    
    initAuth()
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
            // Fetch complete profile data to ensure we have all fields including partnerType
            let completePartner = response.partner
            try {
              const profileResponse = await partnerApi.getProfile(response.partner.token)
              if (profileResponse.success && profileResponse.profile) {
                // Merge the profile data with the login response
                completePartner = {
                  ...response.partner,
                  ...profileResponse.profile,
                  profile: {
                    ...response.partner.profile,
                    ...profileResponse.profile
                  }
                }
              }
            } catch (profileError) {
              console.error('Failed to fetch complete profile:', profileError)
              // Continue with the login response data if profile fetch fails
            }
            
            const payload = {
              token: response.partner.token,
              partner: completePartner
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
      },
      refreshProfile: async () => {
        if (!state.token) return
        try {
          const profileResponse = await partnerApi.getProfile(state.token)
          if (profileResponse.success && profileResponse.profile) {
            const updatedPartner = {
              ...state.partner,
              ...profileResponse.profile,
              profile: {
                ...state.partner?.profile,
                ...profileResponse.profile
              }
            }
            const saved = localStorage.getItem('nexo_partner_auth')
            if (saved) {
              const parsed = JSON.parse(saved)
              parsed.partner = updatedPartner
              localStorage.setItem('nexo_partner_auth', JSON.stringify(parsed))
            }
            dispatch({ type: 'UPDATE_PARTNER', payload: updatedPartner })
            return updatedPartner
          }
        } catch (error) {
          console.error('Failed to refresh profile:', error)
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

