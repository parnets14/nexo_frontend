import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../config/firebase';

// VAPID key from Firebase Console (Web Push certificates)
// This should match the key pair you added in Firebase Console
const VAPID_KEY = 'BC4rz7vzSsS59jhKkTcwex63a_XBnJEnBwaEDWpdM_Epk5NGztNTl27jN31usSSOEanFSX6HZuRe96JyAZbPjRg';

let messaging = null;

// Register service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');
      if (existingRegistration) {
        return existingRegistration;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Initialize messaging (only in browser)
export const initializeMessaging = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if messaging is supported
  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  // Register service worker first
  await registerServiceWorker();

  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    // Check current permission
    let permission = Notification.permission;
    
    // Request permission if not already granted
    if (permission === 'default') {
      // Request permission - this is required for background notifications
      // Note: Browsers require this to be called in response to a user gesture
      try {
        permission = await Notification.requestPermission();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
      }
    } else if (permission === 'denied') {
      // Cannot request again if denied - user must enable in browser settings
      return null;
    }
    
    if (permission !== 'granted') {
      return null;
    }

    // Register service worker first
    await registerServiceWorker();
    
    // Wait a bit for service worker to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Initialize messaging if not already done
    if (!messaging) {
      messaging = await initializeMessaging();
    }

    if (!messaging) {
      return null;
    }

    // Get FCM token with retry logic
    let token = null;
    let retries = 3;
    
    while (!token && retries > 0) {
      try {
        token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          return token;
        }
      } catch (error) {
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!token) {
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Keep track of existing listener to prevent duplicates
let currentUnsubscribe = null;
let currentCallback = null;

// Listen for foreground messages - returns a callback function
export const setupMessageListener = async (callback) => {
  try {
    // If listener already exists with same callback, return existing unsubscribe
    if (currentUnsubscribe && currentCallback === callback) {
      return currentUnsubscribe;
    }

    // Clean up existing listener if any
    if (currentUnsubscribe && typeof currentUnsubscribe === 'function') {
      currentUnsubscribe();
      currentUnsubscribe = null;
      currentCallback = null;
    }

    if (!messaging) {
      messaging = await initializeMessaging();
    }

    if (!messaging) {
      return null;
    }

    // Set up continuous listener
    const unsubscribe = onMessage(messaging, (payload) => {
      if (callback) {
        callback(payload);
      }
    });

    // Store the unsubscribe function and callback
    currentUnsubscribe = unsubscribe;
    currentCallback = callback;

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

// Get current messaging instance
export const getMessagingInstance = async () => {
  if (!messaging) {
    messaging = await initializeMessaging();
  }
  return messaging;
};

