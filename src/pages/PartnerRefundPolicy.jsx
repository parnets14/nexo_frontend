import React from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { FaFileContract, FaCheckCircle, FaTimesCircle, FaClock, FaWallet, FaExclamationTriangle } from 'react-icons/fa'

const PartnerRefundPolicy = () => {
  return (
    <>
      <SEO 
        title="Partner Refund Policy | NEXO"
        description="NEXO Partner Refund Policy - Learn about refund eligibility, non-refundable items, refund processing times, and refund methods for partners."
        keywords="partner refund policy, NEXO partner refund, refund eligibility, partner refund processing"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 rounded-full p-4">
                  <FaFileContract className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Partner Refund Policy
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                NEXO Partner Program - Fair & Transparent Refund Process
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Eligibility for Refund */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                1. Eligibility for Refund 
              </h2>
              <p className="text-gray-700 mb-4">
                A partner may receive a refund only for the following cases:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Duplicate payment made by the partner.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Wallet deduction error due to a system glitch.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Overcharged commission or lead deduction due to technical error.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>MG Plan or Subscription</strong> — Refund only if partner has not activated or taken any job (within 24 hours of purchase).
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Non-Refundable Items */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-red-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
                <FaTimesCircle className="text-red-600" />
                2. Non-Refundable Items 
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">
                The following are strictly non-refundable:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Minimum Guarantee (MG) Plans</strong>, once activated or once a job is assigned.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Registration fees</strong></span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Toolkit fees</strong></span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Security deposit</strong> (refundable only at exit with conditions)
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Lead cost</strong> deducted for job views, accepts, or responses.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Penalties</strong> for cancellations, no-show, customer complaints.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Any <strong>custom kit, merchandise, uniform, or device cost</strong>.
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Refund Time */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaClock className="text-primary" />
                3. Refund Time (Partner)
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaWallet className="text-blue-500" />
                    Wallet Refunds:
                  </h3>
                  <p className="text-gray-700 text-lg font-semibold">
                    Instant to 24 hours
                  </p>
                </div>
                <div className="p-5 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaWallet className="text-purple-500" />
                    Bank Refunds:
                  </h3>
                  <p className="text-gray-700 text-lg font-semibold">
                    3–7 working days
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Mode of Refund */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                4. Mode of Refund
              </h2>
              <p className="text-gray-700 mb-4">Refund will be processed to:</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Partner Wallet</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Original payment mode (UPI/Card/Net Banking)</span>
                </div>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  Cash refunds are not permitted.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Important Notice */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need Help with Refunds?</h2>
              <p className="text-white/90 mb-4">
                If you believe you are eligible for a refund or have questions about our refund policy, please contact our partner support team:
              </p>
              <div className="space-y-2">
                <p className="text-white font-semibold">
                  Email: support@nexo.works
                </p>
                <p className="text-white/80 text-sm">
                  Please include your Partner ID and a brief description of the issue for faster processing.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}

export default PartnerRefundPolicy

