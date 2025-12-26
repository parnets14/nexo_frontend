import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext.jsx'

const RequirePartnerAuth = () => {
  const { isAuthenticated, isLoading } = usePartnerAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide text-white/80">Loading partner portal...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/partner/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default RequirePartnerAuth

