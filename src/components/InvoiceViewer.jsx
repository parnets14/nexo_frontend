import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfessionalInvoice from './ProfessionalInvoice';
import { generateInvoiceFromBooking } from '../utils/invoiceGenerator';
import '../styles/professional-invoice-print.css';

const InvoiceViewer = () => {
  const [searchParams] = useSearchParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        // Get user token from localStorage (same as MyBookings)
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        // Fetch actual booking data from API using axios (same pattern as MyBookings)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/bookings/${bookingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch booking: ${response.status}`);
        }

        const result = await response.json();
        console.log('📋 Full API Response:', result);
        console.log('📋 Response keys:', Object.keys(result));
        
        const bookingData = result.booking || result.data || result;
        console.log('📋 Extracted Booking Data:', bookingData);
        console.log('📋 Booking Data keys:', Object.keys(bookingData || {}));
        
        // Log specific fields we're looking for
        console.log('🔍 Field Analysis:');
        console.log('  - customerDetails:', bookingData?.customerDetails);
        console.log('  - location:', bookingData?.location);
        console.log('  - txnid:', bookingData?.txnid);
        console.log('  - paymentDetails:', bookingData?.paymentDetails);
        console.log('  - scheduledDate:', bookingData?.scheduledDate);
        console.log('  - scheduledTime:', bookingData?.scheduledTime);
        console.log('  - serviceName:', bookingData?.serviceName);
        console.log('  - totalAmount:', bookingData?.totalAmount);
        
        // Generate invoice from actual booking data only
        const invoice = generateInvoiceFromBooking(bookingData);
        setInvoiceData(invoice);
      } catch (err) {
        setError('Failed to load booking data. Please check the booking ID and try again.');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 flex justify-center">
        <ProfessionalInvoice 
          invoiceData={invoiceData} 
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
};

export default InvoiceViewer;