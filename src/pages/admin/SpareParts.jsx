import React, { useState, useEffect, useRef } from 'react'
import { FiAlertTriangle, FiBox, FiLink2, FiTruck, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiArrowUp, FiArrowDown, FiSearch, FiClock, FiPackage, FiRefreshCw, FiUser, FiEye, FiFileText } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

// Unit options for inventory management
const UNIT_OPTIONS = [
  { value: 'pieces', label: 'Pieces', category: 'Count' },
  { value: 'units', label: 'Units', category: 'Count' },
  { value: 'sets', label: 'Sets', category: 'Count' },
  { value: 'pairs', label: 'Pairs', category: 'Count' },
  { value: 'boxes', label: 'Boxes', category: 'Count' },
  { value: 'packets', label: 'Packets', category: 'Count' },
  { value: 'rolls', label: 'Rolls', category: 'Count' },
  { value: 'kg', label: 'Kilograms (kg)', category: 'Weight' },
  { value: 'grams', label: 'Grams (g)', category: 'Weight' },
  { value: 'liters', label: 'Liters (L)', category: 'Volume' },
  { value: 'ml', label: 'Milliliters (ml)', category: 'Volume' },
  { value: 'meters', label: 'Meters (m)', category: 'Length' },
  { value: 'cm', label: 'Centimeters (cm)', category: 'Length' },
  { value: 'feet', label: 'Feet (ft)', category: 'Length' },
  { value: 'inches', label: 'Inches (in)', category: 'Length' },
  { value: 'sqft', label: 'Square Feet (sq ft)', category: 'Area' },
  { value: 'sqm', label: 'Square Meters (sq m)', category: 'Area' }
]

// Comprehensive Material Icons List
const MATERIAL_ICONS = [
  // Tools & Hardware
  { emoji: '🔧', name: 'Wrench', category: 'Tools' },
  { emoji: '🔨', name: 'Hammer', category: 'Tools' },
  { emoji: '🛠️', name: 'Tools', category: 'Tools' },
  { emoji: '⚙️', name: 'Gear', category: 'Tools' },
  { emoji: '🔩', name: 'Nut & Bolt', category: 'Tools' },
  { emoji: '⚡', name: 'Electrical', category: 'Electrical' },
  { emoji: '💡', name: 'Light Bulb', category: 'Electrical' },
  { emoji: '🔌', name: 'Plug', category: 'Electrical' },
  { emoji: '📡', name: 'Antenna', category: 'Electrical' },
  { emoji: '🔋', name: 'Battery', category: 'Electrical' },
  // Plumbing
  { emoji: '🚿', name: 'Shower', category: 'Plumbing' },
  { emoji: '🚰', name: 'Water', category: 'Plumbing' },
  { emoji: '💧', name: 'Droplet', category: 'Plumbing' },
  { emoji: '🌊', name: 'Wave', category: 'Plumbing' },
  { emoji: '🚰', name: 'Tap', category: 'Plumbing' },
  // Painting & Decor
  { emoji: '🎨', name: 'Paint', category: 'Painting' },
  { emoji: '🖌️', name: 'Paintbrush', category: 'Painting' },
  { emoji: '🖼️', name: 'Frame', category: 'Decor' },
  { emoji: '🪟', name: 'Window', category: 'Decor' },
  { emoji: '🚪', name: 'Door', category: 'Decor' },
  // AC & Cooling
  { emoji: '❄️', name: 'Snowflake', category: 'AC' },
  { emoji: '🌡️', name: 'Thermometer', category: 'AC' },
  { emoji: '🌀', name: 'Cyclone', category: 'AC' },
  { emoji: '💨', name: 'Wind', category: 'AC' },
  // Cleaning & Maintenance
  { emoji: '🧹', name: 'Broom', category: 'Cleaning' },
  { emoji: '🧽', name: 'Sponge', category: 'Cleaning' },
  { emoji: '🧴', name: 'Bottle', category: 'Cleaning' },
  { emoji: '🧼', name: 'Soap', category: 'Cleaning' },
  { emoji: '🧯', name: 'Fire Extinguisher', category: 'Safety' },
  // Hardware & Fasteners
  { emoji: '📎', name: 'Paperclip', category: 'Hardware' },
  { emoji: '📌', name: 'Pushpin', category: 'Hardware' },
  { emoji: '🔒', name: 'Lock', category: 'Hardware' },
  { emoji: '🔑', name: 'Key', category: 'Hardware' },
  { emoji: '🪝', name: 'Hook', category: 'Hardware' },
  // Appliances
  { emoji: '📺', name: 'TV', category: 'Appliances' },
  { emoji: '📱', name: 'Phone', category: 'Appliances' },
  { emoji: '💻', name: 'Laptop', category: 'Appliances' },
  { emoji: '🖥️', name: 'Computer', category: 'Appliances' },
  { emoji: '⌨️', name: 'Keyboard', category: 'Appliances' },
  // Construction & Building
  { emoji: '🏗️', name: 'Construction', category: 'Building' },
  { emoji: '🧱', name: 'Brick', category: 'Building' },
  { emoji: '🏠', name: 'House', category: 'Building' },
  { emoji: '🏢', name: 'Building', category: 'Building' },
  { emoji: '🏭', name: 'Factory', category: 'Building' },
  // Packaging & Storage
  { emoji: '📦', name: 'Package', category: 'Storage' },
  { emoji: '📋', name: 'Clipboard', category: 'Storage' },
  { emoji: '🗂️', name: 'Card Index', category: 'Storage' },
  { emoji: '📁', name: 'Folder', category: 'Storage' },
  { emoji: '🗄️', name: 'File Cabinet', category: 'Storage' },
  // General Materials
  { emoji: '🧰', name: 'Toolbox', category: 'General' },
  { emoji: '🛒', name: 'Shopping Cart', category: 'General' },
  { emoji: '📊', name: 'Chart', category: 'General' },
  { emoji: '⭐', name: 'Star', category: 'General' },
  { emoji: '✨', name: 'Sparkle', category: 'General' },
  { emoji: '🌟', name: 'Glowing Star', category: 'General' },
  { emoji: '💎', name: 'Diamond', category: 'General' },
  { emoji: '🎯', name: 'Target', category: 'General' },
  { emoji: '✅', name: 'Check Mark', category: 'General' },
  { emoji: '🔍', name: 'Magnifying Glass', category: 'General' },
  // Specialized
  { emoji: '🪜', name: 'Ladder', category: 'Tools' },
  { emoji: '🪣', name: 'Bucket', category: 'Tools' },
  { emoji: '🧲', name: 'Magnet', category: 'Tools' },
  { emoji: '🔦', name: 'Flashlight', category: 'Tools' },
  { emoji: '🪛', name: 'Screwdriver', category: 'Tools' },
]

