/**
 * Utility functions for generating invoice data from booking information
 */

// Generate clean sequential invoice numbers
const generateCleanInvoiceNumber = (bookingId) => {
  console.log('🔢 Generating invoice number from:', bookingId);
  
  if (!bookingId) {
    console.warn('⚠️ No booking ID provided, using URL booking ID');
    // Try to get booking ID from URL as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const urlBookingId = urlParams.get('bookingId');
    if (urlBookingId) {
      bookingId = urlBookingId;
      console.log('🔢 Using URL booking ID:', bookingId);
    } else {
      throw new Error('Booking ID is required to generate invoice number');
    }
  }
  
  // If bookingId is already in NEXO format, use it
  if (bookingId.startsWith('NEXO')) {
    return bookingId;
  }
  
  // Extract last 6 characters from booking ID and convert to number
  const idSuffix = bookingId.slice(-6);
  const numericId = parseInt(idSuffix, 16) % 999999 + 1; // Convert hex to number and ensure it's within range
  return `NEXO${numericId.toString().padStart(5, '0')}`;
};

// Generate clean booking ID format
const generateCleanBookingId = (originalId) => {
  console.log('🔢 Generating booking ID from:', originalId);
  
  if (!originalId) {
    console.warn('⚠️ No original ID provided, using URL booking ID');
    // Try to get booking ID from URL as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const urlBookingId = urlParams.get('bookingId');
    if (urlBookingId) {
      originalId = urlBookingId;
      console.log('🔢 Using URL booking ID:', originalId);
    } else {
      throw new Error('Original ID is required to generate booking ID');
    }
  }
  
  // If originalId is already in NEXO format, use it
  if (originalId.startsWith('NEXO')) {
    return originalId;
  }
  
  // Extract last 6 characters and convert to a clean format
  const idSuffix = originalId.slice(-6);
  const numericId = parseInt(idSuffix, 16) % 999999 + 1;
  return `NEXO${numericId.toString().padStart(5, '0')}`;
};

