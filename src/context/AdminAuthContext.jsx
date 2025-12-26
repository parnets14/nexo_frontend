import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { clearAdminDataCache } from '../hooks/useAdminData.js'
import { useNotifications } from '../hooks/useNotifications'
import { adminApi } from '../services/adminApi'

const AdminAuthContext = createContext(null)

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  admin: null,
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
        admin: action.payload?.admin ?? null,
        token: action.payload?.token ?? null
      }
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        error: null
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        admin: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = localStorage.getItem('nexo_admin_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'INIT', payload: parsed })
      } catch (error) {
        console.error('Failed to parse admin auth cache', error)
        localStorage.removeItem('nexo_admin_auth')
        dispatch({ type: 'INIT', payload: null })
      }
    } else {
      dispatch({ type: 'INIT', payload: null })
    }
  }, [])

  // Initialize notifications
  const notifications = useNotifications(adminApi, state.token, state.isAuthenticated)

  const value = useMemo(
    () => ({
      ...state,
      notifications,
      login: async (loginFn, credentials) => {
        dispatch({ type: 'LOGIN_START' })
        try {
          const response = await loginFn(credentials)
          const payload = {
            token: response.token,
            admin: response.admin
          }
          localStorage.setItem('nexo_admin_auth', JSON.stringify(payload))
          dispatch({ type: 'LOGIN_SUCCESS', payload })
          return payload
        } catch (error) {
          const message =
            error?.message ?? error?.response?.data?.message ?? 'Unable to login'
          dispatch({ type: 'LOGIN_ERROR', payload: message })
          throw new Error(message)
        }
      },
      logout: () => {
        localStorage.removeItem('nexo_admin_auth')
        clearAdminDataCache() // Clear API cache on logout
        dispatch({ type: 'LOGOUT' })
      },
      clearError: () => dispatch({ type: 'LOGIN_ERROR', payload: null })
    }),
    [state, notifications]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}


