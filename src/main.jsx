import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { PartnerAuthProvider } from './context/PartnerAuthContext.jsx'
import PageLoader from './components/PageLoader.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <PageLoader />
    <AdminAuthProvider>
      <PartnerAuthProvider>
        <App />
      </PartnerAuthProvider>
    </AdminAuthProvider>
  </HelmetProvider>
)

