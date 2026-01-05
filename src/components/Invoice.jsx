import React from 'react';
import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const Invoice = ({ invoiceData, data, type, onClose, onPrint }) => {
  // Handle both prop patterns for backward compatibility
  let actualInvoiceData = invoiceData || data;
  
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
    
    // Build services array - include both booking service and quotation items
    let services = [];
    
    // Add main booking service
    if (booking.subService || booking.service || booking.popularService || booking.serviceName) {
      services.push({
        name: booking.service?.name || booking.subService?.name || booking.popularService?.name || booking.serviceName || 'Service',
        description: booking.subService?.description || booking.description || 'Main service booking',
        quantity: 1,
        rate: booking.amount || 0,
        type: 'service'
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
      bookingTotalAmount: booking.totalAmount,
      quotationExists: !!quotation,
      quotationStatus: quotation?.customerStatus
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

  const subtotal = services && services.length > 0 
    ? services.reduce((sum, service) => sum + ((service.quantity || 1) * (service.rate || 0)), 0) 
    : 0;
  
  // Use the correct total amount - prefer paymentDetails.totalAmount if available, otherwise calculate from subtotal
  const totalAmount = paymentDetails?.totalAmount || paymentDetails?.amount || subtotal;

  const handlePrint = () => {
    // Add print-ready class to body
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Remove print-ready class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 1000);
    
    if (onPrint) onPrint();
  };

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
              <p>Date: {date ? format(new Date(date), 'dd MMMM yyyy') : format(new Date(), 'dd MMMM yyyy')}</p>
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
                <span>{paymentDetails?.serviceDate ? format(new Date(paymentDetails.serviceDate), 'dd MMMM yyyy') : format(new Date(date), 'dd MMMM yyyy')}</span>
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
                  <span className="ml-2">{actualInvoiceData.quotationDetails.quotationDate ? format(new Date(actualInvoiceData.quotationDetails.quotationDate), 'dd MMM yyyy') : 'N/A'}</span>
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
                    QUANTITY
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
                  <tr key={index} className={service.type === 'quotation_item' ? 'bg-blue-50' : ''}>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{service.name || 'Service'}</p>
                          {service.type === 'quotation_item' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Quotation Item
                            </span>
                          )}
                          {service.type === 'service' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Main Service
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
          <div className="w-80">
            {/* Show breakdown if quotation exists */}
            {actualInvoiceData.quotationDetails && paymentDetails?.bookingAmount !== undefined && paymentDetails?.quotationAmount !== undefined ? (
              <>
                <div className="flex justify-between py-1.5 text-sm border-b border-gray-200">
                  <span>Service Amount:</span>
                  <span>₹{Number(paymentDetails.bookingAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm border-b border-gray-200">
                  <span>Quotation Amount:</span>
                  <span>₹{Number(paymentDetails.quotationAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm">
                  <span>Subtotal:</span>
                  <span>₹{Number((paymentDetails.bookingAmount || 0) + (paymentDetails.quotationAmount || 0)).toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1.5 text-sm">
                <span>Subtotal:</span>
                <span>₹{Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {/* Show paid amount if partial payment */}
            {paymentDetails?.paidAmount && paymentDetails.paidAmount > 0 && paymentDetails.paidAmount < totalAmount && (
              <div className="flex justify-between py-1.5 text-sm text-green-600">
                <span>Amount Paid:</span>
                <span>₹{Number(paymentDetails.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-gray-800 text-white px-3 font-semibold">
              <span>TOTAL AMOUNT:</span>
              <span>₹{Number(totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            
            {/* Show remaining amount if partial payment */}
            {paymentDetails?.paidAmount && paymentDetails.paidAmount > 0 && paymentDetails.paidAmount < totalAmount && (
              <div className="flex justify-between py-1.5 text-sm text-red-600 font-medium">
                <span>Remaining Amount:</span>
                <span>₹{Number((totalAmount || 0) - (paymentDetails.paidAmount || 0)).toLocaleString('en-IN')}</span>
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
              or call <span className="text-blue-600">{companyDetails?.phone || '+91-9740016068'}</span>
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