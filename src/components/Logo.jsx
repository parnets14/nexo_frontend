import React from 'react'
import { motion } from 'framer-motion'

const Logo = ({ className = "", variant = "default" }) => {
  const isLight = variant === "light"
  const iconColor = isLight ? "#FFFFFF" : "#214A73"
  const textColor = isLight ? "text-white" : "text-primary"
  const textSecondaryColor = isLight ? "text-white/80" : "text-primary/80"
  
  // Enhanced rotating animation with pulsing
  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      rotate: 360,
      scale: [1, 1.05, 1],
      transition: {
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    hover: {
      scale: 1.15,
      rotate: [0, 360],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  // Path animation with opacity and stroke effects
  const pathVariants = {
    initial: { opacity: 0.7 },
    animate: {
      opacity: [0.7, 1, 0.7],
      strokeWidth: [3, 3.5, 3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Center circle with pulsing and counter-rotation
  const circleVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.3, 1],
      rotate: -360,
      transition: {
        scale: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 5,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Stylized Knot */}
      <motion.div 
        className="relative w-12 h-12 flex items-center justify-center"
        variants={iconVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 4px rgba(33, 74, 115, 0.3))' }}
        >
          {/* Outer knot lines with animated effects */}
          <motion.path
            d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={pathVariants}
            initial="initial"
            animate="animate"
          />
          <motion.path
            d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={pathVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          />
          <motion.path
            d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={pathVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          />
          <motion.path
            d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={pathVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          />
          {/* Center circle with pulsing and counter-rotation */}
          <motion.circle 
            cx="24" 
            cy="24" 
            r="4" 
            fill={iconColor}
            variants={circleVariants}
            initial="initial"
            animate="animate"
            style={{ filter: 'drop-shadow(0 0 6px rgba(33, 74, 115, 0.6))' }}
          />
        </svg>
      </motion.div>
      {/* Brand Name */}
      <motion.div 
        className="flex flex-col"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.span 
          className={`text-2xl font-bold ${textColor}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          Nexo
        </motion.span>
        <motion.span 
          className={`text-xs ${textSecondaryColor} font-light`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Connect. Work. Grow.
        </motion.span>
      </motion.div>
    </div>
  )
}

export default Logo

