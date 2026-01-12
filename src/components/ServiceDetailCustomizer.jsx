import React from 'react'
import { motion } from 'framer-motion'

/**
 * ServiceDetailCustomizer - A wrapper component that allows custom UI designs
 * for specific services while preserving all existing functionality
 */
const ServiceDetailCustomizer = ({ 
  serviceName, 
  children, 
  customLayout = null,
  customHeroSection = null,
  customServiceSection = null,
  customPricingSection = null
}) => {
  // Check if this service has custom UI components
  const hasCustomLayout = customLayout && (serviceName === 'ac-service' || serviceName === 'ac-service-repair')
  
  if (hasCustomLayout) {
    return (
      <div className="service-detail-custom">
        {/* Custom Hero Section */}
        {customHeroSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {customHeroSection}
          </motion.div>
        )}
        
        {/* Custom Service Section */}
        {customServiceSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {customServiceSection}
          </motion.div>
        )}
        
        {/* Custom Pricing Section */}
        {customPricingSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {customPricingSection}
          </motion.div>
        )}
        
        {/* Render custom layout with all original functionality preserved */}
        {customLayout}
      </div>
    )
  }
  
  // Return original layout for all other services
  return children
}

export default ServiceDetailCustomizer