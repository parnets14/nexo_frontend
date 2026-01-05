import React, { useState } from 'react'
import { FiX, FiClock } from 'react-icons/fi'

const PauseJobModal = ({ booking, onClose, onPause, token }) => {
  const [nextScheduledDate, setNextScheduledDate] = useState('')
  const [nextScheduledTime, setNextScheduledTime] = useState('')
  const [pauseReason, setPauseReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nextScheduledDate || !nextScheduledTime) {
      setError('Please provide both date and time for resuming the job')
      return
    }

    setLoading(true)
    try {
      await onPause(booking._id || booking.bookingId, {
        nextScheduledDate,
        nextScheduledTime,
        pauseReason: pauseReason.trim() || 'Not specified'
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to pause job')
    } finally {
      setLoading(false)
    }
  }

  // Get tomorrow's date as default minimum date
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900">Pause Job</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Booking Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">
              <strong>Booking ID:</strong> {booking.bookingId || booking._id?.toString().slice(-8) || 'N/A'}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Service:</strong> {
                booking.service?.name || 
                booking.subService?.name || 
                booking.popularService?.name || 
                booking.serviceName || 
                'Service Booking'
              }
            </p>
          </div>

          {/* Next Scheduled Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiClock className="inline mr-2" />
              Next Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={nextScheduledDate}
              onChange={(e) => setNextScheduledDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              required
              disabled={loading}
            />
          </div>

          {/* Next Scheduled Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiClock className="inline mr-2" />
              Next Scheduled Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={nextScheduledTime}
              onChange={(e) => setNextScheduledTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              required
              disabled={loading}
            />
          </div>

          {/* Pause Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reason for Pausing (Optional)
            </label>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
              placeholder="e.g., Waiting for parts, Customer requested delay, etc."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Pausing...' : 'Pause Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PauseJobModal

