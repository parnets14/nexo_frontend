import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { useVendorAuth } from '../../context/VendorAuthContext';

const NotificationBell = () => {
  const { notifications: notificationData } = useVendorAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;
  const markAsRead = notificationData?.markAsRead;
  const fetchNotifications = notificationData?.fetchNotifications;

  // Calculate dropdown position to prevent overflow
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownWidth = 384; // 24rem = 384px
        const dropdownHeight = Math.min(viewportHeight - 100, 600);
        
        // Use fixed positioning on mobile, absolute on desktop
        if (viewportWidth < 640) {
          // Mobile: fixed positioning from top, aligned to right edge
          setDropdownStyle({
            position: 'fixed',
            top: '4rem',
            right: '0.5rem',
            width: `calc(100vw - 1rem)`,
            maxWidth: '24rem',
            maxHeight: `${dropdownHeight}px`,
            zIndex: 9999
          });
        } else {
          // Desktop: absolute positioning relative to button
          // Calculate available space
          const spaceOnRight = viewportWidth - buttonRect.right;
          const spaceOnLeft = buttonRect.left;
          
          // Check if button is in sidebar (left side of screen)
          const isInSidebar = buttonRect.left < 300; // Sidebar is typically ~256px (16rem)
          
          let finalWidth = dropdownWidth;
          let rightValue = 0;
          let leftValue = 'auto';
          
          if (isInSidebar) {
            // In sidebar: use fixed positioning to escape sidebar overflow
            // Align left edge with button, extend to right
            const finalWidth = Math.min(dropdownWidth, spaceOnRight + buttonRect.width - 16);
            
            setDropdownStyle({
              position: 'fixed',
              left: `${buttonRect.left}px`,
              top: `${buttonRect.bottom + 8}px`,
              width: `${Math.max(280, finalWidth)}px`,
              maxWidth: '24rem',
              maxHeight: `${dropdownHeight}px`,
              minWidth: '280px',
              zIndex: 9999
            });
            return;
          } else {
            // In header: align right edge with button
            rightValue = 0;
            leftValue = 'auto';
            
            // If not enough space on right, check left
            if (spaceOnRight < dropdownWidth) {
              if (spaceOnLeft > spaceOnRight) {
                // More space on left, align to left edge
                leftValue = 0;
                rightValue = 'auto';
                finalWidth = Math.min(dropdownWidth, spaceOnLeft - 8);
              } else {
                // Use available space on right
                finalWidth = Math.max(300, spaceOnRight - 8);
              }
            }
            
            setDropdownStyle({
              position: 'absolute',
              right: rightValue,
              left: leftValue,
              top: '100%',
              marginTop: '0.5rem',
              width: `${Math.max(280, finalWidth)}px`,
              maxWidth: '24rem',
              maxHeight: `${dropdownHeight}px`,
              minWidth: '280px',
              zIndex: 9999
            });
          }
        }
      };

      // Small delay to ensure button is rendered
      const timeoutId = setTimeout(updatePosition, 0);
      
      // Update on resize and scroll
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    } else {
      // Reset style when closed
      setDropdownStyle({});
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
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
    if (fetchNotifications) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId = null) => {
    if (markAsRead) {
      await markAsRead(notificationId);
      if (fetchNotifications) {
        await fetchNotifications();
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markAsRead) {
      await markAsRead();
      if (fetchNotifications) {
        await fetchNotifications();
      }
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
    <div className="relative z-50" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors z-50"
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

      {isOpen && (
        <div 
          className="bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{
            ...dropdownStyle,
            zIndex: 9999,
            position: dropdownStyle.position || 'absolute'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FiBell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const isUnread = !notification.seen && !notification.read;
                  return (
                    <div
                      key={notification._id || notification.id || Math.random()}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        isUnread ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (isUnread) {
                          handleMarkAsRead(notification._id || notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 break-words line-clamp-2">
                            {notification.title || notification.message?.split(': ')[0] || 'New notification'}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-slate-600 mt-1 break-words line-clamp-2">
                              {notification.title ? notification.message : notification.message.split(': ').slice(1).join(': ') || notification.message}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {formatDate(notification.date || notification.createdAt)}
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
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full text-sm text-center text-primary hover:text-primary-dark font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

