import React, { useState, useEffect, useRef } from 'react'
import { FiWifi, FiWifiOff, FiRefreshCw, FiCheckCircle, FiXCircle, FiMessageSquare, FiSend } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { adminApi } from '../../services/adminApi.js'

const WhatsAppSettings = () => {
  const { token } = useAdminAuth()
  const [status, setStatus] = useState({
    isReady: false,
    isAuthenticated: false,
    qrCode: null,
    autoReconnect: true,
    reconnectAttempts: 0,
    isReconnecting: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const isCheckingStatus = useRef(false)

  useEffect(() => {
    // Initial status check
    checkStatus()
    
    // Only poll when not ready or reconnecting, with longer interval
    if (!status.isReady || status.isReconnecting) {
      setIsPolling(true)
      const interval = setInterval(() => {
        checkStatus()
      }, 15000) // Poll every 15 seconds instead of 5

      return () => {
        clearInterval(interval)
        setIsPolling(false)
      }
    } else {
      setIsPolling(false)
    }
  }, [status.isReady, status.isReconnecting])

  const checkStatus = async () => {
    // Prevent multiple simultaneous calls
    if (isCheckingStatus.current) return
    
    isCheckingStatus.current = true
    try {
      const response = await adminApi.getWhatsAppStatus(token)
      if (response.success) {
        setStatus(prevStatus => {
          // Only update if status actually changed to prevent unnecessary re-renders
          const newStatus = {
            isReady: response.isReady || false,
            isAuthenticated: response.isAuthenticated || false,
            qrCode: response.qrCode || null,
            autoReconnect: response.autoReconnect !== undefined ? response.autoReconnect : true,
            reconnectAttempts: response.reconnectAttempts || 0,
            isReconnecting: response.isReconnecting || false
          }
          
          // Check if status actually changed
          if (
            prevStatus.isReady !== newStatus.isReady ||
            prevStatus.isReconnecting !== newStatus.isReconnecting ||
            prevStatus.qrCode !== newStatus.qrCode ||
            prevStatus.reconnectAttempts !== newStatus.reconnectAttempts
          ) {
            return newStatus
          }
          return prevStatus
        })
      }
    } catch (err) {
      console.error('Error checking status:', err)
    } finally {
      isCheckingStatus.current = false
    }
  }

  const handleInitialize = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await adminApi.initializeWhatsApp(token)
      if (response.success) {
        setStatus({
          isReady: response.isReady || false,
          isAuthenticated: response.isAuthenticated || false,
          qrCode: response.qrCode || null
        })
        setSuccess('WhatsApp client initialized. Please scan the QR code.')
        // Fetch QR code after a short delay
        setTimeout(() => {
          fetchQRCode()
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await adminApi.getWhatsAppQRCode(token)
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          qrCode: response.qrCode || null,
          isReady: response.isReady || false,
          isAuthenticated: response.isAuthenticated || false
        }))
      }
    } catch (err) {
      console.error('Error fetching QR code:', err)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp? This will require re-authentication.')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await adminApi.disconnectWhatsApp(token)
      if (response.success) {
        setStatus({
          isReady: false,
          isAuthenticated: false,
          qrCode: null
        })
        setSuccess('WhatsApp disconnected successfully')
      }
    } catch (err) {
      setError(err.message || 'Failed to disconnect WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testPhone) {
      setError('Please enter a phone number')
      return
    }

    setSendingTest(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await adminApi.sendTestWhatsAppMessage(
        token,
        testPhone,
        testMessage || 'Test message from Nexo Works'
      )
      if (response.success) {
        setSuccess('Test message sent successfully!')
        setTestPhone('')
        setTestMessage('')
      }
    } catch (err) {
      setError(err.message || 'Failed to send test message')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="WhatsApp Settings"
        subtitle="Connect WhatsApp to send OTP messages for free"
      />

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Connection Status</h3>
          <button
            onClick={checkStatus}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            disabled={loading}
          >
            <FiRefreshCw className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            {status.isReady ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <FiCheckCircle className="text-2xl" />
                  <span className="font-semibold">Connected</span>
                </div>
                <p className="text-sm text-slate-600">
                  WhatsApp is connected and ready to send OTP messages
                </p>
              </>
            ) : status.isReconnecting ? (
              <>
                <div className="flex items-center gap-2 text-yellow-600">
                  <FiRefreshCw className="text-2xl animate-spin" />
                  <span className="font-semibold">Reconnecting...</span>
                </div>
                <p className="text-sm text-slate-600">
                  Attempting to reconnect automatically (Attempt {status.reconnectAttempts}/10)
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-red-600">
                  <FiXCircle className="text-2xl" />
                  <span className="font-semibold">Not Connected</span>
                </div>
                <p className="text-sm text-slate-600">
                  WhatsApp is not connected. {status.autoReconnect ? 'Auto-reconnect is enabled.' : 'Please scan QR code to connect.'}
                </p>
              </>
            )}
          </div>
          
          {/* Auto-reconnect status */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2 h-2 rounded-full ${status.autoReconnect ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>Auto-reconnect: {status.autoReconnect ? 'Enabled' : 'Disabled'}</span>
            {status.reconnectAttempts > 0 && (
              <span className="ml-2">• Attempts: {status.reconnectAttempts}/10</span>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Card */}
      {!status.isReady && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Scan QR Code</h3>
          
          {status.qrCode ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                <img
                  src={status.qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Scan this QR code with your WhatsApp
                </p>
                <ol className="text-sm text-slate-600 text-left max-w-md mx-auto space-y-1">
                  <li>1. Open WhatsApp on your phone</li>
                  <li>2. Go to Settings → Linked Devices</li>
                  <li>3. Tap "Link a Device"</li>
                  <li>4. Scan this QR code</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No QR code available. Click "Initialize" to generate one.</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <FiWifi />
                  Initialize WhatsApp
                </>
              )}
            </button>
            {status.qrCode && (
              <button
                onClick={fetchQRCode}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              >
                <FiRefreshCw />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Connected Actions */}
      {status.isReady && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Actions</h3>
          
          <div className="space-y-4">
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiWifiOff />
              Disconnect WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Auto-reconnect Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Auto-Reconnect Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-700">Automatic Reconnection</p>
              <p className="text-sm text-slate-500 mt-1">
                Automatically reconnect WhatsApp if connection is lost
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={status.autoReconnect}
                onChange={async (e) => {
                  try {
                    await adminApi.setAutoReconnect(token, e.target.checked)
                    setStatus(prev => ({ ...prev, autoReconnect: e.target.checked }))
                    setSuccess(`Auto-reconnect ${e.target.checked ? 'enabled' : 'disabled'}`)
                  } catch (err) {
                    setError(err.message || 'Failed to update auto-reconnect setting')
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {!status.isReady && (
            <button
              onClick={async () => {
                setLoading(true)
                setError(null)
                setSuccess(null)
                try {
                  const response = await adminApi.reconnectWhatsApp(token)
                  if (response.success) {
                    setStatus(prev => ({
                      ...prev,
                      isReady: response.isReady || false,
                      isAuthenticated: response.isAuthenticated || false,
                      qrCode: response.qrCode || null
                    }))
                    setSuccess('Reconnection initiated. Please wait...')
                    setTimeout(() => checkStatus(), 3000)
                  }
                } catch (err) {
                  setError(err.message || 'Failed to reconnect')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading || status.isReconnecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              {status.isReconnecting ? 'Reconnecting...' : 'Manual Reconnect'}
            </button>
          )}
        </div>
      </div>

      {/* Test Message Card */}
      {status.isReady && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FiMessageSquare />
            Send Test Message
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number (with country code, e.g., 919876543210)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test message from Nexo Works"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleSendTest}
              disabled={sendingTest || !testPhone}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingTest ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend />
                  Send Test Message
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <FiXCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <FiCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Initialize WhatsApp" to generate a QR code</li>
          <li>• Scan the QR code with your WhatsApp mobile app</li>
          <li>• Once connected, all OTP messages will be sent via WhatsApp instead of SMS</li>
          <li>• This is completely free and doesn't require any SMS API</li>
          <li>• The connection persists until you disconnect or restart the server</li>
        </ul>
      </div>
    </div>
  )
}

export default WhatsAppSettings

