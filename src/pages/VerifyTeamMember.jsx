import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiUser, FiPhone, FiMapPin, FiShield, FiBriefcase } from 'react-icons/fi'
import Logo from '../components/Logo.jsx'

const VerifyTeamMember = () => {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMemberDetails()
  }, [memberId])

  const fetchMemberDetails = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173'
      const response = await fetch(`${API_BASE_URL}/api/partner/verify/team-member/${memberId}`)
      const data = await response.json()

      if (data.success && data.member) {
        setMember(data.member)
      } else {
        setError(data.message || 'Team member not found')
      }
    } catch (err) {
      setError('Failed to verify team member')
      console.error('Verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying team member...</p>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h1>
          <p className="text-slate-600 mb-6">{error || 'Team member not found or invalid ID'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  const isVerified = member.status === 'active' || member.kyc?.status === 'approved'
  const profileImage = member.profilePicture
    ? (member.profilePicture.startsWith('http') 
        ? member.profilePicture 
        : `http://localhost:5173/${member.profilePicture}`)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Team Member Verification</h1>
          <p className="text-slate-600">Verify Nexo Team Member Identity</p>
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
                    <h2 className="text-xl font-bold">Verified Team Member</h2>
                    <p className="text-sm opacity-90">This team member is verified by Nexo</p>
                  </div>
                </>
              ) : (
                <>
                  <FiShield className="text-2xl" />
                  <div>
                    <h2 className="text-xl font-bold">Verification Pending</h2>
                    <p className="text-sm opacity-90">Verification in progress</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Team Member Details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-4xl border-4 border-indigo-200">
                    {member.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
              </div>

              {/* Member Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{member.name || 'N/A'}</h3>
                  <p className="text-slate-500">Member ID: {(member._id || member.id || '').toString().slice(-8).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FiPhone className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-semibold text-slate-800">{member.phone}</p>
                      </div>
                    </div>
                  )}

                  {member.role && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FiBriefcase className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Role</p>
                        <p className="font-semibold text-slate-800">{member.role}</p>
                      </div>
                    </div>
                  )}

                  {member.city && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FiMapPin className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="font-semibold text-slate-800">{member.city}</p>
                      </div>
                    </div>
                  )}

                  {member.partner && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FiUser className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Partner</p>
                        <p className="font-semibold text-slate-800">
                          {member.partner.profile?.name || member.partner.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {member.specializations && member.specializations.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-indigo-50 border-t border-indigo-100 p-6">
            <div className="flex items-start gap-4">
              <FiShield className="text-indigo-600 text-2xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Verification Details</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Member ID verified: {(member._id || member.id || '').toString().slice(-8).toUpperCase()}</li>
                  <li>• Status: <span className="font-semibold">{member.status || 'Pending'}</span></li>
                  {member.createdAt && (
                    <li>• Joined on: {new Date(member.createdAt).toLocaleDateString()}</li>
                  )}
                  {member.partner && (
                    <li>• Works under: <span className="font-semibold">{member.partner.profile?.name || member.partner.name || 'N/A'}</span></li>
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
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default VerifyTeamMember
