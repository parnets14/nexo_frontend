import React, { createContext, useContext, useState } from 'react'
import ComingSoonDialog from '../components/ComingSoonDialog'

const ComingSoonContext = createContext()

export const useComingSoon = () => {
  const context = useContext(ComingSoonContext)
  if (!context) {
    throw new Error('useComingSoon must be used within ComingSoonProvider')
  }
  return context
}

export const ComingSoonProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  return (
    <ComingSoonContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <ComingSoonDialog isOpen={isOpen} onClose={closeDialog} />
    </ComingSoonContext.Provider>
  )
}

