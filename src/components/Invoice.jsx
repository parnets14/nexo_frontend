import React from 'react';
import { format } from 'date-fns';
import PrintOptions from './PrintOptions';

const Invoice = ({ invoiceData, onPrint }) => {
  const {
    invoiceNumber,
    date,
    status = 'CONFIRMED',
    customer,
    services,
    paymentDetails,
    companyDetails
  } = invoiceData;

  const subtotal = services?.reduce((sum, service) => sum + (service.quantity * service.rate), 0) || 0;
  const totalAmount = subtotal; // Add tax calculations if needed

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print Options - Hidden during print */}
      <PrintOptions onPrint={onPrint} invoiceData={invoiceData} />

      {/* Invoice Container */}
      <div className="border border-gray-300 p-6 print:border-0 print:p-0 invoice-container no-page-break">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                N
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Nexo</h1>
                <p className="text-sm text-gray-600">Professional Home Services</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{companyDetails?.name || 'Professional Home Services Private Limited'}</p>
              <p>CIN: {companyDetails?.cin || 'U74999KA2023PTC123456'}</p>
              <p>GSTIN: {companyDetails?.gstin || '29ABCDE1234F1Z5'}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-600 mb-2">INVOICE</h2>
            <div className="text-sm space-y-0.5">
              <p className="font-semibold">#{invoiceNumber}</p>
              <p>Date: {format(new Date(date), 'dd MMMM yyyy')}</p>
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
          <p>{companyDetails?.address || '#123, Tech Park, Whitefield'}</p>
          <p>{companyDetails?.city || 'Bengaluru, Karnataka - 560066'}</p>
          <div className="mt-2 space-y-0.5">
            <p>Contact: {companyDetails?.phone || '+91-80-4567-8900'}</p>
            <p>Email: {companyDetails?.email || 'support@company.works'}</p>
            <p>Website: {companyDetails?.website || 'www.nexo.works'}</p>
          </div>
        </div>

        {/* Bill To and Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bill To */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">BILL TO</h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-lg">{customer?.name}</p>
              <p>Phone: {customer?.phone}</p>
              <p>Email: {customer?.email}</p>
              <div className="mt-2">
                <p className="font-medium">Address:</p>
                <p>{customer?.address}</p>
                <p>Landmark: {customer?.landmark}</p>
                <p>Pincode: {customer?.pincode}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">SERVICE DETAILS</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-medium">#{paymentDetails?.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Date:</span>
                <span>{format(new Date(paymentDetails?.serviceDate), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Time:</span>
                <span>{paymentDetails?.serviceTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-medium">{paymentDetails?.paymentMode || 'ONLINE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-medium text-green-600">{paymentDetails?.paymentStatus || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">{paymentDetails?.transactionId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Services & Items</h3>
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
                {services?.map((service, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {service.description}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center text-sm">
                      {service.quantity}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center text-sm">
                      ₹{service.rate}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right text-sm">
                      ₹{service.quantity * service.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1.5 text-sm">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between py-2 bg-gray-800 text-white px-3 font-semibold">
              <span>TOTAL AMOUNT:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Thank You for Choosing Our Services!</h3>
          <div className="text-sm text-gray-600 space-y-1.5">
            <p>
              For any queries regarding this invoice, please contact us at{' '}
              <span className="text-blue-600">{companyDetails?.email || 'support@company.works'}</span>{' '}
              or call <span className="text-blue-600">{companyDetails?.phone || '+91-80-4567-8900'}</span>
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