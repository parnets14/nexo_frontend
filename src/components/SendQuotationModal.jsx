import React, { useState, useEffect } from 'react'
import { FiX, FiPlus, FiTrash2, FiCalendar, FiPackage, FiSearch, FiShoppingCart, FiMinus } from 'react-icons/fi'

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

  // Material selection state
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [materialCategories, setMaterialCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availableItems, setAvailableItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingMaterials, setLoadingMaterials] = useState(false)

  useEffect(() => {
    fetchMaterialCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory !== 'all') {
      fetchCategoryItems(selectedCategory)
    }
  }, [selectedCategory])

  // Calculate totals when items change
  React.useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      const itemTotal = quantity * unitPrice
      
      // Update the item's total if it's different
      if (item.total !== itemTotal) {
        const updatedItems = [...items]
        const itemIndex = items.indexOf(item)
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = { ...item, total: itemTotal }
          setItems(updatedItems)
        }
      }
      
      return sum + itemTotal
    }, 0)
    
    setSubtotal(calculatedSubtotal)
    const calculatedTotal = calculatedSubtotal + (Number(tax) || 0) - (Number(discount) || 0)
    setTotalAmount(calculatedTotal)
  }, [items, tax, discount])

  const fetchMaterialCategories = async () => {
    try {
      const response = await fetch('/api/public/material-categories')
      const data = await response.json()
      if (data.success) {
        setMaterialCategories(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch material categories:', err)
    }
  }

  const fetchCategoryItems = async (categoryId) => {
    if (!categoryId || categoryId === 'all') {
      setAvailableItems([])
      return
    }
    
    setLoadingMaterials(true)
    try {
      // Find the selected category from the already fetched categories
      const selectedCategory = materialCategories.find(cat => cat._id === categoryId)
      if (selectedCategory && selectedCategory.items) {
        // Transform the items to match the expected format
        const transformedItems = selectedCategory.items.map((item, index) => ({
          _id: `temp-${categoryId}-${index}`, // Create a temporary unique ID (not for MongoDB)
          name: typeof item === 'string' ? item : item.name,
          description: typeof item === 'object' ? item.description || '' : '',
          sellingPrice: typeof item === 'object' ? item.priceMax || item.priceMin || 0 : 0,
          priceMin: typeof item === 'object' ? item.priceMin || 0 : 0,
          priceMax: typeof item === 'object' ? item.priceMax || 0 : 0,
          category: selectedCategory.name,
          isFromCatalog: true // Flag to indicate this is from material catalog
        }))
        setAvailableItems(transformedItems)
      } else {
        setAvailableItems([])
      }
    } catch (err) {
      console.error('Failed to fetch category items:', err)
      setAvailableItems([])
    } finally {
      setLoadingMaterials(false)
    }
  }

  const addItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const addMaterialItem = (material) => {
    // Check if item already exists in the quotation
    const existingItemIndex = items.findIndex(item => 
      (material.isFromCatalog && item.name === material.name && item.category === material.category) ||
      (!material.isFromCatalog && item.materialId === material._id)
    )
    
    if (existingItemIndex !== -1) {
      // If item exists, increase quantity
      const updatedItems = [...items]
      const currentQuantity = Number(updatedItems[existingItemIndex].quantity) || 0
      const unitPrice = Number(updatedItems[existingItemIndex].unitPrice) || 0
      updatedItems[existingItemIndex].quantity = currentQuantity + 1
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * unitPrice
      setItems(updatedItems)
    } else {
      // If item doesn't exist, add new item
      const unitPrice = Number(material.sellingPrice || material.priceMax || material.priceMin) || 0
      const newItem = {
        name: String(material.name || '').trim(),
        description: String(material.description || '').trim(),
        quantity: 1,
        unitPrice: unitPrice,
        total: unitPrice,
        // Only set materialId if it's a real MongoDB ObjectId, not a temporary catalog ID
        materialId: material.isFromCatalog ? null : material._id,
        category: String(material.category || '').trim()
      }
      setItems([...items, newItem])
    }
  }

  const updateMaterialItemQuantity = (material, change) => {
    const existingItemIndex = items.findIndex(item => 
      (material.isFromCatalog && item.name === material.name && item.category === material.category) ||
      (!material.isFromCatalog && item.materialId === material._id)
    )
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...items]
      const currentQuantity = Number(updatedItems[existingItemIndex].quantity) || 0
      const unitPrice = Number(updatedItems[existingItemIndex].unitPrice) || 0
      const newQuantity = Math.max(1, currentQuantity + change)
      updatedItems[existingItemIndex].quantity = newQuantity
      updatedItems[existingItemIndex].total = newQuantity * unitPrice
      setItems(updatedItems)
    }
  }

  const getItemQuantityInQuotation = (material) => {
    const existingItem = items.find(item => 
      (material.isFromCatalog && item.name === material.name && item.category === material.category) ||
      (!material.isFromCatalog && item.materialId === material._id)
    )
    return existingItem ? existingItem.quantity : 0
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...items]
    
    // Convert numeric fields to numbers
    if (field === 'quantity' || field === 'unitPrice') {
      value = Number(value) || 0
    }
    
    updatedItems[index][field] = value
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(updatedItems[index].quantity) || 0
      const unitPrice = Number(updatedItems[index].unitPrice) || 0
      updatedItems[index].total = quantity * unitPrice
    }
    
    setItems(updatedItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (items.some(item => !item.name || !String(item.name).trim())) {
      setError('Please fill all item names')
      return
    }

    if (items.some(item => !item.quantity || Number(item.quantity) <= 0)) {
      setError('Please ensure all items have valid quantities greater than 0')
      return
    }

    if (items.some(item => !item.unitPrice || Number(item.unitPrice) <= 0)) {
      setError('Please ensure all items have valid unit prices greater than 0')
      return
    }

    if (!validTill) {
      setError('Please select a valid till date')
      return
    }

    if (Number(totalAmount) <= 0) {
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
      const quotationData = {
        items: items.map(item => {
          const processedItem = {
            name: String(item.name || '').trim(),
            description: String(item.description || '').trim(),
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            total: Number(item.total) || 0,
            // Only include materialId if it's a valid MongoDB ObjectId format (24 hex characters)
            materialId: (item.materialId && /^[0-9a-fA-F]{24}$/.test(item.materialId)) ? item.materialId : null,
            category: String(item.category || '').trim()
          };
          console.log('Processing item for quotation:', item.name, 'originalMaterialId:', item.materialId, 'processedMaterialId:', processedItem.materialId);
          return processedItem;
        }),
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        totalAmount: Number(totalAmount) || 0,
        description: String(description || '').trim(),
        validTill: validTillDate.toISOString(),
        notes: String(notes || '').trim()
      };
      
      console.log('Sending quotation data:', quotationData);
      await onCreate(booking._id || booking.bookingId, quotationData);
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

  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
                >
                  <FiPackage className="w-4 h-4" /> Add from Materials
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition inline-flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" /> Add Manual Item
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-700">Item {index + 1}</h4>
                      {item.materialId && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Material
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
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

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Select Material Items</h3>
              <button
                onClick={() => setShowMaterialSelector(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Material Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {materialCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Items List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {loadingMaterials ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredAvailableItems.length > 0 ? (
                  filteredAvailableItems.map((item) => {
                    const quantityInQuotation = getItemQuantityInQuotation(item)
                    
                    return (
                      <div
                        key={item._id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                          quantityInQuotation > 0 
                            ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{item.name}</h4>
                            {quantityInQuotation > 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Added
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span>₹{item.sellingPrice || item.priceMax || item.priceMin || 0}</span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        
                        {quantityInQuotation > 0 ? (
                          // Show quantity controls if item is already added
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => updateMaterialItemQuantity(item, -1)}
                              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-semibold text-slate-700">
                              {quantityInQuotation}
                            </span>
                            <button
                              onClick={() => updateMaterialItemQuantity(item, 1)}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          // Show add button if item is not added yet
                          <button
                            onClick={() => addMaterialItem(item)}
                            className="ml-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No items found</p>
                    {selectedCategory !== 'all' && (
                      <p className="text-sm">Try selecting a different category</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SendQuotationModal

