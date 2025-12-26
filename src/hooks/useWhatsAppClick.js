import { useComingSoon } from '../contexts/ComingSoonContext'

/**
 * Hook to intercept WhatsApp link clicks and show Coming Soon dialog
 * Usage: onClick={handleWhatsAppClick} or href={handleWhatsAppClick()}
 */
export const useWhatsAppClick = () => {
  const { openDialog } = useComingSoon()

  const handleClick = (e) => {
    e?.preventDefault?.()
    openDialog()
  }

  return handleClick
}

