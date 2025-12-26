import React from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { FaFileContract, FaCheckCircle, FaTimesCircle, FaClock, FaWallet, FaBox, FaExclamationTriangle } from 'react-icons/fa'

const CustomerRefundPolicy = () => {
  return (
    <>
      <SEO 
        title="Customer Refund Policy | NEXO"
        description="NEXO Customer Refund Policy - Learn about refund eligibility, non-refundable fees, refund processing times, and refund methods."
        keywords="refund policy, customer refund, NEXO refund, refund eligibility, refund processing"
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
                Customer Refund Policy
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                NEXO - Fair & Transparent Refund Process
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
                A customer is eligible for a refund only in the following cases:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Partner fails to arrive within the committed time window.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Service not initiated due to partner unavailability / NEXO internal issue.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Service not delivered due to NEXO's fault, such as system failure or incorrect partner assignment.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Duplicate payment made by the customer.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Overcharging due to system or billing error.</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Non-Refundable Fees */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-red-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
                <FaTimesCircle className="text-red-600" />
                2. Non-Refundable Fees 
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">
                The following charges are strictly non-refundable:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Visiting Fee</strong>, once the partner has arrived at the customer location.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Service Charge</strong> (platform/processing fee).</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Cancellation Fee</strong> charged due to last-minute customer cancellation.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Custom materials/parts</strong> purchased exclusively for the customer's job.</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Any penalties</strong> applied due to customer behaviour or policy violation.</span>
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
                3. Refund Time (Customer)
              </h2>
              <div className="space-y-6">
                <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaWallet className="text-blue-500" />
                    Refund to NEXO Wallet:
                  </h3>
                  <p className="text-gray-700 text-lg font-semibold">
                    Instant to 24 hours.
                  </p>
                </div>
                <div className="p-5 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaWallet className="text-purple-500" />
                    Refund to Bank Account / UPI:
                  </h3>
                  <p className="text-gray-700 text-lg font-semibold">
                    3–7 working days, depending on bank processing timelines.
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
              <p className="text-gray-700 mb-4">Refund will be processed via:</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-semibold">NEXO Wallet</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-semibold">Source Account (UPI/Card/Net Banking)</span>
                </div>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  No cash refunds are permitted under any circumstances.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Material Purchase Refund */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaBox className="text-primary" />
                5. Material Purchase Refund
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-700 mb-2">
                    <strong>Materials purchased by the partner on customer's request are not refundable once:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Opened</li>
                    <li>Installed</li>
                    <li>Used</li>
                    <li>Customized</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-gray-700">
                    <strong>If unopened and vendor accepts returns,</strong> only material cost may be refunded (vendor policies apply).
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Important Notice */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need Help with Refunds?</h2>
              <p className="text-white/90 mb-4">
                If you believe you are eligible for a refund or have questions about our refund policy, please contact our support team:
              </p>
              <div className="space-y-2">
                <p className="text-white font-semibold">
                  Email: support@nexo.works
                </p>
                <p className="text-white/80 text-sm">
                  Please include your booking ID and a brief description of the issue for faster processing.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}

export default CustomerRefundPolicy

