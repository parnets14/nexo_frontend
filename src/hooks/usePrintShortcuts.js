import { useEffect } from 'react';

/**
 * Custom hook for print keyboard shortcuts
 */
export const usePrintShortcuts = (onPrint) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+P or Cmd+P for print
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        if (onPrint) {
          onPrint();
        } else {
          window.print();
        }
      }
      
      // Ctrl+Shift+P for print options
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        // Trigger print options modal
        const printOptionsButton = document.querySelector('[data-print-options]');
        if (printOptionsButton) {
          printOptionsButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrint]);
};

export default usePrintShortcuts;