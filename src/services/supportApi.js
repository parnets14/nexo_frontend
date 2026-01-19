const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'https://nexo.works' : window.location.origin)

const buildUrl = (path) => `${API_BASE_URL}/api/support${path}`

const getDefaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
})

const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}

export const supportApi = {
  // User Support Tickets
  async createTicket(token, ticketData) {
    const response = await fetch(buildUrl('/tickets'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(ticketData)
    })
    return handleResponse(response)
  },

  async getUserTickets(token, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(buildUrl(`/tickets?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getTicketDetails(token, ticketId) {
    const response = await fetch(buildUrl(`/tickets/${ticketId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addTicketReply(token, ticketId, replyData) {
    const response = await fetch(buildUrl(`/tickets/${ticketId}/reply`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(replyData)
    })
    return handleResponse(response)
  },

  async submitTicketFeedback(token, ticketId, feedbackData) {
    const response = await fetch(buildUrl(`/tickets/${ticketId}/feedback`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(feedbackData)
    })
    return handleResponse(response)
  },

  // FAQs
  async getFAQs(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(buildUrl(`/faqs?${queryParams}`))
    return handleResponse(response)
  },

  async getFAQDetails(faqId) {
    const response = await fetch(buildUrl(`/faqs/${faqId}`))
    return handleResponse(response)
  },

  async rateFAQ(faqId, helpful) {
    const response = await fetch(buildUrl(`/faqs/${faqId}/rate`), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ helpful })
    })
    return handleResponse(response)
  },

  // Support Settings
  async getSupportSettings() {
    const response = await fetch(buildUrl('/settings'))
    return handleResponse(response)
  },

  // Partner Support Tickets
  async createPartnerTicket(token, ticketData) {
    const response = await fetch(buildUrl('/partner/tickets'), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(ticketData)
    })
    return handleResponse(response)
  },

  async getPartnerTickets(token, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(buildUrl(`/partner/tickets?${queryParams}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async getPartnerTicketDetails(token, ticketId) {
    const response = await fetch(buildUrl(`/partner/tickets/${ticketId}`), {
      headers: getDefaultHeaders(token)
    })
    return handleResponse(response)
  },

  async addPartnerTicketReply(token, ticketId, replyData) {
    const response = await fetch(buildUrl(`/partner/tickets/${ticketId}/reply`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(replyData)
    })
    return handleResponse(response)
  },

  async submitPartnerTicketFeedback(token, ticketId, feedbackData) {
    const response = await fetch(buildUrl(`/partner/tickets/${ticketId}/feedback`), {
      method: 'POST',
      headers: getDefaultHeaders(token),
      body: JSON.stringify(feedbackData)
    })
    return handleResponse(response)
  }
}