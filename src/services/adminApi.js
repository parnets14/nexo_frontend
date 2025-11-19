const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)

const buildUrl = (path) => {
  // Handle both /api/admin and /admin routes
  if (path.startsWith('/admin/bookings')) {
    return `${API_BASE_URL}${path}`
  }
  if (path.startsWith('/api/')) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/api/admin${path}`
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
  const isHtml = contentType.includes('text/html')
  
  // Get response text first to check if it's empty
  const text = await response.text()
  
  // If response is HTML, it's likely an error page
  if (isHtml || (text.trim().startsWith('<!') && text.trim().toLowerCase().includes('html'))) {
    const error = new Error(`Server returned HTML instead of JSON (Status: ${response.status}). This usually means the endpoint doesn't exist or there's a server error.`)
    error.status = response.status
    error.isHtml = true
    error.htmlPreview = text.substring(0, 500)
    throw error
  }
  
  // If response is empty, return a default object
  if (!text || text.trim() === '') {
    if (!response.ok) {
      const error = new Error('Empty response from server')
      error.status = response.status
      throw error
    }
    return { success: true, message: 'Operation completed successfully' }
  }
  
  // Parse JSON if content type indicates JSON
  let data
  if (isJson) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      // If JSON parsing fails, check if it's HTML
      if (text.trim().startsWith('<!')) {
        const error = new Error('Server returned HTML instead of JSON')
        error.status = response.status
        error.isHtml = true
        error.htmlPreview = text.substring(0, 500)
        throw error
      }
      // Otherwise return the text
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

export const adminApi = {
  async login(credentials) {
    const response = await fetch(buildUrl('/api/admin/login'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(credentials)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async fetchDashboard(token) {
    const response = await fetch(buildUrl('/api/admin/dashboard'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async fetchDashboardCounts(token) {
    const response = await fetch(buildUrl('/api/admin/dashboard/counts'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    // Backend returns: { success: true, data: { counts: {...}, bookingStats: {...} } }
    return data
  },
  
  // Partners
  async fetchPartners(token, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/partners?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async fetchPendingKYC(token) {
    const response = await fetch(buildUrl('/api/admin/partners/kyc/pending'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async fetchPartnerDetails(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async updatePartnerStatus(token, partnerId, status, remarks) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ status, remarks })
    })
    return handleResponse(response)
  },
  
  async verifyPartnerKYC(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/kyc`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updatePartnerProfile(token, partnerId, profileData) {
    // Use buildUrl to ensure correct URL construction
    // The buildUrl function will prepend API_BASE_URL which is https://nexo.works in dev
    const url = buildUrl(`/api/admin/updatePartnerProfile/${partnerId}`)
    console.log('Update Partner Profile URL:', url, 'API_BASE_URL:', API_BASE_URL)
    const response = await fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(profileData)
    })
    return handleResponse(response)
  },

  async suspendPartner(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partner/${partnerId}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ status: 'inactive' })
    })
    return handleResponse(response)
  },

  async activatePartner(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partner/${partnerId}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ status: 'active' })
    })
    return handleResponse(response)
  },

  async deletePartner(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/deletepartner/${partnerId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },
  
  // Bookings
  async fetchBookings(token, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'all',
      ...(params.fromDate && { fromDate: params.fromDate }),
      ...(params.toDate && { toDate: params.toDate })
    }).toString()
    
    // Backend route is /api/admin/bookings/bookings
    const response = await fetch(buildUrl(`/api/admin/bookings/bookings?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async assignBooking(token, bookingId, partnerId, teamMemberId) {
    const response = await fetch(buildUrl('/api/admin/bookings/assign-partner'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ bookingId, partnerId, teamMemberId })
    })
    return handleResponse(response)
  },

  async fetchTeamMembers(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.status && { status: params.status })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/team-members${queryParams ? `?${queryParams}` : ''}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  async completeBooking(token, bookingId) {
    const response = await fetch(buildUrl(`/api/admin/bookings/${bookingId}/complete`), {
      method: 'PUT',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createManualBooking(token, bookingData) {
    const response = await fetch(buildUrl('/api/admin/bookings/create'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(bookingData)
    })
    return handleResponse(response)
  },
  
  // Users
  async fetchUsers(token, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/users?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },
  
  // Reports
  async fetchRevenueAnalytics(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/reports/revenue?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },
  
  async fetchPartnerPerformance(token) {
    const response = await fetch(buildUrl('/api/admin/reports/partners/performance'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },
  
  async fetchUserAnalytics(token) {
    const response = await fetch(buildUrl('/api/admin/reports/users'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },
  
  async fetchCategoryRevenue(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/reports/category-revenue?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },

  async fetchTransactionReport(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/reports/transactions?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },

  // Lead Management
  async fetchLeads(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.status && params.status !== 'all' && { status: params.status }),
      ...(params.city && { city: params.city }),
      ...(params.allocationStrategy && params.allocationStrategy !== 'all' && { allocationStrategy: params.allocationStrategy }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/leads?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },

  async fetchLeadAnalytics(token) {
    const response = await fetch(buildUrl('/api/admin/leads/analytics'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },

  async fetchBids(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.status && params.status !== 'all' && { status: params.status }),
      ...(params.leadId && { leadId: params.leadId })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/leads/bids?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data
  },

  async createLeadFromBooking(token, bookingId) {
    const response = await fetch(buildUrl('/api/admin/leads/create'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ bookingId })
    })
    return handleResponse(response)
  },

  async createManualLead(token, leadData) {
    const response = await fetch(buildUrl('/api/admin/leads/create-manual'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(leadData)
    })
    return handleResponse(response)
  },

  async updateLeadStatus(token, leadId, status, assignedPartner) {
    const response = await fetch(buildUrl(`/api/admin/leads/${leadId}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ status, assignedPartner })
    })
    return handleResponse(response)
  },

  async acceptBid(token, leadId, bidId) {
    const response = await fetch(buildUrl('/api/admin/leads/accept-bid'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ leadId, bidId })
    })
    return handleResponse(response)
  },

  async syncBookingsToLeads(token) {
    const response = await fetch(buildUrl('/api/admin/leads/sync'), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },
  
  // Reviews
  async fetchReviews(token) {
    const response = await fetch(buildUrl('/api/admin/reviews'), {
      headers: getDefaultHeaders(token)
    })
    const data = await handleResponse(response)
    return data?.data || data
  },
  
  async updateReviewStatus(token, reviewId, status) {
    const response = await fetch(buildUrl(`/api/admin/reviews/${reviewId}/status`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },
  
  // Partner Earnings & Bookings
  async fetchPartnerEarnings(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partner/${partnerId}/earnings`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Partner Wallet
  async fetchFeeTransactions(token, params = {}) {
    const queryParams = new URLSearchParams()
    
    // Add all non-empty parameters - ensure values are properly trimmed and validated
    if (params.partnerId && typeof params.partnerId === 'string' && params.partnerId.trim()) {
      queryParams.append('partnerId', params.partnerId.trim())
    }
    if (params.feeType && typeof params.feeType === 'string' && params.feeType.trim() && params.feeType !== 'all') {
      queryParams.append('feeType', params.feeType.trim())
    }
    if (params.status && typeof params.status === 'string' && params.status.trim() && params.status !== 'all') {
      queryParams.append('status', params.status.trim())
    }
    if (params.startDate && typeof params.startDate === 'string' && params.startDate.trim()) {
      queryParams.append('startDate', params.startDate.trim())
    }
    if (params.endDate && typeof params.endDate === 'string' && params.endDate.trim()) {
      queryParams.append('endDate', params.endDate.trim())
    }
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    const url = buildUrl(`/api/admin/fee-transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('Fetching fee transactions with params:', Object.fromEntries(queryParams))
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchPartnerWallet(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/adminwallets/${partnerId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Get all wallet transactions
  async fetchAllWalletTransactions(token, params = {}) {
    const queryParams = new URLSearchParams({
      ...(params.limit && { limit: params.limit })
    }).toString()
    
    const response = await fetch(buildUrl(`/api/admin/wallet-transactions?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Add Wallet Transaction (Credit/Debit)
  async addWalletTransaction(token, transactionData) {
    const response = await fetch(buildUrl('/api/admin/partner/addwallets'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(transactionData)
    })
    return handleResponse(response)
  },

  // MG Plans Management
  async fetchMGPlans(token) {
    const response = await fetch(buildUrl('/api/admin/mg-plans'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Subscription Plans Management
  async fetchSubscriptionPlans(token) {
    try {
      const url = buildUrl('/api/admin/subscription-plans')
      console.log('📡 Fetching subscription plans from:', url)
      console.log('📡 Using token:', token ? 'Present' : 'Missing')
      
      const response = await fetch(url, {
        headers: getDefaultHeaders(token)
      })
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        const text = await response.text()
        console.error('❌ Server returned HTML instead of JSON')
        console.error('Response status:', response.status, response.statusText)
        console.error('Response preview:', text.substring(0, 500))
        throw new Error(`API endpoint returned HTML (${response.status}). Check if the endpoint exists: ${url}`)
      }
      
      const data = await handleResponse(response)
      console.log('📡 Subscription plans response:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching subscription plans:', error)
      throw error
    }
  },

  async createSubscriptionPlan(token, planData) {
    const response = await fetch(buildUrl('/api/admin/subscription-plans'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(planData)
    })
    return handleResponse(response)
  },

  async updateSubscriptionPlan(token, planId, planData) {
    const response = await fetch(buildUrl(`/api/admin/subscription-plans/${planId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(planData)
    })
    return handleResponse(response)
  },

  async deleteSubscriptionPlan(token, planId) {
    const response = await fetch(buildUrl(`/api/admin/subscription-plans/${planId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Featured Reviews Management
  async fetchFeaturedReviews(token) {
    const response = await fetch(buildUrl('/api/admin/featured-reviews'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createFeaturedReview(token, reviewData) {
    const response = await fetch(buildUrl('/api/admin/featured-reviews'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(reviewData)
    })
    return handleResponse(response)
  },

  async updateFeaturedReview(token, reviewId, reviewData) {
    const response = await fetch(buildUrl(`/api/admin/featured-reviews/${reviewId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(reviewData)
    })
    return handleResponse(response)
  },

  async deleteFeaturedReview(token, reviewId) {
    const response = await fetch(buildUrl(`/api/admin/featured-reviews/${reviewId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createMGPlan(token, planData) {
    const response = await fetch(buildUrl('/api/admin/mg-plans'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(planData)
    })
    return handleResponse(response)
  },

  async updateMGPlan(token, planId, planData) {
    const response = await fetch(buildUrl(`/api/admin/mg-plans/${planId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(planData)
    })
    return handleResponse(response)
  },

  async deleteMGPlan(token, planId) {
    const response = await fetch(buildUrl(`/api/admin/mg-plans/${planId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchPartnerServiceHubs(token, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/service-hubs`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createPartnerServiceHub(token, partnerId, hubData) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/service-hubs`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(hubData)
    })
    return handleResponse(response)
  },

  async updatePartnerServiceHub(token, partnerId, hubId, hubData) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/service-hubs/${hubId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(hubData)
    })
    return handleResponse(response)
  },

  async deletePartnerServiceHub(token, partnerId, hubId) {
    const response = await fetch(buildUrl(`/api/admin/partners/${partnerId}/service-hubs/${hubId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Hub Management (New Hub System)
  async fetchHubs(token, params = {}) {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)
    const queryString = queryParams.toString()
    const url = buildUrl(`/api/admin/hubs${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchHubById(token, hubId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createHub(token, hubData) {
    const response = await fetch(buildUrl('/api/admin/hubs'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(hubData)
    })
    return handleResponse(response)
  },

  async updateHub(token, hubId, hubData) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(hubData)
    })
    return handleResponse(response)
  },

  async deleteHub(token, hubId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async assignHubToPartner(token, hubId, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/assign-partner`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ partnerId })
    })
    return handleResponse(response)
  },

  async unassignHubFromPartner(token, hubId, partnerId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/unassign-partner`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ partnerId })
    })
    return handleResponse(response)
  },

  async fetchHubPartners(token, hubId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/partners`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addAreaToHub(token, hubId, areaData) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/areas`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(areaData)
    })
    return handleResponse(response)
  },

  async updateAreaInHub(token, hubId, areaId, areaData) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/areas/${areaId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(areaData)
    })
    return handleResponse(response)
  },

  async deleteAreaFromHub(token, hubId, areaId) {
    const response = await fetch(buildUrl(`/api/admin/hubs/${hubId}/areas/${areaId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchHubsByPinCode(token, pinCode) {
    const response = await fetch(buildUrl(`/api/admin/hubs/pin-code/${pinCode}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Fee Management
  async fetchFees(token) {
    const response = await fetch(buildUrl('/api/admin/fees'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updateFees(token, fees) {
    const response = await fetch(buildUrl('/api/admin/fees'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(fees)
    })
    return handleResponse(response)
  },

  // Category Management
  async fetchCategories(token) {
    const response = await fetch(buildUrl('/api/admin/service-categories'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createCategory(token, categoryData) {
    const response = await fetch(buildUrl('/api/admin/service-category'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(categoryData)
    })
    return handleResponse(response)
  },

  async updateCategory(token, categoryId, categoryData) {
    const response = await fetch(buildUrl(`/api/admin/service-category/${categoryId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(categoryData)
    })
    return handleResponse(response)
  },

  async deleteCategory(token, categoryId) {
    const response = await fetch(buildUrl(`/api/admin/service-category/${categoryId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Popular Services Management
  async fetchPopularServices(token) {
    const response = await fetch(buildUrl('/api/admin/popular-services'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createPopularService(token, serviceData) {
    const response = await fetch(buildUrl('/api/admin/popular-services'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(serviceData)
    })
    return handleResponse(response)
  },

  async updatePopularService(token, serviceId, serviceData) {
    const response = await fetch(buildUrl(`/api/admin/popular-services/${serviceId}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(serviceData)
    })
    return handleResponse(response)
  },

  async deletePopularService(token, serviceId) {
    const response = await fetch(buildUrl(`/api/admin/popular-services/${serviceId}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async migratePopularServices(token) {
    const response = await fetch(buildUrl('/popular-services/migrate'), {
      method: 'POST',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updatePopularServicesOrder(token, services) {
    const response = await fetch(buildUrl('/api/admin/popular-services/order/update'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ services })
    })
    return handleResponse(response)
  },

  // Generic fetch for any endpoint
  async fetchModuleData(path, token, options = {}) {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        ...getDefaultHeaders(token),
        ...(options.headers || {})
      }
    })
    return handleResponse(response)
  },

  // Material Categories Management
  async fetchMaterialCategories(token) {
    const response = await fetch(buildUrl('/api/admin/material-categories'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchMaterialCategory(token, id) {
    const response = await fetch(buildUrl(`/api/admin/material-categories/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createMaterialCategory(token, categoryData) {
    const response = await fetch(buildUrl('/api/admin/material-categories'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(categoryData)
    })
    return handleResponse(response)
  },

  async updateMaterialCategory(token, id, categoryData) {
    const response = await fetch(buildUrl(`/api/admin/material-categories/${id}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(categoryData)
    })
    return handleResponse(response)
  },

  async deleteMaterialCategory(token, id) {
    const response = await fetch(buildUrl(`/api/admin/material-categories/${id}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async updateMaterialCategoryOrder(token, categories) {
    const response = await fetch(buildUrl('/api/admin/material-categories/order/update'), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify({ categories })
    })
    return handleResponse(response)
  },

  // Inventory Management
  async fetchInventoryItems(token, params = {}) {
    const queryParams = new URLSearchParams()
    if (params.category) queryParams.append('category', params.category)
    if (params.location) queryParams.append('location', params.location)
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)
    const queryString = queryParams.toString()
    const url = buildUrl(`/api/admin/inventory/items${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchInventoryStats(token) {
    const response = await fetch(buildUrl('/api/admin/inventory/items/stats'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchInventoryItem(token, id) {
    const response = await fetch(buildUrl(`/api/admin/inventory/items/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createInventoryItem(token, itemData) {
    const response = await fetch(buildUrl('/api/admin/inventory/items'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(itemData)
    })
    return handleResponse(response)
  },

  async updateInventoryItem(token, id, itemData) {
    const response = await fetch(buildUrl(`/api/admin/inventory/items/${id}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(itemData)
    })
    return handleResponse(response)
  },

  async deleteInventoryItem(token, id) {
    const response = await fetch(buildUrl(`/api/admin/inventory/items/${id}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchInventoryItemHistory(token, id) {
    const response = await fetch(buildUrl(`/api/admin/inventory/items/${id}/history`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Purchase Orders
  async fetchPurchaseOrders(token, params = {}) {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.supplier) queryParams.append('supplier', params.supplier)
    if (params.search) queryParams.append('search', params.search)
    const queryString = queryParams.toString()
    const url = buildUrl(`/api/admin/inventory/purchase-orders${queryString ? `?${queryString}` : ''}`)
    const response = await fetch(url, {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchPurchaseOrder(token, id) {
    const response = await fetch(buildUrl(`/api/admin/inventory/purchase-orders/${id}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async createPurchaseOrder(token, orderData) {
    const response = await fetch(buildUrl('/api/admin/inventory/purchase-orders'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(orderData)
    })
    return handleResponse(response)
  },

  async updatePurchaseOrder(token, id, orderData) {
    const response = await fetch(buildUrl(`/api/admin/inventory/purchase-orders/${id}`), {
      method: 'PUT',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(orderData)
    })
    return handleResponse(response)
  },

  async deletePurchaseOrder(token, id) {
    const response = await fetch(buildUrl(`/api/admin/inventory/purchase-orders/${id}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  // Inventory Thresholds
  async fetchThresholds(token) {
    const response = await fetch(buildUrl('/api/admin/inventory/thresholds'), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async fetchThreshold(token, category) {
    const response = await fetch(buildUrl(`/api/admin/inventory/thresholds/${category}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async upsertThreshold(token, thresholdData) {
    const response = await fetch(buildUrl('/api/admin/inventory/thresholds'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(thresholdData)
    })
    return handleResponse(response)
  },

  async deleteThreshold(token, category) {
    const response = await fetch(buildUrl(`/api/admin/inventory/thresholds/${category}`), {
      method: 'DELETE',
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  }
}


