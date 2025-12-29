/**
 * Utility functions for generating invoice data from booking information
 */

export const generateInvoiceFromBooking = (booking) => {
  return {
    invoiceNumber: `TNT-${booking.bookingId || 'UNKNOWN'}`,
    date: booking.createdAt || new Date().toISOString(),
    status: booking.status === 'completed' ? 'COMPLETED' : 'CONFIRMED',
    customer: {
      name: booking.customerName || booking.customer?.name || 'N/A',
      phone: booking.customerPhone || booking.customer?.phone || 'N/A',
      email: booking.customerEmail || booking.customer?.email || 'N/A',
      address: booking.address || booking.customer?.address || 'N/A',
      landmark: booking.landmark || booking.customer?.landmark || 'N/A',
      pincode: booking.pincode || booking.customer?.pincode || 'N/A'
    },
    services: booking.services?.map(service => ({
      description: service.name || service.description || 'Service',
      quantity: service.quantity || 1,
      rate: service.price || service.rate || 0,
      amount: (service.quantity || 1) * (service.price || service.rate || 0)
    })) || [
      {
        description: booking.serviceName || 'Service',
        quantity: 1,
        rate: booking.totalAmount || 0,
        amount: booking.totalAmount || 0
      }
    ],
    paymentDetails: {
      bookingId: booking.bookingId || 'N/A',
      serviceDate: booking.serviceDate || booking.scheduledDate || new Date().toISOString(),
      serviceTime: booking.serviceTime || booking.scheduledTime || '10:00 AM',
      paymentMode: booking.paymentMethod || 'ONLINE',
      paymentStatus: booking.paymentStatus || 'COMPLETED',
      transactionId: booking.transactionId || booking.paymentId || 'N/A'
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
};

export const generateInvoiceNumber = (bookingId) => {
  const prefix = 'TNT';
  const suffix = bookingId ? bookingId.toString().toUpperCase() : 
    Math.random().toString(36).substr(2, 8).toUpperCase();
  return `${prefix}-${suffix}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const calculateInvoiceTotals = (services) => {
  const subtotal = services.reduce((sum, service) => {
    return sum + (service.quantity * service.rate);
  }, 0);
  
  // Add tax calculations here if needed
  const tax = 0; // 18% GST for example: subtotal * 0.18
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total
  };
};