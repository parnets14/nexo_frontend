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
  
  // Log all potential service/addon fields for debugging
  console.log('🔍 Checking for services/add-ons:');
  console.log('  - selectedAddOns:', booking.selectedAddOns?.length || 0, 'items');
  console.log('  - cartItems:', booking.cartItems?.length || 0, 'items');
  console.log('  - cart:', booking.cart?.length || 0, 'items');
  console.log('  - services:', booking.services?.length || 0, 'items');
  
  if (booking.selectedAddOns && booking.selectedAddOns.length > 0) {
    console.log('  📦 selectedAddOns details:', JSON.stringify(booking.selectedAddOns, null, 2));
  }
  if (booking.cartItems && booking.cartItems.length > 0) {
    console.log('  🛒 cartItems details:', JSON.stringify(booking.cartItems, null, 2));
  }
  if (booking.cart && booking.cart.length > 0) {
    console.log('  🛒 cart details:', JSON.stringify(booking.cart, null, 2));
  }

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

  // Build services array - include main service, add-ons, sub-services, and quotation items
  let services = [];
  
  // Add main booking service if exists
  if (booking.serviceName || booking.service || booking.subService || booking.popularService) {
    const serviceName = extractField(booking, [
      'serviceName', 
      'popularService.name',
      'service.name', 
      'subService.name', 
      'serviceType', 
      'category', 
      'title'
    ], 'Service');
    
    services.push({
      description: serviceName,
      details: extractField(booking, [
        'popularService.description',
        'service.description',
        'subService.description',
        'description'
      ], 'Main service'),
      quantity: 1,
      rate: booking.amount || 0,
      amount: booking.amount || 0,
      type: 'service'
    });
  }

  // Add selected add-ons if they exist
  if (booking.selectedAddOns && Array.isArray(booking.selectedAddOns) && booking.selectedAddOns.length > 0) {
    console.log('📋 Adding add-ons to invoice:', booking.selectedAddOns.length);
    booking.selectedAddOns.forEach(addon => {
      // Skip if basePrice is 0 or undefined (might be placeholder data)
      const price = addon.basePrice || addon.price || 0;
      const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
      
      // Only add add-ons with price > 1 (skip placeholder/incorrect data)
      if (numericPrice > 1) {
        services.push({
          description: addon.name || 'Add-on',
          details: addon.description || 'Additional service',
          quantity: 1,
          rate: numericPrice,
          amount: numericPrice,
          type: 'addon'
        });
        console.log(`  ✅ Added add-on: ${addon.name} - ₹${numericPrice}`);
      } else {
        console.warn(`  ⚠️ Skipped add-on with invalid price (₹${numericPrice}): ${addon.name}`);
        console.warn(`     This add-on has incorrect pricing data and will not appear in the invoice.`);
      }
    });
  } else {
    console.log('📋 No selectedAddOns found in booking');
  }

  // Add cart items (sub-services) if they exist
  if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
    console.log('📋 Adding cart items to invoice:', booking.cartItems.length);
    booking.cartItems.forEach(item => {
      const price = item.price || item.basePrice || 0;
      const quantity = item.quantity || 1;
      const amount = quantity * price;
      
      if (price > 0) {
        services.push({
          description: item.name || item.serviceName || 'Sub-service',
          details: item.description || 'Additional service item',
          quantity: quantity,
          rate: price,
          amount: amount,
          type: 'subservice'
        });
        console.log(`  ✅ Added cart item: ${item.name || item.serviceName} - ₹${price} x ${quantity}`);
      } else {
        console.warn(`  ⚠️ Skipped cart item with zero price: ${item.name || item.serviceName}`);
      }
    });
  } else {
    console.log('📋 No cartItems found in booking');
  }
  
  // BACKWARD COMPATIBILITY: Check for cart in booking.cart (old structure)
  if (booking.cart && Array.isArray(booking.cart) && booking.cart.length > 0) {
    console.log('📋 Adding cart items from booking.cart:', booking.cart.length);
    booking.cart.forEach(item => {
      // Only add approved items
      if (item.approved !== false) {
        const price = item.price || item.amount || 0;
        const quantity = item.quantity || 1;
        const amount = quantity * price;
        
        if (price > 0) {
          services.push({
            description: item.name || 'Cart Item',
            details: item.description || 'Additional item',
            quantity: quantity,
            rate: price,
            amount: amount,
            type: 'subservice'
          });
          console.log(`  ✅ Added cart item: ${item.name} - ₹${price} x ${quantity}`);
        } else {
          console.warn(`  ⚠️ Skipped cart item with zero price: ${item.name}`);
        }
      } else {
        console.log(`  ⏭️ Skipped unapproved cart item: ${item.name}`);
      }
    });
  } else {
    console.log('📋 No cart items found in booking.cart');
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
    console.warn('⚠️ No services found in booking data, adding default service');
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
  
  // Log final services summary
  console.log('📊 INVOICE SERVICES SUMMARY:');
  console.log(`  Total services: ${services.length}`);
  services.forEach((service, idx) => {
    console.log(`  ${idx + 1}. [${service.type || 'unknown'}] ${service.description} - ₹${service.amount}`);
  });
  console.log(`  Total amount: ₹${services.reduce((sum, s) => sum + s.amount, 0)}`);
  console.log('='.repeat(70));

  // Calculate totals and breakdown
  const bookingAmount = booking.amount || 0;
  const quotationAmount = quotation?.totalAmount || 0;
  const discount = booking.discount || 0;
  const specialDiscount = booking.specialDiscount || null;
  const totalAmount = booking.totalAmount || (bookingAmount + quotationAmount);
  
  // Extract price breakdown fields - check multiple possible locations
  // First check direct booking fields, then check nested booking.booking
  const bookingData = booking.booking || booking;
  
  // Get stored values or calculate for old bookings
  let visitingCharge = bookingData.visitingCharge !== undefined ? bookingData.visitingCharge : 0;
  let serviceCharge = bookingData.serviceCharge !== undefined ? bookingData.serviceCharge : 0;
  let emergencyCharge = bookingData.emergencyCharge !== undefined ? bookingData.emergencyCharge : 0;
  let cgstAmount = bookingData.cgstAmount !== undefined ? bookingData.cgstAmount : 0;
  let sgstAmount = bookingData.sgstAmount !== undefined ? bookingData.sgstAmount : 0;
  let gstAmount = bookingData.gstAmount !== undefined ? bookingData.gstAmount : 0;
  let subtotalBeforeTax = bookingData.subtotalBeforeTax !== undefined ? bookingData.subtotalBeforeTax : 0;
  
  // BACKWARD COMPATIBILITY: Calculate breakdown for old bookings
  const hasStoredBreakdown = (
    bookingData.visitingCharge !== undefined || 
    bookingData.cgstAmount !== undefined || 
    bookingData.subtotalBeforeTax !== undefined
  );
  
  if (!hasStoredBreakdown && totalAmount > 0) {
    console.log('📊 Calculating price breakdown for old booking...');
    
    // Try to extract visiting charge from popularService
    if (bookingData.popularService?.visitingCharge) {
      visitingCharge = bookingData.popularService.visitingCharge;
    }
    
    // Calculate GST (assuming 18% total = 9% CGST + 9% SGST)
    // GST is typically included in totalAmount
    const gstRate = 0.18; // 18% total GST
    const amountWithGST = totalAmount - discount;
    const amountWithoutGST = amountWithGST / (1 + gstRate);
    gstAmount = amountWithGST - amountWithoutGST;
    cgstAmount = gstAmount / 2;
    sgstAmount = gstAmount / 2;
    subtotalBeforeTax = amountWithoutGST;
    
    console.log('📊 Calculated breakdown:', {
      totalAmount,
      subtotalBeforeTax: subtotalBeforeTax.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      visitingCharge
    });
  }
  
  // If booking is emergency but emergencyCharge is not set, try to extract from amount
  if (bookingData.isEmergency && emergencyCharge === 0) {
    // Check if there's an emergency service with extra amount
    if (bookingData.popularService?.emergencyService?.extraAmount) {
      emergencyCharge = bookingData.popularService.emergencyService.extraAmount;
    } else if (bookingData.serviceData?.emergencyService?.extraAmount) {
      emergencyCharge = bookingData.serviceData.emergencyService.extraAmount;
    }
  }
  
  const cgst = bookingData.cgst !== undefined ? bookingData.cgst : 9; // Default 9%
  const sgst = bookingData.sgst !== undefined ? bookingData.sgst : 9; // Default 9%

  console.log('📋 Special Discount Data:', {
    hasSpecialDiscount: !!specialDiscount,
    amount: specialDiscount?.amount || 0,
    percentage: specialDiscount?.percentage || 0,
    reason: specialDiscount?.reason || 'N/A'
  });

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
    specialDiscount: specialDiscount,
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