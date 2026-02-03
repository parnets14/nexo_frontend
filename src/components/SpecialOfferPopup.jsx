import React, { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const SpecialOfferPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [specialOffer, setSpecialOffer] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has seen popup before
    const hasSeenPopup = localStorage.getItem('nexo_special_offer_seen')
    
    if (!hasSeenPopup) {
      // Fetch active special offers
      fetchSpecialOffers()
    }
  }, [])

  const fetchSpecialOffers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`)
      const data = await response.json()
      
      if (data.success) {
        // Find active special offers with popup enabled
        const activeSpecialOffers = data.data.filter(offer => {
          const now = new Date()
          const startDate = new Date(offer.startDate)
          const endDate = new Date(offer.endDate)
          
          return offer.offerType === 'special_offer' && 
                 offer.isPopupEnabled && 
                 now >= startDate && 
                 now <= endDate
        })
        
        if (activeSpecialOffers.length > 0) {
          // Show the first active special offer
          setSpecialOffer(activeSpecialOffers[0])
          setShowPopup(true)
        }
      }
    } catch (error) {
      console.error('Error fetching special offers:', error)
    }
  }

  const handleOfferClick = () => {
    if (specialOffer && specialOffer.targetService) {
      // Mark popup as seen
      localStorage.setItem('nexo_special_offer_seen', 'true')
      setShowPopup(false)
      
      // Navigate to service page with offer parameter
      navigate(`/service/${specialOffer.targetService}?offer=${specialOffer.couponCode}`)
    }
  }

  const handleClosePopup = () => {
    // Mark popup as seen
    localStorage.setItem('nexo_special_offer_seen', 'true')
    setShowPopup(false)
  }

  if (!showPopup || !specialOffer) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClosePopup}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
        >
          <FiX className="text-xl text-slate-600" />
        </button>

        {/* Offer Image */}
        <div 
          className="cursor-pointer relative overflow-hidden"
          onClick={handleOfferClick}
        >
          <img
            src={specialOffer.promotionalImage}
            alt={specialOffer.offerTitle}
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay with offer details */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h3 className="text-white text-xl font-bold mb-2">{specialOffer.offerTitle}</h3>
            <div className="flex items-center gap-4 text-white">
              <div className="text-sm">
                <span className="line-through opacity-75">₹{specialOffer.originalPrice}</span>
              </div>
              <div className="text-2xl font-bold">₹{specialOffer.offerPrice}</div>
              <div className="bg-green-500 px-2 py-1 rounded text-sm font-medium">
                Save ₹{specialOffer.originalPrice - specialOffer.offerPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-6 text-center">
          <button
            onClick={handleOfferClick}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Book Now - {specialOffer.targetService.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Use code: <span className="font-mono font-bold">{specialOffer.couponCode}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SpecialOfferPopup