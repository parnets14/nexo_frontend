import React, { useRef } from 'react'
import { FiPrinter, FiX } from 'react-icons/fi'

const Invoice = ({ data, type = 'booking', onClose }) => {
  const invoiceRef = useRef(null)

  // Determine invoice type and extract data
  const isBooking = type === 'booking' || type === 'job'
  const isTransaction = type === 'transaction'

  const invoiceNumber = isBooking 
    ? (data?.bookingId || data?._id?.toString().slice(-8) || `INV-${Date.now()}`)
    : (data?.transactionId || data?._id?.toString().slice(-8) || `TXN-${Date.now()}`)
  
  const invoiceDate = isBooking
    ? (data?.completedAt || data?.createdAt || new Date())
    : (data?.createdAt || new Date())

  const customerName = isBooking
    ? (data?.user?.name || data?.customerName || 'Customer')
    : (data?.partner?.profile?.name || data?.partnerName || 'Partner')

  const customerPhone = isBooking
    ? (data?.user?.phone || data?.customerPhone || 'N/A')
    : (data?.partner?.phone || 'N/A')

  const serviceName = isBooking
    ? (data?.subService?.name || data?.serviceName || data?.service?.name || 'Service')
    : null

  // Calculate amount - use price breakdown total for fee transactions if available
  const amount = isBooking
    ? (data?.amount || 0)
    : (data?.metadata?.priceBreakdown?.totalAmount || data?.amount || 0)

  const status = isBooking
    ? (data?.status || 'pending')
    : (data?.status || 'success')

  const paymentMode = isBooking
    ? (data?.paymentMode || 'cash')
    : null

  const location = isBooking
    ? (data?.location || {})
    : null

  const description = isTransaction
    ? (data?.description || 'Transaction')
    : serviceName

  const handlePrint = async () => {
    // Get logo image as base64 for print
    const logoImg = invoiceRef.current?.querySelector('.invoice-logo-img')
    let logoDataUrl = ''
    
    if (logoImg && logoImg.src) {
      try {
        // Use the actual image element if it's already loaded
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const canvas = document.createElement('canvas')
          canvas.width = logoImg.naturalWidth || 60
          canvas.height = logoImg.naturalHeight || 60
          const ctx = canvas.getContext('2d')
          ctx.drawImage(logoImg, 0, 0)
          logoDataUrl = canvas.toDataURL('image/png')
        } else {
          // Load the image if not already loaded
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0)
              logoDataUrl = canvas.toDataURL('image/png')
              resolve()
            }
            img.onerror = () => {
              // If image fails, use absolute URL
              logoDataUrl = logoImg.src.startsWith('http') ? logoImg.src : `${window.location.origin}${logoImg.src}`
              resolve()
            }
            // Use absolute URL if relative
            img.src = logoImg.src.startsWith('http') ? logoImg.src : `${window.location.origin}${logoImg.src}`
          })
        }
      } catch (error) {
        console.error('Error converting logo:', error)
        // Fallback to absolute URL
        if (logoImg.src) {
          logoDataUrl = logoImg.src.startsWith('http') ? logoImg.src : `${window.location.origin}${logoImg.src}`
        }
      }
    }

    const printWindow = window.open('', '_blank')
    let invoiceContent = invoiceRef.current.innerHTML
    
    // Replace logo image with base64 or absolute URL in print content
    if (logoDataUrl) {
      invoiceContent = invoiceContent.replace(
        /<img[^>]*class="invoice-logo-img"[^>]*>/,
        `<img src="${logoDataUrl}" alt="NEXO Logo" style="width: auto; height: 120px; object-fit: contain; display: block;" />`
      )
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: white;
              color: #1a202c;
              padding: 40px;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .invoice-header {
              border-bottom: 3px solid #214A73;
              padding-bottom: 30px;
              margin-bottom: 30px;
            }
            .invoice-header-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
            }
            .invoice-logo-container {
              display: flex;
              align-items: center;
            }
            .invoice-logo-box {
              width: auto;
              height: 120px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              padding: 10px;
            }
            .invoice-logo-img {
              width: auto;
              height: 100%;
              object-fit: contain;
              display: block;
            }
            img.invoice-logo-img {
              max-width: none;
              max-height: 120px;
            }
            .invoice-number {
              text-align: right;
            }
            .invoice-number h1 {
              font-size: 28px;
              color: #214A73;
              margin-bottom: 5px;
            }
            .invoice-number p {
              color: #718096;
              font-size: 14px;
            }
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 30px;
            }
            .info-section h3 {
              color: #214A73;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
            }
            .info-section p {
              color: #4a5568;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .invoice-items {
              margin: 30px 0;
            }
            .invoice-items h3 {
              color: #214A73;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table thead {
              background: #f7fafc;
            }
            .items-table th {
              padding: 12px;
              text-align: left;
              color: #214A73;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 15px 12px;
              border-bottom: 1px solid #e2e8f0;
              color: #2d3748;
            }
            .items-table tbody tr:last-child td {
              border-bottom: none;
            }
            .invoice-total {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
              padding: 8px 0;
            }
            .total-label {
              width: 200px;
              text-align: right;
              color: #4a5568;
              font-size: 14px;
            }
            .total-value {
              width: 150px;
              text-align: right;
              color: #1a202c;
              font-weight: 600;
              font-size: 14px;
            }
            .total-row.grand-total {
              border-top: 2px solid #214A73;
              padding-top: 15px;
              margin-top: 15px;
            }
            .total-row.grand-total .total-label,
            .total-row.grand-total .total-value {
              font-size: 18px;
              font-weight: 700;
              color: #214A73;
            }
            .invoice-footer {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #718096;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-completed {
              background: #c6f6d5;
              color: #22543d;
            }
            .status-success {
              background: #c6f6d5;
              color: #22543d;
            }
            .status-pending {
              background: #feebc8;
              color: #7c2d12;
            }
            .status-in_progress {
              background: #bee3f8;
              color: #2c5282;
            }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header with Actions */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Invoice</h2>
            <p className="text-sm text-slate-600 mt-1">#{invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2"
            >
              <FiPrinter /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 to-white">
          <div ref={invoiceRef} className="invoice-container bg-white rounded-lg shadow-lg p-8">
            {/* Invoice Header */}
            <div className="invoice-header">
              <div className="invoice-header-top">
                <div className="invoice-logo-container">
                  <div className="invoice-logo-box">
                    <img 
                      src="/logo.png" 
                      alt="NEXO Logo" 
                      className="invoice-logo-img"
                    />
                  </div>
                </div>
                <div className="invoice-number">
                  <h1>INVOICE</h1>
                  <p>#{invoiceNumber}</p>
                </div>
              </div>
              
              <div className="invoice-info">
                <div className="info-section">
                  <h3>Bill To</h3>
                  <p className="font-semibold text-slate-800">{customerName}</p>
                  <p>{customerPhone}</p>
                  {location && location.address && (
                    <p className="mt-2 text-sm">{location.address}</p>
                  )}
                  {location && location.city && (
                    <p className="text-sm">{location.city} - {location.pincode}</p>
                  )}
                </div>
                <div className="info-section">
                  <h3>Invoice Details</h3>
                  <p><strong>Date:</strong> {new Date(invoiceDate).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  {isBooking && data?.scheduledDate && (
                    <p><strong>Service Date:</strong> {new Date(data.scheduledDate).toLocaleDateString('en-IN')}</p>
                  )}
                  {isBooking && data?.scheduledTime && (
                    <p><strong>Service Time:</strong> {data.scheduledTime}</p>
                  )}
                  <p className="mt-2">
                    <span className={`status-badge ${
                      status === 'completed' || status === 'success' ? 'status-completed' :
                      status === 'pending' ? 'status-pending' :
                      status === 'in_progress' ? 'status-in_progress' :
                      'status-pending'
                    }`}>
                      {status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="invoice-items">
              <h3>Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="font-semibold text-slate-800">{description}</div>
                      {isBooking && serviceName && (
                        <div className="text-sm text-slate-600 mt-1">{serviceName}</div>
                      )}
                      {isTransaction && data?.reference && (
                        <div className="text-sm text-slate-600 mt-1">Ref: {data.reference}</div>
                      )}
                      {isBooking && paymentMode && (
                        <div className="text-sm text-slate-600 mt-1">Payment: {paymentMode}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Total */}
            <div className="invoice-total">
              {/* Show breakdown subtotal for fee transactions */}
              {isTransaction && data?.metadata?.priceBreakdown && (
                <>
                  {data.metadata.priceBreakdown.registrationFee > 0 && (
                    <div className="total-row">
                      <div className="total-label">Registration Fee:</div>
                      <div className="total-value">₹{data.metadata.priceBreakdown.registrationFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  )}
                  {data.metadata.priceBreakdown.securityDeposit > 0 && (
                    <div className="total-row">
                      <div className="total-label">Security Deposit:</div>
                      <div className="total-value">₹{data.metadata.priceBreakdown.securityDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  )}
                  {data.metadata.priceBreakdown.toolkitPrice > 0 && (
                    <div className="total-row">
                      <div className="total-label">Toolkit:</div>
                      <div className="total-value">₹{data.metadata.priceBreakdown.toolkitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  )}
                  {data.metadata.priceBreakdown.mgPlanFee > 0 && (
                    <div className="total-row">
                      <div className="total-label">MG Plan Fee:</div>
                      <div className="total-value">₹{data.metadata.priceBreakdown.mgPlanFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  )}
                  {data.metadata.priceBreakdown.leadFee > 0 && (
                    <div className="total-row">
                      <div className="total-label">Lead Fee:</div>
                      <div className="total-value">₹{data.metadata.priceBreakdown.leadFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  )}
                </>
              )}
              <div className="total-row">
                <div className="total-label">Subtotal:</div>
                <div className="total-value">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="total-row">
                <div className="total-label">Tax:</div>
                <div className="total-value">₹0.00</div>
              </div>
              <div className="total-row grand-total">
                <div className="total-label">Total:</div>
                <div className="total-value">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="invoice-footer">
              <p className="mb-2"><strong>Thank you for your business!</strong></p>
              <p>This is a computer-generated invoice and does not require a signature.</p>
              <p className="mt-4">For support, contact us at support@nexo.works</p>
              <p className="mt-2">www.nexo.works</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice

