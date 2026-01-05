import { FiPrinter } from 'react-icons/fi';

const PrintOptions = ({ onPrint, invoiceData }) => {

  const handlePrintInNewWindow = () => {
    // Get the invoice content
    const invoiceElement = document.querySelector('.invoice-container');
    if (!invoiceElement) {
      alert('Invoice content not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Write the HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceData?.invoiceNumber || 'Invoice'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @page {
              margin: 0.2in;
              size: A4;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 9px;
              line-height: 1.2;
              color: #000;
              background: white;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            
            .invoice-container {
              max-width: 100%;
              margin: 0 auto;
              padding: 15px;
              background: white;
              transform: scale(0.9);
              transform-origin: top center;
              width: 111%;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 8px;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 3px 5px;
              text-align: left;
              line-height: 1.2;
            }
            
            /* Logo and image styling */
            img {
              max-width: 100% !important;
              height: auto !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              object-fit: contain !important;
            }
            
            .object-contain {
              object-fit: contain;
            }
            
            .bg-gray-800 {
              background-color: #1f2937 !important;
              color: white !important;
            }
            
            .bg-blue-600 {
              background-color: #2563eb !important;
              color: white !important;
            }
            
            .text-blue-600 {
              color: #2563eb !important;
            }
            
            .text-green-600 {
              color: #059669 !important;
            }
            
            .bg-blue-100 {
              background-color: #dbeafe !important;
            }
            
            .text-blue-800 {
              color: #1e40af !important;
            }
            
            .bg-green-100 {
              background-color: #dcfce7 !important;
            }
            
            .text-green-800 {
              color: #166534 !important;
            }
            
            .font-bold {
              font-weight: bold;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-right {
              text-align: right;
            }
            
            .flex {
              display: flex;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .items-center {
              align-items: center;
            }
            
            .items-start {
              align-items: flex-start;
            }
            
            .flex-1 {
              flex: 1 1 0%;
            }
            
            .flex-shrink-0 {
              flex-shrink: 0;
            }
            
            .justify-end {
              justify-content: flex-end;
            }
            
            .ml-auto {
              margin-left: auto;
            }
            
            .w-80 {
              width: 20rem;
            }
            
            .min-w-0 {
              min-width: 0px;
            }
            
            /* Center the main content */
            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            
            .mb-1 { margin-bottom: 0.15rem; }
            .mb-2 { margin-bottom: 0.3rem; }
            .mb-3 { margin-bottom: 0.45rem; }
            .mb-4 { margin-bottom: 0.6rem; }
            .mb-6 { margin-bottom: 0.9rem; }
            
            .mt-1 { margin-top: 0.15rem; }
            .mt-2 { margin-top: 0.3rem; }
            .mt-3 { margin-top: 0.45rem; }
            
            .p-3 { padding: 0.45rem; }
            .p-4 { padding: 0.6rem; }
            .p-6 { padding: 0.9rem; }
            .px-2 { padding-left: 0.3rem; padding-right: 0.3rem; }
            .px-3 { padding-left: 0.45rem; padding-right: 0.45rem; }
            .py-1 { padding-top: 0.15rem; padding-bottom: 0.15rem; }
            .py-2 { padding-top: 0.3rem; padding-bottom: 0.3rem; }
            
            .border { border: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-full { border-radius: 9999px; }
            
            .w-12 { width: 3rem; }
            .h-12 { height: 3rem; }
            
            .text-xs { font-size: 0.7rem; line-height: 1.2; }
            .text-sm { font-size: 0.8rem; line-height: 1.2; }
            .text-lg { font-size: 1rem; line-height: 1.2; }
            .text-xl { font-size: 1.1rem; line-height: 1.2; }
            .text-2xl { font-size: 1.3rem; line-height: 1.2; }
            .text-3xl { font-size: 1.5rem; line-height: 1.2; }
            
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-4 { gap: 0.6rem; }
            .gap-6 { gap: 0.9rem; }
            
            .space-y-1 > * + * { margin-top: 0.15rem; }
            .space-y-2 > * + * { margin-top: 0.3rem; }
            
            /* Compact specific elements */
            .w-12 { width: 2.5rem; }
            .h-12 { height: 2.5rem; }
            
            /* Force single page */
            * {
              page-break-inside: avoid !important;
            }
            
            .invoice-container {
              page-break-inside: avoid !important;
              max-height: 95vh !important;
              overflow: hidden !important;
            }
            
            @media print {
              body { 
                font-size: 8px; 
                margin: 0;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }
              .invoice-container { 
                padding: 10px;
                transform: scale(0.88);
                transform-origin: top center;
                width: 113.6%;
                margin: 0 auto;
              }
              
              table {
                font-size: 7px;
              }
              
              th, td {
                padding: 2px 3px;
              }
              
              .mb-6 { margin-bottom: 0.6rem !important; }
              .mb-4 { margin-bottom: 0.4rem !important; }
              .mb-3 { margin-bottom: 0.3rem !important; }
              .mb-2 { margin-bottom: 0.2rem !important; }
              .mb-1 { margin-bottom: 0.1rem !important; }
              
              .p-6 { padding: 0.6rem !important; }
              .p-4 { padding: 0.4rem !important; }
              .p-3 { padding: 0.3rem !important; }
            }
          </style>
        </head>
        <body>
          <div style="max-height: 100vh; overflow: hidden; page-break-inside: avoid;">
            ${invoiceElement.outerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
    
    if (onPrint) onPrint();
  };

  return (
    <div className="print:hidden">
      {/* Print Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handlePrintInNewWindow}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPrinter className="w-4 h-4 mr-2" />
          Print Invoice
        </button>
      </div>

      {/* Print Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Print Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click "Print Invoice" to open and print the invoice</li>
          <li>• For best results, use A4 paper in portrait orientation</li>
          <li>• Enable "Print backgrounds" in your browser for proper colors</li>
          <li>• The invoice is optimized for single-page printing</li>
        </ul>
      </div>
    </div>
  );
};

export default PrintOptions;