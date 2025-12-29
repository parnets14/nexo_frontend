/**
 * Advanced print utilities for invoice system
 */

// Print with custom settings
export const printWithSettings = (settings = {}) => {
  const {
    paperSize = 'A4',
    orientation = 'portrait',
    margins = 'normal',
    colorMode = 'color',
    copies = 1
  } = settings;

  // Create dynamic print styles
  const printCSS = `
    @media print {
      @page {
        size: ${paperSize} ${orientation};
        margin: ${getMarginValue(margins)};
      }
      
      body {
        ${colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .print\\:hidden {
        display: none !important;
      }
    }
  `;

  // Apply styles and print
  const styleElement = document.createElement('style');
  styleElement.textContent = printCSS;
  document.head.appendChild(styleElement);

  // Print multiple copies if needed
  for (let i = 0; i < copies; i++) {
    setTimeout(() => {
      window.print();
    }, i * 1000);
  }

  // Cleanup
  setTimeout(() => {
    document.head.removeChild(styleElement);
  }, 2000);
};

// Get margin value based on setting
const getMarginValue = (margins) => {
  switch (margins) {
    case 'narrow': return '0.2in';
    case 'wide': return '0.8in';
    default: return '0.4in';
  }
};

// Print preview in new window
export const printPreview = (invoiceHTML, settings = {}) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Preview</title>
      <style>
        ${getPreviewStyles(settings)}
      </style>
    </head>
    <body>
      <div class="preview-controls">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
      ${invoiceHTML}
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Get preview styles
const getPreviewStyles = (settings) => {
  return `
    body { font-family: Arial, sans-serif; margin: 20px; }
    .preview-controls { 
      position: fixed; 
      top: 10px; 
      right: 10px; 
      z-index: 1000;
      background: white;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .preview-controls button {
      margin: 0 5px;
      padding: 5px 10px;
      border: 1px solid #007bff;
      background: #007bff;
      color: white;
      border-radius: 3px;
      cursor: pointer;
    }
    @media print {
      .preview-controls { display: none; }
    }
  `;
};

export default {
  printWithSettings,
  printPreview
};