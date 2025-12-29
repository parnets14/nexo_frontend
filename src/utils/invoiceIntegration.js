/**
 * Integration utilities for invoice generation with existing booking system
 */

// Function to generate invoice URL for a booking
export const generateInvoiceUrl = (bookingId) => {
  return `/invoice?bookingId=${bookingId}`;
};

// Function to open invoice in new tab for printing
export const openInvoiceForPrint = (bookingId) => {
  const invoiceUrl = generateInvoiceUrl(bookingId);
  const printWindow = window.open(invoiceUrl, '_blank');
  
  // Auto-print when the page loads (optional)
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    });
  }
  
  return printWindow;
};

// Function to download invoice as PDF (requires html2canvas and jsPDF)
export const downloadInvoiceAsPDF = async (bookingId) => {
  try {
    // This would require additional libraries: html2canvas and jsPDF
    // npm install html2canvas jspdf
    
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    
    const invoiceUrl = generateInvoiceUrl(bookingId);
    const printWindow = window.open(invoiceUrl, '_blank');
    
    printWindow.addEventListener('load', async () => {
      const canvas = await html2canvas(printWindow.document.body);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`invoice-${bookingId}.pdf`);
      printWindow.close();
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    // Fallback to regular print
    openInvoiceForPrint(bookingId);
  }
};

// Function to add invoice button to booking cards/rows
export const InvoiceButton = ({ bookingId, variant = 'primary', size = 'sm' }) => {
  const handleClick = () => {
    openInvoiceForPrint(bookingId);
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      title="View & Print Invoice"
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Invoice
    </button>
  );
};

export default {
  generateInvoiceUrl,
  openInvoiceForPrint,
  downloadInvoiceAsPDF,
  InvoiceButton
};