export const generateInvoiceFromBooking = (booking) => {
  // Validate that booking data exists
  if (!booking) {
    throw new Error('Booking data is required to generate invoice');
  }

  console.log('📋 Processing booking data:', booking);
  console.log('📋 Quotations in booking:', booking.quotations);
  console.log('📋 Accepted quotation:', booking.acceptedQuotation);

  // Try multiple possible ID fields
  const possibleIds = [
    booking.bookingId,
    booking._id,
    booking.id,
    booking.bookingNumber,
    booking.orderNumber,
    booking.referenceId
  ];

  const bookingId = possibleIds.find(id => id && id.toString().trim()) || null;
  console.log('🔍 Found booking ID:', bookingId);

  const cleanInvoiceNumber = generateCleanInvoiceNumber(bookingId);
  const cleanBookingId = generateCleanBookingId(bookingId);

  // Helper function to safely convert values to strings
  const safeString = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // If it's an object, try to extract meaningful string representation
      if (value.address && value.landmark && value.pincode) {
        return `${value.address}, ${value.landmark}, ${value.pincode}`;
      }
      if (value.street || value.city || value.state) {
        return [value.street, value.city, value.state, value.country].filter(Boolean).join(', ');
      }
      // If it's an object but we can't extract address, return JSON string
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Enhanced field extraction with more variations
  const extractField = (booking, fieldPaths, fallback = '') => {
    for (const path of fieldPaths) {
      const keys = path.split('.');
      let value = booking;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = null;
          break;
        }
      }
      
      if (value !== null && value !== undefined && value !== '') {
        return safeString(value, fallback);
      }
    }
    return fallback;
  };

  // Check for accepted quotation
  const quotation = booking.acceptedQuotation || 
                    (booking.quotations && booking.quotations.find(q => q.customerStatus === 'accepted'));

  console.log('📋 [invoiceGenerator] Quotation search result:', {
    hasAcceptedQuotation: !!booking.acceptedQuotation,
    quotationsArray: booking.quotations?.length || 0,
    foundQuotation: !!quotation,
    quotationAmount: quotation?.totalAmount || 0,
    quotationNumber: quotation?.quotationNumber || 'N/A'
  });

  // Build services array - include both booking service and quotation items
  let services = [];
  
  // Add main booking service if exists
  if (booking.serviceName || booking.service || booking.subService) {
    services.push({
      description: extractField(booking, [
        'serviceName', 'service.name', 'subService.name', 'serviceType', 'category', 'title'
      ], 'Service'),
      quantity: 1,
      rate: booking.amount || 0,
      amount: booking.amount || 0,
      type: 'service'
    });
  }

  // Add quotation items if quotation exists and is accepted
  if (quotation && quotation.customerStatus === 'accepted' && quotation.items) {
    console.log('📋 Adding quotation items to invoice:', quotation.items.length);
    quotation.items.forEach(item => {
      services.push({
        description: item.name,
        details: item.description || 'Quotation item',
        quantity: item.quantity || 1,
        rate: item.unitPrice || 0,
        amount: (item.quantity || 1) * (item.unitPrice || 0),
        type: 'quotation_item',
        category: item.category
      });
    });
  }

  // If no services were added, add a default service
  if (services.length === 0) {
    services = booking.services?.map(service => ({
      description: safeString(service.name || service.description || service.serviceName || service.title, 'Service'),
      quantity: service.quantity || 1,
      rate: service.price || service.rate || service.amount || service.cost || 0,
      amount: (service.quantity || 1) * (service.price || service.rate || service.amount || service.cost || 0)
    })) || [
      {
        description: extractField(booking, [
          'serviceName', 'service.name', 'serviceType', 'category', 'title'
        ], 'Service'),
        quantity: 1,
        rate: booking.totalAmount || booking.amount || booking.price || booking.cost || 0,
        amount: booking.totalAmount || booking.amount || booking.price || booking.cost || 0
      }
    ];
  }

  // Calculate totals and breakdown
  const bookingAmount = booking.amount || 0;
  const quotationAmount = quotation?.totalAmount || 0;
  const discount = booking.discount || 0;
  const totalAmount = booking.totalAmount || (bookingAmount + quotationAmount);
  
  // Extract price breakdown fields - check multiple possible locations
  // First check direct booking fields, then check nested booking.booking
  const bookingData = booking.booking || booking;
  
  const visitingCharge = bookingData.visitingCharge !== undefined ? bookingData.visitingCharge : 0;
  const serviceCharge = bookingData.serviceCharge !== undefined ? bookingData.serviceCharge : 0;
  let emergencyCharge = bookingData.emergencyCharge !== undefined ? bookingData.emergencyCharge : 0;
  
  // If booking is emergency but emergencyCharge is not set, try to extract from amount
  // This is a fallback for bookings created before emergencyCharge field was added
  if (bookingData.isEmergency && emergencyCharge === 0) {
    // Check if there's an emergency service with extra amount
    if (bookingData.popularService?.emergencyService?.extraAmount) {
      emergencyCharge = bookingData.popularService.emergencyService.extraAmount;
    } else if (bookingData.serviceData?.emergencyService?.extraAmount) {
      emergencyCharge = bookingData.serviceData.emergencyService.extraAmount;
    }
    // If still 0, we'll show it as 0 but the field will be present
  }
  
  const cgst = bookingData.cgst !== undefined ? bookingData.cgst : 9; // Default 9%
  const sgst = bookingData.sgst !== undefined ? bookingData.sgst : 9; // Default 9%
  const cgstAmount = bookingData.cgstAmount !== undefined ? bookingData.cgstAmount : 0;
  const sgstAmount = bookingData.sgstAmount !== undefined ? bookingData.sgstAmount : 0;
  const gstAmount = bookingData.gstAmount !== undefined ? bookingData.gstAmount : (cgstAmount + sgstAmount);
  const subtotalBeforeTax = bookingData.subtotalBeforeTax !== undefined ? bookingData.subtotalBeforeTax : (booking.amount || 0)



  return {
    invoiceNumber: cleanInvoiceNumber,
    date: booking.createdAt || booking.bookingDate || booking.date || new Date().toISOString(),
    status: booking.status === 'completed' ? 'COMPLETED' : 'CONFIRMED',
    customer: {
      name: extractField(booking, [
        'customerDetails.name', 'customerDetails.customerName', 'customerDetails.fullName',
        'customerName', 'customer.name', 'user.name', 'name', 
        'clientName', 'userName', 'fullName'
      ], 'Customer Name Not Available'),
      
      phone: extractField(booking, [
        'customerDetails.phone', 'customerDetails.mobile', 'customerDetails.phoneNumber',
        'customerPhone', 'customer.phone', 'user.phone', 'phone', 
        'mobile', 'phoneNumber', 'contactNumber'
      ], 'Phone Not Available'),
      
      email: extractField(booking, [
        'customerDetails.email', 'customerDetails.emailAddress',
        'customerEmail', 'customer.email', 'user.email', 'email', 
        'emailAddress', 'userEmail'
      ], 'Email Not Available'),
      
      address: extractField(booking, [
        'location.address', 'location.fullAddress', 'customerDetails.address',
        'address', 'customer.address', 'user.address', 'location', 
        'fullAddress', 'serviceAddress', 'deliveryAddress'
      ], 'Address Not Available'),
      
      landmark: extractField(booking, [
        'location.landmark', 'customerDetails.landmark', 'location.nearbyLandmark',
        'landmark', 'customer.landmark', 'user.landmark', 
        'nearbyLandmark', 'reference'
      ]) || '', // Empty string if not available
      
      pincode: extractField(booking, [
        'location.pincode', 'location.zipCode', 'customerDetails.pincode',
        'pincode', 'customer.pincode', 'user.pincode', 'zipCode', 
        'postalCode', 'zip'
      ]) || '' // Empty string if not available
    },
    partner: booking.partner ? {
      name: extractField(booking, [
        'partnerName', 'partner.profile.name', 'partner.name'
      ], 'Partner Not Assigned'),
      phone: extractField(booking, [
        'partnerPhone', 'partner.profile.phone', 'partner.phone'
      ], ''),
      email: extractField(booking, [
        'partner.profile.email', 'partner.email'
      ], '')
    } : null,
    teamMember: booking.teamMember ? {
      name: extractField(booking, [
        'teamMember.name'
      ], ''),
      phone: extractField(booking, [
        'teamMember.phone'
      ], ''),
      role: extractField(booking, [
        'teamMember.role'
      ], 'Technician')
    } : null,
    services: services,
    quotationDetails: quotation ? {
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.createdAt,
      quotationAmount: quotation.totalAmount,
      itemCount: quotation.items?.length || 0,
      status: quotation.customerStatus
    } : null,
    paymentDetails: {
      bookingId: cleanBookingId,
      serviceDate: booking.scheduledDate || booking.serviceDate || booking.appointmentDate || booking.date || new Date().toISOString(),
      serviceTime: extractField(booking, [
        'scheduledTime', 'serviceTime', 'appointmentTime', 'time', 'slot'
      ], 'Time Not Available'),
      paymentMode: extractField(booking, [
        'paymentMode', 'paymentMethod', 'paymentType', 'method'
      ], 'ONLINE'),
      paymentStatus: extractField(booking, [
        'paymentStatus', 'status', 'transactionStatus'
      ], 'COMPLETED'),
      transactionId: extractField(booking, [
        'txnid', 'transactionId', 'paymentId', 'razorpayPaymentId', 
        'paymentDetails.transactionId', 'paymentDetails.txnid',
        'paymentTransactionId', 'orderId', 'referenceId'
      ]) || '', // Empty string if not available
      amount: totalAmount,
      bookingAmount: Number(bookingAmount),
      quotationAmount: Number(quotationAmount),
      discount: Number(discount),
      totalAmount: Number(totalAmount),
      // Price breakdown
      visitingCharge: Number(visitingCharge),
      serviceCharge: Number(serviceCharge),
      emergencyCharge: Number(emergencyCharge),
      subtotalBeforeTax: Number(subtotalBeforeTax),
      cgst: Number(cgst),
      sgst: Number(sgst),
      cgstAmount: Number(cgstAmount),
      sgstAmount: Number(sgstAmount),
      gstAmount: Number(gstAmount)
    },
    companyDetails: {
      name: 'ParNets Software India PVT LTD',
      gstin: '29AANCP7155K1ZN',
      address: 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura',
      city: 'Bengaluru, Bengaluru Urban, Karnataka, 560097',
      phone: '+91-9740016068',
      email: 'support@nexo.works',
      website: 'www.nexo.works'
    }
  };
};

export const generateInvoiceNumber = (bookingId) => {
  // Generate clean NEXO format
  const idSuffix = bookingId ? bookingId.slice(-6) : '000001';
  const numericId = parseInt(idSuffix, 16) % 999999 + 1;
  return `NEXO${numericId.toString().padStart(5, '0')}`;
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