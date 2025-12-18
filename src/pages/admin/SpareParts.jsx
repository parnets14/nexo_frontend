import React, { useState, useEffect, useRef } from 'react'
import { FiAlertTriangle, FiBox, FiLink2, FiTruck, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiArrowUp, FiArrowDown, FiSearch, FiClock, FiPackage, FiRefreshCw, FiUser, FiEye } from 'react-icons/fi'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import StatCard from '../../components/admin/StatCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

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

const inventoryColumns = [
  { header: 'SKU', accessor: 'sku' },
  { header: 'Part Name', accessor: 'name' },
  { header: 'Category', accessor: 'category' },
  { header: 'Location', accessor: 'location' },
  {
    header: 'Stock',
    accessor: 'stock',
    render: (value, row) => {
      const stockValue = typeof value === 'string' ? value : `${row.stock || 0} ${row.unit || 'units'}`
      return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.status === 'Critical'
            ? 'bg-rose-500/10 text-rose-600'
            : row.status === 'Low'
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-emerald-500/10 text-emerald-600'
        }`}
      >
          {stockValue}
      </span>
    )
    }
  },
  { header: 'Supplier', accessor: 'supplier' },
  {
    header: 'Lead Time',
    accessor: 'leadTime',
    render: (value) => typeof value === 'string' ? value : `${value || 0} days`
  },
  {
    header: 'Actions',
    accessor: '_id',
    render: (value) => (
      <button
        onClick={() => fetchItemHistory(value)}
        className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition"
        title="View History"
      >
        <FiClock className="w-4 h-4" />
      </button>
    )
  }
]

const procurementColumns = [
  { header: 'PO', accessor: 'poId' },
  { header: 'Supplier', accessor: 'supplier' },
  {
    header: 'Parts',
    accessor: 'items',
    render: (value) => {
      if (typeof value === 'string') return value
      if (Array.isArray(value)) {
        return value.map(item => `${item.name || item.sku} (${item.quantity})`).join(', ')
      }
      return 'N/A'
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
  }
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
  const [newItem, setNewItem] = useState({ name: '', priceMin: '', priceMax: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearchTerm, setIconSearchTerm] = useState('')
  const [showPOModal, setShowPOModal] = useState(false)
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

  // Fetch purchase orders
  const { data: purchaseOrdersData, isLoading: poLoading, error: poError, refresh: refreshPOs } = useAdminData(
    (token) => adminApi.fetchPurchaseOrders(token),
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
    try {
      const data = await adminApi.fetchInventoryItemHistory(token, itemId)
      setItemHistoryData(data.data?.history || [])
      setSelectedItemForHistory(itemId)
      setShowItemHistory(true)
    } catch (error) {
      setErrorMsg('Failed to load item history')
    }
  }

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
    setNewItem({ name: '', priceMin: '', priceMax: '' })
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
    setNewItem({ name: '', priceMin: '', priceMax: '' })
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
          priceMin: newItem.priceMin ? Number(newItem.priceMin) : null,
          priceMax: newItem.priceMax ? Number(newItem.priceMax) : null
        }]
      }))
      setNewItem({ name: '', priceMin: '', priceMax: '' })
    }
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
      render: (value) => (
        <span className="text-sm text-slate-600">
          {Array.isArray(value) ? value.length : 0} items
        </span>
      )
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
            emptyLabel="No inventory items found. Add items to track stock levels."
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
                {materials.map((material) => (
                  <div
                    key={material._id}
                    className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20"
                  >
                    <div className="text-3xl mb-2">{material.icon}</div>
                    <div className="font-semibold text-sm text-primary mb-1">{material.name}</div>
                    <div className="text-xs text-slate-600">
                      {Array.isArray(material.items) ? material.items.length : 0} items
                    </div>
                  </div>
                ))}
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
              {poError && <span className="text-xs text-rose-500">Error loading orders</span>}
              {poLoading && <span className="text-xs text-slate-400">Loading...</span>}
            </div>
            <DataTable
              columns={procurementColumns}
              data={purchaseOrders}
              emptyLabel="No purchase orders found. Create a purchase order to track procurement."
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
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
    </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (poFormData.items.length === 0) {
                  setErrorMsg('Please add at least one item to the purchase order')
                  return
                }
                setSubmitting(true)
                try {
                  await adminApi.createPurchaseOrder(token, {
                    ...poFormData,
                    expectedDeliveryDate: new Date(poFormData.expectedDeliveryDate).toISOString()
                  })
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
                  }, 1000)
                } catch (error) {
                  setErrorMsg(error.message || 'Failed to create purchase order')
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
                                .map((item) => (
                                  <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => {
                                      const stockNum = typeof item.stock === 'string' 
                                        ? parseInt(item.stock.split(' ')[0]) || 0 
                                        : item.stock || 0
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
                                ))}
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
                  <div className="space-y-3">
                    {/* Item Name Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Item Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddItem())}
                        className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                        placeholder="e.g., PVC Pipe, Copper Wire, Paint Bucket"
                      />
                    </div>

                    {/* Price Range Inputs */}
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!newItem.name.trim()}
                      className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">💡</span>
                    <span>Price range is optional. Press Enter to quickly add items.</span>
                  </p>
                </div>

                {/* Items List */}
                {materialFormData.items.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {materialFormData.items.map((item, index) => (
                      <div 
                        key={index} 
                        className="group flex items-start gap-3 p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
                      >
                        {/* Item Number Badge */}
                        <div className="flex-shrink-0 w-7 h-7 bg-slate-100 group-hover:bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">
                          {index + 1}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-sm break-words">
                            {item.name || item}
                          </div>
                          {(item.priceMin || item.priceMax) && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                                <span className="text-xs font-semibold text-emerald-700">
                                  ₹{item.priceMin || '0'}
                                </span>
                                <span className="text-xs text-emerald-600">→</span>
                                <span className="text-xs font-semibold text-emerald-700">
                                  ₹{item.priceMax || '∞'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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
    </div>
  )
}

export default SpareParts


