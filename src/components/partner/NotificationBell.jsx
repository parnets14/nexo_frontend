import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { usePartnerAuth } from '../../context/PartnerAuthContext';

const NotificationBell = () => {
  const { notifications: notificationData } = usePartnerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;
  const markAsRead = notificationData?.markAsRead;
  const fetchNotifications = notificationData?.fetchNotifications;
  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Refresh notifications periodically
      useEffect(() => {
        // Initial fetch only - rely on Firebase real-time messages for updates
        if (fetchNotifications) {
          fetchNotifications();
        }
      }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId = null) => {
    if (markAsRead) {
      try {
        await markAsRead(notificationId);
        if (fetchNotifications) {
          await fetchNotifications();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!markAsRead) {
      return;
    }
    
    try {
      await markAsRead();
      if (fetchNotifications) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <FiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span 
              key={unreadCount}
              className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white transition-opacity duration-200"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[9998]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          {/* Dropdown - positioned fixed to stay in viewport */}
          <div 
            className="fixed right-4 top-16 lg:right-4 lg:top-20 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999] max-h-[calc(100vh-140px)] flex flex-col overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMarkAllAsRead(e);
                  }}
                  className="text-xs text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                  type="button"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                type="button"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FiBell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const isUnread = !notification.read;
                  return (
                    <div
                      key={notification._id || notification.id || Math.random()}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        isUnread ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isUnread) {
                          handleMarkAsRead(notification._id || notification.id);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${isUnread ? 'bg-primary' : 'bg-slate-300'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-2 ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notification.title || 'New notification'}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {formatDate(notification.createdAt || notification.date)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
                {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-200 bg-slate-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="w-full text-sm text-center text-primary hover:text-primary-dark font-medium"
                    type="button"
                  >
                    View all notifications
                  </button>
                </div>
              )}
          </div>
        </>
      )}
    </>
  );
};

export default NotificationBell;

