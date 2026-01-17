import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const Invoice = ({ invoiceData, data, type, onClose, onPrint }) => {
  // Handle both prop patterns for backward compatibility
  let actualInvoiceData = invoiceData || data;
  
  // Safe date formatting function
  const safeFormatDate = (dateValue, formatString = 'dd MMMM yyyy') => {
    try {
      if (!dateValue) return 'N/A';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatString);
    } catch (error) {
      console.warn('Date formatting error:', error, 'for value:', dateValue);
      return 'N/A';
    }
  };
  
  // If no invoice data is provided, show error or return null
  if (!actualInvoiceData) {
    console.error('Invoice component: No invoice data provided');
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Error</h2>
        <p className="text-slate-600 mb-4">Invoice data is missing or invalid.</p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  // Transform booking data to invoice data if needed
  if (type === 'booking' && actualInvoiceData) {
    const booking = actualInvoiceData;
    
    // Check if there's quotation data passed along with booking
    const quotation = booking.quotation || booking.acceptedQuotation;
    
    // Build services array - include main service, add-ons, sub-services, and quotation items
    let services = [];
    
    // Calculate the main service amount (excluding visiting, emergency, service charges, and GST)
    let mainServiceAmount = booking.amount || 0;
    
    // Subtract all charges and GST from total to get the actual service cost
    const visitingChg = Number(booking.visitingCharge) || 0;
    const serviceChg = Number(booking.serviceCharge) || 0;
    const emergencyChg = Number(booking.emergencyCharge) || 0;
    const cgstAmt = Number(booking.cgstAmount) || 0;
    const sgstAmt = Number(booking.sgstAmount) || 0;
    const totalGst = cgstAmt + sgstAmt;
    
    // Main service cost = total amount - visiting - service - emergency - GST
    mainServiceAmount = mainServiceAmount - visitingChg - serviceChg - emergencyChg - totalGst;
    
    // Add main booking service
    if (booking.subService || booking.service || booking.popularService || booking.serviceName) {
      services.push({
        name: booking.service?.name || booking.subService?.name || booking.popularService?.name || booking.serviceName || 'Service',
        description: booking.subService?.description || booking.description || 'Main service',
        quantity: 1,
        rate: mainServiceAmount > 0 ? mainServiceAmount : 0,
        type: 'service'
      });
    }
    
    // Add selected add-ons if they exist
    if (booking.selectedAddOns && Array.isArray(booking.selectedAddOns) && booking.selectedAddOns.length > 0) {
      booking.selectedAddOns.forEach(addon => {
        services.push({
          name: addon.name || 'Add-on',
          description: addon.description || 'Additional service',
          quantity: 1,
          rate: addon.basePrice || 0,
          type: 'addon'
        });
      });
    }
    
    // Add cart items (sub-services) if they exist
    if (booking.cartItems && Array.isArray(booking.cartItems) && booking.cartItems.length > 0) {
      booking.cartItems.forEach(item => {
        services.push({
          name: item.name || item.serviceName || 'Sub-service',
          description: item.description || 'Additional service item',
          quantity: item.quantity || 1,
          rate: item.price || item.basePrice || 0,
          type: 'subservice'
        });
      });
    }
    
    // Add quotation items if quotation exists and is accepted
    if (quotation && quotation.customerStatus === 'accepted' && quotation.items) {
      quotation.items.forEach(item => {
        services.push({
          name: item.name,
          description: item.description || 'Quotation item',
          quantity: item.quantity || 1,
          rate: item.unitPrice || 0,
          type: 'quotation_item',
          category: item.category
        });
      });
    }
    
    // Calculate totals
    const bookingAmount = booking.amount || 0;
    const quotationAmount = quotation?.totalAmount || 0;
    const totalAmount = booking.totalAmount || (bookingAmount + quotationAmount);
    
    console.log('Invoice Data Debug:', {
      bookingAmount,
      quotationAmount,
      totalAmount,
      visitingCharge: visitingChg,
      serviceCharge: serviceChg,
      emergencyCharge: emergencyChg,
      baseServiceAmount,
      bookingTotalAmount: booking.totalAmount,
      quotationExists: !!quotation,
      quotationStatus: quotation?.customerStatus,
      isEmergency: booking.isEmergency
    });
    
    actualInvoiceData = {
      invoiceNumber: booking.bookingId || `INV-${booking._id?.slice(-8)}` || 'INV-000001',
      date: booking.createdAt || new Date().toISOString(),
      status: booking.status === 'completed' ? 'COMPLETED' : 'CONFIRMED',
      customer: {
        name: booking.user?.name || booking.customerName || 'Customer',
        email: booking.user?.email || booking.customerEmail || '',
        phone: booking.user?.phone || booking.customerPhone || '',
        address: booking.address || booking.location?.address || 'Address not provided',
        landmark: booking.location?.landmark,
        pincode: booking.location?.pincode
      },
      services: services,
      quotationDetails: quotation ? {
        quotationNumber: quotation.quotationNumber,
        quotationDate: quotation.createdAt,
        quotationAmount: quotation.totalAmount,
        itemCount: quotation.items?.length || 0,
        status: quotation.customerStatus
      } : null,
      // Price breakdown fields - properly extract from booking
      visitingCharge: Number(booking.visitingCharge) || 0,
      serviceCharge: Number(booking.serviceCharge) || 0,
      emergencyCharge: Number(booking.emergencyCharge) || 0,
      isEmergency: booking.isEmergency || false,
      cgst: Number(booking.cgst) || 9,
      sgst: Number(booking.sgst) || 9,
      cgstAmount: Number(booking.cgstAmount) || 0,
      sgstAmount: Number(booking.sgstAmount) || 0,
      subtotalBeforeTax: Number(booking.subtotalBeforeTax) || Number(booking.amount) || 0,
      specialDiscount: booking.specialDiscount || null,
      paymentDetails: {
        method: booking.paymentMethod || booking.paymentMode || 'Cash',
        status: booking.paymentStatus || 'Pending',
        amount: totalAmount,
        bookingAmount: Number(bookingAmount),
        quotationAmount: Number(quotationAmount),
        totalAmount: Number(totalAmount),
        paidAmount: Number(booking.payamount || 0),
        bookingId: booking.bookingId || booking._id,
        serviceDate: booking.scheduledDate,
        serviceTime: booking.scheduledTime,
        transactionId: booking.paymentDetails?.finalPayment?.transactionId
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
  }

  const {
    invoiceNumber,
    date,
    status = 'CONFIRMED',
    customer,
    services,
    paymentDetails,
    companyDetails
  } = actualInvoiceData;

  // Calculate services subtotal from the services array
  const servicesSubtotal = services && services.length > 0 
    ? services.reduce((sum, service) => sum + ((service.quantity || 1) * (service.rate || 0)), 0) 
    : 0;
  
  // Get additional charges from invoice data
  const visitingCharge = Number(actualInvoiceData.visitingCharge) || 0;
  const serviceCharge = Number(actualInvoiceData.serviceCharge) || 0;
  const emergencyCharge = Number(actualInvoiceData.emergencyCharge) || 0;
  const isEmergency = actualInvoiceData.isEmergency || false;
  
  // Get GST amounts
  const cgstAmount = Number(actualInvoiceData.cgstAmount) || 0;
  const sgstAmount = Number(actualInvoiceData.sgstAmount) || 0;
  const cgstPercent = Number(actualInvoiceData.cgst) || 9;
  const sgstPercent = Number(actualInvoiceData.sgst) || 9;
  const gstAmount = cgstAmount + sgstAmount;
  
  const discount = Number(paymentDetails?.discount) || 0;
  const specialDiscount = actualInvoiceData.specialDiscount?.amount || 0;
  
  // Calculate subtotal before tax (services + visiting + service + emergency charges)
  const subtotalBeforeTax = servicesSubtotal + visitingCharge + serviceCharge + emergencyCharge;
  
  // Calculate the correct total amount
  let totalAmount = subtotalBeforeTax + gstAmount - discount - specialDiscount;
  
  // If quotation exists, add quotation amount to the total
  if (actualInvoiceData.quotationDetails && paymentDetails?.quotationAmount) {
    const quotationAmt = Number(paymentDetails.quotationAmount) || 0;
    totalAmount += quotationAmt;
    console.log('Invoice Total Calculation (with quotation):', {
      servicesSubtotal,
      visitingCharge,
      serviceCharge,
      emergencyCharge,
      subtotalBeforeTax,
      gstAmount,
      discount,
      specialDiscount,
      quotationAmount: quotationAmt,
      calculatedTotal: totalAmount
    });
  } else {
    // No quotation - use paymentDetails.totalAmount if available and valid
    if (paymentDetails?.totalAmount !== undefined && paymentDetails?.totalAmount !== null && paymentDetails.totalAmount > 0) {
      totalAmount = Number(paymentDetails.totalAmount);
    }
    
    console.log('Invoice Total Calculation (no quotation):', {
      servicesSubtotal,
      visitingCharge,
      serviceCharge,
      emergencyCharge,
      subtotalBeforeTax,
      gstAmount,
      discount,
      specialDiscount,
      paymentDetailsTotalAmount: paymentDetails?.totalAmount,
      calculatedTotal: totalAmount
    });
  }

  console.log('Invoice Final Values:', {
    servicesSubtotal,
    visitingCharge,
    serviceCharge,
    emergencyCharge,
    isEmergency,
    subtotalBeforeTax,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalAmount,
    servicesCount: services?.length,
    hasQuotation: !!actualInvoiceData.quotationDetails
  });

  return (
    <div className="max-w-4xl mx-auto bg-white print-invoice-wrapper">
      {/* Print Options - Hidden during print */}
      <PrintOptions onPrint={onPrint} invoiceData={actualInvoiceData} />

      {/* Invoice Container */}
      <div className="border border-gray-300 p-6 print:border-0 print:p-0 invoice-container no-page-break">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center mb-3">
              <img 
                src="/logo.png" 
                alt="Nexo Logo" 
                className="w-12 h-12 mr-3 object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3" style={{display: 'none'}}>
                N
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Nexo</h1>
                <p className="text-sm text-gray-600">ParNets Software India PVT LTD</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{companyDetails?.name || 'ParNets Software India PVT LTD'}</p>
              <p>GSTIN: {companyDetails?.gstin || '29AANCP7155K1ZN'}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-600 mb-2">INVOICE</h2>
            <div className="text-sm space-y-0.5">
              <p className="font-semibold">#{invoiceNumber}</p>
              <p>Date: {safeFormatDate(date)}</p>
              <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="mb-6 text-sm text-gray-600">
          <p className="font-semibold mb-1">Registered Office:</p>
          <p>{companyDetails?.address || 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura'}</p>
          <p>{companyDetails?.city || 'Bengaluru, Bengaluru Urban, Karnataka, 560097'}</p>
          <div className="mt-2 space-y-0.5">
            <p>Contact: {companyDetails?.phone || '+91-9740016068'}</p>
            <p>Email: {companyDetails?.email || 'support@nexo.works'}</p>
            <p>Website: {companyDetails?.website || 'www.nexo.works'}</p>
          </div>
        </div>

        {/* Bill To and Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bill To */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">BILL TO</h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-lg">{customer?.name || 'Customer Name'}</p>
              <p>Phone: {customer?.phone || 'N/A'}</p>
              <p>Email: {customer?.email || 'N/A'}</p>
              <div className="mt-2">
                <p className="font-medium">Address:</p>
                <p>{customer?.address || 'Address not provided'}</p>
                {customer?.landmark && <p>Landmark: {customer.landmark}</p>}
                {customer?.pincode && <p>Pincode: {customer.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">SERVICE DETAILS</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-medium">#{paymentDetails?.bookingId || invoiceNumber}</span>
              </div>
              {actualInvoiceData.quotationDetails && (
                <div className="flex justify-between">
                  <span>Quotation ID:</span>
                  <span className="font-medium">#{actualInvoiceData.quotationDetails.quotationNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Service Date:</span>
                <span>{safeFormatDate(paymentDetails?.serviceDate || date)}</span>
              </div>
              {paymentDetails?.serviceTime && (
                <div className="flex justify-between">
                  <span>Service Time:</span>
                  <span>{paymentDetails.serviceTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-medium">{paymentDetails?.paymentMode || paymentDetails?.method || 'ONLINE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-medium text-green-600">{paymentDetails?.paymentStatus || paymentDetails?.status || 'COMPLETED'}</span>
              </div>
              {paymentDetails?.transactionId && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-xs">{paymentDetails.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Services & Items</h3>
          
          {/* Quotation Summary if exists */}
          {actualInvoiceData.quotationDetails && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Quotation Summary</h4>
                <span className="text-xs text-blue-600">#{actualInvoiceData.quotationDetails.quotationNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Quotation Date:</span>
                  <span className="ml-2">{safeFormatDate(actualInvoiceData.quotationDetails.quotationDate, 'dd MMM yyyy')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Items Count:</span>
                  <span className="ml-2">{actualInvoiceData.quotationDetails.itemCount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Quotation Amount:</span>
                  <span className="ml-2 font-semibold">₹{Number(actualInvoiceData.quotationDetails.quotationAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Status:</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full capitalize">
                    {actualInvoiceData.quotationDetails.status}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    DESCRIPTION
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                    QTY
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                    RATE
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium text-gray-700">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {services && services.length > 0 ? services.map((service, index) => (
                  <tr key={index} className={
                    service.type === 'quotation_item' ? 'bg-blue-50' : 
                    service.type === 'addon' ? 'bg-purple-50' :
                    service.type === 'subservice' ? 'bg-yellow-50' : ''
                  }>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{service.name || 'Service'}</p>
                          {service.type === 'quotation_item' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                              Quotation Item
                            </span>
                          )}
                          {service.type === 'service' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                              Main Service
                            </span>
                          )}
                          {service.type === 'addon' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full whitespace-nowrap">
                              Add-on
                            </span>
                          )}
                          {service.type === 'subservice' && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full whitespace-nowrap">
                              Sub-service
                            </span>
                          )}
                        </div>
                        {service.description && <p className="text-gray-600 text-xs mt-1">{service.description}</p>}
                        {service.category && <p className="text-gray-500 text-xs mt-0.5">Category: {service.category}</p>}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center text-sm">
                      {service.quantity || 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center text-sm">
                      ₹{Number(service.rate || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right text-sm">
                      ₹{Number((service.quantity || 1) * (service.rate || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="border border-gray-200 px-3 py-4 text-center text-sm text-gray-500">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-6">
          <div className="w-full md:w-80">
            {/* Services Subtotal (Main service + add-ons + sub-services) */}
            <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-gray-50 px-2 -mx-2">
              <span className="text-gray-700 font-medium">Service Subtotal:</span>
              <span className="font-semibold">₹{Number(servicesSubtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            {/* Visiting Charge - Show if exists and > 0 */}
            {visitingCharge > 0 && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                <span className="text-gray-600">Visiting Charge:</span>
                <span className="font-medium text-amber-600">+₹{Number(visitingCharge).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* Service Charge/Platform Fee - Show if exists and > 0 */}
            {serviceCharge > 0 && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium text-blue-600">+₹{Number(serviceCharge).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* Emergency Charge - Show if exists and > 0 */}
            {emergencyCharge > 0 && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-1">
                  <span className="text-red-500">🚨</span>
                  Emergency Service Charge:
                </span>
                <span className="font-medium text-red-600">+₹{Number(emergencyCharge).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* Discount - Show if greater than 0 */}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                <span className="text-green-700 font-medium">Offer Discount:</span>
                <span className="font-semibold text-green-600">-₹{Number(discount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* Special Discount - Show if greater than 0 */}
            {specialDiscount > 0 && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-purple-50 px-2 -mx-2">
                <div className="flex flex-col">
                  <span className="text-purple-700 font-medium">Special Discount:</span>
                  {actualInvoiceData.specialDiscount?.reason && (
                    <span className="text-xs text-purple-600 italic">{actualInvoiceData.specialDiscount.reason}</span>
                  )}
                </div>
                <span className="font-semibold text-purple-600">-₹{Number(specialDiscount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* GST Breakdown - only if GST exists */}
            {gstAmount > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2 mt-2 border border-blue-100">
                <div className="text-xs font-semibold text-blue-800 mb-1">GST Breakdown</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">CGST ({cgstPercent}%):</span>
                  <span className="font-medium text-gray-700">₹{Number(cgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">SGST ({sgstPercent}%):</span>
                  <span className="font-medium text-gray-700">₹{Number(sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                  <span className="text-gray-700 font-medium">Total GST:</span>
                  <span className="font-semibold text-gray-900">₹{Number(gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
            
            {/* Show paid amount if partial payment */}
            {paymentDetails?.paidAmount && paymentDetails.paidAmount > 0 && paymentDetails.paidAmount < totalAmount && (
              <div className="flex justify-between py-2 text-sm text-green-600 border-b border-gray-200 mt-2">
                <span>Amount Paid:</span>
                <span className="font-medium">₹{Number(paymentDetails.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {/* Final Total */}
            <div className="flex justify-between py-3 bg-gray-800 text-white px-3 font-semibold mt-3 rounded">
              <span>Total Amount:</span>
              <span className="text-lg">₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            {/* Show remaining amount if partial payment */}
            {paymentDetails?.paidAmount && paymentDetails.paidAmount > 0 && paymentDetails.paidAmount < totalAmount && (
              <div className="flex justify-between py-2 text-sm text-red-600 font-medium mt-2">
                <span>Remaining Amount:</span>
                <span>₹{Number((totalAmount || 0) - (paymentDetails.paidAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Thank You for Choosing Our Services!</h3>
          <div className="text-sm text-gray-600 space-y-1.5">
            <p>
              For any queries regarding this invoice, please contact us at{' '}
              <span className="text-blue-600">{companyDetails?.email || 'support@nexo.works'}</span>{' '}
              {/* or call <span className="text-blue-600">{companyDetails?.phone || '+91-9740016068'}</span> */}
            </p>
            <p>
              Visit our website at{' '}
              <span className="text-blue-600">{companyDetails?.website || 'www.nexo.works'}</span>{' '}
              for more services
            </p>
            <p className="text-xs text-gray-500 mt-3">
              This is a computer-generated invoice and does not require a physical signature.<br />
              Subject to Bengaluru jurisdiction. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;