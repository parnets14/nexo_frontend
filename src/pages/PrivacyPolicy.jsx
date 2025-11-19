import React from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { FaShieldAlt, FaFileContract, FaLock, FaUserShield, FaDatabase, FaShareAlt, FaCookie, FaEye, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy | NEXO"
        description="NEXO Privacy Policy - Learn how we collect, use, store, and protect your personal information across our platform."
        keywords="privacy policy, data protection, NEXO privacy, user data, data security"
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
                  <FaShieldAlt className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Effective Date: 15 Nov 2025
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaFileContract className="text-primary" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy explains how NEXO collects, uses, stores, and protects Customer, Partner, and user data across mobile app, website, and WhatsApp ("Platform").
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                By using the Platform, you agree to this Policy.
              </p>
            </div>
          </motion.section>

          {/* Information We Collect */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaDatabase className="text-primary" />
                2. Information We Collect
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Name</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Phone number</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Address & location</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>OTP verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Device details</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-yellow-500" />
                    <span className="italic">ID proof (Partners only)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-yellow-500" />
                    <span className="italic">Bank details (Partners only)</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Usage Information</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>Browsing behaviour</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>Clickstream</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>Transaction data</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>Service history</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>Communication logs (WhatsApp/chat/call)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-500" />
                    <span>IP address</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Location Data</h3>
                <p className="text-gray-700">
                  For service allocation and partner tracking.
                </p>
              </div>
            </div>
          </motion.section>

          {/* How We Use Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                3. How We Use Information
              </h2>
              <p className="text-gray-700 mb-4">We use information for:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Booking and service fulfillment</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Identity verification</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Customer support</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Fraud prevention</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Partner allocation & tracking</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>Payment processing</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">g)</span>
                  <span>Safety and dispute resolution</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">h)</span>
                  <span>Marketing & promotional messages</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-primary font-bold mt-1">i)</span>
                  <span>Legal compliance</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Sharing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaShareAlt className="text-primary" />
                4. Data Sharing
              </h2>
              <p className="text-gray-700 mb-4">We share limited data with:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Partners for service delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Payment gateways</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Background verification agencies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Marketing automation tools (e.g., AiSensy)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Law enforcement (upon request)</span>
                </li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  We never sell personal data.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Data Security */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaLock className="text-primary" />
                5. Data Security
              </h2>
              <p className="text-gray-700 mb-4">We implement:</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-green-500" />
                  <span>Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-green-500" />
                  <span>Secured servers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-green-500" />
                  <span>Access restrictions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-green-500" />
                  <span>Fraud detection tools</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaCheckCircle className="text-green-500" />
                  <span>OTP-based authentication</span>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  However, no system is 100% secure.
                </p>
              </div>
            </div>
          </motion.section>

          {/* WhatsApp Data Usage */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                6. WhatsApp Data Usage
              </h2>
              <p className="text-gray-700 mb-4">Usage of WhatsApp APIs (including AiSensy) includes:</p>
              <ul className="space-y-3 text-gray-700 mb-4">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Sending booking updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Sending notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Sending promotional content</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Customer–partner communication</span>
                </li>
              </ul>
              <p className="text-gray-700 font-semibold">
                All messages follow WhatsApp's commerce policies.
              </p>
            </div>
          </motion.section>

          {/* Cookies & Tracking */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaCookie className="text-primary" />
                7. Cookies & Tracking
              </h2>
              <p className="text-gray-700">
                Used for analytics, personalization, and fraud prevention.
              </p>
            </div>
          </motion.section>

          {/* User Rights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaUserShield className="text-primary" />
                8. User Rights
              </h2>
              <p className="text-gray-700 mb-4">Users may request:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Data access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Data correction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Data deletion (subject to legal limits)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Opt-out of marketing messages</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Third-Party Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                9. Third-Party Links
              </h2>
              <p className="text-gray-700">
                External links have separate privacy policies; NEXO is not responsible for third-party practices.
              </p>
            </div>
          </motion.section>

          {/* Children's Privacy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700">
                Platform is not intended for children under age 18.
              </p>
            </div>
          </motion.section>

          {/* Amendments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                11. Amendments
              </h2>
              <p className="text-gray-700">
                We may update this Policy; changes posted on website/app become effective immediately.
              </p>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-white/90 mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <p className="text-white font-semibold mb-2">
                Email: support@nexo.works
              </p>
              <p className="text-white/80 text-sm">
                For data access, correction, or deletion requests, please include your registered email or phone number.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy

