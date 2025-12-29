import React, { useEffect, useState } from 'react';
import Invoice from '../components/Invoice';
import CompactInvoice from '../components/CompactInvoice';
import SinglePageInvoice from '../components/SinglePageInvoice';
import '../styles/print.css';
import '../styles/single-page-print.css';

const InvoicePage = () => {
  const [layoutType, setLayoutType] = useState('single'); // 'single', 'compact', 'standard'

  // Sample invoice data - replace with actual data from your API
  const sampleInvoiceData = {
    invoiceNumber: 'TNT-BF11F6D5',
    date: '2025-12-27',
    status: 'CONFIRMED',
    customer: {
      name: 'Shubham',
      phone: '9031277796',
      email: 'shubchy14@gmail.com',
      address: 'Old Mysuru Road, Gopalpura, Bengaluru Central City Corporation, Bengaluru, Bangalore North, Bengaluru Urban, Karnataka, 560023, India',
      landmark: 'Gopalpura',
      pincode: '560023'
    },
    services: [
      {
        description: 'AC Inspection / Diagnosis',
        quantity: 1,
        rate: 1,
        amount: 1
      }
    ],
    paymentDetails: {
      bookingId: 'BF11F6D5',
      serviceDate: '2025-12-28',
      serviceTime: '10:00 AM',
      paymentMode: 'ONLINE',
      paymentStatus: 'COMPLETED',
      transactionId: 'TXN766814462972123KEN9'
    },
    companyDetails: {
      name: 'Professional Home Services Private Limited',
      cin: 'U74999KA2023PTC123456',
      gstin: '29ABCDE1234F1Z5',
      address: '#123, Tech Park, Whitefield',
      city: 'Bengaluru, Karnataka - 560066',
      phone: '+91-80-4567-8900',
      email: 'support@nexo.works',
      website: 'www.nexo.works'
    }
  };

  const handlePrint = () => {
    console.log('Invoice printed successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Layout Selection - Hidden during print */}
        <div className="mb-4 print:hidden text-center">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setLayoutType('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'single' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Single Page (Recommended)
            </button>
            <button
              onClick={() => setLayoutType('compact')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'compact' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setLayoutType('standard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'standard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Standard
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Current: {
              layoutType === 'single' ? 'Single Page (Guaranteed 1 page)' :
              layoutType === 'compact' ? 'Compact Layout' :
              'Standard Layout'
            }
          </p>
        </div>

        {layoutType === 'single' ? (
          <SinglePageInvoice 
            invoiceData={sampleInvoiceData} 
            onPrint={handlePrint}
          />
        ) : layoutType === 'compact' ? (
          <CompactInvoice 
            invoiceData={sampleInvoiceData} 
            onPrint={handlePrint}
          />
        ) : (
          <Invoice 
            invoiceData={sampleInvoiceData} 
            onPrint={handlePrint}
          />
        )}
      </div>
    </div>
  );
};

export default InvoicePage;