import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiMessageSquare, FiBriefcase } from 'react-icons/fi';

const NotificationDialog = ({ notification, onClose, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'alert':
        return <FiAlertCircle className="w-6 h-6 text-amber-500" />;
      case 'message':
        return <FiMessageSquare className="w-6 h-6 text-blue-500" />;
      case 'job':
        return <FiBriefcase className="w-6 h-6 text-purple-500" />;
      case 'info':
      default:
        return <FiInfo className="w-6 h-6 text-slate-500" />;
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && notification._id) {
      onMarkAsRead(notification._id);
    }
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-end pointer-events-none overflow-hidden" style={{ padding: '0.5rem' }}>
          <motion.div
            initial={{ opacity: 0, x: 400, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 sm:p-6 pointer-events-auto overflow-hidden flex flex-col"
            style={{ 
              maxWidth: 'min(calc(100vw - 1rem), 28rem)',
              width: 'calc(100vw - 1rem)',
              maxHeight: 'calc(100vh - 1rem)',
              marginTop: '0.5rem',
              marginRight: '0.5rem'
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4 flex-shrink-0 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                {getIconForType(notification.type || 'info')}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 break-words pr-2 flex-1 min-w-0">
                    {notification.title || notification.message?.split(': ')[0] || 'New Notification'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(() => onClose(), 300);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </button>
                </div>
                {notification.message && (
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 break-words overflow-wrap-anywhere line-clamp-3">
                    {notification.title ? notification.message : notification.message.split(': ').slice(1).join(': ') || notification.message}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleMarkAsRead}
                    className="flex-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(() => onClose(), 300);
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDialog;

