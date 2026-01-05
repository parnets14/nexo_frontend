import React, { useState } from 'react'
import { FiX, FiUpload, FiImage, FiFileText } from 'react-icons/fi'
import { getServiceName, getBookingId } from '../utils/bookingUtils'

const CompleteJobModal = ({ booking, onClose, onComplete, token }) => {
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([])
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(prev => [...prev, ...files])
  }

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files)
    setVideos(prev => [...prev, ...files])
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (photos.length === 0 && videos.length === 0) {
      setError('Please upload at least one photo or video')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      
      // Append photos
      photos.forEach((photo) => {
        formData.append('photos', photo)
      })
      
      // Append videos
      videos.forEach((video) => {
        formData.append('videos', video)
      })
      
      // Append remark if provided
      if (remark.trim()) {
        formData.append('remark', remark.trim())
      }

      await onComplete(booking._id || booking.bookingId, formData)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to complete job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900">Mark Work as Done</h2>
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
              <strong>Booking ID:</strong> {getBookingId(booking)}
            </p>
            <p className="text-sm text-slate-600 mb-3">
              <strong>Service:</strong> {getServiceName(booking)}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-semibold mb-1">📋 Important Note:</p>
              <p className="text-xs text-blue-700">
                This will mark the work as completed. The job will require payment settlement before final completion.
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiImage className="inline mr-2" />
              Upload Photos <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition">
                <FiUpload className="w-5 h-5 text-slate-600 mr-2" />
                <span className="text-sm text-slate-600">Click to upload photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiUpload className="inline mr-2" />
              Upload Videos (Optional)
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition">
                <FiUpload className="w-5 h-5 text-slate-600 mr-2" />
                <span className="text-sm text-slate-600">Click to upload videos</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <span className="text-sm text-slate-600 truncate flex-1">{video.name}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiFileText className="inline mr-2" />
              Remark (Optional)
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
              placeholder="Add any remarks or notes about the job completion..."
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
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (photos.length === 0 && videos.length === 0)}
            >
              {loading ? 'Marking as Done...' : 'Mark Work Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteJobModal

