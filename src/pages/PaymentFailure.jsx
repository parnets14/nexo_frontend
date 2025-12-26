import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaTimesCircle } from 'react-icons/fa'

const PaymentFailure = () => {
  const navigate = useNavigate()

  const handleRetry = () => {
    navigate(-1) // Go back to checkout
  }

  const handleGoHome = () => {
    navigate('/')
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
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaTimesCircle className="w-12 h-12 text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
          >
            Try Again
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

export default PaymentFailure
