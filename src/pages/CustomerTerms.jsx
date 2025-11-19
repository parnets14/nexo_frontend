import React from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { FaGavel, FaFileContract, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaUserShield } from 'react-icons/fa'

const CustomerTerms = () => {
  return (
    <>
      <SEO 
        title="Customer Terms & Conditions | NEXO"
        description="Customer Terms & Conditions for using NEXO platform. Read our comprehensive terms covering bookings, payments, cancellations, and customer rights."
        keywords="customer terms, user terms, NEXO terms and conditions, customer agreement"
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
                Customer Terms & Conditions
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Effective Date: 15 Nov 2025 | Last Updated: 15 Nov 2025
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
                These Customer Terms & Conditions ("Terms") constitute a legally binding agreement between NEXO ("Company", "Platform", "We", "Us") and any individual or entity ("Customer", "You") who accesses, uses, or avails any service listed on the NEXO mobile application, website, or WhatsApp service platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                By using or accessing the Platform, You agree to be bound by these Terms.
              </p>
            </div>
          </motion.section>

          {/* Eligibility */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                2. Eligibility
              </h2>
              <p className="text-gray-700 mb-4">By using the Platform, You confirm:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>You are at least 18 years old;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>You are legally competent to enter into contracts;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Information provided by You is true and accurate;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>You are availing services for lawful purposes only.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Nature of Services */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                3. Nature of Services
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>NEXO is an aggregator, facilitating connections between Customers and independent service professionals ("Partners").</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>NEXO does not employ, control, or supervise Partners.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Services are rendered solely by the Partner, and NEXO is only a facilitating platform.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Customer Obligations */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                4. Customer Obligations
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Customer agrees to:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Provide correct service address, contact details, and description of work;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Ensure availability of an adult at service location;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Verify Partner identity before granting access;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Provide safe, hazard-free environment;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span className="text-red-600 font-semibold">Not request or engage Partners for offline jobs outside the Platform;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>Treat Partners respectfully and refrain from abusive, unlawful, or threatening behaviour;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">g)</span>
                  <span>Ensure payment is made only through NEXO.</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Booking, Cancellation & Rescheduling */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                5. Booking, Cancellation & Rescheduling
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Booking Confirmation</h3>
                <p className="text-gray-700">
                  A booking is confirmed only upon completion of the applicable Visiting Fee, Service Fee, or pre-payment as required.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Cancellation by Customer</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-gray-800 font-semibold mb-2">Free cancellation within 15 minutes of booking.</p>
                </div>
                <p className="text-gray-700 mb-3">After 15 minutes, cancellation charges apply:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">a)</span>
                    <span>Before dispatch — 50% of visiting fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">b)</span>
                    <span>After Partner dispatch — full visiting fee + ₹50 penalty</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">c)</span>
                    <span>After Partner arrival — full visiting fee + applicable labour charges (if work has begun)</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3 font-semibold text-red-600">
                  Repeated cancellations may lead to suspension.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Rescheduling</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1" />
                    <span>Free one-time reschedule if requested at least 60 minutes before service.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimesCircle className="text-yellow-500 mt-1" />
                    <span>Subsequent reschedules may attract fee up to ₹50.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimesCircle className="text-red-500 mt-1" />
                    <span>Rescheduling is not permitted once Partner arrives.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Service Charges & Payments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                6. Service Charges & Payments
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Charges</h3>
                <p className="text-gray-700 mb-3">Charges include:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">a)</span>
                    <span>Visiting Fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">b)</span>
                    <span>Labour charges</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">c)</span>
                    <span>Service fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">d)</span>
                    <span>Additional work approved by Customer</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">e)</span>
                    <span>Cost of materials (if used)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">f)</span>
                    <span>Government taxes including GST</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Payment Method</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1" />
                    <span>All payments must be processed through the NEXO Platform.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaTimesCircle className="text-red-500 mt-1" />
                    <span className="text-red-600 font-semibold">Direct cash/card payments to Partner are strictly prohibited.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-500 mt-1" />
                    <span>NEXO is not responsible for any offline payments made by Customer.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Final Invoice</h3>
                <p className="text-gray-700">
                  Final charges may vary from initial estimate after inspection by Partner.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Safety, Security & Conduct */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaShieldAlt className="text-primary" />
                7. Safety, Security & Conduct
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Customer Safety Rights</h3>
                <p className="text-gray-700 mb-3">Customer may:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">a)</span>
                    <span>Ask for Partner ID verification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">b)</span>
                    <span>Refuse entry if Partner identity appears suspicious</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">c)</span>
                    <span>Report misconduct immediately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">d)</span>
                    <span>Request replacement of Partner if uncomfortable</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Customer Responsibilities</h3>
                <p className="text-gray-700 mb-3">Customer must ensure:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Home is safe for work</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Pets/children are supervised</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Valuables are secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-green-500" />
                    <span>Clear working access for Partner</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Service Quality & Warranty */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                8. Service Quality & Warranty
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>NEXO does not provide warranty on services unless explicitly mentioned.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Workmanship warranty (if any) is provided solely by the Partner.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Customer must inspect work upon completion before payment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Any rework request must be raised within 24 hours (if applicable).</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Prohibited Activities */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-red-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
                9. Prohibited Activities
              </h2>
              <p className="text-gray-700 mb-4 font-semibold">Customer shall not:</p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">a)</span>
                  <span>Harass, abuse, threaten, or intimidate Partners;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">b)</span>
                  <span>Engage in discriminatory or unlawful behaviour;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">c)</span>
                  <span>Request services that are illegal or unsafe;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">d)</span>
                  <span>Ask for personal contact of Partner;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">e)</span>
                  <span>Request offline or private service outside the Platform;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">f)</span>
                  <span>Record Partner without consent;</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">g)</span>
                  <span>Provide false complaints or fraudulent claims.</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800 font-semibold mb-2">Violation may result in:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Account suspension</li>
                  <li>Legal action</li>
                  <li>Service denial</li>
                  <li>Blacklisting</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Liability & Damages */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                10. Liability & Damages
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Customer Responsibility</h3>
                <p className="text-gray-700 mb-3">Customer is responsible for:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Securing valuables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Providing accurate service details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Ensuring safe working conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Reviewing work before job closure</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 NEXO's Liability Limitation</h3>
                <p className="text-gray-700 mb-3">NEXO is not liable for:</p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">a)</span>
                    <span>Any theft, loss, or damage caused by Partner;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">b)</span>
                    <span>Delays, cancellations, or non-performance by Partner;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">c)</span>
                    <span>Damages arising due to incorrect information provided by Customer;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">d)</span>
                    <span>Losses from natural wear & tear or misuse;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">e)</span>
                    <span>Electrical/plumbing faults not directly caused by Partner;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">f)</span>
                    <span>Third-party or material failures.</span>
                  </li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-gray-800 font-semibold">
                    NEXO's liability, if any, shall not exceed the service fee paid.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Partner Misconduct or Issues */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FaUserShield className="text-primary" />
                11. Partner Misconduct or Issues
              </h2>
              <p className="text-gray-700 mb-4">If Partner misbehaviour or misconduct is reported (with proof):</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Immediate review will be conducted</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Partner may be suspended</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Replacement may be arranged</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1" />
                  <span>Refunds (if applicable) may be processed</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-4 font-semibold">
                For severe offences, NEXO may file a police complaint.
              </p>
            </div>
          </motion.section>

          {/* Data Privacy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                12. Data Privacy
              </h2>
              <p className="text-gray-700 mb-3">
                Customer data will be used in accordance with NEXO's Privacy Policy.
              </p>
              <p className="text-gray-700">
                Customer agrees to receive booking updates, OTPs, notifications, and promotional messages.
              </p>
            </div>
          </motion.section>

          {/* Intellectual Property Rights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                13. Intellectual Property Rights
              </h2>
              <p className="text-gray-700 mb-3">
                All content, branding, design, and material on the Platform is owned by NEXO.
              </p>
              <p className="text-gray-700">
                Copying, distributing, or modifying Platform content without written permission is prohibited.
              </p>
            </div>
          </motion.section>

          {/* Termination of Account */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                14. Termination of Account
              </h2>
              <p className="text-gray-700 mb-4">NEXO may deactivate or terminate Customer account without notice for:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Fraudulent behaviour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Misuse of Platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">c)</span>
                  <span>Harassment of Partner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">d)</span>
                  <span>Repeated cancellations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">e)</span>
                  <span>Illegal activity</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">f)</span>
                  <span>Violation of any Terms</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Dispute Resolution */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                15. Dispute Resolution
              </h2>
              <ul className="space-y-3 text-gray-700 mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">a)</span>
                  <span>Raise complaint within 24 hours of service.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">b)</span>
                  <span>Disputes shall be resolved via:</span>
                </li>
              </ul>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-8 mb-4">
                <li>Support escalation</li>
                <li>Mediation</li>
                <li>Arbitration</li>
              </ul>
              <div className="space-y-2 text-gray-700">
                <p><strong>c)</strong> Jurisdiction: Bangalore, Karnataka</p>
                <p><strong>d)</strong> Governing Law: Laws of India</p>
              </div>
            </div>
          </motion.section>

          {/* Force Majeure */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                16. Force Majeure
              </h2>
              <p className="text-gray-700">
                NEXO is not liable for delays/failures caused by events outside reasonable control including weather, traffic, strikes, pandemics, accidents, or natural disasters.
              </p>
            </div>
          </motion.section>

          {/* Amendments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                17. Amendments
              </h2>
              <p className="text-gray-700">
                NEXO may modify these Terms at any time. Updates will be notified, and continued usage constitutes acceptance.
              </p>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
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

export default CustomerTerms

