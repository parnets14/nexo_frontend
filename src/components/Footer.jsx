import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { motion } from 'framer-motion'
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { useWhatsAppClick } from '../hooks/useWhatsAppClick'
import { useHashNavigation } from '../utils/hashNavigation'

const Footer = () => {
  const whatsappNumber = "+15558136145"
  const handleWhatsAppClick = useWhatsAppClick()
  const { handleHashClick } = useHashNavigation()

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/#about' },
      { name: 'Services', path: '/#services' },
      { name: 'Partner Program', path: '/partner' },
      { name: 'User Login', path: '/user/login' },
      { name: 'Partner Login', path: '/partner/login' },
      { name: 'Vendor Login', path: '/vendor/login' },
      { name: 'AMC Plans', path: '/amc' },
    ],
    legal: [
      { name: 'Customer Terms', path: '/terms' },
      { name: 'Partner Terms', path: '/partner-terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Customer Refund Policy', path: '/refund-policy' },
      { name: 'Partner Refund Policy', path: '/partner-refund-policy' },
    ],
    resources: [
      { name: 'Lead Marketplace', path: '/leads' },
      // { name: 'Material Store', path: '/materials' },
      { name: 'Emergency Service', path: '/emergency' },
      { name: 'Brand Partnerships', path: '/brand-partnerships' },
    ],
  }

  const socialLinks = [
    { icon: FaFacebook, href: '#', name: 'Facebook' },
    { icon: FaTwitter, href: '#', name: 'Twitter' },
    { icon: FaInstagram, href: '#', name: 'Instagram' },
    { icon: FaLinkedin, href: '#', name: 'LinkedIn' },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white overflow-hidden pb-20 sm:pb-24">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Animated Particles - Small */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`small-${i}`}
          className="absolute rounded-full z-0"
          style={{
            width: `${6 + (i % 3) * 2}px`,
            height: `${6 + (i % 3) * 2}px`,
            left: `${5 + (i * 7) % 90}%`,
            top: `${10 + (i * 6) % 80}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, (i % 2 === 0 ? 20 : -20), 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 7 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Animated Particles - Medium */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`medium-${i}`}
          className="absolute rounded-full blur-sm z-0"
          style={{
            width: `${12 + (i % 2) * 4}px`,
            height: `${12 + (i % 2) * 4}px`,
            left: `${8 + (i * 9) % 85}%`,
            top: `${12 + (i * 8) % 75}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, (i % 2 === 0 ? 30 : -30), 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: 8 + (i % 3) * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Animated Particles - Large */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className="absolute rounded-full blur-md z-0"
          style={{
            width: `${20 + (i % 2) * 8}px`,
            height: `${20 + (i % 2) * 8}px`,
            left: `${10 + (i * 15) % 80}%`,
            top: `${15 + (i * 12) % 70}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, (i % 2 === 0 ? 40 : -40), 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 10 + (i % 3) * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Logo and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="col-span-1 lg:col-span-2"
          >
            <Logo className="mb-4" variant="light" />
            <p className="text-sm sm:text-base text-white/80 mt-4 mb-6 max-w-md">
              Fast, reliable, and affordable home services. Connect with verified experts on WhatsApp.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {/* <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center gap-3 text-white/80 hover:text-[#25D366] transition-colors duration-200"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span className="text-sm sm:text-base">+91 {whatsappNumber.slice(2)}</span>
              </motion.button> */}
              <motion.a
                href="mailto:support@nexo.works"
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center gap-3 text-white/80 hover:text-yellow-300 transition-colors duration-200"
              >
                <FaEnvelope className="w-5 h-5" />
                <span className="text-sm sm:text-base">support@nexo.works</span>
              </motion.a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-yellow-300 hover:bg-white/20 transition-all duration-300"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 sm:mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {link.path.startsWith('/#') ? (
                    <a
                      href={link.path}
                      onClick={(e) => handleHashClick(e, link.path)}
                      className="text-sm sm:text-base text-white/80 hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-yellow-300 transition-all duration-200"></span>
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-sm sm:text-base text-white/80 hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-yellow-300 transition-all duration-200"></span>
                      {link.name}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 sm:mb-6">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className="text-sm sm:text-base text-white/80 hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-yellow-300 transition-all duration-200"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 sm:mb-6">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className="text-sm sm:text-base text-white/80 hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-yellow-300 transition-all duration-200"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* WhatsApp CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-white/20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-white font-semibold text-lg mb-2">Need Help? Chat with us on WhatsApp</p>
              <p className="text-white/80 text-sm sm:text-base">Get instant support 24/7</p>
            </div>
            <motion.button
              onClick={handleWhatsAppClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#25D366] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-[#25D366]/50 transition-all duration-300 flex items-center gap-2"
            >
              <FaWhatsapp className="w-5 h-5" />
              Chat on WhatsApp
            </motion.button>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/20 mt-8 pt-8 text-center"
        >
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} <a href='https://parnetsgroup.com' target='_blank' rel='noopener noreferrer' className='hover:text-white transition-colors'><span style={{ color: '#2a017d' }}>Par</span><span style={{ color: '#f65c0d' }}>Nets</span> Software India PVT LTD</a>. All rights reserved. | Connect. Work. Grow 
            
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

