import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Custom hook to handle hash navigation
 * Handles both same-page scrolling and cross-page navigation
 */
export const useHashNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleHashClick = (e, hashPath) => {
    e.preventDefault()
    
    // Extract hash from path (e.g., '/#services' -> '#services')
    const hash = hashPath.includes('#') ? hashPath.split('#')[1] : null
    
    if (!hash) {
      // No hash, just navigate normally
      navigate(hashPath)
      return
    }

    // If we're already on the home page, just scroll to the element
    if (location.pathname === '/') {
      // Update hash directly and trigger hashchange event
      window.location.hash = hash
      
      // Wait a bit for hash to update, then scroll
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        // Trigger hashchange event manually to update React Router
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }, 50)
    } else {
      // Navigate to home page with hash, React Router will handle it
      navigate(`/#${hash}`)
      
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          // Small delay to ensure page is rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }
      }, 100)
    }
  }

  return { handleHashClick }
}

