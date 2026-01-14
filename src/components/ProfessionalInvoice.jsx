import React from 'react';
import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const ProfessionalInvoice = ({ invoiceData, onPrint }) => {
  // Safety check for invoiceData
  if (!invoiceData) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  const {
    invoiceNumber,
    date,
    status = 'CONFIRMED',
    customer = {},
    services = [],
    quotationDetails = null,
    paymentDetails = {},
    companyDetails = {}
  } = invoiceData;

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      console.warn('Attempting to render object:', value);
      return fallback;
    }
    return String(value);
  };

  // Helper function to format currency with 2 decimal places
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const subtotal = services?.reduce((sum, service) => sum + (service.quantity * service.rate), 0) || 0;
  
  // Debug logging for quotation details
  console.log('📋 [ProfessionalInvoice] Invoice data received:', {
    hasQuotationDetails: !!quotationDetails,
    quotationDetails: quotationDetails,
    bookingAmount: paymentDetails?.bookingAmount,
    quotationAmount: paymentDetails?.quotationAmount,
    totalAmount: paymentDetails?.totalAmount,
    servicesCount: services?.length || 0
  });
  
  // Debug logging for emergency bookings
  if (invoiceData?.booking?.isEmergency) {
    console.log('🚨 INVOICE COMPONENT - Emergency booking data:', {
      isEmergency: invoiceData.booking.isEmergency,
      emergencyType: invoiceData.booking.emergencyType,
      emergencyCharge: paymentDetails?.emergencyCharge,
      visitingCharge: paymentDetails?.visitingCharge,
      serviceCharge: paymentDetails?.serviceCharge,
      subtotalBeforeTax: paymentDetails?.subtotalBeforeTax,
      paymentDetails: paymentDetails
    });
  }
  
  // Calculate the correct total amount
  let totalAmount = subtotal;
  
  // If quotation exists, calculate total as booking amount + quotation amount
  if (quotationDetails) {
    const bookingAmt = Number(paymentDetails?.bookingAmount) || 0;
    const quotationAmt = Number(paymentDetails?.quotationAmount) || 0;
    
    // If we have explicit amounts, use them
    if (bookingAmt > 0 || quotationAmt > 0) {
      totalAmount = bookingAmt + quotationAmt;
      console.log('ProfessionalInvoice Total Calculation (with quotation):', {
        bookingAmount: bookingAmt,
        quotationAmount: quotationAmt,
        calculatedTotal: totalAmount
      });
    } else {
      // Fallback to paymentDetails.totalAmount or subtotal
      if (paymentDetails?.totalAmount !== undefined && paymentDetails?.totalAmount !== null) {
        totalAmount = Number(paymentDetails.totalAmount);
      }
    }
  } else {
    // No quotation - use paymentDetails.totalAmount or calculated subtotal
    if (paymentDetails?.totalAmount !== undefined && paymentDetails?.totalAmount !== null) {
      totalAmount = Number(paymentDetails.totalAmount);
    }
    
    console.log('ProfessionalInvoice Total Calculation (no quotation):', {
      paymentDetailsTotalAmount: paymentDetails?.totalAmount,
      subtotal,
      finalTotal: totalAmount
    });
  }
  
  // Ensure totalAmount is a valid number
  if (isNaN(totalAmount) || totalAmount === 0) {
    totalAmount = subtotal;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      {/* Print Options - Hidden during print */}
      <PrintOptions onPrint={onPrint} invoiceData={invoiceData} />

      {/* Professional Invoice Container */}
      <div className="professional-invoice bg-white border-2 border-gray-800 p-8 print:border-2 print:p-6 mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Company Logo and Info */}
          <div className="flex-1">
            <div className="flex items-center justify-start mb-6">
              <img 
                src="/logo.png" 
                alt="Nexo Logo" 
                className="w-28 h-28 object-contain"
              />
            </div>
            
            <div className="space-y-1 text-sm text-gray-700 mt-4">
              <p className="font-semibold text-lg">ParNets Software India PVT LTD</p>
              <p>ParNets Software India PVT LTD</p>
              <p>GSTIN: {companyDetails?.gstin || '29AANCP7155K1ZN'}</p>
            </div>
          </div>

          {/* Invoice Title and Details */}
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 mb-4">INVOICE</h2>
            <div className="text-sm space-y-1">
              <p className="font-bold text-blue-600">#{invoiceNumber}</p>
              <p><span className="text-gray-600">Date:</span> {format(new Date(date), 'dd MMMM yyyy')}</p>
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Contact Details */}
        <div className="mb-8 text-sm text-gray-700 space-y-1">
          <p className="font-semibold">Registered Office:</p>
          <p>{companyDetails?.address || 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura'}</p>
          <p>{companyDetails?.city || 'Bengaluru, Bengaluru Urban, Karnataka, 560097'}</p>
          <div className="mt-3 space-y-1">
            <p><span className="font-medium">Contact:</span> {companyDetails?.phone || '+91-9740016068'}</p>
            <p><span className="font-medium">Email:</span> {companyDetails?.email || 'support@nexo.works'}</p>
            <p><span className="font-medium">Website:</span> {companyDetails?.website || 'www.nexo.works'}</p>
          </div>
        </div>

        {/* Bill To, Partner, and Service Details Section */}
        <div className="grid grid-cols-2 gap-12 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-sm">BILL TO (CUSTOMER)</h3>
            <div className="space-y-3">
              <div>
                <p className="font-bold text-lg text-gray-800">{safeRender(customer?.name)}</p>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Phone:</span> {safeRender(customer?.phone)}</p>
                <p><span className="font-medium">Email:</span> {safeRender(customer?.email)}</p>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Address:</span></p>
                <p className="leading-relaxed">{safeRender(customer?.address)}</p>
                {customer?.landmark && (
                  <p><span className="font-medium">Landmark:</span> {safeRender(customer?.landmark)}</p>
                )}
                {customer?.pincode && (
                  <p><span className="font-medium">Pincode:</span> {safeRender(customer?.pincode)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-sm">SERVICE DETAILS</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-bold text-blue-600">#{safeRender(paymentDetails?.bookingId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Date:</span>
                <span className="font-medium">{paymentDetails?.serviceDate ? format(new Date(paymentDetails.serviceDate), 'dd MMMM yyyy') : 'Date Not Available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Time:</span>
                <span className="font-medium">{safeRender(paymentDetails?.serviceTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-bold">{safeRender(paymentDetails?.paymentMode, 'ONLINE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-bold text-green-600">{safeRender(paymentDetails?.paymentStatus, 'COMPLETED')}</span>
              </div>
              {paymentDetails?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs font-medium">{safeRender(paymentDetails?.transactionId)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Partner Details Section */}
        {invoiceData?.partner && (
          <div className="mb-8 border-t-2 border-gray-200 pt-6">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">SERVICE PARTNER</h3>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Partner Name:</span> {safeRender(invoiceData.partner.name)}</p>
                <p><span className="font-medium">Phone:</span> {safeRender(invoiceData.partner.phone)}</p>
                {invoiceData.partner.email && (
                  <p><span className="font-medium">Email:</span> {safeRender(invoiceData.partner.email)}</p>
                )}
              </div>
              {invoiceData?.teamMember && (
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Team Member:</span> {safeRender(invoiceData.teamMember.name)}</p>
                  <p><span className="font-medium">Role:</span> {safeRender(invoiceData.teamMember.role, 'Technician')}</p>
                  {invoiceData.teamMember.phone && (
                    <p><span className="font-medium">Phone:</span> {safeRender(invoiceData.teamMember.phone)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Services & Items</h3>
          
          {/* Quotation Summary if exists */}
          {quotationDetails && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-blue-800">Quotation Summary</h4>
                <span className="text-sm text-blue-600 font-semibold">#{quotationDetails.quotationNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Quotation Date:</span>
                  <span className="ml-2">{quotationDetails.quotationDate ? format(new Date(quotationDetails.quotationDate), 'dd MMM yyyy') : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Items Count:</span>
                  <span className="ml-2 font-semibold">{quotationDetails.itemCount}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Quotation Amount:</span>
                  <span className="ml-2 font-bold">₹{formatCurrency(quotationDetails.quotationAmount || 0)}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize font-semibold">
                    {quotationDetails.status}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">DESCRIPTION</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm">QUANTITY</th>
                <th className="text-center py-3 px-4 font-bold text-gray-700 text-sm">RATE</th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 text-sm">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {services?.map((service, index) => (
                <tr key={index} className={`border-b border-gray-200 ${service.type === 'quotation_item' ? 'bg-blue-50' : ''}`}>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{service.description}</span>
                        {service.type === 'quotation_item' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                            Quotation Item
                          </span>
                        )}
                        {service.type === 'service' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                            Main Service
                          </span>
                        )}
                      </div>
                      {service.details && <p className="text-gray-600 text-xs mt-1">{service.details}</p>}
                      {service.category && <p className="text-gray-500 text-xs mt-0.5">Category: {service.category}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-800">{service.quantity}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-800">₹{formatCurrency(service.rate)}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-800">₹{formatCurrency(service.quantity * service.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Section with Price Breakdown */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="space-y-2">
              {/* Show detailed breakdown if any breakdown field exists */}
              {(paymentDetails?.subtotalBeforeTax !== undefined || 
                paymentDetails?.visitingCharge !== undefined || 
                paymentDetails?.serviceCharge !== undefined || 
                (paymentDetails?.emergencyCharge !== undefined && paymentDetails?.emergencyCharge > 0) ||
                paymentDetails?.gstAmount !== undefined) ? (
                <>
                  {/* Visiting Charge */}
                  {(paymentDetails?.visitingCharge !== undefined && paymentDetails?.visitingCharge > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                      <span className="text-gray-600">Visiting Charge:</span>
                      <span className="font-medium">₹{formatCurrency(paymentDetails.visitingCharge)}</span>
                    </div>
                  )}
                  
                  {/* Service Charge */}
                  {(paymentDetails?.serviceCharge !== undefined && paymentDetails?.serviceCharge > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                      <span className="text-gray-600">Service Charge:</span>
                      <span className="font-medium">₹{formatCurrency(paymentDetails.serviceCharge)}</span>
                    </div>
                  )}
                  
                  {/* Emergency Charge - Only show if greater than 0 */}
                  {(paymentDetails?.emergencyCharge !== undefined && paymentDetails?.emergencyCharge > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-red-50">
                      <span className="text-red-700 font-medium">🚨 Emergency Charge:</span>
                      <span className="font-bold text-red-700">₹{formatCurrency(paymentDetails.emergencyCharge)}</span>
                    </div>
                  )}
                  
                  {/* Subtotal Before Tax */}
                  {(paymentDetails?.subtotalBeforeTax !== undefined || subtotal > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                      <span className="text-gray-700 font-medium">Subtotal (Before Tax):</span>
                      <span className="font-bold">₹{formatCurrency(paymentDetails.subtotalBeforeTax || subtotal)}</span>
                    </div>
                  )}
                  
                  {/* CGST - Always show if gstAmount exists */}
                  {(paymentDetails?.cgstAmount !== undefined || paymentDetails?.gstAmount > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                      <span className="text-gray-600">CGST ({paymentDetails.cgst || 9}%):</span>
                      <span className="font-medium">₹{formatCurrency(paymentDetails.cgstAmount || 0)}</span>
                    </div>
                  )}
                  
                  {/* SGST - Always show if gstAmount exists */}
                  {(paymentDetails?.sgstAmount !== undefined || paymentDetails?.gstAmount > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                      <span className="text-gray-600">SGST ({paymentDetails.sgst || 9}%):</span>
                      <span className="font-medium">₹{formatCurrency(paymentDetails.sgstAmount || 0)}</span>
                    </div>
                  )}
                  
                  {/* Total GST */}
                  {paymentDetails?.gstAmount !== undefined && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-300 bg-gray-50">
                      <span className="text-gray-700 font-medium">Total GST ({(paymentDetails.cgst || 9) + (paymentDetails.sgst || 9)}%):</span>
                      <span className="font-bold">₹{formatCurrency(paymentDetails.gstAmount || 0)}</span>
                    </div>
                  )}
                  
                  {/* Discount - Show if greater than 0 */}
                  {(paymentDetails?.discount !== undefined && paymentDetails?.discount > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-green-50">
                      <span className="text-green-700 font-medium">Discount Applied:</span>
                      <span className="font-bold text-green-700">- ₹{formatCurrency(paymentDetails.discount)}</span>
                    </div>
                  )}
                </>
              ) : quotationDetails && (paymentDetails?.bookingAmount !== undefined || paymentDetails?.quotationAmount !== undefined) ? (
                <>
                  <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                    <span className="text-gray-600">Service Amount:</span>
                    <span className="font-medium">₹{formatCurrency(paymentDetails.bookingAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm border-b border-gray-200">
                    <span className="text-gray-600">Quotation Amount:</span>
                    <span className="font-medium">₹{formatCurrency(paymentDetails.quotationAmount || 0)}</span>
                  </div>
                  
                  {/* Discount for quotation scenario */}
                  {(paymentDetails?.discount !== undefined && paymentDetails?.discount > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-green-50">
                      <span className="text-green-700 font-medium">Discount Applied:</span>
                      <span className="font-bold text-green-700">- ₹{formatCurrency(paymentDetails.discount)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Subtotal:</span>
                    <span className="font-bold">₹{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {/* Discount for simple scenario */}
                  {(paymentDetails?.discount !== undefined && paymentDetails?.discount > 0) && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-200 bg-green-50">
                      <span className="text-green-700 font-medium">Discount Applied:</span>
                      <span className="font-bold text-green-700">- ₹{formatCurrency(paymentDetails.discount)}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Grand Total */}
              <div className="flex justify-between items-center mt-4">
                <div className="bg-gray-800 text-white px-4 py-3 font-bold text-sm">
                  TOTAL AMOUNT:
                </div>
                <div className="bg-gray-600 text-white px-4 py-3 font-bold text-lg">
                  ₹{formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Thank You for Choosing Our Services!</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              For any queries regarding this invoice, please contact us at{' '}
              <span className="text-blue-600 font-medium">{companyDetails?.email || 'support@nexo.works'}</span>{' '}
              {/* or call <span className="text-blue-600 font-medium">{companyDetails?.phone || '+91-9740016068'}</span> */}
            </p>
            <p>
              Visit our website at{' '}
              <span className="text-blue-600 font-medium">{companyDetails?.website || 'www.nexo.works'}</span>{' '}
              for more services
            </p>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                This is a computer-generated invoice and does not require a physical signature.
              </p>
              <p className="text-xs text-gray-500">
                Subject to Bengaluru jurisdiction. Terms and conditions apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvoice;