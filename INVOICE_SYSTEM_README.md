# Invoice System Documentation

## Overview
This invoice system provides a professional, printable invoice component for the Nexo service booking platform. It matches the design shown in your reference image and includes full print functionality.

## Components Created

### 1. Core Invoice Component (`src/components/Invoice.jsx`)
- Main invoice display component
- Professional layout matching your design
- Print-optimized styling
- Responsive design

### 2. Invoice Viewer (`src/components/InvoiceViewer.jsx`)
- Handles loading booking data
- Generates invoice from booking information
- Error handling and loading states
- URL parameter support (`/invoice?bookingId=123`)

### 3. Sample Invoice Page (`src/pages/InvoicePage.jsx`)
- Demonstration page with sample data
- Available at `/invoice/sample`

### 4. Print Styles (`src/styles/print.css`)
- Print-specific CSS optimizations
- Ensures proper formatting when printing
- Handles colors and layout for print media

### 5. Utility Functions (`src/utils/invoiceGenerator.js`)
- `generateInvoiceFromBooking()` - Converts booking data to invoice format
- `generateInvoiceNumber()` - Creates invoice numbers
- `formatCurrency()` - Currency formatting
- `calculateInvoiceTotals()` - Tax and total calculations

### 6. Integration Helpers (`src/utils/invoiceIntegration.js`)
- `openInvoiceForPrint()` - Opens invoice in new tab for printing
- `generateInvoiceUrl()` - Creates invoice URLs
- `InvoiceButton` - Ready-to-use button component

## Usage

### Basic Usage
```jsx
import Invoice from '../components/Invoice';

const MyComponent = () => {
  const invoiceData = {
    invoiceNumber: 'TNT-BF11F6D5',
    date: '2025-12-27',
    status: 'CONFIRMED',
    customer: {
      name: 'Customer Name',
      phone: '1234567890',
      email: 'customer@email.com',
      address: 'Customer Address',
      landmark: 'Landmark',
      pincode: '560001'
    },
    services: [
      {
        description: 'Service Name',
        quantity: 1,
        rate: 100,
        amount: 100
      }
    ],
    paymentDetails: {
      bookingId: 'BOOKING123',
      serviceDate: '2025-12-28',
      serviceTime: '10:00 AM',
      paymentMode: 'ONLINE',
      paymentStatus: 'COMPLETED',
      transactionId: 'TXN123456'
    }
  };

  return <Invoice invoiceData={invoiceData} onPrint={() => console.log('Printed')} />;
};
```

### Adding Invoice Button to Existing Components
```jsx
import { openInvoiceForPrint } from '../utils/invoiceIntegration';

const BookingCard = ({ booking }) => {
  return (
    <div className="booking-card">
      {/* Your existing booking card content */}
      
      <button 
        onClick={() => openInvoiceForPrint(booking.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        View Invoice
      </button>
    </div>
  );
};
```

### Using the Invoice Viewer
The invoice viewer automatically loads booking data and generates an invoice:
- URL: `/invoice?bookingId=YOUR_BOOKING_ID`
- Example: `/invoice?bookingId=BF11F6D5`

## Routes Added
- `/invoice` - Invoice viewer (requires bookingId parameter)
- `/invoice/sample` - Sample invoice with demo data

## Integration with Your API

### Update the Invoice Viewer
In `src/components/InvoiceViewer.jsx`, replace the sample data section with your actual API call:

```jsx
// Replace this section in InvoiceViewer.jsx
try {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking data');
  }
  
  const bookingData = await response.json();
  const invoice = generateInvoiceFromBooking(bookingData);
  setInvoiceData(invoice);
} catch (err) {
  setError('Failed to load booking data');
  console.error('Error fetching booking:', err);
}
```

### Customize Company Details
Update the company information in `src/utils/invoiceGenerator.js`:

```jsx
companyDetails: {
  name: 'Your Company Name',
  cin: 'Your CIN Number',
  gstin: 'Your GSTIN',
  address: 'Your Address',
  city: 'Your City, State - Pincode',
  phone: 'Your Phone',
  email: 'Your Email',
  website: 'Your Website'
}
```

## Print Functionality

### Manual Print
Users can click the "Print Invoice" button to open the browser's print dialog.

### Programmatic Print
```jsx
import { openInvoiceForPrint } from '../utils/invoiceIntegration';

// Open invoice and auto-print
openInvoiceForPrint(bookingId);
```

### PDF Download (Optional)
To enable PDF download, install additional dependencies:
```bash
npm install html2canvas jspdf
```

Then use:
```jsx
import { downloadInvoiceAsPDF } from '../utils/invoiceIntegration';

downloadInvoiceAsPDF(bookingId);
```

## Customization

### Styling
- Modify `src/components/Invoice.jsx` for layout changes
- Update `src/styles/print.css` for print-specific styling
- Use Tailwind classes for quick styling adjustments

### Data Mapping
- Update `src/utils/invoiceGenerator.js` to match your booking data structure
- Modify the `generateInvoiceFromBooking()` function as needed

### Company Branding
- Replace the logo placeholder in the Invoice component
- Update colors to match your brand
- Customize the header and footer sections

## Testing
1. Visit `/invoice/sample` to see the sample invoice
2. Test printing functionality
3. Test with actual booking IDs: `/invoice?bookingId=YOUR_ID`

## Dependencies Added
- `date-fns` - For date formatting

## Next Steps
1. Update the API integration in `InvoiceViewer.jsx`
2. Add invoice buttons to your existing booking components
3. Customize company details and branding
4. Test with real booking data
5. Optional: Add PDF download functionality

The invoice system is now ready to use and can be easily integrated into your existing booking workflow!