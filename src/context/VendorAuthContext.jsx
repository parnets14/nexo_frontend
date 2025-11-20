import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { vendorApi } from '../services/vendorApi.js'
import { useNotifications } from '../hooks/useNotifications'

const VendorAuthContext = createContext(null)

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  vendor: null,
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
        vendor: action.payload?.vendor ?? null,
        token: action.payload?.token ?? null
      }
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        vendor: action.payload.vendor,
        token: action.payload.token,
        error: null
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        vendor: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'UPDATE_VENDOR':
      return {
        ...state,
        vendor: { ...state.vendor, ...action.payload }
      }
    default:
      return state
  }
}

export const VendorAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = localStorage.getItem('nexo_vendor_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'INIT', payload: parsed })
      } catch (error) {
        console.error('Failed to parse vendor auth cache', error)
        localStorage.removeItem('nexo_vendor_auth')
        dispatch({ type: 'INIT', payload: null })
      }
    } else {
      dispatch({ type: 'INIT', payload: null })
    }
  }, [])

  // Initialize notifications
  const notifications = useNotifications(vendorApi, state.token, state.isAuthenticated)

  const value = useMemo(
    () => ({
      ...state,
      notifications,
      login: async (phone, otp) => {
        dispatch({ type: 'LOGIN_START' })
        try {
          const response = await vendorApi.verifyOTP(phone, otp)
          if (response.success && response.vendor) {
            const payload = {
              token: response.vendor.token,
              vendor: response.vendor
            }
            localStorage.setItem('nexo_vendor_auth', JSON.stringify(payload))
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
      loginWithPassword: async (email, password) => {
        dispatch({ type: 'LOGIN_START' })
        try {
          const response = await vendorApi.loginWithPassword(email, password)
          console.log('Login response:', response)
          
          if (response.success && response.vendor) {
            const payload = {
              token: response.vendor.token,
              vendor: response.vendor
            }
            localStorage.setItem('nexo_vendor_auth', JSON.stringify(payload))
            dispatch({ type: 'LOGIN_SUCCESS', payload })
            return payload
          } else {
            const errorMsg = response.message || 'Login failed'
            console.error('Login failed:', errorMsg, response)
            throw new Error(errorMsg)
          }
        } catch (error) {
          console.error('Login error caught:', error)
          const message = error?.message || error?.data?.message || 'Unable to login'
          dispatch({ type: 'LOGIN_ERROR', payload: message })
          throw new Error(message)
        }
      },
      logout: () => {
        localStorage.removeItem('nexo_vendor_auth')
        dispatch({ type: 'LOGOUT' })
      },
      clearError: () => dispatch({ type: 'LOGIN_ERROR', payload: null }),
      updateVendor: (vendorData) => {
        const saved = localStorage.getItem('nexo_vendor_auth')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            parsed.vendor = { ...parsed.vendor, ...vendorData }
            localStorage.setItem('nexo_vendor_auth', JSON.stringify(parsed))
            dispatch({ type: 'UPDATE_VENDOR', payload: vendorData })
          } catch (error) {
            console.error('Failed to update vendor data', error)
          }
        }
      }
    }),
    [state, notifications]
  )

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>
}

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext)
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider')
  }
  return context
}

