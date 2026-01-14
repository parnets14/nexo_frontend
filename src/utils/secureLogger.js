/**
 * Secure Logger for Frontend (React)
 * Prevents sensitive data from appearing in browser console
 * 
 * Usage:
 *   import logger from './utils/secureLogger';
 *   logger.info('User action', { userId, action });
 */

// Check if we're in production
const isProduction = import.meta.env.MODE === 'production';

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'otp',
  'token',
  'userToken',
  'partnerToken',
  'adminToken',
  'fcmToken',
  'apiKey',
  'secret',
  'creditCard',
  'cvv',
  'pan',
  'aadhar'
];

// PII fields that should be masked
const PII_FIELDS = [
  'phone',
  'email',
  'address',
  'pincode'
];

/**
 * Mask phone number (show only last 4 digits)
 */
const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return phone;
  return '******' + phone.slice(-4);
};

/**
 * Mask email (show only first 2 chars and domain)
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  return name.slice(0, 2) + '***@' + domain;
};

/**
 * Sanitize a single value
 */
const sanitizeValue = (value, key) => {
  if (value === null || value === undefined) return value;
  
  const lowerKey = key.toLowerCase();
  
  // Redact sensitive fields
  if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
    return '[REDACTED]';
  }
  
  // Mask phone numbers
  if (lowerKey.includes('phone') && typeof value === 'string') {
    return maskPhone(value);
  }
  
  // Mask emails
  if (lowerKey.includes('email') && typeof value === 'string') {
    return maskEmail(value);
  }
  
  // Mask addresses
  if (lowerKey.includes('address') && typeof value === 'string' && value.length > 20) {
    return value.slice(0, 10) + '...';
  }
  
  return value;
};

/**
 * Deep sanitize an object
 */
const sanitizeObject = (obj, depth = 0) => {
  if (depth > 10) return '[DEEP_OBJECT]';
  
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object') {
        return sanitizeObject(item, depth + 1);
      }
      return item;
    });
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = sanitizeValue(value, key);
    }
  }
  
  return sanitized;
};

/**
 * Sanitize data for logging
 */
const sanitizeForLog = (data) => {
  if (typeof data === 'string') return data;
  if (typeof data === 'object') return sanitizeObject(data);
  return data;
};

/**
 * Format log message
 */
const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data && Object.keys(data).length > 0) {
    const sanitized = sanitizeForLog(data);
    return [prefix, message, sanitized];
  }
  
  return [prefix, message];
};

/**
 * Log error
 */
const error = (message, data) => {
  if (isProduction) {
    // In production, log minimal information
    console.error('[ERROR]', message);
  } else {
    console.error(...formatMessage('ERROR', message, data));
  }
};

/**
 * Log warning
 */
const warn = (message, data) => {
  if (isProduction) {
    console.warn('[WARN]', message);
  } else {
    console.warn(...formatMessage('WARN', message, data));
  }
};

/**
 * Log info
 */
const info = (message, data) => {
  if (!isProduction) {
    console.log(...formatMessage('INFO', message, data));
  }
};

/**
 * Log debug (development only)
 */
const debug = (message, data) => {
  if (!isProduction) {
    console.log(...formatMessage('DEBUG', message, data));
  }
};

/**
 * Log authentication events
 */
const auth = (message, data) => {
  const sanitized = {
    ...data,
    phone: data?.phone ? maskPhone(data.phone) : undefined,
    email: data?.email ? maskEmail(data.email) : undefined,
    token: data?.token ? '[REDACTED]' : undefined,
    otp: data?.otp ? '[REDACTED]' : undefined
  };
  
  if (!isProduction) {
    console.log(...formatMessage('AUTH', message, sanitized));
  }
};

/**
 * Log payment events
 */
const payment = (message, data) => {
  const sanitized = {
    amount: data?.amount,
    transactionId: data?.transactionId,
    status: data?.status,
    // Remove sensitive payment details
    cardNumber: data?.cardNumber ? '[REDACTED]' : undefined,
    cvv: data?.cvv ? '[REDACTED]' : undefined
  };
  
  if (!isProduction) {
    console.log(...formatMessage('PAYMENT', message, sanitized));
  }
};

/**
 * Check if value contains sensitive data
 */
const containsSensitiveData = (value) => {
  if (typeof value !== 'string') return false;
  
  // Check for phone numbers
  if (/^[6-9]\d{9}$/.test(value)) return true;
  
  // Check for emails
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  
  // Check for tokens (long alphanumeric strings)
  if (value.length > 50 && /^[A-Za-z0-9-._~+/]+=*$/.test(value)) return true;
  
  // Check for OTPs (6 digit numbers)
  if (/^\d{6}$/.test(value)) return true;
  
  return false;
};

/**
 * Safe console.log replacement
 * Use this to gradually migrate from console.log
 */
const log = (message, data) => {
  if (!isProduction) {
    if (data) {
      console.log(message, sanitizeForLog(data));
    } else {
      console.log(message);
    }
  }
};

// Export logger
const logger = {
  error,
  warn,
  info,
  debug,
  auth,
  payment,
  log,
  // Utility functions
  sanitizeForLog,
  maskPhone,
  maskEmail,
  containsSensitiveData
};

export default logger;

// Also export individual functions for convenience
export {
  error,
  warn,
  info,
  debug,
  auth,
  payment,
  log,
  sanitizeForLog,
  maskPhone,
  maskEmail,
  containsSensitiveData
};
