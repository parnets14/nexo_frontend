const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:9088' : window.location.origin)

const buildUrl = (path) => {
  if (path.startsWith('/api/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/api/user${path}`
}

const getDefaultHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  
  const text = await response.text()
  
  console.log('API Response:', {
    status: response.status,
    ok: response.ok,
    contentType,
    text: text.substring(0, 200)
  });
  
  if (!text || text.trim() === '') {
    if (!response.ok) {
      const error = new Error('Empty response from server')
      error.status = response.status
      throw error
    }
    return { success: true, message: 'Operation completed successfully' }
  }
  
  let data
  if (isJson) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('JSON Parse Error:', e);
      data = text
    }
  } else {
    data = text
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const userApi = {
  // Authentication
  async register(userData) {
    const response = await fetch(buildUrl('/register'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(userData)
    })
    return handleResponse(response)
  },

  async sendOTP(phone) {
    const url = buildUrl('/auth/send-otp');
    console.log('Sending OTP to URL:', url, 'Phone:', phone);
    const response = await fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone })
    })
    return handleResponse(response)
  },

  async sendLoginOTP(phone) {
    const url = buildUrl('/login/otp/send');
    console.log('Sending Login OTP to URL:', url, 'Phone:', phone);
    const response = await fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone })
    })
    return handleResponse(response)
  },

  async verifyOTP(phone, otp) {
    const response = await fetch(buildUrl('/login/otp/verify'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone, otp })
    })
    return handleResponse(response)
  },

  async loginWithPassword(email, password) {
    const response = await fetch(buildUrl('/login/password'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  // Profile
  async getProfile(token) {
    const response = await fetch(buildUrl('/profile'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updateProfile(token, formData) {
    const headers = { Authorization: `Bearer ${token}` }
    const response = await fetch(buildUrl('/profile'), {
      method: 'PUT',
      headers,
      body: formData
    })
    return handleResponse(response)
  },

  async updateProfileData(token, profileData) {
    const response = await fetch(buildUrl('/profile'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(profileData)
    })
    return handleResponse(response)
  },

  async changePassword(token, currentPassword, newPassword) {
    const response = await fetch(buildUrl('/change-password'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword })
    })
    return handleResponse(response)
  },

  // Addresses
  async addAddress(token, addressData) {
    const response = await fetch(buildUrl('/addresses'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(addressData)
    })
    return handleResponse(response)
  },

  async updateAddress(token, addressId, addressData) {
    const response = await fetch(buildUrl(`/address/${addressId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(addressData)
    })
    return handleResponse(response)
  },

  async deleteAddress(token, addressId) {
    const response = await fetch(buildUrl(`/address/${addressId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Bookings
  async getBookings(token) {
    console.log('🔍 userApi.getBookings called');
    console.log('   buildUrl result:', buildUrl('/bookings'));
    const response = await fetch(buildUrl('/bookings'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getBookingDetails(token, bookingId) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async cancelBooking(token, bookingId) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/cancel`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Wallet
  async getWalletBalance(token, userId) {
    const response = await fetch(buildUrl(`/wallet/${userId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getWalletDetails(token, userId) {
    const response = await fetch(buildUrl(`/wallet/${userId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async initiateWalletPayment(token, amount, userId) {
    const response = await fetch(buildUrl('/wallet/initiate-payment'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ amount, userId })
    })
    return handleResponse(response)
  },

  async checkWalletPaymentStatus(token, txnid) {
    const response = await fetch(buildUrl(`/wallet/payment-status/${txnid}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Notifications
  async getNotifications(token) {
    const response = await fetch(buildUrl('/notifications'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async markNotificationAsRead(token, notificationId) {
    const response = await fetch(buildUrl(`/notifications/${notificationId}/read`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async deleteNotification(token, notificationId) {
    const response = await fetch(buildUrl(`/notifications/${notificationId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Support
  async sendSupportMessage(token, subject, message) {
    const response = await fetch(buildUrl('/contactus'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ subject, message })
    })
    return handleResponse(response)
  },

  // Reviews
  async submitReview(token, reviewData) {
    const response = await fetch(buildUrl('/reviews'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(reviewData)
    })
    return handleResponse(response)
  },

  // Quotation APIs
  async getBookingQuotations(token, bookingId) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/quotations`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getQuotationDetails(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async acceptQuotation(token, quotationId, paymentData = null) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/accept`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ paymentData })
    })
    return handleResponse(response)
  },

  async rejectQuotation(token, quotationId, reason = '') {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/reject`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ reason })
    })
    return handleResponse(response)
  },

  async initiateQuotationPayment(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/initiate-payment`), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Dashboard APIs - Enhanced with time-based insights
  async getDashboard(token) {
    const response = await fetch(buildUrl('/dashboard'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getQuickStats(token) {
    const response = await fetch(buildUrl('/dashboard/quick-stats'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getSmartAlerts(token) {
    const response = await fetch(buildUrl('/dashboard/alerts'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getActivityStreak(token) {
    const response = await fetch(buildUrl('/dashboard/streak'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getSuggestions(token) {
    const response = await fetch(buildUrl('/dashboard/suggestions'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getRecentActivity(token, limit = 15) {
    const response = await fetch(buildUrl(`/dashboard/activity?limit=${limit}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getBookingStats(token) {
    const response = await fetch(buildUrl('/dashboard/booking-stats'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getWalletSummaryDashboard(token) {
    const response = await fetch(buildUrl('/dashboard/wallet-summary'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getDashboardInsights(token) {
    const response = await fetch(buildUrl('/dashboard/insights'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getRecommendations(token) {
    const response = await fetch(buildUrl('/dashboard/recommendations'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getGreeting(token) {
    const response = await fetch(buildUrl('/dashboard/greeting'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Quotations
  async getQuotationsByBooking(token, bookingId) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/quotations`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getQuotationById(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async acceptQuotation(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/accept`), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async rejectQuotation(token, quotationId, rejectionReason) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/reject`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ rejectionReason })
    })
    return handleResponse(response)
  },

  // Emergency Services
  async getEmergencyServices() {
    const response = await fetch(buildUrl('/services/emergency'), {
      headers: getDefaultHeaders()
    })
    return handleResponse(response)
  }
}
