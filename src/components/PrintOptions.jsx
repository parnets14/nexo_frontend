import React, { useState } from 'react';
import { FiPrinter, FiDownload, FiSettings, FiFileText } from 'react-icons/fi';

const PrintOptions = ({ onPrint, invoiceData }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    margins: 'normal',
    colorMode: 'color',
    copies: 1
  });

  const handleQuickPrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const handlePrintWithSettings = () => {
    // Apply print settings before printing
    const printCSS = `
      @media print {
        @page {
          size: ${printSettings.paperSize} ${printSettings.orientation};
          margin: ${printSettings.margins === 'narrow' ? '0.2in' : printSettings.margins === 'wide' ? '0.8in' : '0.4in'};
        }
        body {
          ${printSettings.colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
        }
      }
    `;
    
    // Create temporary style element
    const styleElement = document.createElement('style');
    styleElement.textContent = printCSS;
    document.head.appendChild(styleElement);
    
    // Print
    window.print();
    
    // Remove temporary style
    document.head.removeChild(styleElement);
    
    if (onPrint) onPrint();
    setShowOptions(false);
  };

  const handleDownloadPDF = async () => {
    try {
      // This would require html2pdf.js library
      // For now, we'll use the browser's print to PDF functionality
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoiceData?.invoiceNumber}</title>
          <style>
            ${document.querySelector('style').textContent}
          </style>
        </head>
        <body>
          ${document.querySelector('.single-page-invoice').outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Please use your browser\'s "Print to PDF" option for PDF download.');
    }
  };

  const handleEmailInvoice = () => {
    const subject = `Invoice ${invoiceData?.invoiceNumber} - Nexo Services`;
    const body = `Dear ${invoiceData?.customer?.name},

Please find your invoice details below:

Invoice Number: ${invoiceData?.invoiceNumber}
Date: ${invoiceData?.date}
Amount: ₹${invoiceData?.services?.reduce((sum, service) => sum + (service.quantity * service.rate), 0) || 0}

Thank you for choosing Nexo Professional Home Services.

Best regards,
Nexo Team`;

    const mailtoLink = `mailto:${invoiceData?.customer?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="print:hidden">
      {/* Quick Print Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleQuickPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPrinter className="w-4 h-4 mr-2" />
          Quick Print
        </button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiSettings className="w-4 h-4 mr-2" />
          Print Options
        </button>
        
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload className="w-4 h-4 mr-2" />
          Save as PDF
        </button>
        
        <button
          onClick={handleEmailInvoice}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FiFileText className="w-4 h-4 mr-2" />
          Email Invoice
        </button>
      </div>

      {/* Print Options Panel */}
      {showOptions && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Print Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Paper Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Size
              </label>
              <select
                value={printSettings.paperSize}
                onChange={(e) => setPrintSettings({...printSettings, paperSize: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation
              </label>
              <select
                value={printSettings.orientation}
                onChange={(e) => setPrintSettings({...printSettings, orientation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margins
              </label>
              <select
                value={printSettings.margins}
                onChange={(e) => setPrintSettings({...printSettings, margins: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="narrow">Narrow (0.2 in)</option>
                <option value="normal">Normal (0.4 in)</option>
                <option value="wide">Wide (0.8 in)</option>
              </select>
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Mode
              </label>
              <select
                value={printSettings.colorMode}
                onChange={(e) => setPrintSettings({...printSettings, colorMode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="color">Color</option>
                <option value="grayscale">Grayscale</option>
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copies
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={printSettings.copies}
                onChange={(e) => setPrintSettings({...printSettings, copies: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Print Button */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() => setShowOptions(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrintWithSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Print with Settings
            </button>
          </div>
        </div>
      )}

      {/* Print Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Print Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use "Quick Print" for fastest printing with default settings</li>
          <li>• Select "Save as PDF" to create a digital copy</li>
          <li>• For best results, use A4 paper in portrait orientation</li>
          <li>• Enable "Print backgrounds" in your browser for proper colors</li>
        </ul>
      </div>
    </div>
  );
};

export default PrintOptions;