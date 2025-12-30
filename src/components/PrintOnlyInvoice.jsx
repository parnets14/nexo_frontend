import React, { useEffect } from 'react';
import { format } from 'date-fns';

const PrintOnlyInvoice = ({ invoiceData }) => {
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
  const totalAmount = subtotal;

  useEffect(() => {
    // Auto-print when component loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html>
      <head>
        <title>Invoice {invoiceNumber}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #000;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .logo {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #2563eb;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            margin-right: 15px;
            border-radius: 4px;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
          }
          
          .company-details {
            font-size: 11px;
            color: #374151;
            line-height: 1.3;
          }
          
          .invoice-title-section {
            text-align: right;
          }
          
          .invoice-title {
            font-size: 32px;
            font-weight: 300;
            color: #9ca3af;
            margin-bottom: 15px;
          }
          
          .invoice-details {
            font-size: 11px;
          }
          
          .invoice-number {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            background-color: #dbeafe;
            color: #1e40af;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            margin-top: 8px;
          }
          
          .contact-info {
            margin-bottom: 30px;
            font-size: 11px;
            color: #374151;
            line-height: 1.4;
          }
          
          .contact-info .title {
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 11px;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .customer-name {
            font-weight: bold;
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 10px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
          }
          
          .detail-label {
            color: #4b5563;
          }
          
          .detail-value {
            font-weight: 500;
          }
          
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .services-table th {
            background-color: #f3f4f6;
            padding: 10px 12px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            color: #374151;
            text-transform: uppercase;
          }
          
          .services-table td {
            padding: 10px 12px;
            font-size: 10px;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .services-table .text-center {
            text-align: center;
          }
          
          .services-table .text-right {
            text-align: right;
          }
          
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          
          .total-box {
            width: 300px;
          }
          
          .subtotal-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 11px;
          }
          
          .total-row {
            display: flex;
          }
          
          .total-label {
            background-color: #1f2937;
            color: white;
            padding: 12px 16px;
            font-weight: bold;
            font-size: 11px;
          }
          
          .total-amount {
            background-color: #4b5563;
            color: white;
            padding: 12px 16px;
            font-weight: bold;
            font-size: 16px;
          }
          
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          .footer-title {
            font-weight: bold;
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .footer-text {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.5;
            margin-bottom: 8px;
          }
          
          .footer-links {
            color: #2563eb;
            font-weight: 500;
          }
          
          .footer-disclaimer {
            font-size: 9px;
            color: #6b7280;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          
          @media print {
            body { margin: 0; }
            .invoice-container { 
              border: 2px solid #000; 
              page-break-inside: avoid;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="invoice-container">
          {/* Header */}
          <div className="header">
            <div className="logo-section">
              <div className="logo">
                <div className="logo-icon">N</div>
                <div className="company-name">Nexo</div>
              </div>
              <div className="company-details">
                <div style={{fontWeight: '600', marginBottom: '5px'}}>ParNets Software India PVT LTD</div>
                <div>ParNets Software India PVT LTD</div>
                <div>GSTIN: {companyDetails?.gstin || '29AANCP7155K1ZN'}</div>
              </div>
            </div>
            
            <div className="invoice-title-section">
              <div className="invoice-title">INVOICE</div>
              <div className="invoice-details">
                <div className="invoice-number">#{invoiceNumber}</div>
                <div>Date: {format(new Date(date), 'dd MMMM yyyy')}</div>
                <div className="status-badge">{status}</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <div className="title">Registered Office:</div>
            <div>{companyDetails?.address || 'GROUND FLOOR, 104/1, Singapura Main Road, Grace Mens Wear, Singapura'}</div>
            <div>{companyDetails?.city || 'Bengaluru, Bengaluru Urban, Karnataka, 560097'}</div>
            <div style={{marginTop: '10px'}}>
              <span style={{fontWeight: '500'}}>Contact:</span> {companyDetails?.phone || '+91-9740016068'} | 
              <span style={{fontWeight: '500'}}> Email:</span> {companyDetails?.email || 'support@nexo.works'} | 
              <span style={{fontWeight: '500'}}> Website:</span> {companyDetails?.website || 'www.nexo.works'}
            </div>
          </div>

          {/* Two Column Section */}
          <div className="two-column">
            <div>
              <div className="section-title">BILL TO</div>
              <div className="customer-name">{customer?.name}</div>
              <div style={{fontSize: '11px', color: '#374151', lineHeight: '1.4'}}>
                <div><span style={{fontWeight: '500'}}>Phone:</span> {customer?.phone}</div>
                <div><span style={{fontWeight: '500'}}>Email:</span> {customer?.email}</div>
                <div style={{marginTop: '10px'}}>
                  <div><span style={{fontWeight: '500'}}>Address:</span></div>
                  <div>{customer?.address}</div>
                  <div><span style={{fontWeight: '500'}}>Landmark:</span> {customer?.landmark}</div>
                  <div><span style={{fontWeight: '500'}}>Pincode:</span> {customer?.pincode}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="section-title">SERVICE DETAILS</div>
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value" style={{color: '#2563eb', fontWeight: 'bold'}}>#{paymentDetails?.bookingId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service Date:</span>
                <span className="detail-value">{format(new Date(paymentDetails?.serviceDate), 'dd MMMM yyyy')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service Time:</span>
                <span className="detail-value">{paymentDetails?.serviceTime}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Mode:</span>
                <span className="detail-value" style={{fontWeight: 'bold'}}>{paymentDetails?.paymentMode || 'ONLINE'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className="detail-value" style={{color: '#059669', fontWeight: 'bold'}}>{paymentDetails?.paymentStatus || 'COMPLETED'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value" style={{fontFamily: 'monospace', fontSize: '9px'}}>{paymentDetails?.transactionId}</span>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div>
            <div className="section-title" style={{marginBottom: '15px'}}>Services & Items</div>
            <table className="services-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th className="text-center">QUANTITY</th>
                  <th className="text-center">RATE</th>
                  <th className="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {services?.map((service, index) => (
                  <tr key={index}>
                    <td>{service.description}</td>
                    <td className="text-center">{service.quantity}</td>
                    <td className="text-center">₹{service.rate}</td>
                    <td className="text-right">₹{service.quantity * service.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div className="total-section">
            <div className="total-box">
              <div className="subtotal-row">
                <span>Subtotal:</span>
                <span style={{fontWeight: 'bold'}}>₹{subtotal}</span>
              </div>
              <div className="total-row">
                <div className="total-label">TOTAL AMOUNT:</div>
                <div className="total-amount">₹{totalAmount}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-title">Thank You for Choosing Our Services!</div>
            <div className="footer-text">
              For any queries regarding this invoice, please contact us at{' '}
              <span className="footer-links">{companyDetails?.email || 'support@nexo.works'}</span>{' '}
              or call <span className="footer-links">{companyDetails?.phone || '+91-9740016068'}</span>
            </div>
            <div className="footer-text">
              Visit our website at{' '}
              <span className="footer-links">{companyDetails?.website || 'www.nexo.works'}</span>{' '}
              for more services
            </div>
            <div className="footer-disclaimer">
              This is a computer-generated invoice and does not require a physical signature.<br />
              Subject to Bengaluru jurisdiction. Terms and conditions apply.
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PrintOnlyInvoice;