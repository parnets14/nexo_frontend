import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiUser, FiPhone, FiMail, FiMapPin, FiShield } from 'react-icons/fi'
import Logo from '../components/Logo.jsx'

const VerifyPartner = () => {
  const { partnerId } = useParams()
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPartnerDetails()
  }, [partnerId])

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9088'
      const response = await fetch(`${API_BASE_URL}/api/partner/verify/${partnerId}`)
      const data = await response.json()

      if (data.success && data.partner) {
        setPartner(data.partner)
      } else {
        setError(data.message || 'Partner not found')
      }
    } catch (err) {
      setError('Failed to verify partner')
      console.error('Verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying partner...</p>
        </div>
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h1>
          <p className="text-slate-600 mb-6">{error || 'Partner not found or invalid ID'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  const isVerified = partner.kycStatus === 'approved' || partner.kycStatus === 'verified'
  const profileImage = partner.profilePicture
    ? (partner.profilePicture.startsWith('http') 
        ? partner.profilePicture 
        : `http://localhost:9088/${partner.profilePicture}`)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Partner Verification</h1>
          <p className="text-slate-600">Verify Nexo Partner Identity</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div className={`${isVerified ? 'bg-green-500' : 'bg-yellow-500'} text-white p-4 text-center`}>
            <div className="flex items-center justify-center gap-3">
              {isVerified ? (
                <>
                  <FiCheckCircle className="text-2xl" />
                  <div>
                    <h2 className="text-xl font-bold">Verified Partner</h2>
                    <p className="text-sm opacity-90">This partner is verified by Nexo</p>
                  </div>
                </>
              ) : (
                <>
                  <FiShield className="text-2xl" />
                  <div>
                    <h2 className="text-xl font-bold">Verification Pending</h2>
                    <p className="text-sm opacity-90">KYC verification in progress</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Partner Details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={partner.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-4xl border-4 border-primary/20">
                    {partner.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
              </div>

              {/* Partner Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{partner.name || 'N/A'}</h3>
                  <p className="text-slate-500">Partner ID: {partner.partnerId || partnerId}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partner.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FiPhone className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-semibold text-slate-800">{partner.phone}</p>
                      </div>
                    </div>
                  )}

                  {partner.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FiMail className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-semibold text-slate-800">{partner.email}</p>
                      </div>
                    </div>
                  )}

                  {partner.city && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FiMapPin className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="font-semibold text-slate-800">{partner.city}</p>
                      </div>
                    </div>
                  )}

                  {partner.experience && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FiUser className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Experience</p>
                        <p className="font-semibold text-slate-800">{partner.experience} Years</p>
                      </div>
                    </div>
                  )}
                </div>

                {partner.categoryNames && partner.categoryNames.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Service Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {partner.categoryNames.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-slate-50 border-t border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <FiShield className="text-primary text-2xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Verification Details</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Partner ID verified: {partner.partnerId || partnerId}</li>
                  <li>• KYC Status: <span className="font-semibold">{partner.kycStatus || 'Pending'}</span></li>
                  {partner.verifiedAt && (
                    <li>• Verified on: {new Date(partner.verifiedAt).toLocaleDateString()}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default VerifyPartner

