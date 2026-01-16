import React from 'react';
import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const SinglePageInvoice = ({ invoiceData, onPrint }) => {
  const {
    invoiceNumber,
    date,
    status = 'CONFIRMED',
    customer,
    services,
    paymentDetails,
    companyDetails
  } = invoiceData;

  // Calculate services subtotal from the services array
  const servicesSubtotal = services?.reduce((sum, service) => sum + (service.quantity * service.rate), 0) || 0;
  
  // Get additional charges
  const visitingCharge = Number(paymentDetails?.visitingCharge) || 0;
  const serviceCharge = Number(paymentDetails?.serviceCharge) || 0;
  const emergencyCharge = Number(paymentDetails?.emergencyCharge) || 0;
  const cgstAmount = Number(paymentDetails?.cgstAmount) || 0;
  const sgstAmount = Number(paymentDetails?.sgstAmount) || 0;
  const gstAmount = cgstAmount + sgstAmount;
  const discount = Number(paymentDetails?.discount) || 0;
  
  // Calculate subtotal before tax (services + visiting + service + emergency charges)
  const subtotalBeforeTax = servicesSubtotal + visitingCharge + serviceCharge + emergencyCharge;
  
  // Calculate total amount
  let totalAmount = subtotalBeforeTax + gstAmount - discount;
  
  // If quotation exists, add quotation amount
  if (invoiceData.quotationDetails && paymentDetails?.quotationAmount) {
    totalAmount += Number(paymentDetails.quotationAmount) || 0;
  } else if (paymentDetails?.totalAmount !== undefined && paymentDetails?.totalAmount !== null && paymentDetails.totalAmount > 0) {
    // Use paymentDetails.totalAmount if available and valid
    totalAmount = Number(paymentDetails.totalAmount);
  }
  
  // Ensure totalAmount is a valid number
  if (isNaN(totalAmount) || totalAmount === 0) {
    totalAmount = servicesSubtotal;
  }

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print Options - Hidden during print */}
      <PrintOptions onPrint={onPrint} invoiceData={invoiceData} />

      {/* Single Page Invoice Container */}
      <div className="single-page-invoice p-3 print:p-0">
        {/* Ultra Compact Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold mr-2 print-logo">
              N
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Nexo</h1>
              <p className="text-xs text-gray-600 leading-tight">ParNets Software India PVT LTD</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-light text-gray-600 leading-tight">INVOICE</h2>
            <div className="text-xs">
              <p className="font-semibold">#{invoiceNumber}</p>
              <p>{format(new Date(date), 'dd MMM yyyy')}</p>
              <span className={`inline-block px-1 py-0.5 rounded text-xs ${
                status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Company Info - Ultra Compact */}
        <div className="mb-2 text-xs text-gray-600 border-b pb-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">{companyDetails?.name || 'ParNets Software India PVT LTD'}</span>
              <br />
              <span>GSTIN: {companyDetails?.gstin || '29AANCP7155K1ZN'}</span>
            </div>
            <div className="text-right">
              <span>{companyDetails?.address || 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura, Bengaluru, Bengaluru Urban, Karnataka, 560097'}</span>
              <br />
              <span>Ph: {companyDetails?.phone || '+91-9740016068'} | {companyDetails?.email || 'support@nexo.works'}</span>
            </div>
          </div>
        </div>

        {/* Bill To and Service Details - Ultra Compact Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-xs mb-1">BILL TO</h3>
            <div className="text-xs leading-tight">
              <p className="font-semibold">{customer?.name}</p>
              <p>Ph: {customer?.phone} | {customer?.email}</p>
              <p className="text-xs">{customer?.address}</p>
              <p>Landmark: {customer?.landmark} | PIN: {customer?.pincode}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-xs mb-1">SERVICE DETAILS</h3>
            <div className="text-xs leading-tight">
              <p>Booking ID: <span className="font-medium">#{paymentDetails?.bookingId}</span></p>
              <p>Service Date: {format(new Date(paymentDetails?.serviceDate), 'dd MMM yyyy')} | Time: {paymentDetails?.serviceTime}</p>
              <p>Payment: <span className="font-medium text-green-600">{paymentDetails?.paymentStatus || 'COMPLETED'}</span></p>
              <p>Txn ID: <span className="font-mono text-xs">{paymentDetails?.transactionId}</span></p>
            </div>
          </div>
        </div>

        {/* Ultra Compact Services Table */}
        <div className="mb-2">
          <h3 className="font-semibold text-xs mb-1">Services & Items</h3>
          <table className="w-full text-xs ultra-compact-table">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-1 py-0.5 text-left font-medium">DESCRIPTION</th>
                <th className="border border-gray-300 px-1 py-0.5 text-center font-medium w-16">QTY</th>
                <th className="border border-gray-300 px-1 py-0.5 text-center font-medium w-20">RATE</th>
                <th className="border border-gray-300 px-1 py-0.5 text-right font-medium w-20">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {services?.map((service, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-1 py-0.5">{service.description}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">{service.quantity}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">₹{service.rate}</td>
                  <td className="border border-gray-300 px-1 py-0.5 text-right">₹{service.quantity * service.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ultra Compact Total Section */}
        <div className="flex justify-end mb-2">
          <div className="w-48">
            <div className="flex justify-between text-xs py-0.5">
              <span>Services:</span>
              <span>₹{servicesSubtotal}</span>
            </div>
            {visitingCharge > 0 && (
              <div className="flex justify-between text-xs py-0.5">
                <span>Visiting:</span>
                <span className="text-amber-600">+₹{visitingCharge}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between text-xs py-0.5">
                <span>Platform:</span>
                <span className="text-blue-600">+₹{serviceCharge}</span>
              </div>
            )}
            {emergencyCharge > 0 && (
              <div className="flex justify-between text-xs py-0.5 bg-red-50 px-1">
                <span className="text-red-600">Emergency:</span>
                <span className="text-red-600">+₹{emergencyCharge}</span>
              </div>
            )}
            {gstAmount > 0 && (
              <div className="flex justify-between text-xs py-0.5">
                <span>GST:</span>
                <span>+₹{gstAmount}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-xs py-0.5 text-green-600">
                <span>Discount:</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between bg-gray-800 text-white px-2 py-1 font-semibold text-sm mt-1">
              <span>TOTAL:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Ultra Compact Footer */}
        <div className="text-center border-t pt-1">
          <h3 className="font-semibold text-xs mb-1">Thank You for Choosing Our Services!</h3>
          <div className="text-xs text-gray-600">
            <p>For queries: <span className="text-blue-600">{companyDetails?.email || 'support@nexo.works'}</span> </p>
            <p className="text-xs text-gray-500 mt-0.5">Computer-generated invoice. No signature required. Subject to Bengaluru jurisdiction.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePageInvoice;