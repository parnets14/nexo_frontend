import { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, setupMessageListener } from '../services/firebaseMessaging';
import { playNotificationSound } from '../utils/notificationSound';

export const useNotifications = (api, token, isAuthenticated) => {
  const [notifications, setNotifications] = useState([]);
  const [fcmToken, setFcmToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentNotification, setCurrentNotification] = useState(null);
  const pollingIntervalRef = useRef(null);
  const lastNotificationIdRef = useRef(null);

  // Request notification permission and get FCM token
  const initializeNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      const fcmTokenValue = await requestNotificationPermission();
      if (fcmTokenValue && api?.updateFCMToken) {
        setFcmToken(fcmTokenValue);
        // Send token to backend
        try {
          await api.updateFCMToken(token, fcmTokenValue);
        } catch (error) {
          console.error('Error sending FCM token to backend:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [isAuthenticated, token, api]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async (showDialog = false) => {
    if (!isAuthenticated || !token || !api?.getNotifications) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.getNotifications(token);
      
      let newNotifications = [];
      
      if (response.success && response.notifications) {
        newNotifications = response.notifications;
      } else if (Array.isArray(response)) {
        newNotifications = response;
      }

      // Check for new notifications
      if (newNotifications.length > 0 && lastNotificationIdRef.current) {
        const latestNotification = newNotifications[0];
        if (latestNotification._id && latestNotification._id !== lastNotificationIdRef.current) {
          // New notification detected
          if (showDialog && (!latestNotification.read && !latestNotification.seen)) {
            setCurrentNotification(latestNotification);
            playNotificationSound();
          }
          lastNotificationIdRef.current = latestNotification._id;
        }
      } else if (newNotifications.length > 0) {
        // First load - set the latest notification ID
        const latestNotification = newNotifications[0];
        if (latestNotification._id) {
          lastNotificationIdRef.current = latestNotification._id;
        }
      }

      setNotifications(newNotifications);
      // Calculate unread count - check both read and seen for admin, only read for partner
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show error if it's a connection refused (server might be down)
      if (error.message && !error.message.includes('ERR_CONNECTION_REFUSED')) {
        // Only log non-connection errors
      }
      // Set empty notifications on error to prevent UI issues
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, api]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationId = null) => {
    if (!isAuthenticated || !token || !api) {
      return;
    }

    try {
      // Optimistically update UI immediately for better UX
      if (notificationId && api.markNotificationAsRead) {
        // For single notification, decrease count by 1
        setUnreadCount(prev => Math.max(0, prev - 1));
        await api.markNotificationAsRead(token, notificationId);
      } else if (api.markNotificationsAsRead) {
        // For all notifications, set count to 0 immediately
        setUnreadCount(0);
        await api.markNotificationsAsRead(token);
      } else {
        return;
      }
      
      // Refresh notifications to get updated state from server
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      // Revert optimistic update on error by refreshing
      await fetchNotifications();
    }
  }, [isAuthenticated, token, api, fetchNotifications]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let unsubscribe = null;

    const setupListener = async () => {
      try {
        unsubscribe = await setupMessageListener((payload) => {
          // Extract notification data
          const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
          const notificationBody = payload.notification?.body || payload.data?.message || 'You have a new notification';
          // Use data.type first (more reliable), fallback to 'new-notification'
          const notificationType = payload.data?.type || payload.data?.notificationType || 'new-notification';
          const isStatusChange = payload.data?.isStatusChange === 'true' || notificationType === 'status-change';
          const notificationIcon = payload.notification?.icon || payload.data?.icon;
          const notificationImage = payload.notification?.image || payload.data?.image;
          
          // Play notification sound
          playNotificationSound();
          
          // Show browser notification
          if (payload.notification || payload.data) {
            
            // Helper to get icon URL (convert relative to absolute if needed)
            const getIconUrl = (icon) => {
              if (!icon) {
                return `${window.location.origin}/android-chrome-192x192.png`;
              }
              // If already absolute URL, return as is
              if (icon.startsWith('http://') || icon.startsWith('https://')) {
                return icon;
              }
              // Convert relative to absolute
              return icon.startsWith('/') ? `${window.location.origin}${icon}` : `${window.location.origin}/${icon}`;
            };

            const iconUrl = getIconUrl(notificationIcon) || `${window.location.origin}/android-chrome-192x192.png`;
            const badgeUrl = `${window.location.origin}/android-chrome-192x192.png`;
            const imageUrl = notificationImage ? getIconUrl(notificationImage) : null;

            // Check if browser notifications are supported and permission is granted
            if ('Notification' in window && Notification.permission === 'granted') {
              const notificationOptions = {
                body: notificationBody,
                icon: iconUrl,
                badge: badgeUrl,
                tag: notificationType,
                data: payload.data,
                timestamp: Date.now(),
                vibrate: [200, 100, 200],
                silent: false, // CRITICAL: Must be false for browser to play default notification sound
                // Note: 'sound' property is not standard in Notification API, browser uses default sound when silent: false
                // Add image if available (for rich notifications)
                ...(imageUrl && { image: imageUrl })
              };

              const notification = new Notification(notificationTitle, notificationOptions);

              notification.onclick = () => {
                window.focus();
                notification.close();
                // Handle notification click (e.g., navigate to specific page)
                if (payload.data?.type === 'new-notification') {
                  fetchNotifications();
                }
              };
            }
          }
          
          // Show in-app notification dialog
          const notificationData = {
            _id: payload.data?.notificationId || payload.data?.userId || payload.data?.adminId || Date.now().toString(),
            title: notificationTitle,
            message: notificationBody,
            type: isStatusChange ? 'status-change' : (notificationType || 'info'),
            icon: notificationIcon,
            image: notificationImage,
            read: false,
            seen: false,
            createdAt: new Date(),
            isStatusChange: isStatusChange
          };
          
          setCurrentNotification(notificationData);
          
          // If this is a status change notification, emit a custom event for components to listen
          if (isStatusChange) {
            window.dispatchEvent(new CustomEvent('vendorStatusChange', { 
              detail: { title: notificationTitle, message: notificationBody } 
            }));
          }
          
          // Refresh notifications list from API after a delay to ensure backend has saved it
          setTimeout(async () => {
            try {
              await fetchNotifications(false);
            } catch (error) {
              console.error('Error refreshing notifications list:', error);
            }
          }, 1000);
        });
      } catch (error) {
        console.error('Error setting up message listener:', error);
      }
    };

    setupListener();

    // Initial fetch on mount - no polling, rely on Firebase real-time messages
    if (isAuthenticated && token && api?.getNotifications) {
      // Fetch once on mount to get initial notifications
      fetchNotifications(false);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, fetchNotifications, token, api]);

  // Initialize notifications on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && token) {
      initializeNotifications();
      // Don't fetch here - will be fetched once when message listener is set up
    }
  }, [isAuthenticated, token, initializeNotifications]);

  // Listen for permission granted event
  useEffect(() => {
    const handlePermissionGranted = () => {
      if (isAuthenticated && token) {
        initializeNotifications();
      }
    };

    window.addEventListener('notificationPermissionGranted', handlePermissionGranted);
    return () => {
      window.removeEventListener('notificationPermissionGranted', handlePermissionGranted);
    };
  }, [isAuthenticated, token, initializeNotifications]);

  const handleCloseNotificationDialog = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  const handleMarkNotificationAsRead = useCallback(async (notificationId) => {
    await markAsRead(notificationId);
    setCurrentNotification(null);
  }, [markAsRead]);

  return {
    notifications,
    fcmToken,
    isLoading,
    unreadCount,
    currentNotification,
    fetchNotifications,
    markAsRead,
    initializeNotifications,
    closeNotificationDialog: handleCloseNotificationDialog,
    markNotificationAsRead: handleMarkNotificationAsRead
  };
};

