import React from 'react';
import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const CompactInvoice = ({ invoiceData, onPrint }) => {
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

      {/* Compact Invoice Container */}
      <div className="border border-gray-300 p-4 print:border-0 print:p-0 invoice-container">
        {/* Compact Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
              N
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Nexo</h1>
              <p className="text-xs text-gray-600">ParNets Software India PVT LTD</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-light text-gray-600">INVOICE</h2>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">#{invoiceNumber}</p>
              <p>Date: {format(new Date(date), 'dd MMM yyyy')}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Company Info - Single Line */}
        <div className="mb-2 text-xs text-gray-600 border-b pb-1">
          <div className="flex flex-wrap gap-3">
            <span>{companyDetails?.name || 'ParNets Software India PVT LTD'}</span>
            <span>GSTIN: {companyDetails?.gstin || '29AANCP7155K1ZN'}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-0.5">
            <span>{companyDetails?.address || 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura, Bengaluru, Bengaluru Urban, Karnataka, 560097'}</span>
            <span>Ph: {companyDetails?.phone || '+91-9740016068'}</span>
            <span>{companyDetails?.email || 'support@nexo.works'}</span>
          </div>
        </div>

        {/* Bill To and Service Details - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1.5">BILL TO</h3>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">{customer?.name}</p>
              <p>Ph: {customer?.phone}</p>
              <p>{customer?.email}</p>
              <p className="text-xs">{customer?.address}</p>
              <p>Landmark: {customer?.landmark} | PIN: {customer?.pincode}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1.5">SERVICE DETAILS</h3>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-medium">#{paymentDetails?.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Date:</span>
                <span>{format(new Date(paymentDetails?.serviceDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{paymentDetails?.serviceTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-medium text-green-600">{paymentDetails?.paymentStatus || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between">
                <span>Txn ID:</span>
                <span className="font-mono text-xs">{paymentDetails?.transactionId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Services Table */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-1.5">Services & Items</h3>
          <table className="w-full text-xs compact-table">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-2 py-1 text-left font-medium text-gray-700">
                  DESCRIPTION
                </th>
                <th className="border border-gray-200 px-2 py-1 text-center font-medium text-gray-700">
                  QTY
                </th>
                <th className="border border-gray-200 px-2 py-1 text-center font-medium text-gray-700">
                  RATE
                </th>
                <th className="border border-gray-200 px-2 py-1 text-right font-medium text-gray-700">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {services?.map((service, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 px-2 py-1">
                    {service.description}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-center">
                    {service.quantity}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-center">
                    ₹{service.rate}
                  </td>
                  <td className="border border-gray-200 px-2 py-1 text-right">
                    ₹{service.quantity * service.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Total Section */}
        <div className="flex justify-end mb-3">
          <div className="w-56">
            <div className="flex justify-between py-0.5 text-xs">
              <span>Services:</span>
              <span>₹{servicesSubtotal}</span>
            </div>
            {visitingCharge > 0 && (
              <div className="flex justify-between py-0.5 text-xs">
                <span>Visiting Charge:</span>
                <span className="text-amber-600">+₹{visitingCharge}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between py-0.5 text-xs">
                <span>Platform Fee:</span>
                <span className="text-blue-600">+₹{serviceCharge}</span>
              </div>
            )}
            {emergencyCharge > 0 && (
              <div className="flex justify-between py-0.5 text-xs bg-red-50 px-1">
                <span className="text-red-600">Emergency:</span>
                <span className="text-red-600">+₹{emergencyCharge}</span>
              </div>
            )}
            {gstAmount > 0 && (
              <div className="flex justify-between py-0.5 text-xs">
                <span>GST:</span>
                <span>+₹{gstAmount}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-0.5 text-xs text-green-600">
                <span>Discount:</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between py-1 bg-gray-800 text-white px-2 font-semibold text-sm mt-1">
              <span>TOTAL AMOUNT:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="text-center border-t pt-2">
          <h3 className="font-semibold text-gray-800 text-sm mb-1.5">Thank You for Choosing Our Services!</h3>
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>
              For queries: <span className="text-blue-600">{companyDetails?.email || 'support@nexo.works'}</span> | 
              {/* <span className="text-blue-600"> {companyDetails?.phone || '+91-9740016068'}</span> |  */}
              <span className="text-blue-600"> {companyDetails?.website || 'www.nexo.works'}</span>
            </p>
            <p className="text-xs text-gray-500">
              Computer-generated invoice. No physical signature required. Subject to Bengaluru jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactInvoice;