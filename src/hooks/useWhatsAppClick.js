/**
 * Hook to redirect WhatsApp link clicks to the specified WhatsApp number
 * Usage: onClick={handleWhatsAppClick} or href={handleWhatsAppClick()}
 */
export const useWhatsAppClick = () => {
  const handleClick = (e, customMessage = "Hi, I need help with your services.") => {
    e?.preventDefault?.()
    
    // WhatsApp URL with the specified number
    const whatsappUrl = `https://wa.aisensy.com/+15558136145?text=${encodeURIComponent(customMessage)}`
    
    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return handleClick
}

