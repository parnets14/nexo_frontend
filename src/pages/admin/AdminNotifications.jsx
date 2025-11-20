import React, { useState } from 'react';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import ModuleHeader from '../../components/admin/ModuleHeader.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminNotifications = () => {
  const { notifications: notificationData } = useAdminAuth();
  const notifications = notificationData?.notifications || [];
  const isLoading = notificationData?.isLoading || false;
  const unreadCount = notificationData?.unreadCount || 0;
  const markAsRead = notificationData?.markAsRead;
  const fetchNotifications = notificationData?.fetchNotifications;
  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') {
      return !notification.seen && !notification.read;
    }
    if (filter === 'read') {
      return notification.seen || notification.read;
    }
    return true;
  });

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
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <ModuleHeader
        title="Notifications"
        subtitle="View and manage all your notifications"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications && fetchNotifications()}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'read'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <FiBell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
          <p className="text-slate-600">
            {filter === 'unread' 
              ? "You're all caught up! No unread notifications."
              : filter === 'read'
              ? "No read notifications to display."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {filteredNotifications.map((notification) => {
            const isUnread = !notification.seen && !notification.read;
            return (
              <div
                key={notification._id || notification.id || Math.random()}
                className={`p-6 hover:bg-slate-50 transition-colors ${
                  isUnread ? 'bg-blue-50/30 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      isUnread ? 'bg-primary' : 'bg-slate-300'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900 mb-1">
                          {notification.title || notification.message?.split(': ')[0] || 'New notification'}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-slate-600 mb-2 line-clamp-3">
                            {notification.title ? notification.message : notification.message.split(': ').slice(1).join(': ') || notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{formatDate(notification.date || notification.createdAt)}</span>
                          {notification.type && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {notification.type}
                            </span>
                          )}
                        </div>
                      </div>
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id || notification.id)}
                          className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <FiCheck className="w-5 h-5 text-slate-400 hover:text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

