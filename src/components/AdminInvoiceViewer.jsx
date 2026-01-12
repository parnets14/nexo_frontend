import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfessionalInvoice from './ProfessionalInvoice';
import { generateInvoiceFromBooking } from '../utils/invoiceGenerator';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/professional-invoice-print.css';

const AdminInvoiceViewer = () => {
  const [searchParams] = useSearchParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAdminAuth();

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        // Check if admin is authenticated
        if (!isAuthenticated || !token) {
          throw new Error('No admin authentication found. Please login again.');
        }

        // Use the new getBookingDetails function
        const response = await adminApi.getBookingDetails(token, bookingId);

        console.log('📋 Admin API Response:', response);
        
        const bookingData = response.booking || response.data || response;
        
        if (!bookingData) {
          throw new Error('Booking not found');
        }

        console.log('📋 Found Booking Data:', bookingData);
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
        console.log('  - isEmergency:', bookingData?.isEmergency);
        console.log('  - emergencyType:', bookingData?.emergencyType);
        console.log('  - emergencyCharge:', bookingData?.emergencyCharge);
        console.log('  - visitingCharge:', bookingData?.visitingCharge);
        console.log('  - serviceCharge:', bookingData?.serviceCharge);
        console.log('  - cgst:', bookingData?.cgst);
        console.log('  - sgst:', bookingData?.sgst);
        console.log('  - cgstAmount:', bookingData?.cgstAmount);
        console.log('  - sgstAmount:', bookingData?.sgstAmount);
        console.log('  - gstAmount:', bookingData?.gstAmount);
        console.log('  - subtotalBeforeTax:', bookingData?.subtotalBeforeTax);
        
        // Check if booking is nested
        if (bookingData?.booking) {
          console.log('🔍 Nested booking found:');
          console.log('  - booking.emergencyCharge:', bookingData.booking.emergencyCharge);
          console.log('  - booking.isEmergency:', bookingData.booking.isEmergency);
        }
        
        // Generate invoice from actual booking data
        const invoice = generateInvoiceFromBooking(bookingData);
        setInvoiceData(invoice);
      } catch (err) {
        setError(err.message || 'Failed to load booking data. Please check the booking ID and try again.');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handlePrint = () => {
    console.log('Admin invoice printed for booking:', bookingId);
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

export default AdminInvoiceViewer;