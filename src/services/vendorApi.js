const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_VENDOR_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin)

const buildUrl = (path) => {
  if (path.startsWith('/api/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/api/vendor${path}`
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
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  
  let data
  try {
    data = isJson ? await response.json() : await response.text()
  } catch (parseError) {
    console.error('Error parsing response:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || data?.success === false ? data?.message : 'Request failed'
    const error = new Error(errorMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const vendorApi = {
  // Authentication
  async sendOTP(phone) {
    try {
      const url = buildUrl('/auth/send-otp')
      console.log('📤 Vendor OTP API call:', { url, phone })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ phone })
      })
      
      console.log('📥 Vendor OTP API response status:', response.status)
      return handleResponse(response)
    } catch (error) {
      console.error('❌ Vendor OTP API fetch error:', error)
      throw error
    }
  },

  async verifyOTP(phone, otp) {
    const response = await fetch(buildUrl('/auth/verify-otp'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone, otp })
    })
    return handleResponse(response)
  },

  async loginWithPassword(email, password) {
    const response = await fetch(buildUrl('/auth/login'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  async updateFCMToken(token, fcmToken) {
    const response = await fetch(buildUrl('/auth/update-fcm-token'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ token: fcmToken })
    })
    return handleResponse(response)
  },

  async getProfile(token) {
    const response = await fetch(buildUrl('/auth/profile'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Spare Parts
  async getSpareParts(token, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = buildUrl(`/spare-parts${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getSparePart(token, id) {
    const response = await fetch(buildUrl(`/spare-parts/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addSparePart(token, formData) {
    const response = await fetch(buildUrl('/spare-parts'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return handleResponse(response)
  },

  async updateSparePart(token, id, formData) {
    const response = await fetch(buildUrl(`/spare-parts/${id}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return handleResponse(response)
  },

  async deleteSparePart(token, id) {
    const response = await fetch(buildUrl(`/spare-parts/${id}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getCategories(token) {
    const response = await fetch(buildUrl('/spare-parts/categories'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Bookings
  async getBookings(token, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = buildUrl(`/bookings${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getBooking(token, id) {
    const response = await fetch(buildUrl(`/bookings/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updateBookingStatus(token, id, statusData) {
    const response = await fetch(buildUrl(`/bookings/${id}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(statusData)
    })
    return handleResponse(response)
  },

  async getBookingStats(token) {
    const response = await fetch(buildUrl('/bookings/stats'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Transactions
  async getTransactions(token, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = buildUrl(`/transactions${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getTransaction(token, id) {
    const response = await fetch(buildUrl(`/transactions/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getTransactionStats(token) {
    const response = await fetch(buildUrl('/transactions/stats'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createTransaction(token, transactionData) {
    const response = await fetch(buildUrl('/transactions'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(transactionData)
    })
    return handleResponse(response)
  },

  // Notifications
  async getNotifications(token) {
    try {
      const response = await fetch(buildUrl('/notifications'), {
        headers: getDefaultHeaders(token)
      })
      return handleResponse(response)
    } catch (error) {
      // Handle connection errors gracefully
      console.error('Error fetching vendor notifications:', error)
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
        return { success: false, notifications: [], message: 'Unable to connect to server' }
      }
      throw error
    }
  },

  async markNotificationAsRead(token, notificationId) {
    const response = await fetch(buildUrl(`/notifications/${notificationId}/mark-read`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async markNotificationsAsRead(token) {
    const response = await fetch(buildUrl('/notifications/mark-read'), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  }
}

