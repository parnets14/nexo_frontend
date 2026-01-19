import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa'

const ReviewCarousel = ({ reviews, variant = 'home' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return

    const timer = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex, isPaused, reviews.length])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.8,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  // Render home page variant (simple reviews)
  if (variant === 'home') {
    return (
      <div 
        className="relative max-w-7xl mx-auto px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)

                if (swipe < -swipeConfidenceThreshold) {
                  handleNext()
                } else if (swipe > swipeConfidenceThreshold) {
                  handlePrev()
                }
              }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {reviews.slice(currentIndex, currentIndex + 3).concat(
                reviews.slice(0, Math.max(0, currentIndex + 3 - reviews.length))
              ).slice(0, 3).map((review, idx) => (
                <motion.div
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-l-4 border-primary"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg mb-4 italic">"{review.text}"</p>
                  <p className="text-primary font-semibold">— {review.author}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {reviews.length > 3 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 group"
              aria-label="Previous reviews"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10 group"
              aria-label="Next reviews"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {reviews.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx * 3)}
                className={`transition-all duration-300 rounded-full ${
                  Math.floor(currentIndex / 3) === idx
                    ? 'bg-primary w-8 h-3'
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render service detail variant (detailed reviews)
  if (variant === 'service') {
    return (
      <div 
        className="relative max-w-7xl mx-auto px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x)

                if (swipe < -swipeConfidenceThreshold) {
                  handleNext()
                } else if (swipe > swipeConfidenceThreshold) {
                  handlePrev()
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {reviews.slice(currentIndex, currentIndex + 3).concat(
                reviews.slice(0, Math.max(0, currentIndex + 3 - reviews.length))
              ).slice(0, 3).map((review, idx) => (
                <motion.div
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-600 ml-1">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {(review.user?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {review.user?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {reviews.length > 3 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
              aria-label="Previous reviews"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
              aria-label="Next reviews"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {reviews.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx * 3)}
                className={`transition-all duration-300 rounded-full ${
                  Math.floor(currentIndex / 3) === idx
                    ? 'bg-primary w-8 h-3'
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

export default ReviewCarousel
