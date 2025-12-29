import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Invoice from './Invoice';
import CompactInvoice from './CompactInvoice';
import SinglePageInvoice from './SinglePageInvoice';
import { generateInvoiceFromBooking } from '../utils/invoiceGenerator';
import '../styles/print.css';
import '../styles/single-page-print.css';

const InvoiceViewer = () => {
  const [searchParams] = useSearchParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutType, setLayoutType] = useState('single'); // Default to single-page

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        // Replace this with your actual API call
        // const response = await fetch(`/api/bookings/${bookingId}`);
        // const bookingData = await response.json();
        
        // For now, using sample data - replace with actual API call
        const sampleBookingData = {
          bookingId: bookingId,
          customerName: 'Shubham',
          customerPhone: '9031277796',
          customerEmail: 'shubchy14@gmail.com',
          address: 'Old Mysuru Road, Gopalpura, Bengaluru Central City Corporation, Bengaluru, Bangalore North, Bengaluru Urban, Karnataka, 560023, India',
          landmark: 'Gopalpura',
          pincode: '560023',
          serviceName: 'AC Inspection / Diagnosis',
          totalAmount: 1,
          serviceDate: '2025-12-28',
          serviceTime: '10:00 AM',
          paymentMethod: 'ONLINE',
          paymentStatus: 'COMPLETED',
          transactionId: 'TXN766814462972123KEN9',
          status: 'confirmed',
          createdAt: '2025-12-27'
        };

        const invoice = generateInvoiceFromBooking(sampleBookingData);
        setInvoiceData(invoice);
      } catch (err) {
        setError('Failed to load booking data');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handlePrint = () => {
    console.log('Invoice printed for booking:', bookingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Invoice</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Layout Toggle - Hidden during print */}
        <div className="mb-4 print:hidden text-center">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setLayoutType('single')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'single' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Single Page
            </button>
            <button
              onClick={() => setLayoutType('compact')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'compact' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setLayoutType('standard')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'standard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Standard
            </button>
          </div>
        </div>

        {layoutType === 'single' ? (
          <SinglePageInvoice 
            invoiceData={invoiceData} 
            onPrint={handlePrint}
          />
        ) : layoutType === 'compact' ? (
          <CompactInvoice 
            invoiceData={invoiceData} 
            onPrint={handlePrint}
          />
        ) : (
          <Invoice 
            invoiceData={invoiceData} 
            onPrint={handlePrint}
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceViewer;