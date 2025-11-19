import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PageLoader = () => {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  
  // Generate stable random values for motion balls
  const [motionBalls] = useState(() => {
    const smallBalls = Array.from({ length: 20 }, (_, i) => ({
      size: i < 5 
        ? Math.random() * 20 + 15 // Smaller size for visible balls (15-35px)
        : Math.random() * 60 + 30, // Normal size for blurred balls (30-90px)
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 2,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      opacity: Math.random() * 0.3 + 0.2,
      isVisible: i < 5, // First 5 small balls are fully visible, rest are blurred
      x1: Math.random() * 200 - 100,
      x2: Math.random() * 200 - 100,
      x3: Math.random() * 200 - 100,
      x4: Math.random() * 200 - 100,
      y1: Math.random() * 200 - 100,
      y2: Math.random() * 200 - 100,
      y3: Math.random() * 200 - 100,
      y4: Math.random() * 200 - 100,
      scale1: Math.random() * 0.5 + 1.2,
      scale2: Math.random() * 0.5 + 0.8
    }))
    
    const mediumBalls = Array.from({ length: 12 }, (_, i) => ({
      size: Math.random() * 100 + 80,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 2.5,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      opacity: Math.random() * 0.25 + 0.15,
      isVisible: i < 4, // First 4 medium balls are fully visible
      x1: Math.random() * 250 - 125,
      x2: Math.random() * 250 - 125,
      x3: Math.random() * 250 - 125,
      x4: Math.random() * 250 - 125,
      y1: Math.random() * 250 - 125,
      y2: Math.random() * 250 - 125,
      y3: Math.random() * 250 - 125,
      y4: Math.random() * 250 - 125,
      scale1: Math.random() * 0.5 + 1.25,
      scale2: Math.random() * 0.5 + 0.75
    }))
    
    const largeBalls = Array.from({ length: 8 }, () => ({
      size: Math.random() * 150 + 100,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 3,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      opacity: Math.random() * 0.2 + 0.1,
      isVisible: false, // Large balls stay blurred for depth
      x1: Math.random() * 300 - 150,
      x2: Math.random() * 300 - 150,
      x3: Math.random() * 300 - 150,
      y1: Math.random() * 300 - 150,
      y2: Math.random() * 300 - 150,
      y3: Math.random() * 300 - 150,
      scale1: Math.random() * 0.4 + 1.3,
      scale2: Math.random() * 0.4 + 0.7
    }))
    
    return { smallBalls, mediumBalls, largeBalls }
  })

  useEffect(() => {
    // Detect network speed
    let detectedSpeed = 'normal'
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          detectedSpeed = 'slow'
        } else if (effectiveType === '3g') {
          detectedSpeed = 'medium'
        }
      }
    }

    let progressInterval
    let timeout
    let minDisplayTime

    // Calculate timeout based on network speed
    const maxWaitTime = detectedSpeed === 'slow' ? 8000 : detectedSpeed === 'medium' ? 6000 : 5000
    const minDisplayTimeMs = detectedSpeed === 'slow' ? 2000 : 1500

    // Simulate loading progress with network-aware increments
    const progressIncrement = detectedSpeed === 'slow' ? 5 : detectedSpeed === 'medium' ? 10 : 15
    const progressIntervalTime = detectedSpeed === 'slow' ? 300 : detectedSpeed === 'medium' ? 250 : 200

    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return Math.min(prev + Math.random() * progressIncrement, 90)
      })
    }, progressIntervalTime)

    // Track resource loading
    const checkResourcesLoaded = () => {
      const images = document.querySelectorAll('img')
      const totalImages = images.length
      let loadedImages = 0

      if (totalImages === 0) {
        return true
      }

      images.forEach((img) => {
        if (img.complete) {
          loadedImages++
        } else {
          img.addEventListener('load', () => {
            loadedImages++
            if (loadedImages === totalImages) {
              setProgress(95)
            }
          })
          img.addEventListener('error', () => {
            loadedImages++
            if (loadedImages === totalImages) {
              setProgress(95)
            }
          })
        }
      })

      return loadedImages === totalImages
    }

    // Wait for all resources to load
    const handleLoad = () => {
      // Ensure minimum display time for smooth UX
      minDisplayTime = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setLoading(false)
        }, 500)
      }, minDisplayTimeMs)
    }

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      const resourcesLoaded = checkResourcesLoaded()
      if (resourcesLoaded) {
        handleLoad()
      } else {
        // Wait a bit more for images
        setTimeout(() => {
          handleLoad()
        }, 500)
      }
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          handleLoad()
        }, 300)
      })
    }

    // Fallback timeout for very slow networks
    timeout = setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }, maxWaitTime)

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (timeout) clearTimeout(timeout)
      if (minDisplayTime) clearTimeout(minDisplayTime)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.1, 1],
      opacity: 1,
      rotate: [0, 360],
      transition: {
        scale: {
          duration: 1,
          ease: "easeOut"
        },
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  }

  const pathVariants = {
    animate: {
      opacity: [0.6, 1, 0.6],
      strokeWidth: [3, 3.5, 3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const circleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const containerVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary via-primary-dark to-primary flex flex-col items-center justify-center"
          variants={containerVariants}
          initial="initial"
          exit="exit"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            />
          </div>

          {/* Animated Motion Balls - Small */}
          {motionBalls.smallBalls.map((ball, i) => (
            <motion.div
              key={`small-${i}`}
              className={`absolute rounded-full pointer-events-none ${
                ball.isVisible 
                  ? 'bg-white/20 backdrop-blur-sm border border-white/30' 
                  : 'bg-white/50 blur-2xl'
              }`}
              style={{
                width: `${ball.size}px`,
                height: `${ball.size}px`,
                left: `${ball.startX}%`,
                top: `${ball.startY}%`,
                opacity: ball.isVisible ? 0.4 : ball.opacity,
                zIndex: ball.isVisible ? 2 : 1,
                filter: ball.isVisible 
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' 
                  : 'blur(40px)',
                WebkitFilter: ball.isVisible 
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' 
                  : 'blur(40px)',
                boxShadow: ball.isVisible 
                  ? 'inset 0 0 20px rgba(255,255,255,0.1), 0 0 15px rgba(255,255,255,0.2)' 
                  : 'none'
              }}
              animate={{
                x: [ball.x1, ball.x2, ball.x3, ball.x4, ball.x1],
                y: [ball.y1, ball.y2, ball.y3, ball.y4, ball.y1],
                scale: [1, ball.scale1, 1, ball.scale2, 1]
              }}
              transition={{
                duration: ball.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: ball.delay,
                repeatType: "loop"
              }}
            />
          ))}
          
          {/* Animated Motion Balls - Medium */}
          {motionBalls.mediumBalls.map((ball, i) => (
            <motion.div
              key={`medium-${i}`}
              className={`absolute rounded-full pointer-events-none ${
                ball.isVisible 
                  ? 'bg-white/20 backdrop-blur-sm border border-white/30' 
                  : 'bg-white/45 blur-2xl'
              }`}
              style={{
                width: `${ball.size}px`,
                height: `${ball.size}px`,
                left: `${ball.startX}%`,
                top: `${ball.startY}%`,
                opacity: ball.isVisible ? 0.35 : ball.opacity,
                zIndex: ball.isVisible ? 2 : 1,
                filter: ball.isVisible 
                  ? 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' 
                  : 'blur(50px)',
                WebkitFilter: ball.isVisible 
                  ? 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' 
                  : 'blur(50px)',
                boxShadow: ball.isVisible 
                  ? 'inset 0 0 25px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.2)' 
                  : 'none'
              }}
              animate={{
                x: [ball.x1, ball.x2, ball.x3, ball.x4, ball.x1],
                y: [ball.y1, ball.y2, ball.y3, ball.y4, ball.y1],
                scale: [1, ball.scale1, 1, ball.scale2, 1]
              }}
              transition={{
                duration: ball.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: ball.delay,
                repeatType: "loop"
              }}
            />
          ))}
          
          {/* Animated Motion Balls - Large */}
          {motionBalls.largeBalls.map((ball, i) => (
            <motion.div
              key={`large-${i}`}
              className="absolute rounded-full bg-white/35 blur-3xl pointer-events-none"
              style={{
                width: `${ball.size}px`,
                height: `${ball.size}px`,
                left: `${ball.startX}%`,
                top: `${ball.startY}%`,
                opacity: ball.opacity,
                zIndex: 0,
                filter: 'blur(80px)',
                WebkitFilter: 'blur(80px)'
              }}
              animate={{
                x: [ball.x1, ball.x2, ball.x3, ball.x1],
                y: [ball.y1, ball.y2, ball.y3, ball.y1],
                scale: [1, ball.scale1, 1, ball.scale2, 1]
              }}
              transition={{
                duration: ball.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: ball.delay,
                repeatType: "loop"
              }}
            />
          ))}

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Logo Icon */}
            <motion.div
              className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6"
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer knot lines */}
                <motion.path
                  d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  variants={pathVariants}
                  animate="animate"
                />
                <motion.path
                  d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  variants={pathVariants}
                  animate="animate"
                  transition={{ delay: 0.2 }}
                />
                <motion.path
                  d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  variants={pathVariants}
                  animate="animate"
                  transition={{ delay: 0.4 }}
                />
                <motion.path
                  d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  variants={pathVariants}
                  animate="animate"
                  transition={{ delay: 0.6 }}
                />
                {/* Center circle */}
                <motion.circle
                  cx="24"
                  cy="24"
                  r="4"
                  fill="#FFFFFF"
                  variants={circleVariants}
                  animate="animate"
                />
              </svg>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                Nexo
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-light">
                Connect. Work. Grow.
              </p>
            </motion.div>

            {/* Loading Progress Bar */}
            <div className="w-64 sm:w-80 max-w-md mx-auto">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <motion.p
                className="text-white/60 text-xs sm:text-sm mt-3 text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {progress < 50 ? 'Loading...' : progress < 90 ? 'Almost there...' : 'Ready!'}
              </motion.p>
            </div>
          </div>

          {/* Tool Icons */}
          <div className="absolute inset-0 pointer-events-none z-5">
            {/* Wrench Icon */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 15, -15, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </motion.div>

            {/* Hammer Icon */}
            <motion.div
              className="absolute top-1/3 right-1/4 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -10, 10, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9" />
                <path d="M17.64 15L22 10.64" />
                <path d="M20.91 11.7l-2.25-2.25L15.64 12l-1.5-1.5 3.06-3.06-2.25-2.25L12 7.36l-1.5-1.5 2.81-2.81-2.25-2.25L7.36 3l-1.5-1.5L9.38.14l-2.25-2.25L4.5 1.5" />
              </svg>
            </motion.div>

            {/* Paint Brush Icon */}
            <motion.div
              className="absolute bottom-1/3 left-1/3 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                x: [0, 15, 0],
                rotate: [0, 20, -20, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.06 2.57c-1.18-.59-2.65-.15-3.44.99l-.57.8c-.28.4-.28.95 0 1.35l5.18 7.27c.28.4.78.4 1.06 0l5.18-7.27c.28-.4.28-.95 0-1.35l-.57-.8c-.79-1.14-2.26-1.58-3.44-.99L9.06 2.57z" />
                <path d="M12 18v4" />
                <path d="M9 22h6" />
              </svg>
            </motion.div>

            {/* Screwdriver Icon */}
            <motion.div
              className="absolute bottom-1/4 right-1/3 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -15, 15, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 3v3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V3" />
                <path d="M12 21v-9" />
                <path d="M9 21v-6" />
                <path d="M15 21v-6" />
                <path d="M9 3h6" />
              </svg>
            </motion.div>

            {/* Toolbox Icon */}
            <motion.div
              className="absolute top-1/2 left-1/5 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                x: [0, -10, 0],
                y: [0, 10, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-3V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                <path d="M9 6v1" />
                <path d="M15 6v1" />
              </svg>
            </motion.div>

            {/* Drill Icon */}
            <motion.div
              className="absolute top-2/3 right-1/5 w-8 h-8 sm:w-10 sm:h-10 text-white/40"
              animate={{
                rotate: [0, 360],
                x: [0, 10, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                delay: 2.5
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M8 6h8" />
                <path d="M8 18h8" />
                <path d="M12 6l-4 4h8l-4-4z" />
                <path d="M12 18l-4-4h8l-4 4z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </motion.div>
          </div>

          {/* Loading Spinner (Backup) */}
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageLoader

