import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiSettings, FiAlertCircle } from 'react-icons/fi';
import { requestNotificationPermission } from '../services/firebaseMessaging';

const NotificationPermissionPrompt = ({ onPermissionGranted }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    // Check permission status
    if ('Notification' in window) {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      console.log('Current notification permission:', permission);
      
      if (permission === 'default') {
        // Show prompt after a short delay
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (permission === 'denied') {
        // Show instructions for denied permission
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else if (permission === 'granted') {
        console.log('Notification permission already granted');
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setShowPrompt(false);
        setPermissionStatus('granted');
        if (onPermissionGranted) {
          onPermissionGranted(token);
        }
      } else {
        // Permission was denied
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionStatus('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('notificationPromptDismissed', 'true');
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return [
        'Chrome Instructions:',
        '1. Click the lock icon (or info icon) in the address bar',
        '2. Click "Site settings"',
        '3. Find "Notifications"',
        '4. Change from "Block" to "Allow"',
        '5. Refresh this page'
      ];
    } else if (userAgent.includes('firefox')) {
      return [
        'Firefox Instructions:',
        '1. Click the lock icon in the address bar',
        '2. Click "More Information"',
        '3. Go to "Permissions" tab',
        '4. Find "Notifications"',
        '5. Change from "Block" to "Allow"',
        '6. Refresh this page'
      ];
    } else if (userAgent.includes('safari')) {
      return [
        'Safari Instructions:',
        '1. Go to Safari → Settings → Websites',
        '2. Click "Notifications"',
        '3. Find this website in the list',
        '4. Change to "Allow"',
        '5. Refresh this page'
      ];
    } else if (userAgent.includes('edge')) {
      return [
        'Edge Instructions:',
        '1. Click the lock icon in the address bar',
        '2. Click "Permissions"',
        '3. Find "Notifications"',
        '4. Change from "Block" to "Allow"',
        '5. Refresh this page'
      ];
    }
    return [
      'Browser Instructions:',
      '1. Click the lock/info icon in the address bar',
      '2. Go to Site settings/Permissions',
      '3. Find "Notifications"',
      '4. Change from "Block" to "Allow"',
      '5. Refresh this page'
    ];
  };

  const getBrowserInstructionsText = () => {
    return getBrowserInstructions().join('\n');
  };

  // Don't show if already dismissed in this session (unless permission is denied)
  if (sessionStorage.getItem('notificationPromptDismissed') === 'true' && permissionStatus !== 'denied') {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  // Show different UI for denied permission
  if (permissionStatus === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 z-[10000] max-w-sm">
        <div className="bg-white rounded-xl shadow-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Notifications Blocked
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Notifications are currently blocked. To enable them:
              </p>
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-700 font-medium mb-2">How to enable:</p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  {getBrowserInstructions().slice(1).map((step, index) => (
                    <li key={index} className="ml-2">{step.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Copy instructions to clipboard
                    const instructions = getBrowserInstructionsText();
                    navigator.clipboard.writeText(instructions).then(() => {
                      alert('Instructions copied to clipboard! Follow the steps to enable notifications.');
                    }).catch(() => {
                      // Fallback if clipboard API fails
                      const textArea = document.createElement('textarea');
                      textArea.value = instructions;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      alert('Instructions copied to clipboard! Follow the steps to enable notifications.');
                    });
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <FiSettings className="w-4 h-4" />
                  Copy Instructions
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[10000] max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FiBell className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Enable Notifications
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Get instant updates about bookings, messages, and important alerts even when your browser is closed.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Dismiss"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;

