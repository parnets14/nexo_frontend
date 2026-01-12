const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:9088' : window.location.origin)

const buildUrl = (path) => {
  if (path.startsWith('/api/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/api/partner${path}`
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
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    })
    
    let errorMessage = 'Request failed'
    
    if (data?.message) {
      errorMessage = data.message
    } else if (data?.error) {
      errorMessage = data.error
    } else if (typeof data === 'string') {
      errorMessage = data
    }
    
    // Add validation error details if available
    if (data?.errors && Array.isArray(data.errors)) {
      errorMessage += ': ' + data.errors.join(', ')
    }
    
    const error = new Error(errorMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const partnerApi = {
  // Authentication
  async sendOTP(phone) {
    const response = await fetch(buildUrl('/auth/send-otp'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone })
    })
    return handleResponse(response)
  },

  async verifyOTP(phone, otp) {
    const response = await fetch(buildUrl('/auth/verify-otp'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone, otp })
    })
    return handleResponse(response)
  },

  async resendOTP(phone) {
    const response = await fetch(buildUrl('/auth/resend-otp'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ phone })
    })
    return handleResponse(response)
  },

  // Profile
  async completeProfile(token, profileData) {
    const formData = new FormData()
    
    // Add text fields
    Object.keys(profileData).forEach(key => {
      if (key !== 'profilePicture' && profileData[key] !== null && profileData[key] !== undefined) {
        if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]))
        } else {
          formData.append(key, profileData[key])
        }
      }
    })

    // Add profile picture if exists
    if (profileData.profilePicture) {
      formData.append('profilePicture', profileData.profilePicture)
    }

    const response = await fetch(buildUrl('/profile/complete'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    })
    return handleResponse(response)
  },

  // KYC
  async completeKYC(token, kycData) {
    const formData = new FormData()

    // Add KYC files
    if (kycData.panCard) {
      formData.append('panCard', kycData.panCard)
    }
    if (kycData.aadhaar) {
      formData.append('aadhaar', kycData.aadhaar)
    }
    if (kycData.aadhaarback) {
      formData.append('aadhaarback', kycData.aadhaarback)
    }
    if (kycData.chequeImage) {
      formData.append('chequeImage', kycData.chequeImage)
    }
    if (kycData.drivingLicence) {
      formData.append('drivingLicence', kycData.drivingLicence)
    }
    if (kycData.bill) {
      formData.append('bill', kycData.bill)
    }

    // Add bank details as separate form fields (not JSON)
    if (kycData.accountNumber) {
      formData.append('accountNumber', kycData.accountNumber)
    }
    if (kycData.ifscCode) {
      formData.append('ifscCode', kycData.ifscCode)
    }
    if (kycData.accountHolderName) {
      formData.append('accountHolderName', kycData.accountHolderName)
    }
    if (kycData.bankName) {
      formData.append('bankName', kycData.bankName)
    }

    const response = await fetch(buildUrl('/kyc/complete'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    })
    return handleResponse(response)
  },

  // Payment
  async completePayment(token, paymentData) {
    const response = await fetch(buildUrl('/regigiste-fee'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(paymentData)
    })
    return handleResponse(response)
  },

  // Get profile
  async getProfile(token) {
    const response = await fetch(buildUrl('/profile'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updateOnboardingStep(token, stepData) {
    const response = await fetch(buildUrl('/profile/onboarding-step'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(stepData)
    })
    return handleResponse(response)
  },

  // Update profile
  async updateProfile(token, profileData) {
    // Check if profileData is FormData
    if (profileData instanceof FormData) {
      const response = await fetch(buildUrl('/profile/update'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: profileData
      })
      return handleResponse(response)
    } else {
      const response = await fetch(buildUrl('/profile/update'), {
        method: 'PUT',
        headers: getDefaultHeaders(token),
        body: JSON.stringify(profileData)
      })
      return handleResponse(response)
    }
  },

  // Get categories for trade selection
  async getCategories(token) {
    // This endpoint doesn't require auth, so only add token if provided
    const headers = token ? getDefaultHeaders(token) : getDefaultHeaders()
    const response = await fetch(buildUrl('/dropdown/categories'), {
      headers
    })
    return handleResponse(response)
  },

  // Select category and service
  async selectCategoryAndService(token, categoryId, serviceIds) {
    const response = await fetch(buildUrl('/select-category-and-service'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({
        category: categoryId,
        services: serviceIds
      })
    })
    return handleResponse(response)
  },

  // MG Plans
  async getMGPlans(token, partnerType = null) {
    const url = partnerType 
      ? buildUrl(`/mg-plans?partnerType=${partnerType}`)
      : buildUrl('/mg-plans')
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getCurrentPlan(token) {
    const response = await fetch(buildUrl('/mg-plans/current'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async subscribeToPlan(token, planId) {
    const response = await fetch(buildUrl('/mg-plans/subscribe'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ planId })
    })
    return handleResponse(response)
  },

  async renewPlan(token) {
    const response = await fetch(buildUrl('/mg-plans/renew'), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Get Pricing Settings
  async getPricingSettings() {
    const response = await fetch(`${API_BASE_URL}/api/registerFee/fees`, {
      headers: getDefaultHeaders()
    })
    return handleResponse(response)
  },

  // Service Hubs
  async getAvailableServiceHubs(token) {
    const response = await fetch(buildUrl('/service-hubs/available'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createServiceHub(token, hubData) {
    const response = await fetch(buildUrl('/service-hubs'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(hubData)
    })
    return handleResponse(response)
  },

  // New Hub System - Assign hubs to partner
  async assignHub(token, hubId) {
    const response = await fetch(buildUrl('/hubs/assign'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ hubId })
    })
    return handleResponse(response)
  },

  async unassignHub(token, hubId) {
    const response = await fetch(buildUrl('/hubs/unassign'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ hubId })
    })
    return handleResponse(response)
  },

  // Wallet
  async getWallet(token) {
    const response = await fetch(buildUrl('/getWalletbypartner'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Transactions
  async getTransactions(token) {
    const response = await fetch(buildUrl('/getAllwalletTransaction'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Partner Earnings
  async getEarnings(token, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(buildUrl(`/earnings?${queryString}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getEarningsSummary(token) {
    const response = await fetch(buildUrl('/earnings/summary'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async claimEarnings(token, data) {
    const response = await fetch(buildUrl('/earnings/claim'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async getEarningsClaimsHistory(token, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(buildUrl(`/earnings/claims-history?${queryString}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Top-up Wallet
  async topUpWallet(token, amount, description, reference) {
    const response = await fetch(buildUrl('/wallet/topup'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({
        amount,
        type: 'credit',
        description: description || 'Topup',
        reference: reference || `TOPUP-${Date.now()}`
      })
    })
    return handleResponse(response)
  },

  // Initiate PayU Wallet Top-up
  async initiatePayUWalletTopUp(token, amount) {
    const response = await fetch(buildUrl('/wallet/initiate-payu-payment'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({
        amount
      })
    })
    return handleResponse(response)
  },

  // Check PayU Wallet Payment Status
  async checkWalletPaymentStatus(token, txnid) {
    const response = await fetch(buildUrl(`/wallet/payment-status/${txnid}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Bookings/Jobs
  async getBookings(token) {
    const response = await fetch(buildUrl('/bookings'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getPendingBookings(token) {
    const response = await fetch(buildUrl('/bookings/pending'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getAcceptedBookings(token) {
    const response = await fetch(buildUrl('/bookings/accepted/:partnerId'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getCompletedBookings(token) {
    const response = await fetch(buildUrl('/bookings/completed'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Products/Spare Parts
  async getProductsByCategory(token, category) {
    const response = await fetch(buildUrl(`/products/${category}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addToCart(token, productData) {
    const response = await fetch(buildUrl('/products/add'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(productData)
    })
    return handleResponse(response)
  },

  // Hubs
  async getAvailableHubs(token) {
    const response = await fetch(buildUrl('/service-hubs/available'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // KYC
  async updateKYC(token, kycData) {
    const formData = new FormData()

    // Add KYC files
    if (kycData.panCard) {
      formData.append('panCard', kycData.panCard)
    }
    if (kycData.aadhaar) {
      formData.append('aadhaar', kycData.aadhaar)
    }
    if (kycData.aadhaarback) {
      formData.append('aadhaarback', kycData.aadhaarback)
    }
    if (kycData.chequeImage) {
      formData.append('chequeImage', kycData.chequeImage)
    }
    if (kycData.drivingLicence) {
      formData.append('drivingLicence', kycData.drivingLicence)
    }
    if (kycData.bill) {
      formData.append('bill', kycData.bill)
    }

    // Add bank details
    if (kycData.accountNumber) {
      formData.append('accountNumber', kycData.accountNumber)
    }
    if (kycData.ifscCode) {
      formData.append('ifscCode', kycData.ifscCode)
    }
    if (kycData.accountHolderName) {
      formData.append('accountHolderName', kycData.accountHolderName)
    }
    if (kycData.bankName) {
      formData.append('bankName', kycData.bankName)
    }

    const response = await fetch(buildUrl('/kyc/complete'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return handleResponse(response)
  },

  // Select Category and Service
  async selectCategoryAndService(token, data) {
    const response = await fetch(buildUrl('/select-category-and-service'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  // Team Members
  async getTeamMembers(token) {
    const response = await fetch(buildUrl('/team-members'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addTeamMember(token, memberData) {
    const formData = new FormData()
    
    // Add all text fields
    Object.keys(memberData).forEach(key => {
      if (key !== 'profilePicture' && key !== 'kyc' && key !== 'kycData' && memberData[key] !== null && memberData[key] !== undefined) {
        if (Array.isArray(memberData[key])) {
          // For arrays, append each item with index
          memberData[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item)
          })
        } else {
          formData.append(key, memberData[key])
        }
      }
    })

    // Add profile picture
    if (memberData.profilePicture) {
      formData.append('profilePicture', memberData.profilePicture)
    }

    // Add KYC files
    if (memberData.kycData) {
      const kycData = memberData.kycData
      if (kycData.panCard) formData.append('panCard', kycData.panCard)
      if (kycData.aadhaar) formData.append('aadhaar', kycData.aadhaar)
      if (kycData.aadhaarback) formData.append('aadhaarback', kycData.aadhaarback)
      if (kycData.chequeImage) formData.append('chequeImage', kycData.chequeImage)
      if (kycData.drivingLicence) formData.append('drivingLicence', kycData.drivingLicence)
      if (kycData.bill) formData.append('bill', kycData.bill)
    }

    const response = await fetch(buildUrl('/team-members'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return handleResponse(response)
  },

  async updateTeamMember(token, memberId, memberData) {
    const formData = new FormData()
    
    // Add all text fields
    Object.keys(memberData).forEach(key => {
      if (key !== 'profilePicture' && key !== 'kyc' && key !== 'kycData' && memberData[key] !== null && memberData[key] !== undefined) {
        if (typeof memberData[key] === 'object' && !Array.isArray(memberData[key])) {
          formData.append(key, JSON.stringify(memberData[key]))
        } else if (Array.isArray(memberData[key])) {
          memberData[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item)
          })
        } else {
          formData.append(key, memberData[key])
        }
      }
    })

    // Add profile picture
    if (memberData.profilePicture) {
      formData.append('profilePicture', memberData.profilePicture)
    }

    // Add KYC files
    if (memberData.kycData) {
      const kycData = memberData.kycData
      if (kycData.panCard) formData.append('panCard', kycData.panCard)
      if (kycData.aadhaar) formData.append('aadhaar', kycData.aadhaar)
      if (kycData.aadhaarback) formData.append('aadhaarback', kycData.aadhaarback)
      if (kycData.chequeImage) formData.append('chequeImage', kycData.chequeImage)
      if (kycData.drivingLicence) formData.append('drivingLicence', kycData.drivingLicence)
      if (kycData.bill) formData.append('bill', kycData.bill)
    }

    const response = await fetch(buildUrl(`/team-members/${memberId}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    return handleResponse(response)
  },

  async deleteTeamMember(token, memberId) {
    const response = await fetch(buildUrl(`/team-members/${memberId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getTeamMemberActivities(token, memberId) {
    const response = await fetch(buildUrl(`/team-members/${memberId}/activities`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async assignBookingToTeamMember(token, bookingId, teamMemberId) {
    const response = await fetch(buildUrl('/team-members/assign-booking'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ bookingId, teamMemberId })
    })
    return handleResponse(response)
  },

  // Public Partner Verification
  async verifyPartner(partnerId) {
    const response = await fetch(buildUrl(`/verify/${partnerId}`))
    return handleResponse(response)
  },

  // Notifications
  async updateFCMToken(token, fcmToken) {
    const response = await fetch(buildUrl('/updateTokenFmc'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ token: fcmToken }) // Backend expects 'token' field
    })
    return handleResponse(response)
  },

  async getNotifications(token) {
    // Get notifications for authenticated partner
    const response = await fetch(buildUrl('/notifications'), {
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
  },

  async markNotificationAsRead(token, notificationId) {
    const response = await fetch(buildUrl(`/notifications/${notificationId}/mark-read`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Complete job with photos, videos, and remark
  async completeJob(token, bookingId, formData) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/complete`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    })
    return handleResponse(response)
  },

  // Pause job
  async pauseJob(token, bookingId, pauseData) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/pause`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(pauseData)
    })
    return handleResponse(response)
  },

  // Resume job
  async resumeJob(token, bookingId) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/resume`), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Quotation methods
  async createQuotation(token, bookingId, quotationData) {
    const response = await fetch(buildUrl(`/bookings/${bookingId}/quotation`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(quotationData)
    })
    return handleResponse(response)
  },

  async getQuotationsByBooking(token, bookingId) {
    try {
      const response = await fetch(buildUrl(`/bookings/${bookingId}/quotations`), {
        headers: getDefaultHeaders(token),
        timeout: 10000 // 10 second timeout
      })
      return handleResponse(response)
    } catch (error) {
      // If it's a network error, try to provide more context
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(`Network error fetching quotations for booking ${bookingId}. Please check your connection.`)
      }
      throw error
    }
  },

  async getPartnerQuotations(token) {
    const response = await fetch(buildUrl('/quotations'), {
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

  async deleteQuotation(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async approveQuotation(token, quotationId) {
    const response = await fetch(buildUrl(`/quotations/${quotationId}/approve`), {
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

  // Job Items Management
  async getJobItems(token, jobId) {
    const response = await fetch(buildUrl(`/jobs/${jobId}/items`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addJobItem(token, jobItemData) {
    const response = await fetch(buildUrl('/jobs/items'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(jobItemData)
    })
    return handleResponse(response)
  },

  async updateJobItem(token, jobItemId, updateData) {
    const response = await fetch(buildUrl(`/jobs/items/${jobItemId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(updateData)
    })
    return handleResponse(response)
  },

  async deleteJobItem(token, jobItemId) {
    const response = await fetch(buildUrl(`/jobs/items/${jobItemId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getJobItemsSummary(token, jobId) {
    const response = await fetch(buildUrl(`/jobs/${jobId}/items/summary`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Get quotation materials for partner
  async getQuotationMaterials(token) {
    const response = await fetch(buildUrl('/quotation-materials'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Get available bookings for quotations
  async getAvailableBookings(token) {
    const response = await fetch(buildUrl('/available-bookings'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Complete job payment
  async completeJobPayment(token, jobId, paymentData) {
    const response = await fetch(buildUrl(`/jobs/${jobId}/complete-payment`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(paymentData)
    })
    return handleResponse(response)
  },

  // Lead Plans
  async getLeadPlans(token) {
    const response = await fetch(buildUrl('/lead-plans'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getCurrentLeadPlan(token) {
    const response = await fetch(buildUrl('/lead-plans/current'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async subscribeToLeadPlan(token, planId) {
    const response = await fetch(buildUrl('/lead-plans/subscribe'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ planId })
    })
    return handleResponse(response)
  },

  async renewLeadPlan(token) {
    const response = await fetch(buildUrl('/lead-plans/renew'), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // PayU Payment for MG Plans
  async initiateMGPlanPayment(token, planId) {
    const response = await fetch(buildUrl('/mg-plans/initiate-payment'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ planId })
    })
    return handleResponse(response)
  },

  async checkMGPlanPaymentStatus(token, txnid) {
    const response = await fetch(buildUrl(`/mg-plans/payment-status/${txnid}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // PayU Payment for Lead Plans
  async initiateLeadPlanPayment(token, planId) {
    const response = await fetch(buildUrl('/lead-plans/initiate-payment'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ planId })
    })
    return handleResponse(response)
  },

  async checkLeadPlanPaymentStatus(token, txnid) {
    const response = await fetch(buildUrl(`/lead-plans/check-payment-status/${txnid}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  }
}

