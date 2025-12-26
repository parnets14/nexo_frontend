import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa'

const CustomAlert = ({ isOpen, onClose, type = 'info', title, message, confirmText = 'OK', onConfirm, showCancel = false, cancelText = 'Cancel' }) => {
  const icons = {
    success: <FaCheckCircle className="w-12 h-12 text-green-500" />,
    error: <FaTimesCircle className="w-12 h-12 text-red-500" />,
    warning: <FaExclamationTriangle className="w-12 h-12 text-yellow-500" />,
    info: <FaInfoCircle className="w-12 h-12 text-blue-500" />
  }

  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-primary to-primary-dark'
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 custom-alert"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${colors[type]} p-6 relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-3"
                >
                  {icons[type]}
                </motion.div>
                {title && (
                  <h3 className="text-xl font-bold text-center">{title}</h3>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-gray-700 leading-relaxed">
                {typeof message === 'string' ? (
                  <p className="text-center">{message}</p>
                ) : (
                  message
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 pb-6 border-t border-gray-100">
              {showCancel ? (
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition transform hover:scale-105"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 bg-gradient-to-r ${colors[type]} text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105`}
                  >
                    {confirmText}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConfirm}
                  className={`w-full bg-gradient-to-r ${colors[type]} text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CustomAlert