const SpareParts = () => {
  const { token } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory', 'materials', or 'vendor-parts'
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [materialFormData, setMaterialFormData] = useState({
    name: '',
    icon: '🔧',
    items: [],
    order: 0,
    isActive: true
  })
  const [newItem, setNewItem] = useState({ 
    name: '', 
    description: '',
    priceMin: '', 
    priceMax: '', 
    stock: '',
    unit: 'pieces',
    sku: '',
    brand: '',
    specifications: '',
    minOrderQuantity: '1'
  })
  const [editingItemIndex, setEditingItemIndex] = useState(null)
  const [editingItem, setEditingItem] = useState({ 
    name: '', 
    description: '',
    priceMin: '', 
    priceMax: '', 
    stock: '',
    unit: 'pieces',
    sku: '',
    brand: '',
    specifications: '',
    minOrderQuantity: '1'
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearchTerm, setIconSearchTerm] = useState('')
  const [showPOModal, setShowPOModal] = useState(false)
  const [showPODetails, setShowPODetails] = useState(false)
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null)
  const [showThresholdModal, setShowThresholdModal] = useState(false)
  const [poFormData, setPOFormData] = useState({
    supplier: '',
    supplierContact: '',
    expectedDeliveryDate: '',
    notes: '',
    items: []
  })
  const [poItemForm, setPOItemForm] = useState({
    selectedInventoryItem: '',
    sku: '',
    name: '',
    quantity: '',
    unitPrice: ''
  })
  const [inventoryItemSearch, setInventoryItemSearch] = useState('')
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false)
  const [showInventoryDetails, setShowInventoryDetails] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)
  const [showItemHistory, setShowItemHistory] = useState(false)
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null)
  const [itemHistoryData, setItemHistoryData] = useState([])
  const dropdownRef = useRef(null)
  const [thresholdFormData, setThresholdFormData] = useState({
    category: '',
    minStockLevel: 5,
    reorderLevel: 10,
    criticalLevel: 3,
    autoReorder: false,
    autoReorderQuantity: 20,
    leadTimeDays: 7
  })

  // Fetch inventory stats
  const { data: inventoryStatsData, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useAdminData(
    (token) => adminApi.fetchInventoryStats(token),
    []
  )

  // Fetch inventory items
  const { data: inventoryItemsData, isLoading: inventoryLoading, error: inventoryError, refresh: refreshInventory } = useAdminData(
    (token) => adminApi.fetchInventoryItems(token),
    []
  )

  // Fetch purchase orders with enhanced debugging
  const { data: purchaseOrdersData, isLoading: poLoading, error: poError, refresh: refreshPOs } = useAdminData(
    (token) => {
      console.log('🔄 Fetching purchase orders with token:', token ? 'Present' : 'Missing')
      return adminApi.fetchPurchaseOrders(token)
    },
    []
  )

  const { data: materialsData, isLoading: materialsLoading, error: materialsError, refresh: refreshMaterials } = useAdminData(
    (token) => adminApi.fetchMaterialCategories(token),
    []
  )

  // Fetch vendor spare parts
  const { data: vendorSparePartsData, isLoading: vendorPartsLoading, error: vendorPartsError, refresh: refreshVendorParts } = useAdminData(
    (token) => adminApi.fetchVendorSpareParts(token),
    []
  )

  const materials = materialsData?.data || []
  const inventoryItems = inventoryItemsData?.data || []
  const purchaseOrders = purchaseOrdersData?.data || []
  
  // Enhanced debugging for purchase orders
  useEffect(() => {
    console.log('📊 Purchase Orders Debug Info:')
    console.log('   Raw Data:', purchaseOrdersData)
    console.log('   Processed Array:', purchaseOrders)
    console.log('   Array Length:', purchaseOrders.length)
    console.log('   Loading State:', poLoading)
    console.log('   Error State:', poError)
    console.log('   Token Available:', !!token)
  }, [purchaseOrdersData, purchaseOrders, poLoading, poError, token])
  const stats = inventoryStatsData?.data || {}
  const vendorSpareParts = vendorSparePartsData?.data || []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowInventoryDropdown(false)
      }
    }

    if (showInventoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showInventoryDropdown])

  // Fetch item history
  const fetchItemHistory = async (itemId) => {
    console.log('🔍 Fetching history for item:', itemId)
    if (!itemId) {
      console.error('❌ No item ID provided for history fetch')
      setErrorMsg('Invalid item ID. Cannot fetch history.')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    
    try {
      const data = await adminApi.fetchInventoryItemHistory(token, itemId)
      console.log('📊 History data received:', data)
      setItemHistoryData(data.data?.history || [])
      setSelectedItemForHistory(itemId)
      setShowItemHistory(true)
    } catch (error) {
      console.error('❌ Failed to load item history:', error)
      setErrorMsg('Failed to load item history: ' + (error.message || 'Unknown error'))
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  // Handle inventory item operations
  const handleDeleteInventoryItem = async (itemId) => {
    console.log('🗑️ Attempting to delete item:', itemId)
    
    if (!itemId) {
      console.error('❌ No item ID provided for deletion')
      setErrorMsg('Invalid item ID. Cannot delete item.')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    
    if (!window.confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      return
    }

    try {
      await adminApi.deleteInventoryItem(token, itemId)
      console.log('✅ Item deleted successfully')
      setSuccessMsg('Inventory item deleted successfully!')
      setTimeout(() => {
        refreshInventory()
        refreshStats()
        setSuccessMsg('')
      }, 1000)
    } catch (error) {
      console.error('❌ Failed to delete inventory item:', error)
      setErrorMsg(error.message || 'Failed to delete inventory item')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  // Handle view inventory item details
  const handleViewInventoryItem = (item) => {
    console.log('👁️ Viewing item details:', item)
    if (!item || !item._id) {
      console.error('❌ Invalid item data:', item)
      setErrorMsg('Invalid item data. Cannot view details.')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    setSelectedInventoryItem(item)
    setShowInventoryDetails(true)
  }

  // Handle purchase order operations
  const handleViewPurchaseOrder = (po) => {
    console.log('👁️ Viewing purchase order details:', po)
    console.log('📊 PO items structure:', po.items)
    console.log('📊 PO items type:', typeof po.items)
    console.log('📊 PO items is array:', Array.isArray(po.items))
    
    if (!po || !po._id) {
      console.error('❌ Invalid purchase order data:', po)
      setErrorMsg('Invalid purchase order data. Cannot view details.')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    
    // Ensure items is an array
    if (po.items && !Array.isArray(po.items)) {
      console.warn('⚠️ PO items is not an array, converting:', po.items)
      po.items = []
    }
    
    setSelectedPurchaseOrder(po)
    setShowPODetails(true)
  }

  const handleDeletePurchaseOrder = async (poId) => {
    console.log('🗑️ Attempting to delete purchase order:', poId)
    
    if (!poId) {
      console.error('❌ No purchase order ID provided for deletion')
      setErrorMsg('Invalid purchase order ID. Cannot delete.')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    
    if (!window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      return
    }

    try {
      await adminApi.deletePurchaseOrder(token, poId)
      console.log('✅ Purchase order deleted successfully')
      setSuccessMsg('Purchase order deleted successfully!')
      setTimeout(() => {
        refreshPOs()
        refreshStats()
        setSuccessMsg('')
      }, 1000)
    } catch (error) {
      console.error('❌ Failed to delete purchase order:', error)
      setErrorMsg(error.message || 'Failed to delete purchase order')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  // Define inventory columns inside component so functions are in scope
  const inventoryColumns = [
    { header: 'SKU', accessor: 'sku' },
    { 
      header: 'Product Details', 
      accessor: 'name',
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-800 text-sm">{value}</div>
          {row.brand && (
            <div className="text-xs text-purple-600 font-medium mt-0.5">{row.brand}</div>
          )}
          {row.specifications && (
            <div className="text-xs text-slate-500 mt-0.5 truncate" title={row.specifications}>
              {row.specifications}
            </div>
          )}
          {row.description && (
            <div className="text-xs text-slate-400 mt-0.5 italic truncate" title={row.description}>
              {row.description}
            </div>
          )}
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (value, row) => {
        // Handle both string and number formats
        let stockValue = 0;
        let unit = row.unit || 'units';
        
        if (typeof value === 'string') {
          const parts = value.split(' ');
          stockValue = parseInt(parts[0]) || 0;
          unit = parts.slice(1).join(' ') || unit;
        } else if (typeof value === 'number') {
          stockValue = value;
        }
        
        // Determine status color based on stock level
        let statusColor = 'bg-emerald-500/10 text-emerald-600'; // Healthy
        if (stockValue === 0) {
          statusColor = 'bg-rose-500/10 text-rose-600'; // Critical
        } else if (stockValue <= (row.minStockLevel || 5)) {
          statusColor = 'bg-rose-500/10 text-rose-600'; // Critical
        } else if (stockValue <= (row.reorderLevel || 10)) {
          statusColor = 'bg-amber-500/10 text-amber-600'; // Low
        }
        
        return (
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {stockValue} {unit}
            </span>
            {row.minOrderQuantity && row.minOrderQuantity > 1 && (
              <div className="text-xs text-slate-500">
                Min: {row.minOrderQuantity}
              </div>
            )}
          </div>
        )
      }
    },
    { 
      header: 'Unit Price', 
      accessor: 'unitPrice',
      render: (value) => `₹${(value || 0).toLocaleString('en-IN')}`
    },
    { header: 'Supplier', accessor: 'supplier' },
    {
      header: 'Lead Time',
      accessor: 'leadTime',
      render: (value) => typeof value === 'string' ? value : `${value || 0} days`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value, row) => {
        // Auto-calculate status if not provided
        let status = value;
        if (!status) {
          const stockValue = typeof row.stock === 'string' ? parseInt(row.stock.split(' ')[0]) || 0 : row.stock || 0;
          if (stockValue === 0 || stockValue <= (row.minStockLevel || 5)) {
            status = 'Critical';
          } else if (stockValue <= (row.reorderLevel || 10)) {
            status = 'Low';
          } else {
            status = 'Healthy';
          }
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            status === 'Critical' ? 'bg-rose-500/10 text-rose-600' :
            status === 'Low' ? 'bg-amber-500/10 text-amber-600' :
            'bg-emerald-500/10 text-emerald-600'
          }`}>
            {status}
          </span>
        )
      }
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => {
        if (!value) {
          console.warn('⚠️ No ID found for inventory item:', row)
          return <span className="text-xs text-slate-400">No actions available</span>
        }
        
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('👁️ View button clicked for item:', value, row)
                try {
                  handleViewInventoryItem(row)
                } catch (error) {
                  console.error('Error in view handler:', error)
                  alert('Error viewing item details: ' + error.message)
                }
              }}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('📊 History button clicked for item:', value)
                try {
                  fetchItemHistory(value)
                } catch (error) {
                  console.error('Error in history handler:', error)
                  alert('Error fetching item history: ' + error.message)
                }
              }}
              className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
              title="View History"
            >
              <FiClock className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🗑️ Delete button clicked for item:', value)
                try {
                  handleDeleteInventoryItem(value)
                } catch (error) {
                  console.error('Error in delete handler:', error)
                  alert('Error deleting item: ' + error.message)
                }
              }}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Delete Item"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium">
              Auto-Generated
            </div>
          </div>
        )
      }
    }
  ]

  // Define procurement columns inside component so functions are in scope
  const procurementColumns = [
    { header: 'PO', accessor: 'poId' },
    { header: 'Supplier', accessor: 'supplier' },
    {
      header: 'Parts',
      accessor: 'itemsDisplay',
      render: (value, row) => {
        // Use itemsDisplay if available (formatted string), otherwise format items array
        if (value) return value
        if (Array.isArray(row.items)) {
          return row.items.map(item => `${item.name || item.sku} (${item.quantity})`).join(', ')
        }
        return row.items || 'N/A'
      }
    },
    {
      header: 'Value',
      accessor: 'value',
      render: (value, row) => {
        if (typeof value === 'string') return value
        const totalValue = row.totalValue || 0
        return totalValue > 100000 ? `₹${(totalValue / 100000).toFixed(1)}L` : `₹${totalValue.toLocaleString()}`
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          value === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
          value === 'In Transit' ? 'bg-blue-500/10 text-blue-600' :
          value === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
          value === 'Cancelled' ? 'bg-rose-500/10 text-rose-600' :
          'bg-slate-500/10 text-slate-600'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'ETA',
      accessor: 'eta',
      render: (value, row) => {
        if (typeof value === 'string') return value
        if (row.expectedDeliveryDate) {
          return new Date(row.expectedDeliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        }
        return 'N/A'
      }
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => {
        if (!value) {
          return <span className="text-xs text-slate-400">No actions available</span>
        }
        
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleViewPurchaseOrder(row)
              }}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="View Purchase Order Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDeletePurchaseOrder(value)
              }}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Delete Purchase Order"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    }
  ]

  const dynamicStats = [
    {
      label: 'Inventory Value',
      value: stats.valuation || '₹0',
      trend: 'Real-time',
      icon: FiBox,
      description: `Across ${stats.totalItems || 0} items`
    },
    {
      label: 'Critical SKUs',
      value: stats.criticalCount || 0,
      trend: stats.criticalCount > 0 ? 'Action required' : 'All good',
      icon: FiAlertTriangle,
      intent: stats.criticalCount > 0 ? 'warning' : 'positive',
      description: 'Below configured safety stock'
    },
    {
      label: 'Active Suppliers',
      value: stats.suppliers || 0,
      trend: 'Active vendors',
      icon: FiLink2,
      description: 'With active purchase orders'
    },
    {
      label: 'In-transit Shipments',
      value: stats.inTransit || 0,
      trend: 'Pending delivery',
      icon: FiTruck,
      description: 'Purchase orders in transit'
    }
  ]

  // Auto-generate inventory from all material categories
  const autoGenerateInventoryFromAllMaterials = async () => {
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      console.log('🔄 Auto-generating inventory from all material categories...')
      console.log('📦 Available materials:', materials.length)

      let createdCount = 0
      let updatedCount = 0
      let skippedCount = 0

      for (const material of materials) {
        if (!material.items || material.items.length === 0) {
          console.log(`⏭️ Skipping ${material.name} - no items`)
          continue
        }

        console.log(`📋 Processing category: ${material.name} (${material.items.length} items)`)

        for (const item of material.items) {
          // Generate SKU from category and item name
          const categoryCode = material.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')
          const itemCode = item.name.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')
          const timestamp = Date.now().toString().slice(-4)
          const sku = item.sku || `${categoryCode}-${itemCode}-${timestamp}`

          // Check if inventory item already exists by SKU or name+category combination
          const existingItem = inventoryItems.find(invItem => 
            invItem.sku === sku || 
            (invItem.name?.toLowerCase() === item.name?.toLowerCase() && 
             invItem.category?.toLowerCase() === material.name?.toLowerCase())
          )

          const inventoryData = {
            sku: existingItem ? existingItem.sku : sku,
            name: item.name,
            category: material.name,
            location: 'Main Warehouse',
            stock: item.stock || 0,
            unit: item.unit || 'pieces',
            supplier: 'Default Supplier',
            supplierContact: '+91-9876543210',
            leadTime: 3,
            unitPrice: item.priceMin || item.priceMax || 0,
            reorderLevel: Math.max(Math.floor((item.stock || 0) * 0.3), 5),
            minStockLevel: Math.max(Math.floor((item.stock || 0) * 0.1), 2),
            description: item.description || `${item.name} from ${material.name} category`,
            brand: item.brand || '',
            specifications: item.specifications || '',
            minOrderQuantity: item.minOrderQuantity || 1
          }

          try {
            if (existingItem) {
              // Update existing item with latest information from material
              await adminApi.updateInventoryItem(token, existingItem._id, {
                ...inventoryData,
                stock: item.stock || existingItem.stock // Use material stock if available
              })
              updatedCount++
              console.log(`✅ Updated: ${item.name}`)
            } else {
              // Create new inventory item
              await adminApi.createInventoryItem(token, inventoryData)
              createdCount++
              console.log(`✅ Created: ${item.name}`)
            }
          } catch (itemError) {
            console.error(`❌ Error processing ${item.name}:`, itemError)
            skippedCount++
          }
        }
      }

      const totalProcessed = createdCount + updatedCount
      if (totalProcessed > 0) {
        setSuccessMsg(`Inventory auto-generated! Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`)
        setTimeout(() => {
          refreshInventory()
          refreshStats()
          setSuccessMsg('')
        }, 2000)
      } else {
        setErrorMsg('No inventory items were generated. Make sure your material categories have products.')
        setTimeout(() => setErrorMsg(''), 5000)
      }

    } catch (error) {
      console.error('❌ Error auto-generating inventory:', error)
      setErrorMsg('Failed to auto-generate inventory: ' + (error.message || 'Unknown error'))
      setTimeout(() => setErrorMsg(''), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-sync inventory when materials change
  useEffect(() => {
    if (materials.length > 0 && !materialsLoading) {
      // Auto-generate inventory in the background when materials are loaded
      const hasItemsWithStock = materials.some(material => 
        material.items && material.items.some(item => item.stock && item.stock > 0)
      )
      
      if (hasItemsWithStock && inventoryItems.length === 0) {
        console.log('🔄 Auto-syncing inventory from materials...')
        autoGenerateInventoryFromAllMaterials()
      }
    }
  }, [materials, materialsLoading])

  // Generate inventory from material categories (renamed for clarity)
  const generateInventoryFromMaterials = async () => {
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      console.log('🔄 Generating inventory from materials...')
      console.log('📦 Available materials:', materials.length)

      let createdCount = 0
      let updatedCount = 0
      let skippedCount = 0

      for (const material of materials) {
        if (!material.items || material.items.length === 0) {
          console.log(`⏭️ Skipping ${material.name} - no items`)
          continue
        }

        console.log(`📋 Processing category: ${material.name} (${material.items.length} items)`)

        for (const item of material.items) {
          // Only process items that have stock information
          if (!item.stock || item.stock === 0) {
            console.log(`⏭️ Skipping ${item.name} - no stock information`)
            skippedCount++
            continue
          }

          // Generate SKU from category and item name
          const categoryCode = material.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')
          const itemCode = item.name.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')
          const sku = `${categoryCode}-${itemCode}-001`

          // Check if inventory item already exists
          const existingItem = inventoryItems.find(invItem => 
            invItem.name?.toLowerCase() === item.name?.toLowerCase() && 
            invItem.category?.toLowerCase() === material.name?.toLowerCase()
          )

          const inventoryData = {
            sku: existingItem ? existingItem.sku : (item.sku || sku),
            name: item.name,
            category: material.name,
            location: 'Main Warehouse', // Default location
            stock: item.stock,
            unit: item.unit || 'units', // Use item unit or default
            supplier: 'Default Supplier', // Default supplier
            supplierContact: '+91-9876543210', // Default contact
            leadTime: 3, // Default lead time
            unitPrice: item.priceMin || item.priceMax || 0, // Use min price or max price
            reorderLevel: Math.max(Math.floor(item.stock * 0.3), 5), // 30% of stock or minimum 5
            minStockLevel: Math.max(Math.floor(item.stock * 0.1), 2), // 10% of stock or minimum 2
            description: item.description || `${item.name} from ${material.name} category. Auto-generated from material stock.`,
            brand: item.brand || '',
            specifications: item.specifications || '',
            minOrderQuantity: item.minOrderQuantity || 1
          }

          try {
            if (existingItem) {
              // Update existing item
              await adminApi.updateInventoryItem(token, existingItem._id, {
                ...inventoryData,
                stock: existingItem.stock + item.stock // Add to existing stock
              })
              updatedCount++
              console.log(`✅ Updated: ${item.name}`)
            } else {
              // Create new item
              await adminApi.createInventoryItem(token, inventoryData)
              createdCount++
              console.log(`✅ Created: ${item.name}`)
            }
          } catch (itemError) {
            console.error(`❌ Error processing ${item.name}:`, itemError)
            // Continue with other items even if one fails
          }
        }
      }

      const totalProcessed = createdCount + updatedCount
      if (totalProcessed > 0) {
        setSuccessMsg(`Inventory generated successfully! Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`)
        setTimeout(() => {
          refreshInventory()
          refreshStats()
          setSuccessMsg('')
        }, 2000)
      } else {
        setErrorMsg('No inventory items were generated. Make sure your material categories have items with stock information.')
        setTimeout(() => setErrorMsg(''), 5000)
      }

    } catch (error) {
      console.error('❌ Error generating inventory:', error)
      setErrorMsg('Failed to generate inventory: ' + (error.message || 'Unknown error'))
      setTimeout(() => setErrorMsg(''), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenMaterialModal = (material = null) => {
    if (material) {
      setEditingMaterial(material._id)
      setMaterialFormData({
        name: material.name || '',
        icon: material.icon || '🔧',
        items: material.items || [],
        order: material.order || 0,
        isActive: material.isActive !== undefined ? material.isActive : true
      })
    } else {
      setEditingMaterial(null)
      setMaterialFormData({
        name: '',
        icon: '🔧',
        items: [],
        order: materials.length > 0 ? Math.max(...materials.map(m => m.order || 0)) + 1 : 0,
        isActive: true
      })
    }
    setNewItem({ name: '', priceMin: '', priceMax: '', stock: '' })
    setShowMaterialModal(true)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleCloseMaterialModal = () => {
    setShowMaterialModal(false)
    setEditingMaterial(null)
    setMaterialFormData({
      name: '',
      icon: '🔧',
      items: [],
      order: 0,
      isActive: true
    })
    setNewItem({ name: '', priceMin: '', priceMax: '', stock: '' })
    setErrorMsg('')
    setSuccessMsg('')
    setShowIconPicker(false)
    setIconSearchTerm('')
  }

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      setMaterialFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          name: newItem.name.trim(),
          description: newItem.description.trim(),
          priceMin: newItem.priceMin ? Number(newItem.priceMin) : null,
          priceMax: newItem.priceMax ? Number(newItem.priceMax) : null,
          stock: newItem.stock ? Number(newItem.stock) : 0,
          unit: newItem.unit || 'pieces',
          sku: newItem.sku.trim(),
          brand: newItem.brand.trim(),
          specifications: newItem.specifications.trim(),
          minOrderQuantity: newItem.minOrderQuantity ? Number(newItem.minOrderQuantity) : 1,
          isActive: true
        }]
      }))
      setNewItem({ 
        name: '', 
        description: '',
        priceMin: '', 
        priceMax: '', 
        stock: '',
        unit: 'pieces',
        sku: '',
        brand: '',
        specifications: '',
        minOrderQuantity: '1'
      })
    }
  }

  const handleEditItem = (index, item) => {
    setEditingItemIndex(index)
    setEditingItem({
      name: item.name || '',
      description: item.description || '',
      priceMin: item.priceMin || '',
      priceMax: item.priceMax || '',
      stock: item.stock || '',
      unit: item.unit || 'pieces',
      sku: item.sku || '',
      brand: item.brand || '',
      specifications: item.specifications || '',
      minOrderQuantity: item.minOrderQuantity || '1'
    })
  }

  const handleUpdateItem = () => {
    if (editingItem.name.trim() && editingItemIndex !== null) {
      setMaterialFormData(prev => ({
        ...prev,
        items: prev.items.map((item, index) => 
          index === editingItemIndex ? {
            name: editingItem.name.trim(),
            description: editingItem.description.trim(),
            priceMin: editingItem.priceMin ? Number(editingItem.priceMin) : null,
            priceMax: editingItem.priceMax ? Number(editingItem.priceMax) : null,
            stock: editingItem.stock ? Number(editingItem.stock) : 0,
            unit: editingItem.unit || 'pieces',
            sku: editingItem.sku.trim(),
            brand: editingItem.brand.trim(),
            specifications: editingItem.specifications.trim(),
            minOrderQuantity: editingItem.minOrderQuantity ? Number(editingItem.minOrderQuantity) : 1,
            isActive: item.isActive !== undefined ? item.isActive : true
          } : item
        )
      }))
      setEditingItemIndex(null)
      setEditingItem({ 
        name: '', 
        description: '',
        priceMin: '', 
        priceMax: '', 
        stock: '',
        unit: 'pieces',
        sku: '',
        brand: '',
        specifications: '',
        minOrderQuantity: '1'
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(null)
    setEditingItem({ 
      name: '', 
      description: '',
      priceMin: '', 
      priceMax: '', 
      stock: '',
      unit: 'pieces',
      sku: '',
      brand: '',
      specifications: '',
      minOrderQuantity: '1'
    })
  }

  const handleRemoveItem = (index) => {
    setMaterialFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmitMaterial = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (!materialFormData.name || !materialFormData.icon || materialFormData.items.length === 0) {
        setErrorMsg('Please fill in all required fields and add at least one item')
        setSubmitting(false)
        return
      }

      if (editingMaterial) {
        await adminApi.updateMaterialCategory(token, editingMaterial, materialFormData)
        setSuccessMsg('Material category updated successfully!')
      } else {
        await adminApi.createMaterialCategory(token, materialFormData)
        setSuccessMsg('Material category created successfully!')
      }

      setTimeout(() => {
        refreshMaterials()
        handleCloseMaterialModal()
      }, 1000)
    } catch (error) {
      setErrorMsg(error.message || 'Failed to save material category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material category?')) {
      return
    }

    try {
      await adminApi.deleteMaterialCategory(token, id)
      setSuccessMsg('Material category deleted successfully!')
      setTimeout(() => {
        refreshMaterials()
        setSuccessMsg('')
      }, 1000)
    } catch (error) {
      setErrorMsg(error.message || 'Failed to delete material category')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const handleMoveOrder = async (id, direction) => {
    const currentIndex = materials.findIndex(m => m._id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= materials.length) return

    const updatedMaterials = [...materials]
    const [moved] = updatedMaterials.splice(currentIndex, 1)
    updatedMaterials.splice(newIndex, 0, moved)

    const orderUpdates = updatedMaterials.map((m, idx) => ({
      id: m._id,
      order: idx
    }))

    try {
      await adminApi.updateMaterialCategoryOrder(token, orderUpdates)
      refreshMaterials()
    } catch (error) {
      setErrorMsg(error.message || 'Failed to update order')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const materialColumns = [
    { header: 'Icon', accessor: 'icon', render: (value) => <span className="text-2xl">{value}</span> },
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Items', 
      accessor: 'items',
      render: (value) => {
        const itemsArray = Array.isArray(value) ? value : [];
        const totalItems = itemsArray.length;
        const itemsWithStock = itemsArray.filter(item => item.stock && item.stock > 0).length;
        const totalStock = itemsArray.reduce((sum, item) => sum + (item.stock || 0), 0);
        
        return (
          <div className="space-y-1">
            <span className="text-sm text-slate-600">
              {totalItems} items
            </span>
            {totalItems > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  itemsWithStock > 0 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {itemsWithStock} with stock
                </span>
                {totalStock > 0 && (
                  <span className="text-xs text-blue-600 font-semibold">
                    {totalStock} total units
                  </span>
                )}
              </div>
            )}
          </div>
        )
      }
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { header: 'Order', accessor: 'order' },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMoveOrder(value, 'up')}
            className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
            disabled={materials.findIndex(m => m._id === value) === 0}
          >
            <FiArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMoveOrder(value, 'down')}
            className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
            disabled={materials.findIndex(m => m._id === value) === materials.length - 1}
          >
            <FiArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenMaterialModal(row)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMaterial(value)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <ModuleHeader
        title="Spare Parts"
        subtitle="Stay ahead of technician demand with predictive inventory, supplier tracking, and automated procurement flows."
        actions={
          <div className="flex gap-2">
            {activeTab === 'materials' && (
              <button
                onClick={() => handleOpenMaterialModal()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Material Category
              </button>
            )}
            {activeTab === 'inventory' && (
              <>
                <button
                  onClick={() => setShowPOModal(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Purchase Order
                </button>
                <button
                  onClick={() => setShowThresholdModal(true)}
                  className="px-4 py-2 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition"
                >
                  Configure Thresholds
                </button>
                <button
                  onClick={autoGenerateInventoryFromAllMaterials}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  {submitting ? 'Generating...' : 'Generate Inventory'}
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-semibold text-sm transition ${
            activeTab === 'inventory'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-semibold text-sm transition ${
            activeTab === 'materials'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Available Materials
        </button>
        <button
          onClick={() => setActiveTab('vendor-parts')}
          className={`px-4 py-2 font-semibold text-sm transition ${
            activeTab === 'vendor-parts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vendor Spare Parts
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {activeTab === 'materials' && (
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Material Categories
            </h2>
            {materialsLoading && <span className="text-xs text-slate-400">Loading...</span>}
            {materialsError && <span className="text-xs text-rose-500">Error loading materials</span>}
          </div>
          <DataTable
            columns={materialColumns}
            data={materials}
            emptyLabel="No material categories found. Click 'Add Material Category' to create one."
          />
        </section>
      )}

      {activeTab === 'vendor-parts' && (
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Vendor Spare Parts
            </h2>
            <div className="flex items-center gap-3">
              {vendorPartsError && (
                <span className="text-xs text-rose-500">
                  Error loading vendor parts. {vendorSpareParts.length > 0 ? `Showing ${vendorSpareParts.length} cached items.` : 'Please refresh.'}
                </span>
              )}
              {vendorPartsLoading && <span className="text-xs text-slate-400">Loading...</span>}
              {!vendorPartsLoading && !vendorPartsError && (
                <span className="text-xs text-slate-500">{vendorSpareParts.length} parts</span>
              )}
              <button
                onClick={() => refreshVendorParts()}
                className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
              >
                <FiRefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>
          <DataTable
            columns={[
              {
                header: 'Image/Icon',
                accessor: 'image',
                render: (value, row) => (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    {row.image ? (
                      <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                    ) : row.icon ? (
                      <span className="text-2xl">{row.icon}</span>
                    ) : (
                      <FiPackage className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                )
              },
              { header: 'Name', accessor: 'name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Brand', accessor: 'brand' },
              {
                header: 'Price',
                accessor: 'price',
                render: (value) => `₹${value?.toLocaleString('en-IN') || 0}`
              },
              {
                header: 'Stock',
                accessor: 'stock',
                render: (value, row) => `${value || 0} ${row.unit || 'units'}`
              },
              {
                header: 'Vendor',
                accessor: 'vendor',
                render: (value) => {
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium">{value.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{value.companyName || value.email || ''}</div>
                        </div>
                      </div>
                    )
                  }
                  return 'N/A'
                }
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (value) => (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    value === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : value === 'out_of_stock'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-slate-500/10 text-slate-600'
                  }`}>
                    {value === 'out_of_stock' ? 'Out of Stock' : value || 'Inactive'}
                  </span>
                )
              },
              {
                header: 'Actions',
                accessor: '_id',
                render: (value, row) => (
                  <button
                    onClick={() => window.open(`/admin/vendors/${row.vendor?._id || row.vendor}`, '_blank')}
                    className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                    title="View Vendor"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                )
              }
            ]}
            data={vendorSpareParts}
            emptyLabel="No vendor spare parts found. Vendors can add spare parts from their dashboard."
          />
        </section>
      )}

      {activeTab === 'inventory' && (
        <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
            {dynamicStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Information</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>Inventory Items Count: {inventoryItems.length}</p>
            <p>Loading: {inventoryLoading ? 'Yes' : 'No'}</p>
            <p>Error: {inventoryError ? inventoryError.message || 'Yes' : 'No'}</p>
            <p>Stats: {JSON.stringify(stats)}</p>
            <p>Raw Data: {inventoryItemsData ? 'Available' : 'Not Available'}</p>
          </div>
        </div>
      )}

      {/* Auto-Generation Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiRefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Auto-Generated Inventory</h3>
            <p className="text-sm text-blue-700 mb-2">
              Inventory items are automatically generated from your material categories. 
              When you add stock information to material items, they become inventory items with full details.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• <strong>SKU:</strong> Auto-generated from category and item name</p>
              <p>• <strong>Pricing:</strong> Uses min/max price from material items</p>
              <p>• <strong>Stock Levels:</strong> Smart reorder levels based on stock quantity</p>
              <p>• <strong>Location:</strong> Default warehouse assignment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Inventory Positions
            </h2>
            <div className="flex items-center gap-3">
              {inventoryError && (
                <span className="text-xs text-rose-500">
                  Error loading inventory data. {inventoryItems.length > 0 ? `Showing ${inventoryItems.length} cached items.` : 'Please refresh.'}
                </span>
              )}
              {inventoryLoading && <span className="text-xs text-slate-400">Loading stock data...</span>}
              {!inventoryLoading && !inventoryError && (
                <span className="text-xs text-slate-500">{inventoryItems.length} items</span>
              )}
              <button
                onClick={() => refreshInventory()}
                className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
              >
                <FiRefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>
          <DataTable
            columns={inventoryColumns}
            data={inventoryItems}
            emptyLabel={
              <div className="text-center py-12">
                <FiPackage className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No inventory items found.</p>
                <p className="text-slate-400 text-sm mb-6">
                  Add stock information to your material categories, then generate inventory automatically.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={autoGenerateInventoryFromAllMaterials}
                    disabled={submitting || materials.length === 0}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                    {submitting ? 'Generating...' : 'Generate from Materials'}
                  </button>
                  {materials.length === 0 && (
                    <button
                      onClick={() => setActiveTab('materials')}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold flex items-center gap-2"
                    >
                      <FiPlus className="w-5 h-5" />
                      Add Materials First
                    </button>
                  )}
                </div>
                {materials.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-blue-700">
                      <strong>Found {materials.length} material categories.</strong><br/>
                      Items with stock information will be converted to inventory items.
                    </p>
                  </div>
                )}
              </div>
            }
          />
        </section>

        {/* Material Categories Summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Available Material Categories
            </h2>
            <span className="text-xs text-slate-500">{materials.length} categories</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            {materialsLoading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading materials...</div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No material categories found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {materials.map((material) => {
                  const totalItems = Array.isArray(material.items) ? material.items.length : 0
                  const itemsWithStock = Array.isArray(material.items) ? material.items.filter(item => item.stock && item.stock > 0).length : 0
                  const totalStock = Array.isArray(material.items) ? material.items.reduce((sum, item) => sum + (item.stock || 0), 0) : 0
                  
                  return (
                    <div
                      key={material._id}
                      className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20"
                    >
                      <div className="text-3xl mb-2">{material.icon}</div>
                      <div className="font-semibold text-sm text-primary mb-1">{material.name}</div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600">
                          {totalItems} items
                        </div>
                        {totalItems > 0 && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              itemsWithStock > 0 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {itemsWithStock} with stock
                            </span>
                            {totalStock > 0 && (
                              <span className="text-xs text-blue-600 font-semibold">
                                {totalStock} total units
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Procurement Tracker
              </h2>
              <div className="flex items-center gap-3">
                {poError && (
                  <span className="text-xs text-rose-500">
                    Error: {poError}. {purchaseOrders.length > 0 ? `Showing ${purchaseOrders.length} cached items.` : 'No data available.'}
                  </span>
                )}
                {poLoading && <span className="text-xs text-slate-400">Loading purchase orders...</span>}
                {!poLoading && !poError && (
                  <span className="text-xs text-slate-500">{purchaseOrders.length} orders</span>
                )}
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered')
                    refreshPOs()
                  }}
                  className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug: Purchase Orders</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>Data Available: {purchaseOrdersData ? 'Yes' : 'No'}</p>
                  <p>Array Length: {purchaseOrders.length}</p>
                  <p>Loading: {poLoading ? 'Yes' : 'No'}</p>
                  <p>Error: {poError || 'None'}</p>
                  <p>Token: {token ? 'Available' : 'Missing'}</p>
                  <p>Raw Response: {JSON.stringify(purchaseOrdersData)}</p>
                </div>
              </div>
            )}
            
            <DataTable
              columns={procurementColumns}
              data={purchaseOrders}
              emptyLabel={
                <div className="text-center py-12">
                  <FiPackage className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">No purchase orders found.</p>
                  {poError ? (
                    <div className="space-y-2">
                      <p className="text-rose-500 text-sm">Error loading data: {poError}</p>
                      <button
                        onClick={() => refreshPOs()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : poLoading ? (
                    <p className="text-slate-400 text-sm">Loading purchase orders...</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm">Create a purchase order to track procurement.</p>
                      <button
                        onClick={() => setShowPOModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
                      >
                        Create First Purchase Order
                      </button>
                    </div>
                  )}
                </div>
              }
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-lg font-semibold">Supplier SLA Watch</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Track lead times, fill rate, and defect rate for each supplier. Auto-notify procurement ops
              when SLA breaches exceed configured thresholds.
            </p>
            <ul className="space-y-3 text-sm text-white/80">
              <li>• Auto-assign alternate supplier if new ETA &gt; threshold</li>
              <li>• Auto-create debit notes for warranty failure</li>
              <li>• Maintain compliance badges for marketplace visibility</li>
            </ul>
          </div>
        </section>
      </div>
        </>
      )}

      {/* Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Purchase Order</h3>
              <button
                onClick={() => {
                  setShowPOModal(false)
                  setPOFormData({
                    supplier: '',
                    supplierContact: '',
                    expectedDeliveryDate: '',
                    notes: '',
                    items: []
                  })
                  setPOItemForm({ selectedInventoryItem: '', sku: '', name: '', quantity: '', unitPrice: '' })
                  setInventoryItemSearch('')
                  setShowInventoryDropdown(false)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Error and Success Messages */}
            {errorMsg && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                {successMsg}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                console.log('🔄 Submitting Purchase Order...')
                console.log('📊 Form Data:', poFormData)
                
                // Validation checks
                if (!poFormData.supplier || !poFormData.supplier.trim()) {
                  setErrorMsg('Please enter supplier name')
                  setTimeout(() => setErrorMsg(''), 3000)
                  return
                }
                
                if (!poFormData.expectedDeliveryDate) {
                  setErrorMsg('Please select expected delivery date')
                  setTimeout(() => setErrorMsg(''), 3000)
                  return
                }
                
                if (poFormData.items.length === 0) {
                  setErrorMsg('Please add at least one item to the purchase order')
                  setTimeout(() => setErrorMsg(''), 3000)
                  return
                }
                
                setSubmitting(true)
                setErrorMsg('') // Clear any previous errors
                
                try {
                  console.log('📤 Sending PO data to backend...')
                  const response = await adminApi.createPurchaseOrder(token, {
                    ...poFormData,
                    expectedDeliveryDate: new Date(poFormData.expectedDeliveryDate).toISOString()
                  })
                  
                  console.log('✅ PO created successfully:', response)
                  setSuccessMsg('Purchase order created successfully!')
                  refreshPOs()
                  refreshStats()
                  setTimeout(() => {
                    setShowPOModal(false)
                    setPOFormData({
                      supplier: '',
                      supplierContact: '',
                      expectedDeliveryDate: '',
                      notes: '',
                      items: []
                    })
                    setPOItemForm({ selectedInventoryItem: '', sku: '', name: '', quantity: '', unitPrice: '' })
                    setInventoryItemSearch('')
                    setShowInventoryDropdown(false)
                    setSuccessMsg('')
                  }, 2000)
                } catch (error) {
                  console.error('❌ PO creation failed:', error)
                  setErrorMsg(error.message || 'Failed to create purchase order')
                  setTimeout(() => setErrorMsg(''), 5000)
                } finally {
                  setSubmitting(false)
                }
              }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Supplier *</label>
                  <input
                    type="text"
                    value={poFormData.supplier}
                    onChange={(e) => setPOFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={poFormData.supplierContact}
                    onChange={(e) => setPOFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={poFormData.expectedDeliveryDate}
                  onChange={(e) => setPOFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Items *</label>
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  {/* Select from Existing Inventory */}
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Select from Existing Inventory Items
                    </label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative" ref={dropdownRef}>
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search inventory items by SKU, name, or category..."
                            value={inventoryItemSearch}
                            onChange={(e) => {
                              setInventoryItemSearch(e.target.value)
                              setShowInventoryDropdown(true)
                            }}
                            onFocus={() => setShowInventoryDropdown(true)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {showInventoryDropdown && inventoryItems.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {inventoryItems
                                .filter(item => 
                                  inventoryItemSearch === '' ||
                                  item.sku?.toLowerCase().includes(inventoryItemSearch.toLowerCase()) ||
                                  item.name?.toLowerCase().includes(inventoryItemSearch.toLowerCase()) ||
                                  item.category?.toLowerCase().includes(inventoryItemSearch.toLowerCase())
                                )
                                .slice(0, 10)
                                .map((item) => {
                                  // Calculate stock number for display
                                  const stockNum = typeof item.stock === 'string' 
                                    ? parseInt(item.stock.split(' ')[0]) || 0 
                                    : item.stock || 0
                                  
                                  return (
                                    <button
                                      key={item._id}
                                      type="button"
                                      onClick={() => {
                                        setPOItemForm({
                                          selectedInventoryItem: item._id,
                                          sku: item.sku,
                                          name: item.name,
                                          quantity: '',
                                          unitPrice: item.unitPrice || 0
                                        })
                                        setInventoryItemSearch(`${item.sku} - ${item.name}`)
                                        setShowInventoryDropdown(false)
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-primary/10 transition flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="font-semibold text-sm">{item.sku}</div>
                                        <div className="text-xs text-slate-600">{item.name}</div>
                                        <div className="text-xs text-slate-400">{item.category} • {item.location}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs font-semibold text-primary">₹{item.unitPrice || 0}</div>
                                        <div className="text-xs text-slate-400">Stock: {stockNum}</div>
                                      </div>
                                    </button>
                                  )
                                })}
                              {inventoryItems.filter(item => 
                                inventoryItemSearch === '' ||
                                item.sku?.toLowerCase().includes(inventoryItemSearch.toLowerCase()) ||
                                item.name?.toLowerCase().includes(inventoryItemSearch.toLowerCase()) ||
                                item.category?.toLowerCase().includes(inventoryItemSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                  No inventory items found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInventoryItemSearch('')
                            setShowInventoryDropdown(false)
                            setPOItemForm({ selectedInventoryItem: '', sku: '', name: '', quantity: '', unitPrice: '' })
                          }}
                          className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                        >
                          Clear
                        </button>
                      </div>
                      {poItemForm.selectedInventoryItem && (
                        <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                          <span className="font-semibold text-primary">Selected:</span> {poItemForm.sku} - {poItemForm.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Details Form */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">SKU *</label>
                      <input
                        type="text"
                        placeholder="SKU"
                        value={poItemForm.sku}
                        onChange={(e) => setPOItemForm(prev => ({ ...prev, sku: e.target.value, selectedInventoryItem: '' }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Name *</label>
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={poItemForm.name}
                        onChange={(e) => setPOItemForm(prev => ({ ...prev, name: e.target.value, selectedInventoryItem: '' }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Quantity *</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={poItemForm.quantity}
                        onChange={(e) => setPOItemForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        min="1"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 mb-1">Unit Price *</label>
                        <input
                          type="number"
                          placeholder="Price"
                          value={poItemForm.unitPrice}
                          onChange={(e) => setPOItemForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (poItemForm.sku && poItemForm.name && poItemForm.quantity && poItemForm.unitPrice) {
                              // Clear any previous error messages
                              setErrorMsg('')
                              setPOFormData(prev => ({
                                ...prev,
                                items: [...prev.items, {
                                  inventoryItemId: poItemForm.selectedInventoryItem || null,
                                  sku: poItemForm.sku,
                                  name: poItemForm.name,
                                  quantity: parseInt(poItemForm.quantity),
                                  unitPrice: parseFloat(poItemForm.unitPrice)
                                }]
                              }))
                              setPOItemForm({ selectedInventoryItem: '', sku: '', name: '', quantity: '', unitPrice: '' })
                              setInventoryItemSearch('')
                              setShowInventoryDropdown(false)
                            } else {
                              setErrorMsg('Please fill all item fields (SKU, Name, Quantity, Unit Price)')
                              setTimeout(() => setErrorMsg(''), 3000)
                            }
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {poFormData.items.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-sm">
                        No items added yet. Select from inventory or enter manually.
                      </div>
                    ) : (
                      poFormData.items.map((item, idx) => {
                        const total = item.quantity * item.unitPrice
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm border border-slate-200">
                            <div className="flex-1">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-xs text-slate-600">SKU: {item.sku} • Qty: {item.quantity} × ₹{item.unitPrice}</div>
                            </div>
                            <div className="text-right mr-3">
                              <div className="font-semibold text-primary">₹{total.toLocaleString()}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPOFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
                              className="text-rose-600 hover:bg-rose-50 p-1.5 rounded transition"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })
                    )}
                    {poFormData.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total Value:</span>
                          <span className="text-primary text-lg">
                            ₹{poFormData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                <textarea
                  value={poFormData.notes}
                  onChange={(e) => setPOFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {submitting ? 'Creating...' : 'Create Purchase Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Configuration Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Configure Thresholds</h3>
              <button
                onClick={() => setShowThresholdModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitting(true)
                try {
                  await adminApi.upsertThreshold(token, thresholdFormData)
                  setSuccessMsg('Threshold configured successfully!')
                  refreshStats()
                  refreshInventory()
                  setTimeout(() => {
                    setShowThresholdModal(false)
                  }, 1000)
                } catch (error) {
                  setErrorMsg(error.message || 'Failed to save threshold')
                } finally {
                  setSubmitting(false)
                }
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={thresholdFormData.category}
                  onChange={(e) => setThresholdFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Air Conditioning"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Critical Level</label>
                  <input
                    type="number"
                    value={thresholdFormData.criticalLevel}
                    onChange={(e) => setThresholdFormData(prev => ({ ...prev, criticalLevel: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    value={thresholdFormData.minStockLevel}
                    onChange={(e) => setThresholdFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reorder Level</label>
                  <input
                    type="number"
                    value={thresholdFormData.reorderLevel}
                    onChange={(e) => setThresholdFormData(prev => ({ ...prev, reorderLevel: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={thresholdFormData.leadTimeDays}
                    onChange={(e) => setThresholdFormData(prev => ({ ...prev, leadTimeDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Auto Reorder Quantity</label>
                  <input
                    type="number"
                    value={thresholdFormData.autoReorderQuantity}
                    onChange={(e) => setThresholdFormData(prev => ({ ...prev, autoReorderQuantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoReorder"
                  checked={thresholdFormData.autoReorder}
                  onChange={(e) => setThresholdFormData(prev => ({ ...prev, autoReorder: e.target.checked }))}
                  className="w-5 h-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="autoReorder" className="text-sm font-semibold text-slate-700">
                  Enable Auto Reorder
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Threshold'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowThresholdModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item History Modal */}
      {showItemHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Item History</h3>
              <button
                onClick={() => {
                  setShowItemHistory(false)
                  setSelectedItemForHistory(null)
                  setItemHistoryData([])
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {itemHistoryData.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FiClock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No history available for this item</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemHistoryData
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-sm capitalize">
                              {entry.action.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            entry.action === 'created' ? 'bg-emerald-500/10 text-emerald-600' :
                            entry.action === 'stock_added' ? 'bg-blue-500/10 text-blue-600' :
                            entry.action === 'stock_removed' ? 'bg-amber-500/10 text-amber-600' :
                            entry.action === 'status_changed' ? 'bg-purple-500/10 text-purple-600' :
                            'bg-slate-500/10 text-slate-600'
                          }`}>
                            {entry.action.replace('_', ' ')}
                          </span>
                        </div>
                        {entry.quantity && (
                          <div className="text-sm text-slate-700">
                            Quantity: <span className="font-semibold">{entry.quantity}</span>
                          </div>
                        )}
                        {entry.previousValue !== undefined && entry.newValue !== undefined && (
                          <div className="text-sm text-slate-700 mt-1">
                            <span className="line-through text-slate-400">{entry.previousValue}</span>
                            {' → '}
                            <span className="font-semibold text-primary">{entry.newValue}</span>
                          </div>
                        )}
                        {entry.notes && (
                          <div className="text-xs text-slate-600 mt-2 italic">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Material Category Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingMaterial ? 'Edit Material Category' : 'Add Material Category'}
              </h3>
              <button
                onClick={handleCloseMaterialModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMaterial} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={materialFormData.name}
                  onChange={(e) => setMaterialFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Plumbing materials"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Icon (Emoji) *
                </label>
                <div className="space-y-2">
                  {/* Icon Display and Picker Button */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      {/* Icon Preview Box - Shows on left */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-3xl pointer-events-none z-10 flex items-center justify-center w-10 h-10">
                        {materialFormData.icon || '🔧'}
                      </div>
                      <input
                        type="text"
                        value={materialFormData.icon}
                        onChange={(e) => setMaterialFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-4 py-2 pl-16 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-transparent caret-slate-700"
                        placeholder=""
                        required
                        maxLength={2}
                        style={{ 
                          color: 'transparent',
                          textShadow: '0 0 0 transparent'
                        }}
                      />
                      {/* Placeholder text overlay when empty */}
                      {!materialFormData.icon && (
                        <div className="absolute left-16 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                          Enter emoji or pick from list
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowIconPicker(!showIconPicker)
                        setIconSearchTerm('')
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-2 text-sm font-semibold"
                    >
                      <span className="text-lg">🎨</span>
                      {showIconPicker ? 'Hide' : 'Pick Icon'}
                    </button>
                  </div>

                  {/* Icon Picker Modal */}
                  {showIconPicker && (
                    <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 max-h-80 overflow-hidden flex flex-col">
                      {/* Search Bar */}
                      <div className="relative mb-3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          value={iconSearchTerm}
                          onChange={(e) => setIconSearchTerm(e.target.value)}
                          placeholder="Search icons..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Icons Grid */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                          {MATERIAL_ICONS.filter(icon => 
                            iconSearchTerm === '' || 
                            icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                            icon.category.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                            icon.emoji.includes(iconSearchTerm)
                          ).map((iconOption, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setMaterialFormData(prev => ({ ...prev, icon: iconOption.emoji }))
                                setShowIconPicker(false)
                              }}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 ${
                                materialFormData.icon === iconOption.emoji
                                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 scale-110'
                                  : 'bg-white hover:bg-primary/10 hover:scale-105 border border-slate-200'
                              }`}
                              title={`${iconOption.name} (${iconOption.category})`}
                            >
                              {iconOption.emoji}
                            </button>
                          ))}
                        </div>
                        {MATERIAL_ICONS.filter(icon => 
                          iconSearchTerm === '' || 
                          icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                          icon.category.toLowerCase().includes(iconSearchTerm.toLowerCase()) ||
                          icon.emoji.includes(iconSearchTerm)
                        ).length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            <p className="text-sm">No icons found matching "{iconSearchTerm}"</p>
                          </div>
                        )}
                      </div>

                      {/* Categories Filter */}
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Quick Filter:</p>
                        <div className="flex flex-wrap gap-1">
                          {['All', 'Tools', 'Electrical', 'Plumbing', 'Painting', 'AC', 'Cleaning', 'Hardware', 'Appliances', 'Building'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setIconSearchTerm(cat === 'All' ? '' : cat)}
                              className={`px-2 py-1 text-xs rounded-md transition ${
                                (cat === 'All' && iconSearchTerm === '') || iconSearchTerm === cat
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    {materialFormData.icon ? (
                      <span>
                        Selected: <span className="font-semibold">
                          {MATERIAL_ICONS.find(i => i.emoji === materialFormData.icon)?.name || 'Custom icon'}
                        </span>
                        {MATERIAL_ICONS.find(i => i.emoji === materialFormData.icon) && (
                          <span className="text-slate-400 ml-1">
                            ({MATERIAL_ICONS.find(i => i.emoji === materialFormData.icon)?.category})
                          </span>
                        )}
                      </span>
                    ) : (
                      'Click "Pick Icon" to browse available icons or type a custom emoji directly'
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Items *
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {materialFormData.items.length} {materialFormData.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </span>
                </label>
                
                {/* Add Item Form */}
                <div className="mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Product Name *</label>
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="e.g., PVC Pipe 2 inch, Copper Wire 2.5mm"
                        />
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">SKU/Product Code</label>
                        <input
                          type="text"
                          value={newItem.sku}
                          onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="e.g., PVC-2IN-001"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white resize-none"
                        placeholder="Brief description of the product..."
                        rows="2"
                      />
                    </div>

                    {/* Brand and Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand</label>
                        <input
                          type="text"
                          value={newItem.brand}
                          onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="e.g., Supreme, Havells"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Specifications</label>
                        <input
                          type="text"
                          value={newItem.specifications}
                          onChange={(e) => setNewItem(prev => ({ ...prev, specifications: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="e.g., 2 inch diameter, 6 meter length"
                        />
                      </div>
                    </div>

                    {/* Price Range and Stock */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Min Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                          <input
                            type="number"
                            value={newItem.priceMin}
                            onChange={(e) => setNewItem(prev => ({ ...prev, priceMin: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                            className="w-full pl-8 pr-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                            placeholder="600"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Max Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                          <input
                            type="number"
                            value={newItem.priceMax}
                            onChange={(e) => setNewItem(prev => ({ ...prev, priceMax: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                            className="w-full pl-8 pr-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                            placeholder="1000"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stock Quantity</label>
                        <input
                          type="number"
                          value={newItem.stock}
                          onChange={(e) => setNewItem(prev => ({ ...prev, stock: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="50"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Unit</label>
                        <select
                          value={newItem.unit}
                          onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                        >
                          {UNIT_OPTIONS.map((option, idx) => (
                            <option key={idx} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Min Order Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Min Order Quantity</label>
                        <input
                          type="number"
                          value={newItem.minOrderQuantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={handleAddItem}
                          disabled={!newItem.name.trim()}
                          className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Product
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">💡</span>
                    <span>Fill in product details for better inventory management. Only product name is required.</span>
                  </p>
                </div>

                {/* Items List */}
                {materialFormData.items.length > 0 ? (
                  <div className="space-y-3">
                    {/* Bulk Actions Header */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">
                        {materialFormData.items.length} {materialFormData.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const stockValue = prompt('Set stock for all items (enter 0 to clear stock):');
                            if (stockValue !== null && !isNaN(stockValue) && stockValue >= 0) {
                              setMaterialFormData(prev => ({
                                ...prev,
                                items: prev.items.map(item => ({ ...item, stock: parseInt(stockValue) || 0 }))
                              }));
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold flex items-center gap-1"
                        >
                          <FiPackage className="w-3 h-3" />
                          Bulk Stock Update
                        </button>
                      </div>
                    </div>
                    
                    {/* Items List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {materialFormData.items.map((item, index) => (
                      <div key={index}>
                        {editingItemIndex === index ? (
                          // Edit Form
                          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="space-y-4">
                              {/* Basic Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                                  <input
                                    type="text"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Product name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU/Code</label>
                                  <input
                                    type="text"
                                    value={editingItem.sku}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, sku: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Product code"
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                                <textarea
                                  value={editingItem.description}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm resize-none"
                                  placeholder="Product description"
                                  rows="2"
                                />
                              </div>

                              {/* Brand and Specifications */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand</label>
                                  <input
                                    type="text"
                                    value={editingItem.brand}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, brand: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Brand name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specifications</label>
                                  <input
                                    type="text"
                                    value={editingItem.specifications}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, specifications: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Product specs"
                                  />
                                </div>
                              </div>

                              {/* Price, Stock, Unit */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Price (₹)</label>
                                  <input
                                    type="number"
                                    value={editingItem.priceMin}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, priceMin: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Min price"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Price (₹)</label>
                                  <input
                                    type="number"
                                    value={editingItem.priceMax}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, priceMax: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Max price"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock</label>
                                  <input
                                    type="number"
                                    value={editingItem.stock}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, stock: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Stock qty"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                                  <select
                                    value={editingItem.unit}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, unit: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                  >
                                    {UNIT_OPTIONS.map((option, idx) => (
                                      <option key={idx} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Min Order Quantity */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order Qty</label>
                                  <input
                                    type="number"
                                    value={editingItem.minOrderQuantity}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Min order"
                                    min="1"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleUpdateItem}
                                  disabled={!editingItem.name.trim()}
                                  className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                                >
                                  <FiSave className="w-3 h-3" />
                                  Update
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Display Item
                          <div className="group flex items-start gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all">
                            {/* Item Number Badge */}
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 group-hover:bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">
                              {index + 1}
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              {/* Product Name and SKU */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 text-sm break-words">
                                    {item.name || item}
                                  </div>
                                  {item.sku && (
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      SKU: {item.sku}
                                    </div>
                                  )}
                                </div>
                                {item.brand && (
                                  <div className="ml-2 px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-xs font-semibold text-purple-700">
                                    {item.brand}
                                  </div>
                                )}
                              </div>

                              {/* Description */}
                              {item.description && (
                                <div className="text-xs text-slate-600 mb-2 italic">
                                  {item.description}
                                </div>
                              )}

                              {/* Specifications */}
                              {item.specifications && (
                                <div className="text-xs text-slate-600 mb-2">
                                  <span className="font-medium">Specs:</span> {item.specifications}
                                </div>
                              )}

                              {/* Price, Stock, and Unit Information */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Price Range */}
                                {(item.priceMin || item.priceMax) && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                                    <span className="text-xs font-semibold text-emerald-700">
                                      ₹{item.priceMin || '0'}
                                    </span>
                                    <span className="text-xs text-emerald-600">→</span>
                                    <span className="text-xs font-semibold text-emerald-700">
                                      ₹{item.priceMax || '∞'}
                                    </span>
                                  </div>
                                )}

                                {/* Stock Information */}
                                {item.stock !== undefined && item.stock !== null ? (
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                                    item.stock > 0 
                                      ? 'bg-blue-50 border border-blue-200' 
                                      : 'bg-amber-50 border border-amber-200'
                                  }`}>
                                    <FiPackage className={`w-3 h-3 ${
                                      item.stock > 0 ? 'text-blue-600' : 'text-amber-600'
                                    }`} />
                                    <span className={`text-xs font-semibold ${
                                      item.stock > 0 ? 'text-blue-700' : 'text-amber-700'
                                    }`}>
                                      {item.stock} {item.unit || 'units'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md">
                                    <span className="text-xs text-gray-500">
                                      Stock not set
                                    </span>
                                  </div>
                                )}

                                {/* Min Order Quantity */}
                                {item.minOrderQuantity && item.minOrderQuantity > 1 && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md">
                                    <span className="text-xs font-semibold text-orange-700">
                                      Min: {item.minOrderQuantity} {item.unit || 'units'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Edit and Delete Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditItem(index, item)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit product"
                              >
                                <FiEdit2 className="w-3 h-3" />
                              </button>
                              {/* Quick Stock Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newStock = prompt(`Update stock for "${item.name}":`, item.stock || 0);
                                  if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                                    setMaterialFormData(prev => ({
                                      ...prev,
                                      items: prev.items.map((itm, idx) => 
                                        idx === index ? { ...itm, stock: parseInt(newStock) || 0 } : itm
                                      )
                                    }));
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Quick stock update"
                              >
                                <FiPackage className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Remove product"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <FiPackage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">No items added yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add at least one item to continue</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={materialFormData.order}
                    onChange={(e) => setMaterialFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={materialFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setMaterialFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {submitting ? 'Saving...' : editingMaterial ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseMaterialModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Inventory Details Modal */}
      {showInventoryDetails && selectedInventoryItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <FiPackage size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Inventory Item Details</h3>
                    <p className="text-blue-100 text-sm">Complete product information and stock details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowInventoryDetails(false)
                    setSelectedInventoryItem(null)
                  }}
                  className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-slate-800">{selectedInventoryItem.name}</h2>
                      {selectedInventoryItem.brand && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {selectedInventoryItem.brand}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <FiPackage className="w-4 h-4" />
                        SKU: <span className="font-mono font-semibold">{selectedInventoryItem.sku}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiBox className="w-4 h-4" />
                        Category: <span className="font-semibold">{selectedInventoryItem.category}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">
                      ₹{(selectedInventoryItem.unitPrice || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-slate-500">per {selectedInventoryItem.unit || 'unit'}</div>
                  </div>
                </div>
                
                {selectedInventoryItem.description && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedInventoryItem.description}</p>
                  </div>
                )}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Information */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FiBox className="w-5 h-5 text-primary" />
                      Stock Information
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Current Stock */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div>
                          <div className="text-sm text-blue-600 font-medium">Current Stock</div>
                          <div className="text-2xl font-bold text-blue-800">
                            {selectedInventoryItem.stock || 0} {selectedInventoryItem.unit || 'units'}
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          (selectedInventoryItem.stock || 0) === 0 ? 'bg-red-100 text-red-600' :
                          (selectedInventoryItem.stock || 0) <= (selectedInventoryItem.minStockLevel || 5) ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          <FiPackage className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Stock Levels */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Reorder Level</span>
                          <span className="font-semibold text-amber-600">{selectedInventoryItem.reorderLevel || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Min Stock Level</span>
                          <span className="font-semibold text-red-600">{selectedInventoryItem.minStockLevel || 0}</span>
                        </div>
                        {selectedInventoryItem.minOrderQuantity && selectedInventoryItem.minOrderQuantity > 1 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Min Order Qty</span>
                            <span className="font-semibold text-orange-600">{selectedInventoryItem.minOrderQuantity}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedInventoryItem.status === 'Critical' ? 'bg-red-100 text-red-700' :
                            selectedInventoryItem.status === 'Low' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {selectedInventoryItem.status || 'Healthy'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FiFileText className="w-5 h-5 text-primary" />
                      Product Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Information */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                          <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.location || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</label>
                          <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.unit || 'units'}</div>
                        </div>

                        {selectedInventoryItem.specifications && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specifications</label>
                            <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.specifications}</div>
                          </div>
                        )}
                      </div>

                      {/* Supplier Information */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</label>
                          <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.supplier || 'N/A'}</div>
                        </div>
                        
                        {selectedInventoryItem.supplierContact && (
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier Contact</label>
                            <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.supplierContact}</div>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Time</label>
                          <div className="text-sm font-medium text-slate-800 mt-1">{selectedInventoryItem.leadTime || 0} days</div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 font-medium">Created</div>
                          <div className="text-sm font-semibold text-slate-800 mt-1">
                            {selectedInventoryItem.createdAt ? new Date(selectedInventoryItem.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 font-medium">Last Updated</div>
                          <div className="text-sm font-semibold text-slate-800 mt-1">
                            {selectedInventoryItem.updatedAt ? new Date(selectedInventoryItem.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-primary/5 rounded-lg">
                          <div className="text-xs text-primary font-medium">Source</div>
                          <div className="text-sm font-semibold text-primary mt-1">Auto-Generated</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    fetchItemHistory(selectedInventoryItem._id)
                    setShowInventoryDetails(false) // Close details modal when opening history
                  }}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2"
                >
                  <FiClock className="w-5 h-5" />
                  View History
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this inventory item?')) {
                      handleDeleteInventoryItem(selectedInventoryItem._id)
                      setShowInventoryDetails(false)
                      setSelectedInventoryItem(null)
                    }
                  }}
                  className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Delete Item
                </button>
                <button
                  onClick={() => {
                    setShowInventoryDetails(false)
                    setSelectedInventoryItem(null)
                  }}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Order Details Modal */}
      {showPODetails && selectedPurchaseOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Purchase Order Details</h3>
                <p className="text-sm text-slate-500 mt-1">PO ID: {selectedPurchaseOrder.poId || selectedPurchaseOrder._id}</p>
              </div>
              <button
                onClick={() => {
                  setShowPODetails(false)
                  setSelectedPurchaseOrder(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Purchase Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Supplier Information */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-primary" />
                    Supplier Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier Name</label>
                      <div className="text-sm font-medium text-slate-800 mt-1">{selectedPurchaseOrder.supplier || 'N/A'}</div>
                    </div>
                    {selectedPurchaseOrder.supplierContact && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</label>
                        <div className="text-sm font-medium text-slate-800 mt-1">{selectedPurchaseOrder.supplierContact}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-primary/5 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-primary" />
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          selectedPurchaseOrder.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                          selectedPurchaseOrder.status === 'In Transit' ? 'bg-blue-500/10 text-blue-600' :
                          selectedPurchaseOrder.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                          selectedPurchaseOrder.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600' :
                          'bg-slate-500/10 text-slate-600'
                        }`}>
                          {selectedPurchaseOrder.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Delivery</label>
                      <div className="text-sm font-medium text-slate-800 mt-1">
                        {selectedPurchaseOrder.expectedDeliveryDate 
                          ? new Date(selectedPurchaseOrder.expectedDeliveryDate).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</label>
                      <div className="text-lg font-bold text-primary mt-1">
                        ₹{(selectedPurchaseOrder.totalValue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-primary" />
                  Items ({Array.isArray(selectedPurchaseOrder.items) ? selectedPurchaseOrder.items.length : 0})
                </h4>
                <div className="bg-slate-50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Name</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Array.isArray(selectedPurchaseOrder.items) && selectedPurchaseOrder.items.length > 0 ? (
                          selectedPurchaseOrder.items.map((item, index) => {
                            const total = (item.quantity || 0) * (item.unitPrice || 0)
                            return (
                              <tr key={index} className="hover:bg-white transition">
                                <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.sku || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{item.name || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-right">{item.quantity || 0}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-right">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">₹{total.toLocaleString('en-IN')}</td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                              {selectedPurchaseOrder.items 
                                ? (typeof selectedPurchaseOrder.items === 'string' 
                                    ? `Items: ${selectedPurchaseOrder.items}` 
                                    : 'No items found')
                                : 'Items data not available'
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPurchaseOrder.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Notes</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-600">{selectedPurchaseOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Created</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPurchaseOrder.createdAt 
                      ? new Date(selectedPurchaseOrder.createdAt).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Last Updated</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPurchaseOrder.updatedAt 
                      ? new Date(selectedPurchaseOrder.updatedAt).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
                      handleDeletePurchaseOrder(selectedPurchaseOrder._id)
                      setShowPODetails(false)
                      setSelectedPurchaseOrder(null)
                    }
                  }}
                  className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Delete Purchase Order
                </button>
                <button
                  onClick={() => {
                    setShowPODetails(false)
                    setSelectedPurchaseOrder(null)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpareParts


