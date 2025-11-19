import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaBars, FaTimes, FaUserCheck, FaSignInAlt } from 'react-icons/fa'
import { useHashNavigation } from '../utils/hashNavigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentHash, setCurrentHash] = useState('')
  const location = useLocation()
  const { handleHashClick } = useHashNavigation()
  const whatsappNumber = "919590926068"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track hash changes
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash)
    }
    
    // Initial hash
    updateHash()
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateHash)
    
    // Also check location.hash from React Router
    if (location.hash) {
      setCurrentHash(location.hash)
    }
    
    return () => {
      window.removeEventListener('hashchange', updateHash)
    }
  }, [location.hash])

  // Helper function to check if a link is active
  const isLinkActive = (linkPath) => {
    if (linkPath === '/') {
      return location.pathname === '/' && !location.hash && !currentHash
    }
    if (linkPath.startsWith('/#')) {
      const hash = linkPath.substring(2) // Remove '/#'
      // Check both React Router's location.hash and tracked currentHash
      const hashToCheck = location.hash || currentHash
      return location.pathname === '/' && (hashToCheck === `#${hash}` || hashToCheck === hash)
    }
    return location.pathname === linkPath
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/#services' },
    { name: 'Emergency Service', path: '/emergency' },
    { name: 'Material Store', path: '/materials' },
    { name: 'Partner Program', path: '/partner' },
    { name: 'AMC Plans', path: '/amc' },
    { name: 'Lead Marketplace', path: '/leads' },
    // { name: 'Admin Dashboard', path: '/admin-dashboard' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 w-full max-w-full overflow-x-hidden bg-white shadow-md ${
        scrolled
          ? 'shadow-lg'
          : ''
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(33, 74, 115, 0.1) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/">
                <Logo variant="default" />
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation - Large Screens */}
          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center max-w-4xl mx-4">
            {navLinks.map((link, index) => {
              const isActive = isLinkActive(link.path)
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {link.path.startsWith('/#') ? (
                    <a
                      href={link.path}
                      onClick={(e) => handleHashClick(e, link.path)}
                      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="navbar-indicator"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="navbar-indicator"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </nav>

          {/* Desktop Navigation - Medium Large Screens (lg to xl) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1 flex-1 justify-center max-w-3xl mx-2">
            {navLinks.slice(0, 5).map((link, index) => {
              const isActive = isLinkActive(link.path)
              return (
                link.path.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) => handleHashClick(e, link.path)}
                    className={`px-2 py-2 text-xs font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {link.name.length > 15 ? link.name.substring(0, 12) + '...' : link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-2 py-2 text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActive
                        ? 'text-primary'
                        : 'text-gray-700 hover:text-primary'
                    }`}
                  >
                    {link.name.length > 15 ? link.name.substring(0, 12) + '...' : link.name}
                  </Link>
                )
              )
            })}
          </nav>

          {/* Right Side - CTA Button */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Desktop Login Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="hidden lg:block"
            >
              <Link
                to="/partner/login"
                className="text-primary border-2 border-primary px-4 xl:px-5 py-2 xl:py-2.5 rounded-full hover:bg-primary hover:text-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2 text-xs xl:text-sm whitespace-nowrap"
              >
                <FaSignInAlt className="w-3 h-3 xl:w-4 xl:h-4" />
                <span className="hidden 2xl:inline">Login</span>
                <span className="2xl:hidden">Login</span>
              </Link>
            </motion.div>
            {/* Desktop CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden lg:block"
            >
              <Link
                to="/partner/onboard"
                className="bg-primary text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-full hover:bg-primary-dark transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 text-xs xl:text-sm whitespace-nowrap"
              >
                <FaUserCheck className="w-3 h-3 xl:w-4 xl:h-4" />
                <span className="hidden 2xl:inline">Become a Partner</span>
                <span className="2xl:hidden">Partner</span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none p-2 transition-colors duration-200 text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaTimes className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBars className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t border-gray-200 mt-2">
                {navLinks.map((link, index) => {
                  const isActive = isLinkActive(link.path)
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {link.path.startsWith('/#') ? (
                        <a
                          href={link.path}
                          onClick={(e) => {
                            handleHashClick(e, link.path)
                            setIsOpen(false)
                          }}
                          className={`block px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                          }`}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                          }`}
                        >
                          {link.name}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navLinks.length * 0.1 }}
                  className="pt-2 space-y-2"
                >
                  <Link
                    to="/partner/login"
                    onClick={() => setIsOpen(false)}
                    className="block mx-4 border-2 border-primary text-primary px-6 py-3 rounded-full text-center font-semibold shadow-md hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/partner/onboard"
                    onClick={() => setIsOpen(false)}
                    className="block mx-4 bg-primary text-white px-6 py-3 rounded-full text-center font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Become a Partner
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
