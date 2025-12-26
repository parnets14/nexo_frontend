import React, { useState } from 'react'
import { FiX, FiPlus, FiTrash2, FiDollarSign, FiCalendar } from 'react-icons/fi'

const SendQuotationModal = ({ booking, onClose, onCreate, token }) => {
  const [items, setItems] = useState([{ name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [validTill, setValidTill] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calculate totals when items change
  React.useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
      return sum + itemTotal
    }, 0)
    
    setSubtotal(calculatedSubtotal)
    const calculatedTotal = calculatedSubtotal + (tax || 0) - (discount || 0)
    setTotalAmount(calculatedTotal)
  }, [items, tax, discount])

  const addItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...items]
    updatedItems[index][field] = value
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = (updatedItems[index].quantity || 0) * (updatedItems[index].unitPrice || 0)
    }
    
    setItems(updatedItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (items.some(item => !item.name || item.unitPrice <= 0)) {
      setError('Please fill all item fields and ensure prices are greater than 0')
      return
    }

    if (!validTill) {
      setError('Please select a valid till date')
      return
    }

    if (totalAmount <= 0) {
      setError('Total amount must be greater than 0')
      return
    }

    const validTillDate = new Date(validTill)
    if (validTillDate <= new Date()) {
      setError('Valid till date must be in the future')
      return
    }

    setLoading(true)
    try {
      await onCreate(booking._id || booking.bookingId, {
        items: items.map(item => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal,
        tax,
        discount,
        totalAmount,
        description,
        validTill: validTillDate.toISOString(),
        notes
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create quotation')
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900">Send Extra Quotation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Booking Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">
              <strong>Booking ID:</strong> {booking.bookingId || booking._id?.toString().slice(-8) || 'N/A'}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Service:</strong> {booking.service?.name || booking.subService?.name || 'N/A'}
            </p>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        placeholder="e.g., Spare Part, Additional Service"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Unit Price (₹) *</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Total (₹)</label>
                      <input
                        type="number"
                        value={item.total.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                      placeholder="Item description..."
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                  disabled={loading}
                />
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                  disabled={loading}
                />
                <span className="font-semibold">₹{discount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-300">
              <span>Total Amount:</span>
              <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
              placeholder="Additional description about the quotation..."
              disabled={loading}
            />
          </div>

          {/* Valid Till */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FiCalendar className="inline mr-2" />
              Valid Till <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              required
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary resize-none"
              placeholder="Internal notes..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || totalAmount <= 0}
            >
              {loading ? 'Sending...' : 'Send Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendQuotationModal

