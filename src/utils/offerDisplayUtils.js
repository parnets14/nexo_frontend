/**
 * Utility functions for determining which offer type to display
 * Ensures only one offer type (Special or Regular) is shown at a time
 */

/**
 * Determines which offer type should be displayed based on active offers
 * Priority: Special Offers > Regular Offers
 * 
 * @param {Array} offers - Array of all offers from the backend
 * @returns {Object|null} - { type: 'special' | 'regular', data: offer(s) } or null
 */
export const determineOfferToDisplay = (offers) => {
  if (!offers || !Array.isArray(offers) || offers.length === 0) {
    return null
  }

  // Filter active offers based on date range and isPopupEnabled flag
  const now = new Date()
  const activeOffers = offers.filter(offer => {
    const startDate = new Date(offer.startDate)
    const endDate = new Date(offer.endDate)
    const isWithinDateRange = now >= startDate && now <= endDate
    const isPopupEnabled = offer.isPopupEnabled === true
    
    return isWithinDateRange && isPopupEnabled
  })

  if (activeOffers.length === 0) {
    return null
  }

  // Separate by type
  const specialOffers = activeOffers.filter(o => o.offerType === 'special_offer')
  const regularOffers = activeOffers.filter(o => o.offerType === 'coupon')

  // Priority: Special Offers first, then Regular Offers
  if (specialOffers.length > 0) {
    return { 
      type: 'special', 
      data: specialOffers[0] // Show first special offer
    }
  } else if (regularOffers.length > 0) {
    return { 
      type: 'regular', 
      data: regularOffers // Pass all regular offers for rotation
    }
  }

  return null
}

/**
 * Filters offers for the top banner display
 * Returns only active offers within date range (regardless of popup flag)
 * 
 * @param {Array} offers - Array of all offers from the backend
 * @returns {Array} - Array of active offers
 */
export const getActiveBannerOffers = (offers) => {
  if (!offers || !Array.isArray(offers)) {
    return []
  }

  const now = new Date()
  return offers.filter(offer => {
    const startDate = new Date(offer.startDate)
    const endDate = new Date(offer.endDate)
    return now >= startDate && now <= endDate
  })
}
