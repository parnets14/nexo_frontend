import React from 'react'
import { FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const SpecialOfferPopup = ({ offer, onClose }) => {
  const navigate = useNavigate()

  const handleOfferClick = () => {
    if (offer) {
      onClose()
      
      // For special offers, navigate to preventive-maintenance service
      if (offer.offerType === 'special_offer') {
        navigate(`/service/preventive-maintenance-services?offer=${offer.couponCode || ''}`)
      } else if (offer.targetService) {
        // For regular offers, navigate to target service
        navigate(`/service/${offer.targetService}?offer=${offer.couponCode || ''}`)
      }
    }
  }

  if (!offer) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
        >
          <FiX className="text-lg sm:text-xl text-slate-600" />
        </button>

        {/* Offer Image */}
        <div 
          className="cursor-pointer relative overflow-hidden"
          onClick={handleOfferClick}
        >
          <img
            src={offer.promotionalImage}
            alt={offer.offerTitle}
            className="w-full h-48 sm:h-auto object-cover hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay with offer details */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-2 leading-tight">{offer.offerTitle}</h3>
            {offer.originalPrice && offer.offerPrice && (
              <div className="flex items-center gap-2 sm:gap-4 text-white flex-wrap">
                <div className="text-xs sm:text-sm">
                  <span className="line-through opacity-75">₹{offer.originalPrice}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">₹{offer.offerPrice}</div>
                <div className="bg-green-500 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                  Save ₹{offer.originalPrice - offer.offerPrice}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-4 sm:p-6 text-center">
          <button
            onClick={handleOfferClick}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base"
          >
            Book Now - {offer.offerType === 'special_offer' ? 'Preventive Maintenance' : (offer.targetService ? offer.targetService.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Service')}
          </button>
          {offer.couponCode && (
            <p className="text-xs text-slate-500 mt-2">
              Use code: <span className="font-mono font-bold">{offer.couponCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpecialOfferPopup