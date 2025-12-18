import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { PartnerAuthProvider } from './context/PartnerAuthContext.jsx'
import { VendorAuthProvider } from './context/VendorAuthContext.jsx'
import { UserAuthProvider } from './context/UserAuthContext.jsx'
import PageLoader from './components/PageLoader.jsx'
import './index.css'

// Register service worker on app load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <PageLoader />
    <AdminAuthProvider>
      <PartnerAuthProvider>
        <VendorAuthProvider>
          <UserAuthProvider>
            <App />
          </UserAuthProvider>
        </VendorAuthProvider>
      </PartnerAuthProvider>
    </AdminAuthProvider>
  </HelmetProvider>
)

