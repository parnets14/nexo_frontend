import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaSpinner } from 'react-icons/fa'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    // Simulate processing
    const timer = setTimeout(() => {
      setProcessing(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleViewBookings = () => {
    navigate('/user/dashboard/bookings')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaSpinner className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Processing your payment...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaCheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed. We'll send you a confirmation shortly.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleViewBookings}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
          >
            View My Bookings
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
