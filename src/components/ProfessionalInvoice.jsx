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

  const subtotal = services?.reduce((sum, service) => sum + (service.quantity * service.rate), 0) || 0;
  const totalAmount = subtotal;

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

        {/* Bill To and Service Details Section */}
        <div className="grid grid-cols-2 gap-12 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-sm">BILL TO</h3>
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

        {/* Services Table */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Services & Items</h3>
          
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
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm text-gray-800">{service.description}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-800">{service.quantity}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-800">₹{service.rate}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-800">₹{service.quantity * service.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="bg-gray-800 text-white px-4 py-3 font-bold text-sm">
                  TOTAL AMOUNT:
                </div>
                <div className="bg-gray-600 text-white px-4 py-3 font-bold text-lg">
                  ₹{totalAmount}
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
              or call <span className="text-blue-600 font-medium">{companyDetails?.phone || '+91-9740016068'}</span>
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