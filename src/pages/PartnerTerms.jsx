import React from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { FaGavel, FaFileContract, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const PartnerTerms = () => {
  return (
    <>
      <SEO 
        title="Partner Terms & Conditions | NEXO"
        description="Partner Terms & Conditions for service providers on NEXO platform. Read our comprehensive terms covering registration, obligations, penalties, and more."
        keywords="partner terms, service provider terms, NEXO terms and conditions, partner agreement"
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
                Partner Terms & Conditions
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Effective Date: 15th November 2025 | Last Updated: 15th November 2025
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
                <FaGavel className="text-primary" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Partner Terms & Conditions ("Terms") constitute a binding agreement between NEXO ("Company", "Platform", "We", "Us") and the individual or business entity ("Partner", "Service Provider", "You") who registers to provide on-site or online services through the Platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                By registering or accepting any service request, the Partner expressly agrees to these Terms.
              </p>
            </div>
          </motion.section>

          {/* Independent Contractor Status */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                2. Independent Contractor Status
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>The Partner is an independent contractor, not an employee, representative, or agent of NEXO.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>No employment benefits (PF, ESI, gratuity, insurance, paid leave, salary) shall be applicable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>The Partner is solely responsible for compliance with GST, income tax, labour laws, and all statutory obligations.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Mandatory Registration & Onboarding Requirements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                3. Mandatory Registration & Onboarding Requirements
              </h2>
              <p className="text-gray-700 mb-4">
                The Partner shall complete mandatory onboarding, including but not limited to:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Valid Government ID</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Address proof</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Skill verification/trade test (if applicable)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Police verification (whenever required)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Recent photograph</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Bank account details</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>GST number (if applicable)</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-gray-800 font-semibold mb-2">Payment of applicable onboarding fees:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Registration Fee</li>
                  <li>Toolkit Fee (if provided)</li>
                  <li>Minimum Guarantee (MG) Plan</li>
                  <li>Security Deposit</li>
                </ul>
              </div>
              <p className="text-gray-700">
                <strong>All fees are non-refundable, except security deposit which is refundable as per Clause 23.</strong>
              </p>
            </div>
          </motion.section>

          {/* Partner Obligations */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                4. Partner Obligations
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner shall:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Maintain professional behaviour at all times.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Deliver high-quality, safe, and lawful services.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Carry valid Partner ID during every service.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Reach customer location on time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Provide correct service estimates before starting work.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>Maintain hygiene, wear uniform/ID (if provided).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">g)</span>
                  <span>Not engage in misconduct, harassment, abuse, threats, or illegal activity.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">h)</span>
                  <span>Maintain tools and ensure safe operation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">i)</span>
                  <span>Not demand cash payments directly from customers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">j)</span>
                  <span className="text-red-600 font-semibold">Not solicit or accept off-platform work (strict penalty).</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Pricing, Estimates & Billing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                5. Pricing, Estimates & Billing
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Partner must follow NEXO pricing structure and guidelines.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Any additional work must be pre-approved through the Platform.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Partner shall not overcharge or misrepresent pricing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>All payments shall be processed solely through NEXO.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Partner is responsible for issuing bills/invoices where required by law.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Platform Commission & Deductions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                6. Platform Commission & Deductions
              </h2>
              <p className="text-gray-700 mb-4">Partner agrees to the following deductions:</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>Platform Commission (%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>Lead Cost per lead</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>GST applicable on Platform Commission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>Penalties & Fines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>TDS (if applicable)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>Outstanding dues from previous jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTimesCircle className="text-red-500" />
                    <span>MG Plan adjustments</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-700 font-semibold">
                All deductions shall be final and binding.
              </p>
            </div>
          </motion.section>

          {/* Mandatory Safety Requirements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaExclamationTriangle className="text-yellow-500" />
                7. Mandatory Safety Requirements
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner shall:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Follow safety protocols prescribed by NEXO.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Use proper tools and protective equipment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Not perform services beyond skill level or without proper safety.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Not endanger customer, property, or themselves.</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Failure may result in:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Immediate suspension</li>
                  <li>Penalty up to ₹5,000</li>
                  <li>Legal action for damages</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Customer Safety & Code of Conduct */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                8. Customer Safety & Code of Conduct
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner must strictly adhere to:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>No harassment (verbal, physical, emotional)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>No misbehaviour, disrespect, abusive language</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>No consumption of alcohol/drugs on duty</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>No theft, damage, or misconduct</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>No photography or unauthorised recording at customer premises</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>No requesting personal favours or discounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">g)</span>
                  <span>No entering restricted areas without consent</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Any violation may lead to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Permanent termination</li>
                  <li>Police complaint</li>
                  <li>Forfeiture of dues and deposits</li>
                  <li>Penalties up to ₹25,000</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Punctuality & Attendance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                9. Punctuality & Attendance
              </h2>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Partner must accept bookings only if available.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Must reach customer location on time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Any delay beyond 20 minutes must be informed.</span>
                </li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-800 font-semibold mb-2">Repeated delays may lead to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>₹50–₹200 penalty per incident</li>
                  <li>Reduced lead allocation</li>
                  <li>Temporary suspension</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* No Offline Deals */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-red-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
                10. No Offline Deals (Strictly Prohibited)
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner shall not:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Ask customer to cancel platform booking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Offer lower pricing for offline work</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Share personal phone number for future services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Accept cash or direct payments</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Penalty:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>₹5,000 minimum</li>
                  <li>Permanent termination</li>
                  <li>Deduction from wallet and MG plan</li>
                  <li>Legal action for business loss</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Service Quality & Returns */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                11. Service Quality & Returns
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner must ensure:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>High-quality workmanship</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Correct problem diagnosis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Use of original parts (if applicable)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Guarantee service quality as per NEXO policy</span>
                </li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-gray-800 font-semibold mb-2">Poor work or customer complaints may attract:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Rework without charges</li>
                  <li>Penalty from ₹100–₹1,000</li>
                  <li>Suspension on repeated offences</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Damage, Theft, or Loss */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                12. Damage, Theft, or Loss
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner shall be fully liable for:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Damage to customer property</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Theft or loss at customer premises</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Fire, accident, or injury caused due to Partner negligence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Incorrect installation or unsafe practices</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Recovery will be made through:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Partner wallet</li>
                  <li>Security deposit</li>
                  <li>MG payouts</li>
                  <li>Legal recovery</li>
                </ul>
                <p className="text-gray-800 font-semibold mt-3">Police FIR may be filed for severe cases.</p>
              </div>
            </div>
          </motion.section>

          {/* Fraudulent Activities */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                13. Fraudulent Activities
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Strictly prohibited:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Faking job completion</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>False OTP entry</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Manipulating customer rating</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Overcharging</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Providing false documents</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Penalty:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Up to ₹25,000</li>
                  <li>Permanent removal</li>
                  <li>Legal prosecution</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Penalty Structure */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                14. Penalty Structure
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Violation</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">Late arrival</td>
                      <td className="border border-gray-300 px-4 py-3">₹50–₹200</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">Job rejection after acceptance</td>
                      <td className="border border-gray-300 px-4 py-3">₹100–₹300</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">Misbehaviour</td>
                      <td className="border border-gray-300 px-4 py-3">₹1,000–₹5,000</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">Unsafe work</td>
                      <td className="border border-gray-300 px-4 py-3">₹2,000</td>
                    </tr>
                    <tr className="hover:bg-red-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-red-600">Offline deal</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-red-600">₹5,000+ termination</td>
                    </tr>
                    <tr className="hover:bg-red-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-red-600">Theft/misconduct</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-red-600">Legal action + termination</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-700 mt-4 italic">
                NEXO reserves the right to modify penalties anytime.
              </p>
            </div>
          </motion.section>

          {/* Partner Wallet & Settlement */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                15. Partner Wallet & Settlement
              </h2>
              <p className="text-gray-700 mb-4">Deductions will be applied in the following order:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Penalties</li>
                <li>Platform Commission</li>
                <li>Lead cost</li>
                <li>MG plan adjustments</li>
                <li>Pending dues</li>
              </ol>
              <p className="text-gray-700 mt-4">
                Settlement cycles will be weekly or as updated by NEXO.
              </p>
            </div>
          </motion.section>

          {/* MG Plan */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                16. MG Plan (Minimum Guarantee)
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>MG plan is optional or mandatory as per category.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>MG provides priority leads based on plan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>MG fee is non-refundable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Partner failing to meet service quality/minimum performance may lose MG benefits without refund.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Ratings & Reviews */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                17. Ratings & Reviews
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Partner must maintain minimum rating (e.g., 4.0).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Low ratings may result in reduced leads or suspension.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>False or manipulated ratings are punishable.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Use of Platform & Technology */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                18. Use of Platform & Technology
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Partner shall:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Keep app updated</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Not misuse customer data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Not reverse engineer, hack, or modify NEXO systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Use genuine documents only</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Termination */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                19. Termination
              </h2>
              <p className="text-gray-700 mb-4">NEXO may terminate partner access without notice for:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Misconduct</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Fraud</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Unsafe behaviour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Low performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Offline deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>Customer complaints</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">g)</span>
                  <span>Violation of any Terms</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Security Deposit Refund */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                20. Security Deposit Refund
              </h2>
              <p className="text-gray-700 mb-4">Refund only upon:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>30-day notice period</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Return of toolkit (if applicable)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>No pending dues or penalties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>No active customer complaints</span>
                </li>
              </ul>
              <p className="text-gray-700 font-semibold">
                Refund processing time: 21–45 working days.
              </p>
            </div>
          </motion.section>

          {/* Dispute Resolution */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                21. Dispute Resolution
              </h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Jurisdiction:</strong> Bangalore, Karnataka</p>
                <p><strong>Governing Law:</strong> Laws of India</p>
                <p className="mt-4"><strong>Method:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Internal review</li>
                  <li>Mediation</li>
                  <li>Arbitration (if required)</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Amendments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                22. Amendments
              </h2>
              <p className="text-gray-700">
                NEXO reserves the right to change Terms anytime. Continued use of the Platform constitutes acceptance.
              </p>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.3 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Questions or Concerns?</h2>
              <p className="text-white/90 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <p className="text-white font-semibold">
                Email: support@nexo.works
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}

export default PartnerTerms

