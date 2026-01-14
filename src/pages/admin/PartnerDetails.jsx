import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiPlus,
  FiMinus,
  FiX,
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiPrinter,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiCreditCard,
  FiHome,
  FiBriefcase,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUpload,
  FiImage,
  FiCheck,
  FiEye,
  FiLoader,
  FiUsers
} from 'react-icons/fi'
import PartnerIDCard from '../../components/PartnerIDCard.jsx'
import ModuleHeader from '../../components/admin/ModuleHeader.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useAdminData } from '../../hooks/useAdminData.js'
import { adminApi } from '../../services/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const bookingColumns = [
  { header: 'Booking ID', accessor: 'bookingId' },
  { header: 'Customer', accessor: 'customerName' },
  { header: 'Service', accessor: 'serviceName' },
  { header: 'Amount', accessor: 'totalAmount' },
  { header: 'Commission', accessor: 'commissionAmount' },
  { header: 'Earnings', accessor: 'partnerEarnings' },
  { header: 'Completed', accessor: 'completedAt' }
]

const transactionColumns = [
  { header: 'Date', accessor: 'date' },
  { header: 'Type', accessor: 'type' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Description', accessor: 'description' },
  { header: 'Balance', accessor: 'balance' },
  { header: 'Reference', accessor: 'reference' }
]

const PartnerDetails = () => {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionType, setTransactionType] = useState('credit')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [transactionReference, setTransactionReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showHubModal, setShowHubModal] = useState(false)
  const [hubSubmitting, setHubSubmitting] = useState(false)
  const [selectedHubIds, setSelectedHubIds] = useState([])
  const printRef = useRef(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    qualification: '',
    experience: '',
    partnerType: 'individual',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    gstNumber: '',
    referralCode: '',
    categories: [],
    categoryNames: [],
    // Bank Details
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    // KYC Status
    kycStatus: '',
    kycRemarks: '',
    // Payment Info
    registerAmount: '',
    payId: '',
    paidBy: '',
    // Profile Status
    profileCompleted: false
  })
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [paymentApprovalLoading, setPaymentApprovalLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showProfileImageModal, setShowProfileImageModal] = useState(false)
  const [kycFiles, setKycFiles] = useState({
    panCard: null,
    aadhaar: null,
    aadhaarback: null,
    drivingLicence: null,
    bill: null,
    chequeImage: null
  })
  const [profileImage, setProfileImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // MG Plan states
  const [showMGPlanModal, setShowMGPlanModal] = useState(false)
  const [mgPlans, setMgPlans] = useState([])
  const [selectedMGPlanId, setSelectedMGPlanId] = useState(null)
  const [mgPlanSubmitting, setMgPlanSubmitting] = useState(false)
  const [mgPlanPaymentMethod, setMgPlanPaymentMethod] = useState('cash')
  const [mgPlanCollectedBy, setMgPlanCollectedBy] = useState('')
  const [mgPlanTransactionId, setMgPlanTransactionId] = useState('')
  
  // Lead Plan states
  const [showLeadPlanModal, setShowLeadPlanModal] = useState(false)
  const [leadPlans, setLeadPlans] = useState([])
  const [selectedLeadPlanId, setSelectedLeadPlanId] = useState(null)
  const [leadPlanSubmitting, setLeadPlanSubmitting] = useState(false)
  const [leadPlanPaymentMethod, setLeadPlanPaymentMethod] = useState('cash')
  const [leadPlanCollectedBy, setLeadPlanCollectedBy] = useState('')
  const [leadPlanTransactionId, setLeadPlanTransactionId] = useState('')
  const [leadPlanLeadsToAdd, setLeadPlanLeadsToAdd] = useState('')
  
  // Update payment details for current plan
  const [showUpdatePaymentDetails, setShowUpdatePaymentDetails] = useState(false)
  const [updatePaymentMethod, setUpdatePaymentMethod] = useState('cash')
  const [updateCollectedBy, setUpdateCollectedBy] = useState('')
  const [updateTransactionId, setUpdateTransactionId] = useState('')
  const [updatingPayment, setUpdatingPayment] = useState(false)
  
  // Payment tracking states
  const [paymentMode, setPaymentMode] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [showFeeTransactionsModal, setShowFeeTransactionsModal] = useState(false)
  const [showIDCard, setShowIDCard] = useState(false)

  const { data: partnerDetailsData, isLoading: detailsLoading, error: detailsError } = useAdminData(
    (token) => adminApi.fetchPartnerDetails(token, partnerId),
    [partnerId]
  )

  const { data: earningsData, isLoading: earningsLoading, error: earningsError, refresh: refetchEarnings } = useAdminData(
    (token) => adminApi.fetchPartnerEarnings(token, partnerId),
    [partnerId] // Only refetch when partnerId changes
  )

  const { data: walletData, isLoading: walletLoading, error: walletError, refresh: refetchWallet } = useAdminData(
    (token) => adminApi.fetchPartnerWallet(token, partnerId),
    [partnerId] // Only refetch when partnerId changes
  )

  const { data: feeTransactionsData, isLoading: feeTransactionsLoading, error: feeTransactionsError, refresh: refetchFeeTransactions } = useAdminData(
    (token) => adminApi.fetchFeeTransactions(token, { partnerId }),
    [partnerId]
  )

  // Fetch partner's assigned hubs from the new Hub system
  const {
    data: partnerHubsData,
    isLoading: partnerHubsLoading,
    error: partnerHubsError,
    refresh: refreshPartnerHubs
  } = useAdminData(
    async (token) => {
      try {
        // Get partner details to see assigned hubs
        const partnerDetails = await adminApi.fetchPartnerDetails(token, partnerId)
        const partner = partnerDetails?.partner || partnerDetails?.data || {}
        
        console.log('Partner Details:', { 
          partnerId, 
          hasHubs: !!partner.hubs, 
          hubsCount: partner.hubs?.length || 0,
          hubs: partner.hubs 
        })
        
        // Get assigned hubs - could be populated hub objects or just IDs
        // Also check displayHubs (which might be derived from serviceHubs)
        const assignedHubsRaw = partner.displayHubs || partner.hubs || []
        const assignedHubIds = assignedHubsRaw.map(hub => 
          typeof hub === 'object' && hub._id ? hub._id.toString() : hub.toString()
        )
        
        console.log('Assigned Hub IDs:', assignedHubIds)
        console.log('Using displayHubs:', !!partner.displayHubs, 'serviceHubs count:', partner.serviceHubs?.length || 0)
        
        // Fetch all available hubs
        const allHubs = await adminApi.fetchHubs(token)
        const availableHubs = allHubs?.data || []
        
        // Mark which hubs are assigned to this partner
        const hubsWithAssignment = availableHubs.map(hub => ({
          ...hub,
          isAssigned: assignedHubIds.some(id => id.toString() === hub._id?.toString())
        }))
        
        // Format assigned hubs to match the structure (use populated data if available, otherwise use from allHubs)
        const assignedHubs = assignedHubsRaw
          .map(hub => {
            if (typeof hub === 'object' && hub._id) {
              // It's a populated hub object, use it directly
              return {
                ...hub,
                isAssigned: true
              }
            } else {
              // It's just an ID, find the full hub data
              return availableHubs.find(h => h._id?.toString() === hub.toString())
            }
          })
          .filter(Boolean) // Remove any undefined entries
        
        return { success: true, data: hubsWithAssignment, assignedHubIds, assignedHubs }
      } catch (err) {
        if (err.status === 500 || err.status === 404) {
          console.warn('Hubs fetch failed, returning empty array:', err.message)
          return { success: true, data: [], assignedHubIds: [], assignedHubs: [] }
        }
        throw err
      }
    },
    [partnerId]
  )

  // Fetch categories for update form and for displaying category names
  useEffect(() => {
    const fetchCategories = async () => {
      if (token) {
        setLoadingCategories(true)
        try {
          const response = await adminApi.fetchCategories(token)
          if (response.success && response.data) {
            setCategories(response.data)
          }
        } catch (err) {
          console.error('Failed to fetch categories:', err)
        } finally {
          setLoadingCategories(false)
        }
      }
    }
    fetchCategories()
  }, [token])

  // Fetch MG Plans filtered by partner type
  useEffect(() => {
    const fetchMGPlans = async () => {
      // Get partner data from the data sources
      const fullPartner = partnerDetailsData?.partner || {}
      const earningsPartner = earningsData?.partner || {}
      const partnerData = { ...earningsPartner, ...fullPartner }
      
      if (!token || !partnerData?._id) return
      
      try {
        const response = await adminApi.fetchMGPlans(token)
        const plans = response.plans || response.data || []
        
        // Filter by partner type
        const partnerType = partnerData?.partnerType || 'individual'
        const filteredPlans = plans.filter(plan => {
          if (!plan.partnerType || plan.partnerType === 'both') return true
          return plan.partnerType === partnerType
        })
        
        setMgPlans(filteredPlans)
      } catch (error) {
        console.error('Error fetching MG plans:', error)
      }
    }
    
    fetchMGPlans()
  }, [token, partnerDetailsData, earningsData])

  // Fetch Lead Plans filtered by partner type
  useEffect(() => {
    const fetchLeadPlans = async () => {
      // Get partner data from the data sources
      const fullPartner = partnerDetailsData?.partner || {}
      const earningsPartner = earningsData?.partner || {}
      const partnerData = { ...earningsPartner, ...fullPartner }
      
      if (!token || !partnerData?._id) return
      
      try {
        const response = await adminApi.fetchLeadPlans(token)
        const plans = response.plans || response.data || []
        
        // Filter by partner type
        const partnerType = partnerData?.partnerType || 'individual'
        const filteredPlans = plans.filter(plan => {
          if (!plan.partnerType || plan.partnerType === 'both') return true
          return plan.partnerType === partnerType
        })
        
        setLeadPlans(filteredPlans)
      } catch (error) {
        console.error('Error fetching Lead plans:', error)
      }
    }
    
    fetchLeadPlans()
  }, [token, partnerDetailsData, earningsData])

  const handlePaymentApproval = async () => {
    // Use values from updateForm (which are bound to the input fields)
    const paymentId = updateForm.payId || partner?.profile?.payId || ''
    const registerAmount = updateForm.registerAmount || partner?.profile?.registerAmount || 0
    const paidBy = updateForm.paidBy || partner?.profile?.paidBy || 'Manual Approval'
    
    // Validate payment ID
    if (!paymentId || paymentId.trim() === '') {
      alert('Please enter a Payment ID before approving')
      return
    }

    // Confirm approval with the values from the form
    if (!confirm(`Approve payment for ${partner?.profile?.name || 'this partner'}?\n\nPayment ID: ${paymentId}\nAmount: ₹${registerAmount}\nPaid By: ${paidBy}`)) {
      return
    }

    setPaymentApprovalLoading(true)
    try {
      // Create payment approval data using form values
      const paymentData = {
        id: partnerId,
        registerAmount: parseFloat(registerAmount) || 0,
        payId: paymentId.trim(),
        paidBy: paidBy,
        securityDeposit: parseFloat(updateForm.securityDeposit || partner?.profile?.securityDeposit || 0),
        toolkitPrice: parseFloat(updateForm.toolkitPrice || partner?.profile?.toolkitPrice || 0),
        paymentApproved: true,
        approvedBy: 'Admin',
        approvedAt: new Date().toISOString()
      }

      // Call the complete payment API to approve the payment
      const response = await adminApi.approvePartnerPayment(token, partnerId, paymentData)

      if (response.success) {
        alert('Payment approved successfully!')
        // Refresh the partner data
        window.location.reload()
      } else {
        alert('Failed to approve payment: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Payment approval error:', error)
      alert('Error approving payment: ' + error.message)
    } finally {
      setPaymentApprovalLoading(false)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    if (!transactionAmount || !transactionDescription) {
      alert('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.addWalletTransaction(token, {
        type: transactionType,
        amount: Number(transactionAmount),
        description: transactionDescription,
        reference: transactionReference || undefined,
        paymentMode: paymentMode, // NEW
        transactionId: transactionId || undefined, // NEW
        partner: partnerId
      })
      
      // Reset form
      setTransactionAmount('')
      setTransactionDescription('')
      setTransactionReference('')
      setPaymentMode('cash') // NEW - Reset
      setTransactionId('') // NEW - Reset
      setShowTransactionModal(false)
      
      // Refetch wallet data
      refetchWallet()
      refetchEarnings()
      
      alert('Transaction added successfully!')
    } catch (error) {
      alert(error.message || 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Handle updating payment details for current plan
  const handleUpdatePaymentDetails = async () => {
    // Validate payment details based on method
    if (updatePaymentMethod === 'cash' && !updateCollectedBy.trim()) {
      alert('Please enter who collected the payment')
      return
    }
    
    if ((updatePaymentMethod === 'online' || updatePaymentMethod === 'upi') && !updateTransactionId.trim()) {
      alert('Please enter the transaction ID')
      return
    }
    
    setUpdatingPayment(true)
    try {
      const paymentDetails = {
        paymentMethod: updatePaymentMethod,
        ...(updatePaymentMethod === 'cash' 
          ? { collectedBy: updateCollectedBy }
          : { transactionId: updateTransactionId }
        )
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/partners/${partnerId}/mg-plan/payment-details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentDetails)
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        alert('Payment details updated successfully!')
        setShowUpdatePaymentDetails(false)
        setUpdatePaymentMethod('cash')
        setUpdateCollectedBy('')
        setUpdateTransactionId('')
        // Refresh partner data
        window.location.reload()
      } else {
        alert(data.message || 'Failed to update payment details')
      }
    } catch (error) {
      console.error('Error updating payment details:', error)
      alert('Error updating payment details')
    } finally {
      setUpdatingPayment(false)
    }
  }
  
  // Handle Lead Plan Assignment
  const handleAssignLeadPlan = async () => {
    if (!selectedLeadPlanId) {
      alert('Please select a Lead plan')
      return
    }
    
    // Validate payment details based on method
    if (leadPlanPaymentMethod === 'cash' && !leadPlanCollectedBy.trim()) {
      alert('Please enter who collected the payment')
      return
    }
    
    if ((leadPlanPaymentMethod === 'online' || leadPlanPaymentMethod === 'upi') && !leadPlanTransactionId.trim()) {
      alert('Please enter the transaction ID')
      return
    }
    
    setLeadPlanSubmitting(true)
    try {
      const paymentDetails = {
        paymentMethod: leadPlanPaymentMethod,
        ...(leadPlanPaymentMethod === 'cash' 
          ? { collectedBy: leadPlanCollectedBy }
          : { transactionId: leadPlanTransactionId }
        ),
        ...(leadPlanLeadsToAdd && { customLeads: parseInt(leadPlanLeadsToAdd) })
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/lead-plans/${selectedLeadPlanId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            partnerId,
            ...paymentDetails
          })
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        alert('Lead Plan assigned successfully!')
        setShowLeadPlanModal(false)
        setSelectedLeadPlanId(null)
        setLeadPlanPaymentMethod('cash')
        setLeadPlanCollectedBy('')
        setLeadPlanTransactionId('')
        setLeadPlanLeadsToAdd('')
        // Refresh partner data
        window.location.reload()
      } else {
        alert(data.message || 'Failed to assign Lead plan')
      }
    } catch (error) {
      console.error('Error assigning Lead plan:', error)
      alert('Error assigning Lead plan')
    } finally {
      setLeadPlanSubmitting(false)
    }
  }
  const handleAssignMGPlan = async () => {
    if (!selectedMGPlanId) {
      alert('Please select an MG plan')
      return
    }
    
    // Validate payment details based on method
    if (mgPlanPaymentMethod === 'cash' && !mgPlanCollectedBy.trim()) {
      alert('Please enter who collected the payment')
      return
    }
    
    if ((mgPlanPaymentMethod === 'online' || mgPlanPaymentMethod === 'upi') && !mgPlanTransactionId.trim()) {
      alert('Please enter the transaction ID')
      return
    }
    
    setMgPlanSubmitting(true)
    try {
      const paymentDetails = {
        paymentMethod: mgPlanPaymentMethod,
        ...(mgPlanPaymentMethod === 'cash' 
          ? { collectedBy: mgPlanCollectedBy }
          : { transactionId: mgPlanTransactionId }
        )
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/mg-plans/${selectedMGPlanId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            partnerId,
            ...paymentDetails
          })
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        alert('MG Plan assigned successfully!')
        setShowMGPlanModal(false)
        setSelectedMGPlanId(null)
        setMgPlanPaymentMethod('cash')
        setMgPlanCollectedBy('')
        setMgPlanTransactionId('')
        // Refresh partner data
        window.location.reload()
      } else {
        alert(data.message || 'Failed to assign MG plan')
      }
    } catch (error) {
      console.error('Error assigning MG plan:', error)
      alert('Error assigning MG plan')
    } finally {
      setMgPlanSubmitting(false)
    }
  }

  // Initialize selected hubs when partner hubs data loads
  useEffect(() => {
    if (partnerHubsData?.assignedHubIds) {
      setSelectedHubIds(partnerHubsData.assignedHubIds.map(id => id.toString()))
    }
  }, [partnerHubsData])

  const openHubSelection = () => {
    // Set current assigned hubs as selected
    const assignedIds = partnerHubsData?.assignedHubIds || []
    setSelectedHubIds(assignedIds.map(id => id.toString()))
    setShowHubModal(true)
  }

  const handleHubToggle = (hubId) => {
    const hubIdStr = hubId.toString()
    setSelectedHubIds(prev => {
      if (prev.includes(hubIdStr)) {
        return prev.filter(id => id !== hubIdStr)
      } else {
        return [...prev, hubIdStr]
      }
    })
  }

  const handleHubSubmit = async (event) => {
    event.preventDefault()
    
    setHubSubmitting(true)
    try {
      const allHubs = partnerHubsData?.data || []
      const currentlyAssigned = allHubs.filter(h => h.isAssigned).map(h => h._id.toString())
      const newlySelected = selectedHubIds
      
      // Find hubs to assign (in newlySelected but not in currentlyAssigned)
      const toAssign = newlySelected.filter(id => !currentlyAssigned.includes(id))
      
      // Find hubs to unassign (in currentlyAssigned but not in newlySelected)
      const toUnassign = currentlyAssigned.filter(id => !newlySelected.includes(id))
      
      // Assign new hubs
      for (const hubId of toAssign) {
        await adminApi.assignHubToPartner(token, hubId, partnerId)
      }
      
      // Unassign removed hubs
      for (const hubId of toUnassign) {
        await adminApi.unassignHubFromPartner(token, hubId, partnerId)
      }
      
      setShowHubModal(false)
      refreshPartnerHubs()
      // Also refresh partner details to get updated hub assignments
      window.location.reload()
    } catch (err) {
      alert(err.message || 'Failed to update hub assignments')
    } finally {
      setHubSubmitting(false)
    }
  }

  // Handle MG Plan History Delete
  const handleDeleteMGPlanHistory = async (historyIndex) => {
    if (!confirm('Are you sure you want to delete this MG plan history entry? This action cannot be undone.')) {
      return
    }

    try {
      const response = await adminApi.deleteMGPlanHistoryEntry(token, partnerId, historyIndex)
      if (response.success) {
        alert('MG plan history entry deleted successfully')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert(response.message || 'Failed to delete MG plan history entry')
      }
    } catch (error) {
      console.error('Error deleting MG plan history:', error)
      alert('Error deleting MG plan history entry')
    }
  }

  // Handle Partner Permanent Delete
  const handleDeletePartner = async () => {
    const partnerName = partner?.profile?.name || 'this partner'
    
    if (!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete ${partnerName}?\n\nThis will:\n- Delete all partner data\n- Delete all bookings\n- Delete all transactions\n- Delete all history\n\nThis action CANNOT be undone!`)) {
      return
    }

    // Double confirmation with prompt
    const confirmText = prompt(`To confirm deletion, type "DELETE" (in capital letters):`)
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled. You must type "DELETE" exactly to confirm.')
      return
    }

    try {
      const response = await adminApi.deletePartner(token, partnerId)
      if (response.success) {
        alert('Partner deleted permanently')
        navigate('/admin/partners')
      } else {
        alert(response.message || 'Failed to delete partner')
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert(`Error deleting partner: ${error.message || 'Unknown error'}`)
    }
  }

  // Consolidate partner data from all sources - use fullPartner as primary, fallback to earningsData partner
  const fullPartner = partnerDetailsData?.partner || {}

  const earningsPartner = earningsData?.partner || {}
  const partner = { ...earningsPartner, ...fullPartner } // Merge with fullPartner taking precedence
  const mgPlanSummary = partner?.mgPlanSummary || {}
  const leadPlan = partner?.leadPlan || {}
  const leadPlanSummary = partner?.leadPlanSummary || {}
  
  // Debug logging for payment data
  console.log('Partner Payment Data:', {
    partnerId: partner?._id,
    registerAmount: partner?.profile?.registerAmount,
    payId: partner?.profile?.payId,
    paidBy: partner?.profile?.paidBy,
    registerdFee: partner?.profile?.registerdFee,
    paymentApproved: partner?.profile?.paymentApproved,
    securityDeposit: partner?.profile?.securityDeposit,
    toolkitPrice: partner?.profile?.toolkitPrice
  });

  // Get all partner data - consolida ted to avoid repetition
  const partnerProfile = partner?.profile || {}
  const partnerKYC = partner?.kyc || {}
  const partnerBankDetails = partner?.bankDetails || {}
  // Check multiple possible locations for terms data
  const partnerTerms = partner?.terms || partner?.partnerTerms || partner?.termsAccepted || (partner?.onboardingData?.terms) || {}
  // Handle categories - can be array or single object
  // Check multiple possible field names
  const partnerCategoriesRaw = partner?.category || partner?.categories || []
  const partnerCategories = Array.isArray(partnerCategoriesRaw) 
    ? partnerCategoriesRaw 
    : (partnerCategoriesRaw ? [partnerCategoriesRaw] : [])
  const partnerCategoryNames = partner?.categoryNames || []
  
  // Debug logging - comprehensive
  console.log('🔍 Partner Categories Debug:', {
    partnerId: partner?._id,
    hasCategoryField: !!partner?.category,
    hasCategoriesField: !!partner?.categories,
    categoryRaw: partner?.category,
    categoriesRaw: partner?.categories,
    categoryCount: partnerCategories.length,
    categoryNamesCount: partnerCategoryNames.length,
    categories: partnerCategories,
    categoryNames: partnerCategoryNames,
    fullPartnerKeys: Object.keys(fullPartner),
    earningsPartnerKeys: Object.keys(earningsPartner)
  })
  
  // Calculate display category names - use useMemo to recalculate when dependencies change
  const displayCategoryNames = useMemo(() => {
    // First priority: Use categoryNames if available
    if (partnerCategoryNames.length > 0) {
      return partnerCategoryNames
    }
    
    // Second priority: Extract names from populated category objects
    const namesFromObjects = partnerCategories
      .map(cat => {
        if (typeof cat === 'object' && cat !== null && cat !== undefined) {
          return cat.name || cat.description || null
        }
        return null
      })
      .filter(Boolean)
    
    if (namesFromObjects.length > 0) {
      return namesFromObjects
    }
    
    // Third priority: Match category IDs with categories list
    if (partnerCategories.length > 0 && categories.length > 0) {
      const matchedNames = partnerCategories
        .map(catId => {
          // Handle both ObjectId and string IDs
          const catIdStr = typeof catId === 'object' && catId !== null 
            ? String(catId._id || catId.id || catId)
            : String(catId)
          
          const matchedCategory = categories.find(c => {
            const cId = String(c._id || c.id || c)
            return cId === catIdStr
          })
          
          return matchedCategory?.name || null
        })
        .filter(Boolean)
      
      if (matchedNames.length > 0) {
        return matchedNames
      }
    }
    
    return []
  }, [partnerCategoryNames, partnerCategories, categories])
  
  console.log('Final Display Category Names:', displayCategoryNames, {
    partnerCategoryNames,
    partnerCategoriesCount: partnerCategories.length,
    categoriesCount: categories.length
  })
  const partnerServices = partner?.service || []
  const partnerSubcategories = partner?.subcategory || []
  const mgPlan = partner?.mgPlan || {}
  
  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      
      // Get signature URL
      const signatureUrl = (partnerTerms?.signature || partner?.terms?.signature)?.startsWith('data:') 
        ? (partnerTerms?.signature || partner?.terms?.signature)
        : (partnerTerms?.signature || partner?.terms?.signature)?.startsWith('http') 
          ? (partnerTerms?.signature || partner?.terms?.signature)
          : (partnerTerms?.signature || partner?.terms?.signature)
            ? `/uploads/signatures/${partnerTerms?.signature || partner?.terms?.signature}`
            : null
      
      // Get logo SVG (inline)
      const logoSVG = `<svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z" stroke="#214A73" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z" stroke="#214A73" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z" stroke="#214A73" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z" stroke="#214A73" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="24" cy="24" r="4" fill="#214A73"/>
      </svg>`
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Partner Full Details - ${partnerProfile?.name || 'N/A'}</title>
            <style>
              @media print {
                @page { 
                  size: A4;
                  margin: 18mm 15mm 15mm 15mm;
                }
                
                @page {
                  @top-center {
                    content: element(header);
                  }
                  @bottom-center {
                    content: element(footer);
                  }
                  counter-increment: page;
                }
                
                @page:first {
                  counter-reset: page 0;
                }
                
                .print-page-header {
                  position: running(header);
                  width: 100%;
                  height: 18mm;
                  min-height: 18mm;
                  max-height: 18mm;
                  background: linear-gradient(135deg, #214A73 0%, #0ea5a4 100%);
                  color: white;
                  padding: 5px 0;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  border-bottom: 2px solid #0ea5a4;
                  box-sizing: border-box;
                }
                
                .print-page-header-left {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding-left: 15mm;
                }
                
                .print-page-header-logo {
                  width: 40px;
                  height: 40px;
                  min-width: 40px;
                  min-height: 40px;
                  background: white;
                  border-radius: 6px;
                  padding: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }
                
                .print-page-header-logo svg {
                  width: 100%;
                  height: 100%;
                }
                
                .print-page-header-text {
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                }
                
                .print-page-header-text h1 {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 0;
                  line-height: 1.1;
                  padding: 0;
                }
                
                .print-page-header-text p {
                  font-size: 9px;
                  margin: 0;
                  padding: 0;
                  opacity: 0.9;
                  line-height: 1.1;
                }
                
                .print-page-header-right {
                  text-align: right;
                  font-size: 9px;
                  flex-shrink: 0;
                  margin-left: 10px;
                  padding-right: 15mm;
                }
                
                .print-page-header-right .date {
                  font-weight: bold;
                  margin-bottom: 2px;
                  line-height: 1.2;
                }
                
                .print-page-footer {
                  position: running(footer);
                  width: 100%;
                  height: 15mm;
                  min-height: 15mm;
                  max-height: 15mm;
                  background: #f8fafc;
                  border-top: 2px solid #e2e8f0;
                  padding: 4px 0;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  font-size: 8px;
                  color: #64748b;
                  box-sizing: border-box;
                }
                
                .print-page-footer-left {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding-left: 15mm;
                }
                
                .print-page-footer-signature {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                
                .print-page-footer-signature {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                }
                
                .print-page-footer-signature img {
                  max-width: 70px !important;
                  max-height: 30px !important;
                  width: auto !important;
                  height: auto !important;
                  border: 1px solid #cbd5e1 !important;
                  padding: 3px !important;
                  background: white !important;
                  object-fit: contain !important;
                  display: block !important;
                  flex-shrink: 0 !important;
                }
                
                @media print {
                  .print-page-footer-signature {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                  }
                  
                  .print-page-footer-signature img {
                    display: block !important;
                    visibility: visible !important;
                    max-width: 70px !important;
                    max-height: 30px !important;
                  }
                }
                
                .print-page-footer-signature-text {
                  font-size: 8px;
                  color: #475569;
                  line-height: 1.2;
                }
                
                .print-page-footer-signature-text div {
                  margin: 0;
                  padding: 0;
                }
                
                .print-page-footer-right {
                  text-align: right;
                  font-size: 8px;
                  padding-right: 15mm;
                }
                
                .print-page-footer-right .page-info {
                  font-weight: bold;
                  color: #214A73;
                  margin-bottom: 2px;
                }
                
                .print-page-footer-right .page-info::after {
                  content: counter(page);
                }
                
                * { 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  font-size: 11px; 
                  line-height: 1.5; 
                  color: #1e293b;
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                
                /* Ensure header and footer don't interfere with content */
                .print-content-wrapper {
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  display: block;
                  visibility: visible;
                  opacity: 1;
                }
                
                /* Ensure first content section is visible */
                .print-content-wrapper > *:first-child {
                  margin-top: 0 !important;
                  padding-top: 0 !important;
                }
                
                /* Profile section specific fixes */
                .print-content-wrapper .print-section:first-of-type {
                  page-break-after: avoid;
                  margin-top: 0;
                }
                
                /* Hide header/footer in screen view, show only in print */
                .print-page-header,
                .print-page-footer {
                  display: none;
                }
                
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                  
                  .print-page-header,
                  .print-page-footer {
                    display: flex !important;
                  }
                  
                  .print-content-wrapper {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  
                  /* Ensure all content is visible */
                  .print-content-wrapper * {
                    visibility: visible !important;
                  }
                  
                  /* Preserve layout structures */
                  .print-content-wrapper .print-section {
                    display: block !important;
                    visibility: visible !important;
                  }
                  
                  .print-content-wrapper .print-grid {
                    display: grid !important;
                    visibility: visible !important;
                  }
                  
                  .print-content-wrapper .print-label,
                  .print-content-wrapper .print-value {
                    display: block !important;
                    visibility: visible !important;
                  }
                  
                  /* Ensure flex containers work */
                  .print-content-wrapper [class*="flex"] {
                    display: flex !important;
                  }
                  
                  /* Ensure grid containers work */
                  .print-content-wrapper [class*="grid"] {
                    display: grid !important;
                  }
                  
                  /* Ensure tables are visible */
                  table {
                    display: table !important;
                    visibility: visible !important;
                  }
                  
                  tr {
                    display: table-row !important;
                  }
                  
                  td, th {
                    display: table-cell !important;
                  }
                }
                .print-header { 
                  border-bottom: 3px solid #000; 
                  padding-bottom: 15px; 
                  margin-bottom: 25px; 
                  display: flex;
                  align-items: center;
                  gap: 20px;
                }
                .print-logo {
                  width: 80px;
                  height: 80px;
                }
                .print-header-content {
                  flex: 1;
                }
                .print-header h1 {
                  font-size: 24px;
                  margin-bottom: 8px;
                }
                .print-section { 
                  margin-bottom: 20px; 
                  page-break-inside: auto; 
                  padding-bottom: 10px;
                  display: block;
                  visibility: visible;
                  opacity: 1;
                  width: 100%;
                }
                
                @media print {
                  .print-section { 
                    page-break-inside: auto;
                    break-inside: auto;
                    margin-bottom: 15px;
                    page-break-after: auto;
                    orphans: 3;
                    widows: 3;
                  }
                  
                  /* Ensure first section is visible */
                  .print-section:first-of-type {
                    margin-top: 0;
                    padding-top: 0;
                  }
                }
                .print-section-title { 
                  font-size: 16px; 
                  font-weight: bold; 
                  color: #1e293b; 
                  margin-bottom: 12px; 
                  border-bottom: 2px solid #e2e8f0; 
                  padding-bottom: 8px; 
                }
                .print-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 12px 20px; 
                  margin-bottom: 15px;
                  width: 100%;
                }
                
                @media print {
                  .print-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 10px 15px !important;
                    margin-bottom: 12px !important;
                    width: 100% !important;
                    page-break-inside: auto;
                  }
                  
                  /* Ensure grid items are visible */
                  .print-grid > * {
                    display: block !important;
                    visibility: visible !important;
                    page-break-inside: avoid;
                    min-height: auto;
                  }
                }
                .print-label { 
                  font-weight: 600; 
                  color: #64748b; 
                  margin-bottom: 4px; 
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .print-value { 
                  margin-bottom: 12px; 
                  color: #1e293b; 
                  font-size: 12px;
                }
                .print-full-width { 
                  grid-column: 1 / -1; 
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 15px; 
                  font-size: 10px; 
                }
                th, td { 
                  border: 1px solid #cbd5e1; 
                  padding: 10px; 
                  text-align: left; 
                }
                th { 
                  background-color: #f1f5f9; 
                  font-weight: bold; 
                  color: #475569;
                }
                .status-badge { 
                  display: inline-block; 
                  padding: 4px 10px; 
                  border-radius: 4px; 
                  font-size: 9px; 
                  font-weight: bold; 
                }
                .status-approved { 
                  background-color: #d1fae5 !important; 
                  color: #065f46 !important; 
                }
                .status-pending { 
                  background-color: #fef3c7 !important; 
                  color: #92400e !important; 
                }
                .status-rejected { 
                  background-color: #fee2e2 !important; 
                  color: #991b1b !important; 
                }
                .kyc-doc { 
                  margin: 5px 0; 
                  padding: 8px; 
                  background-color: #f8fafc; 
                  border-left: 3px solid #3b82f6; 
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  page-break-inside: avoid;
                }
                /* KYC Documents Container */
                .kyc-documents-container {
                  display: flex !important;
                  flex-wrap: wrap !important;
                  gap: 15px !important;
                  align-items: flex-start !important;
                  justify-content: flex-start !important;
                  width: 100% !important;
                }
                
                /* KYC Document Cards */
                .kyc-doc {
                  flex: 0 0 auto !important;
                  width: 200px !important;
                  min-width: 180px !important;
                  max-width: 220px !important;
                  display: flex !important;
                  flex-direction: column !important;
                  margin: 0 !important;
                  vertical-align: top !important;
                  text-align: center !important;
                }
                
                .kyc-doc div[class*="aspect"] {
                  width: 100% !important;
                  max-height: 150px !important;
                  overflow: hidden !important;
                }
                
                .kyc-doc img {
                  max-width: 100% !important;
                  max-height: 150px !important;
                  width: 100% !important;
                  height: auto !important;
                  object-fit: contain !important;
                  border: 1px solid #cbd5e1 !important;
                  padding: 5px !important;
                  background: white !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                
                /* Ensure KYC document cards maintain structure */
                .kyc-doc > div {
                  width: 100% !important;
                }
                
                /* Grid Images */
                .grid img,
                div[class*="grid"] img {
                  max-width: 100% !important;
                  max-height: 150px !important;
                  width: auto !important;
                  height: auto !important;
                  object-fit: contain !important;
                  display: block !important;
                  margin: 5px auto !important;
                }
                
                /* Aspect Ratio Images */
                div[class*="aspect"] {
                  max-height: 150px !important;
                  overflow: visible !important;
                  margin: 5px 0 !important;
                }
                
                div[class*="aspect"] img {
                  max-width: 100% !important;
                  max-height: 150px !important;
                  width: auto !important;
                  height: auto !important;
                  object-fit: contain !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                
                /* Signature Images */
                .signature-image,
                img.signature-image {
                  max-width: 250px !important;
                  max-height: 100px !important;
                  border: 1px solid #cbd5e1 !important;
                  padding: 10px !important;
                  background: white !important;
                  object-fit: contain !important;
                  width: auto !important;
                  height: auto !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                
                /* Profile Images */
                img[alt="Profile"],
                .profile-image {
                  max-width: 120px !important;
                  max-height: 120px !important;
                  width: 120px !important;
                  height: 120px !important;
                  border-radius: 50% !important;
                  object-fit: cover !important;
                  border: 4px solid #e2e8f0 !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                
                /* Image Container Alignment */
                @media print {
                  /* Profile image container - use class-based selectors */
                  div[class*="flex"] {
                    display: flex !important;
                    align-items: center !important;
                    gap: 15px !important;
                  }
                  
                  /* KYC Documents Container - Print */
                  .kyc-documents-container {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 15px !important;
                    align-items: flex-start !important;
                    justify-content: flex-start !important;
                    width: 100% !important;
                    page-break-inside: auto !important;
                  }
                  
                  /* KYC Document Cards - Print */
                  .kyc-doc {
                    flex: 0 0 auto !important;
                    width: 200px !important;
                    min-width: 180px !important;
                    max-width: 220px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    margin: 0 !important;
                    vertical-align: top !important;
                    text-align: center !important;
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                  }
                  
                  .kyc-doc img {
                    max-width: 100% !important;
                    max-height: 150px !important;
                    width: 100% !important;
                    height: auto !important;
                    object-fit: contain !important;
                    page-break-inside: avoid !important;
                  }
                  
                  /* Grid containers */
                  .grid,
                  div[class*="grid"] {
                    display: grid !important;
                    gap: 15px !important;
                    align-items: start !important;
                    margin: 10px 0 !important;
                  }
                  
                  /* Grid with images - responsive columns */
                  .grid img,
                  div[class*="grid"] img {
                    max-width: 180px !important;
                  }
                  
                  /* Ensure images don't break across pages */
                  img {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                    display: block !important;
                  }
                  
                  /* Document sections with images */
                  .print-section {
                    page-break-inside: auto !important;
                  }
                  
                  /* Better spacing for sections with images */
                  .print-section .kyc-doc,
                  .print-section img {
                    margin-bottom: 10px !important;
                  }
                }
                .terms-full-text {
                  margin-top: 20px;
                  padding: 15px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  font-size: 11px;
                  line-height: 1.6;
                  color: #334155;
                }
                .terms-full-text h4 {
                  font-size: 12px;
                  font-weight: bold;
                  margin-top: 12px;
                  margin-bottom: 6px;
                  color: #1e293b;
                }
                .terms-full-text ol,
                .terms-full-text ul {
                  margin-left: 20px;
                  margin-top: 8px;
                  margin-bottom: 8px;
                }
                .terms-full-text li {
                  margin-bottom: 4px;
                }
                .terms-full-text .penalty-table {
                  background: #fff7ed;
                  border: 1px solid #fed7aa;
                  padding: 10px;
                  border-radius: 6px;
                  margin-top: 10px;
                  width: 100%;
                }
                .penalty-box {
                  background: #fff7f0;
                  border: 1px solid #ffd8b5;
                  padding: 10px;
                  border-radius: 6px;
                  margin-top: 10px;
                }
              }
            </style>
          </head>
          <body>
            <!-- Print Header (appears on every page) -->
            <div class="print-page-header">
              <div class="print-page-header-left">
                <div class="print-page-header-logo">
                  ${logoSVG}
                </div>
                <div class="print-page-header-text">
                  <h1>NEXO</h1>
                  <p>Partner Details Document</p>
                </div>
              </div>
              <div class="print-page-header-right">
                <div class="date">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div>Partner ID: ${partnerId?.toString().slice(-8) || 'N/A'}</div>
              </div>
            </div>
            
            <!-- Print Footer (appears on every page) -->
            <div class="print-page-footer">
              <div class="print-page-footer-left">
                ${signatureUrl ? `
                  <div class="print-page-footer-signature">
                    <img src="${signatureUrl}" alt="Partner Signature" onerror="this.style.display='none'" />
                    <div class="print-page-footer-signature-text">
                      <div><strong>Partner Signature</strong></div>
                      <div>${partnerProfile?.name || 'Partner'}</div>
                    </div>
                  </div>
                ` : `
                  <div class="print-page-footer-signature-text">
                    <div><strong>NEXO Partner Platform</strong></div>
                    <div>Official Document</div>
                  </div>
                `}
              </div>
              <div class="print-page-footer-right">
                <div class="page-info">Page </div>
                <div>www.nexo.works</div>
              </div>
            </div>
            
            <!-- Main Content -->
            <div class="print-content-wrapper">
              ${printRef.current.innerHTML}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      
      // Convert images to base64 for printing (including signature in footer)
      setTimeout(() => {
        const images = printWindow.document.querySelectorAll('img')
        let loadedCount = 0
        const totalImages = images.length
        
        if (totalImages === 0) {
          printWindow.print()
          setTimeout(() => printWindow.close(), 100)
          return
        }
        
        images.forEach((img) => {
          if (img.src.startsWith('data:')) {
            loadedCount++
            if (loadedCount === totalImages) {
              printWindow.print()
              setTimeout(() => printWindow.close(), 100)
            }
            return
          }
          
          const imgElement = new Image()
          imgElement.crossOrigin = 'anonymous'
          imgElement.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = imgElement.width
              canvas.height = imgElement.height
              const ctx = canvas.getContext('2d')
              ctx.drawImage(imgElement, 0, 0)
              img.src = canvas.toDataURL('image/png')
              loadedCount++
              if (loadedCount === totalImages) {
                printWindow.print()
                setTimeout(() => printWindow.close(), 100)
              }
            } catch (err) {
              console.warn('Failed to convert image:', err)
              loadedCount++
              if (loadedCount === totalImages) {
                printWindow.print()
                setTimeout(() => printWindow.close(), 100)
              }
            }
          }
          imgElement.onerror = () => {
            loadedCount++
            if (loadedCount === totalImages) {
              printWindow.print()
              setTimeout(() => printWindow.close(), 100)
            }
          }
          
          // Use absolute URL if relative
          if (img.src.startsWith('/')) {
            imgElement.src = window.location.origin + img.src
          } else {
            imgElement.src = img.src
          }
        })
      }, 500)
    }
  }
  // Extract bookings from earnings data - check multiple possible structures
  const bookings = earningsData?.transactions || earningsData?.bookings || earningsData?.data?.transactions || []
  const totalEarnings = earningsData?.totalEarnings || earningsData?.data?.totalEarnings || 0
  
  // Extract wallet data - check multiple possible structures
  const wallet = walletData?.data || walletData || {}
  const walletBalance = wallet?.balance || 0
  const transactions = wallet?.transactions || wallet?.data?.transactions || []
  const allHubs = partnerHubsData?.data || []
  // Use assigned hubs from partner details if available, otherwise filter from all hubs
  const assignedHubsFromPartner = partnerHubsData?.assignedHubs || []
  const assignedHubs = assignedHubsFromPartner.length > 0 
    ? assignedHubsFromPartner 
    : allHubs.filter(h => h.isAssigned)

  const minWalletBalance = wallet?.minWalletBalance ?? mgPlanSummary.minWalletBalance ?? 0
  const leadFee = wallet?.leadFee ?? mgPlanSummary.leadFee ?? 0
  const walletStatusMessage =
    walletBalance < minWalletBalance
      ? `Wallet below minimum threshold (₹${minWalletBalance}). Recharge to resume lead notifications.`
      : `Wallet healthy. Minimum required: ₹${minWalletBalance}`

  const leadsGuaranteed = mgPlanSummary.leadsGuaranteed ?? 0
  const leadsUsed = mgPlanSummary.leadsUsed ?? 0
  const leadsRemaining = mgPlanSummary.leadsRemaining ?? Math.max(leadsGuaranteed - leadsUsed, 0)
  const refundStatus = mgPlanSummary.refundStatus || 'pending'

  const formattedBookings = bookings.map((booking) => ({
    bookingId: booking.bookingId?.toString().slice(-8) || 'N/A',
    customerName: booking.user?.name || 'N/A',
    serviceName: booking.subService || booking.service || 'N/A',
    totalAmount: `₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`,
    commissionAmount: `₹${(booking.commissionAmount || 0).toLocaleString('en-IN')}`,
    partnerEarnings: `₹${(booking.partnerEarnings || 0).toLocaleString('en-IN')}`,
    completedAt: booking.completedAt 
      ? new Date(booking.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'N/A'
  }))

  const formattedTransactions = transactions.map((txn, index) => ({
    id: txn._id || txn.id || `txn-${index}`,
    date: txn.createdAt 
      ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleDateString('en-IN'),
    type: (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
          txn.type === 'credit'
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-rose-500/10 text-rose-600'
        }`}
      >
        {txn.type === 'credit' ? 'Credit' : 'Debit'}
      </span>
    ),
    amount: `₹${(txn.amount || 0).toLocaleString('en-IN')}`,
    description: txn.description || 'N/A',
    balance: `₹${(txn.balance || 0).toLocaleString('en-IN')}`,
    reference: txn.reference || 'N/A'
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/partners')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {partnerProfile?.name || 'Partner Details'}
            </h1>
            <p className="text-sm text-slate-500">
              Partner ID: {partnerId?.toString().slice(-8) || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Wallet Management Button */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              <FiDollarSign className="w-5 h-5" />
              Wallet
              <span className="text-xs ml-1">▼</span>
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <div className="px-3 py-2 mb-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">Current Balance</p>
                  <p className="text-lg font-bold text-slate-900">₹{walletBalance.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => {
                    setTransactionType('credit')
                    setShowTransactionModal(true)
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm rounded transition"
                >
                  <FiPlus className="w-4 h-4 text-emerald-600" />
                  <span>Add Funds</span>
                </button>
                <button
                  onClick={() => {
                    setTransactionType('debit')
                    setShowTransactionModal(true)
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm rounded transition"
                >
                  <FiMinus className="w-4 h-4 text-rose-600" />
                  <span>Deduct Funds</span>
                </button>
                <div className="border-t border-slate-200 my-1"></div>
                <button
                  onClick={() => setShowTransactionsModal(true)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm rounded transition"
                >
                  <FiEye className="w-4 h-4 text-blue-600" />
                  <span>View Wallet Transactions</span>
                </button>
                <button
                  onClick={() => setShowFeeTransactionsModal(true)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-sm rounded transition"
                >
                  <FiCreditCard className="w-4 h-4 text-purple-600" />
                  <span>View Fee Transactions</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* KYC Actions */}
          {partnerKYC && (
            <div className="flex items-center gap-2">
              {partnerKYC.status !== 'approved' && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Approve KYC for this partner?')) return
                    try {
                      await adminApi.updatePartnerProfile(token, partnerId, {
                        kycStatus: 'approved',
                        kycRemarks: 'Approved by admin'
                      })
                      window.location.reload()
                    } catch (err) {
                      alert(err.message || 'Failed to approve KYC')
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  Approve KYC
                </button>
              )}
              {partnerKYC.status !== 'rejected' && (
                <button
                  onClick={async () => {
                    const remarks = prompt('Enter rejection reason:')
                    if (!remarks) return
                    try {
                      await adminApi.updatePartnerProfile(token, partnerId, {
                        kycStatus: 'rejected',
                        kycRemarks: remarks
                      })
                      window.location.reload()
                    } catch (err) {
                      alert(err.message || 'Failed to reject KYC')
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-semibold"
                >
                  <FiXCircle className="w-5 h-5" />
                  Reject KYC
                </button>
              )}
            </div>
          )}
          
          {/* Update KYC Documents */}
          <button
            onClick={() => setShowKYCModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <FiUpload className="w-5 h-5" />
            Update KYC
          </button>
          
          {/* Update Profile Image */}
          <button
            onClick={() => setShowProfileImageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            <FiImage className="w-5 h-5" />
            Profile Image
          </button>
          
          <button
            onClick={() => {
              setUpdateForm({
                name: partnerProfile?.name || '',
                email: partnerProfile?.email || '',
                phone: partner?.phone || '',
                whatsappNumber: partner?.whatsappNumber || '',
                qualification: partner?.qualification || '',
                experience: partner?.experience?.toString() || '',
                partnerType: partner?.partnerType || 'individual',
                address: partnerProfile?.address || '',
                landmark: partnerProfile?.landmark || '',
                pincode: partnerProfile?.pincode || '',
                city: partnerProfile?.city || '',
                gstNumber: partnerProfile?.gstNumber || partner?.gstNumber || '',
                referralCode: partner?.referralCode || '',
                categories: partnerCategories.map(cat => cat._id || cat.id || cat).filter(Boolean),
                categoryNames: displayCategoryNames,
                // Bank Details
                accountHolderName: partnerBankDetails?.accountHolderName || '',
                accountNumber: partnerBankDetails?.accountNumber || '',
                ifscCode: partnerBankDetails?.ifscCode || '',
                bankName: partnerBankDetails?.bankName || '',
                // KYC Status
                kycStatus: partnerKYC?.status || '',
                kycRemarks: partnerKYC?.remarks || '',
                // Payment Info
                registerAmount: partner?.profile?.registerAmount?.toString() || '',
                payId: partner?.profile?.payId || '',
                paidBy: partner?.profile?.paidBy || '',
                securityDeposit: partner?.profile?.securityDeposit?.toString() || '',
                toolkitPrice: partner?.profile?.toolkitPrice?.toString() || '',
                // Profile Status
                profileCompleted: partner?.profileCompleted || false
              })
              setShowUpdateModal(true)
              setUpdateError('')
              setUpdateSuccess('')
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-semibold"
          >
            <FiEdit2 className="w-5 h-5" />
            Update Details
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
          >
            <FiPrinter className="w-5 h-5" />
            Print
          </button>
          <button
            onClick={() => setShowIDCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <FiAward className="w-5 h-5" />
            ID Card
          </button>
          
          {/* Permanent Delete Button */}
          <button
            onClick={handleDeletePartner}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            title="Permanently delete this partner"
          >
            <FiTrash2 className="w-5 h-5" />
            Delete Partner
          </button>
        </div>
      </div>

      {/* Full Partner Details Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8" ref={printRef}>
        {/* Print Header */}
        <div className="print-header hidden print:block mb-6">
          <div className="print-logo">
            <svg
              width="80"
              height="80"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 8C24 8 16 12 16 20C16 20 20 24 24 24C28 24 32 20 32 20C32 12 24 8 24 8Z"
                stroke="#214A73"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M24 40C24 40 32 36 32 28C32 28 28 24 24 24C20 24 16 28 16 28C16 36 24 40 24 40Z"
                stroke="#214A73"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M8 24C8 24 12 16 20 16C20 16 24 20 24 24C24 28 20 32 20 32C12 32 8 24 8 24Z"
                stroke="#214A73"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M40 24C40 24 36 32 28 32C28 32 24 28 24 24C24 20 28 16 28 16C36 16 40 24 40 24Z"
                stroke="#214A73"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="24" cy="24" r="4" fill="#214A73" />
            </svg>
          </div>
          <div className="print-header-content">
            <h1 className="text-2xl font-bold text-slate-900">Nexo - Partner Full Details Report</h1>
            <p className="text-sm text-slate-600">Generated on {new Date().toLocaleString('en-IN')}</p>
            <p className="text-sm text-slate-600">Partner ID: {partnerId}</p>
          </div>
        </div>

        {(detailsLoading || earningsLoading) && !fullPartner?._id ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500">Loading partner details...</p>
          </div>
        ) : detailsError ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
            Error loading partner details: {detailsError}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="print-section">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Basic Information
              </h2>
              {/* Profile Image Display */}
              {(partnerProfile?.profileImage || partner?.profilePicture) && (
                <div className="mb-6 flex items-center gap-4 pb-6 border-b border-slate-200">
                  <div className="relative">
                    <img 
                      src={(partnerProfile?.profileImage || partner?.profilePicture)?.startsWith('http')
                        ? (partnerProfile?.profileImage || partner?.profilePicture)
                        : `/uploads/profiles/${partnerProfile?.profileImage || partner?.profilePicture}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 profile-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Profile Picture</p>
                    <a 
                      href={(partnerProfile?.profileImage || partner?.profilePicture)?.startsWith('http')
                        ? (partnerProfile?.profileImage || partner?.profilePicture)
                        : `/uploads/profiles/${partnerProfile?.profileImage || partner?.profilePicture}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 print-grid">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Full Name</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Email</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Phone Number</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partner?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">WhatsApp Number</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partner?.whatsappNumber || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Qualification</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partner?.qualification || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Experience (Years)</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partner?.experience || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Referral Code</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partner?.referralCode || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">GST Number</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.gstNumber || partner?.gstNumber || 'Not Provided'}</p>
                </div>
                <div className="md:col-span-2 space-y-1 print-full-width">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Address</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.address || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Landmark</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.landmark || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Pincode</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.pincode || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">City</p>
                  <p className="text-base text-slate-900 print-value font-medium">{partnerProfile?.city || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Profile Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      partner?.profileCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 status-badge status-approved'
                        : 'bg-amber-500/10 text-amber-600 status-badge status-pending'
                    }`}>
                      {partner?.profileCompleted ? 'COMPLETED' : 'INCOMPLETE'}
                    </span>
                    <button
                      onClick={async () => {
                        const newStatus = !partner?.profileCompleted
                        const confirmMessage = newStatus 
                          ? 'Mark this profile as COMPLETED?' 
                          : 'Mark this profile as INCOMPLETE?'
                        
                        if (window.confirm(confirmMessage)) {
                          try {
                            setUpdateLoading(true)
                            await adminApi.updatePartnerProfile(token, partnerId, {
                              profileCompleted: newStatus
                            })
                            alert('Profile status updated successfully!')
                            window.location.reload()
                          } catch (error) {
                            alert('Failed to update profile status: ' + error.message)
                          } finally {
                            setUpdateLoading(false)
                          }
                        }
                      }}
                      className="print:hidden p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition"
                      title="Toggle Profile Status"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Partner Type</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    partner?.partnerType === 'franchise'
                      ? 'bg-purple-500/10 text-purple-600 status-badge'
                      : 'bg-blue-500/10 text-blue-600 status-badge'
                  }`}>
                    {partner?.partnerType === 'franchise' ? 'FRANCHISE' : 'INDIVIDUAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiBriefcase className="w-5 h-5" />
                Service Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6 print-grid">
                <div className="md:col-span-2 print-full-width">
                  <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {displayCategoryNames.length > 0 ? (
                      displayCategoryNames.map((catName, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          {catName}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">No categories selected</span>
                    )}
                  </div>
                </div>
                {partnerSubcategories.length > 0 && (
                  <div className="md:col-span-2 print-full-width">
                    <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Sub-Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {partnerSubcategories.map((subcat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {subcat?.name || 'N/A'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {partnerServices.length > 0 && (
                  <div className="md:col-span-2 print-full-width">
                    <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {partnerServices.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {service?.name || 'N/A'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {partner?.modeOfService && (
                  <div className="md:col-span-2 print-full-width">
                    <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Mode of Service</p>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize">
                      {partner.modeOfService === 'online' ? 'Online' : partner.modeOfService === 'offline' ? 'Offline' : partner.modeOfService}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Information */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiFileText className="w-5 h-5" />
                KYC Documents & Status
              </h2>
              <div className="grid md:grid-cols-2 gap-6 print-grid">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">KYC Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    (partnerKYC?.status === 'approved' || partner?.status === 'approved')
                      ? 'bg-emerald-500/10 text-emerald-600 status-badge status-approved'
                      : (partnerKYC?.status === 'rejected' || partner?.status === 'rejected')
                      ? 'bg-rose-500/10 text-rose-600 status-badge status-rejected'
                      : 'bg-amber-500/10 text-amber-600 status-badge status-pending'
                  }`}>
                    {(partnerKYC?.status || partner?.status || 'pending').toUpperCase()}
                  </span>
                </div>
                {partnerKYC?.remarks && (
                  <div className="md:col-span-2 print-full-width">
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">KYC Remarks</p>
                    <p className="text-base text-slate-900 print-value">{partnerKYC.remarks}</p>
                  </div>
                )}
                <div className="md:col-span-2 print-full-width">
                  <p className="text-sm font-semibold text-slate-500 mb-4 print-label">KYC Documents</p>
                  <div className="flex flex-wrap gap-4 kyc-documents-container">
                    {partnerKYC?.panCard && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={partnerKYC.panCard.startsWith('http') ? partnerKYC.panCard : `/uploads/kyc/${partnerKYC.panCard}`}
                            alt="PAN Card"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">PAN Card</p>
                          <p className="text-xs text-slate-500 mt-1">Identity Document</p>
                        </div>
                        <a 
                          href={partnerKYC.panCard.startsWith('http') ? partnerKYC.panCard : `/uploads/kyc/${partnerKYC.panCard}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                    {partnerKYC?.aadhaar && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={partnerKYC.aadhaar.startsWith('http') ? partnerKYC.aadhaar : `/uploads/kyc/${partnerKYC.aadhaar}`}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">Aadhaar (Front)</p>
                          <p className="text-xs text-slate-500 mt-1">Identity Document</p>
                        </div>
                        <a 
                          href={partnerKYC.aadhaar.startsWith('http') ? partnerKYC.aadhaar : `/uploads/kyc/${partnerKYC.aadhaar}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                    {partnerKYC?.aadhaarback && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={partnerKYC.aadhaarback.startsWith('http') ? partnerKYC.aadhaarback : `/uploads/kyc/${partnerKYC.aadhaarback}`}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">Aadhaar (Back)</p>
                          <p className="text-xs text-slate-500 mt-1">Identity Document</p>
                        </div>
                        <a 
                          href={partnerKYC.aadhaarback.startsWith('http') ? partnerKYC.aadhaarback : `/uploads/kyc/${partnerKYC.aadhaarback}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                    {partnerKYC?.drivingLicence && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={partnerKYC.drivingLicence.startsWith('http') ? partnerKYC.drivingLicence : `/uploads/kyc/${partnerKYC.drivingLicence}`}
                            alt="Driving Licence"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">Driving Licence</p>
                          <p className="text-xs text-slate-500 mt-1">Identity Document</p>
                        </div>
                        <a 
                          href={partnerKYC.drivingLicence.startsWith('http') ? partnerKYC.drivingLicence : `/uploads/kyc/${partnerKYC.drivingLicence}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                    {partnerKYC?.bill && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={partnerKYC.bill.startsWith('http') ? partnerKYC.bill : `/uploads/kyc/${partnerKYC.bill}`}
                            alt="Utility Bill"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">Utility Bill</p>
                          <p className="text-xs text-slate-500 mt-1">Address Proof</p>
                        </div>
                        <a 
                          href={partnerKYC.bill.startsWith('http') ? partnerKYC.bill : `/uploads/kyc/${partnerKYC.bill}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                    {(partnerKYC?.chequeImage || partnerBankDetails?.chequeImage) && (
                      <div className="group relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow kyc-doc">
                        <div className="aspect-[4/3] relative" style={{ maxHeight: '128px', overflow: 'hidden' }}>
                          <img 
                            src={(partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)?.startsWith('http') || (partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)?.includes('s3.amazonaws.com')
                              ? (partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)
                              : `/uploads/kyc/${partnerKYC?.chequeImage || partnerBankDetails?.chequeImage}`}
                            alt="Cancelled Cheque"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '128px', width: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-slate-100 items-center justify-center">
                            <FiFileText className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-slate-700">Cancelled Cheque</p>
                          <p className="text-xs text-slate-500 mt-1">Bank Proof</p>
                        </div>
                        <a 
                          href={(partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)?.startsWith('http') || (partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)?.includes('s3.amazonaws.com')
                            ? (partnerKYC?.chequeImage || partnerBankDetails?.chequeImage)
                            : `/uploads/kyc/${partnerKYC?.chequeImage || partnerBankDetails?.chequeImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                          title="Click to view full size"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiCreditCard className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6 print-grid">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Registration Amount</p>
                  <p className="text-base text-slate-900 print-value">
                    ₹{(partner?.profile?.registerAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Payment ID</p>
                  <p className="text-base text-slate-900 print-value font-mono">
                    {partner?.profile?.payId || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Security Deposit</p>
                  <p className="text-base text-slate-900 print-value">
                    ₹{(partner?.profile?.securityDeposit || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Toolkit Price</p>
                  <p className="text-base text-slate-900 print-value">
                    ₹{(partner?.profile?.toolkitPrice || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Paid By</p>
                  <p className="text-base text-slate-900 print-value">
                    {partner?.profile?.paidBy || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Payment Status</p>
                  {partner?.profile?.paymentApproved ? (
                    <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold print-value bg-emerald-500/10 text-emerald-600">
                      Paid
                    </p>
                  ) : (
                    <button
                      onClick={handlePaymentApproval}
                      disabled={paymentApprovalLoading}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentApprovalLoading ? (
                        <FiLoader className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      {paymentApprovalLoading ? 'Verifying...' : 'Verify Payment'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions with Signature */}
            {(partner?.terms || partnerTerms?.signature || partnerTerms?.accepted) && (
              <div className="print-section border-t border-slate-200 pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                  <FiFileText className="w-5 h-5" />
                  Terms & Conditions Acceptance
                </h2>
                <div className="grid md:grid-cols-2 gap-6 print-grid">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Terms Accepted</p>
                    <p className="text-base text-slate-900 print-value">
                      {(partnerTerms.accepted || partner?.terms?.accepted) ? (
                        <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                          <FiCheckCircle className="w-5 h-5" />
                          Accepted
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Accepted</span>
                      )}
                    </p>
                  </div>
                  {(partnerTerms.acceptedAt || partner?.terms?.acceptedAt) && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Accepted On</p>
                      <p className="text-base text-slate-900 print-value">
                        {new Date(partnerTerms.acceptedAt || partner?.terms?.acceptedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {(partnerTerms.signature || partner?.terms?.signature) && (
                    <div className="md:col-span-2 print-full-width">
                      <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Digital Signature</p>
                      <img
                        src={(partnerTerms.signature || partner?.terms?.signature)?.startsWith('data:') 
                          ? (partnerTerms.signature || partner?.terms?.signature)
                          : (partnerTerms.signature || partner?.terms?.signature)?.startsWith('http') 
                            ? (partnerTerms.signature || partner?.terms?.signature)
                            : `/uploads/signatures/${partnerTerms.signature || partner?.terms?.signature}`}
                        alt="Partner Signature"
                        className="signature-image"
                        style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Full Terms & Conditions Text */}
                  <div className="md:col-span-2 print-full-width">
                    <div className="terms-full-text">
                      <h4>AGREEMENT</h4>
                      <p>This Partner Service Agreement ("Agreement") is between NEXO ("Company") and the registered service provider ("Partner"). It governs onboarding, obligations, fees, penalties, liabilities and termination.</p>
                      
                      <h4>Key Points:</h4>
                      <ol>
                        <li><strong>Onboarding:</strong> Partner shall provide valid KYC (Aadhaar, PAN, Address proof, Photo). Police verification required within 30 days.</li>
                        <li><strong>Fees:</strong> Registration fee, Toolkit fee, MG Plan, Security deposit (terms set by Platform).</li>
                        <li><strong>Obligations:</strong> Partner shall perform services with due skill, follow SOP, not solicit off-platform, not collect customer data off platform.</li>
                        <li><strong>Payments:</strong> All payments routed through Platform; Partner is independent contractor.</li>
                        <li><strong>Safety:</strong> No intoxication, no harassment; female-customer safety prioritized.</li>
                        <li><strong>Penalties:</strong> Attempt to take customer offline → ₹5,000 + termination; Last-minute cancellations, no-shows, delays and verified complaints trigger specified monetary penalties and suspension/termination for repeated violations.</li>
                        <li><strong>Liability:</strong> Partner responsible for damages caused by negligence; Company not responsible for Partner's personal injury or tools.</li>
                        <li><strong>Confidentiality:</strong> Partner must keep customer and Company data confidential.</li>
                        <li><strong>Governing Law:</strong> Indian law; exclusive jurisdiction of Bengaluru Courts.</li>
                      </ol>
                      
                      <div className="penalty-table">
                        <h4>Representative Penalty Table:</h4>
                        <ul>
                          <li>Offline / direct contact with customer: <strong>₹5,000 + termination + wallet freeze</strong></li>
                          <li>Cancel within 2 hours: <strong>₹199</strong> | Cancel after reaching site: <strong>₹299</strong></li>
                          <li>No-show after accept: <strong>₹299</strong> | Delay &gt; 30 mins: <strong>₹99</strong></li>
                          <li>Verified complaint: <strong>₹199–₹999</strong> depending on severity</li>
                        </ul>
                      </div>
                      
                      <p style={{ marginTop: '12px', fontSize: '10px', color: '#64748b' }}>
                        Full and binding terms are published on the Platform. By signing and accepting above you confirm you read and agree to all terms and penalties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiCreditCard className="w-5 h-5" />
                Bank Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6 print-grid">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Account Holder Name</p>
                  <p className="text-base text-slate-900 print-value">{partnerBankDetails?.accountHolderName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Account Number</p>
                  <p className="text-base text-slate-900 print-value">{partnerBankDetails?.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">IFSC Code</p>
                  <p className="text-base text-slate-900 print-value">{partnerBankDetails?.ifscCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Bank Name</p>
                  <p className="text-base text-slate-900 print-value">{partnerBankDetails?.bankName || 'N/A'}</p>
                </div>
                {(partnerBankDetails?.chequeImage || partnerKYC?.chequeImage) && (
                  <div className="md:col-span-2 print-full-width">
                    <p className="text-sm font-semibold text-slate-500 mb-2 print-label">Cancelled Cheque</p>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <img 
                        src={(partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)?.startsWith('http') || (partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)?.includes('s3.amazonaws.com')
                          ? (partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)
                          : `/uploads/kyc/${partnerBankDetails?.chequeImage || partnerKYC?.chequeImage}`}
                        alt="Cancelled Cheque"
                        className="w-full h-auto max-h-64 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'block'
                          }
                        }}
                      />
                      <div className="hidden p-4 text-center text-slate-500">
                        <FiFileText className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Image not available</p>
                      </div>
                      <a 
                        href={(partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)?.startsWith('http') || (partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)?.includes('s3.amazonaws.com')
                          ? (partnerBankDetails?.chequeImage || partnerKYC?.chequeImage)
                          : `/uploads/kyc/${partnerBankDetails?.chequeImage || partnerKYC?.chequeImage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary hover:underline mt-2 text-center"
                      >
                        View Full Size
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MG Plan Information */}
            {(mgPlan?._id || mgPlan?.name) && (
              <div className="print-section border-t border-slate-200 pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                  <FiAward className="w-5 h-5" />
                  MG Plan Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6 print-grid">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Plan Name</p>
                    <p className="text-base text-slate-900 print-value">{mgPlan?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Plan Price</p>
                    <p className="text-base text-slate-900 print-value">₹{(mgPlan.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Guaranteed Leads</p>
                    <p className="text-base text-slate-900 print-value">{mgPlan.leads || 0} leads/month</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Commission Rate</p>
                    <p className="text-base text-slate-900 print-value">{mgPlan.commission || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Lead Fee</p>
                    <p className="text-base text-slate-900 print-value">₹{(mgPlan.leadFee || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Minimum Wallet Balance</p>
                    <p className="text-base text-slate-900 print-value">₹{(mgPlan.minWalletBalance || 0).toLocaleString('en-IN')}</p>
                  </div>
                  {partner?.mgPlanSubscribedAt && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Subscribed On</p>
                      <p className="text-base text-slate-900 print-value">
                        {new Date(partner.mgPlanSubscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {partner?.mgPlanExpiresAt && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Expires On</p>
                      <p className="text-base text-slate-900 print-value">
                        {new Date(partner.mgPlanExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lead Plan Information */}
            {(leadPlan?._id || leadPlan?.name || partner?.leadPlanLeadQuota > 0) && (
              <div className="print-section border-t border-slate-200 pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                  <FiUsers className="w-5 h-5" />
                  Lead Plan Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6 print-grid">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Plan Name</p>
                    <p className="text-base text-slate-900 print-value">
                      {leadPlan?.name || (partner?.leadPlanHistory?.length > 0 ? partner.leadPlanHistory[partner.leadPlanHistory.length - 1].planName : 'Custom Plan')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Plan Price</p>
                    <p className="text-base text-slate-900 print-value">
                      ₹{(leadPlan?.price || (partner?.leadPlanHistory?.length > 0 ? partner.leadPlanHistory[partner.leadPlanHistory.length - 1].price : 0) || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Total Leads</p>
                    <p className="text-base text-slate-900 print-value">{partner?.leadPlanLeadQuota || 0} leads</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Leads Used</p>
                    <p className="text-base text-slate-900 print-value">{partner?.leadPlanLeadsUsed || 0} leads</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Leads Remaining</p>
                    <p className="text-base text-slate-900 print-value font-semibold text-emerald-600">
                      {Math.max((partner?.leadPlanLeadQuota || 0) - (partner?.leadPlanLeadsUsed || 0), 0)} leads
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Lead Fee</p>
                    <p className="text-base text-slate-900 print-value">
                      ₹{(leadPlan?.leadFee || (partner?.leadPlanHistory?.length > 0 ? partner.leadPlanHistory[partner.leadPlanHistory.length - 1].leadFee : 0) || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {partner?.leadPlanSubscribedAt && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Subscribed On</p>
                      <p className="text-base text-slate-900 print-value">
                        {new Date(partner.leadPlanSubscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {partner?.leadPlanExpiresAt && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Expires On</p>
                      <p className="text-base text-slate-900 print-value">
                        {new Date(partner.leadPlanExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title flex items-center gap-2">
                <FiDollarSign className="w-5 h-5" />
                Performance Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-6 print-grid">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Total Earnings</p>
                  <p className="text-2xl font-bold text-emerald-600 print-value">₹{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Wallet Balance</p>
                  <p className="text-2xl font-bold text-primary print-value">₹{walletBalance.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">Completed Bookings</p>
                  <p className="text-xl font-bold text-slate-900 print-value">{bookings.length}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 print-label">MG Plan Leads Used</p>
                  <p className="text-xl font-bold text-slate-900 print-value">{leadsUsed} / {leadsGuaranteed}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="print-section border-t border-slate-200 pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 print-section-title">PARTNER TERMS & CONDITIONS</h2>
              <div className="terms-full-text">
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <p><strong>Effective Date:</strong> 15th November 2025</p>
                    <p><strong>Last Updated:</strong> 15th November 2025</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-gray-700">
                  {/* 1. Introduction */}
                  <div>
                    <h4>1. Introduction</h4>
                    <p>These Partner Terms & Conditions ("Terms") constitute a binding agreement between NEXO ("Company", "Platform", "We", "Us") and the individual or business entity ("Partner", "Service Provider", "You") who registers to provide on-site or online services through the Platform.</p>
                    <p>By registering or accepting any service request, the Partner expressly agrees to these Terms.</p>
                  </div>

                  {/* 2. Independent Contractor Status */}
                  <div>
                    <h4>2. Independent Contractor Status</h4>
                    <ul>
                      <li>The Partner is an independent contractor, not an employee, representative, or agent of NEXO.</li>
                      <li>No employment benefits (PF, ESI, gratuity, insurance, paid leave, salary) shall be applicable.</li>
                      <li>The Partner is solely responsible for compliance with GST, income tax, labour laws, and all statutory obligations.</li>
                    </ul>
                  </div>

                  {/* 3. Mandatory Registration & Onboarding Requirements */}
                  <div>
                    <h4>3. Mandatory Registration & Onboarding Requirements</h4>
                    <p>The Partner shall complete mandatory onboarding, including but not limited to:</p>
                    <ul>
                      <li>Valid Government ID</li>
                      <li>Address proof</li>
                      <li>Skill verification/trade test (if applicable)</li>
                      <li>Police verification (whenever required)</li>
                      <li>Recent photograph</li>
                      <li>Bank account details</li>
                      <li>GST number (if applicable)</li>
                    </ul>
                    <p><strong>Payment of applicable onboarding fees:</strong></p>
                    <ul>
                      <li>Registration Fee</li>
                      <li>Toolkit Fee (if provided)</li>
                      <li>Minimum Guarantee (MG) Plan</li>
                      <li>Security Deposit</li>
                    </ul>
                    <p className="text-xs">All fees are non-refundable, except security deposit which is refundable as per Clause 20.</p>
                  </div>

                  {/* 4. Partner Obligations */}
                  <div>
                    <h4>4. Partner Obligations</h4>
                    <p>Partner shall:</p>
                    <ul>
                      <li>Maintain professional behaviour at all times.</li>
                      <li>Deliver high-quality, safe, and lawful services.</li>
                      <li>Carry valid Partner ID during every service.</li>
                      <li>Reach customer location on time.</li>
                      <li>Provide correct service estimates before starting work.</li>
                      <li>Maintain hygiene, wear uniform/ID (if provided).</li>
                      <li>Not engage in misconduct, harassment, abuse, threats, or illegal activity.</li>
                      <li>Maintain tools and ensure safe operation.</li>
                      <li>Not demand cash payments directly from customers.</li>
                      <li>Not solicit or accept off-platform work (strict penalty).</li>
                    </ul>
                  </div>

                  {/* 5. Pricing, Estimates & Billing */}
                  <div>
                    <h4>5. Pricing, Estimates & Billing</h4>
                    <ul>
                      <li>Partner must follow NEXO pricing structure and guidelines.</li>
                      <li>Any additional work must be pre-approved through the Platform.</li>
                      <li>Partner shall not overcharge or misrepresent pricing.</li>
                      <li>All payments shall be processed solely through NEXO.</li>
                      <li>Partner is responsible for issuing bills/invoices where required by law.</li>
                    </ul>
                  </div>

                  {/* 6. Platform Commission & Deductions */}
                  <div>
                    <h4>6. Platform Commission & Deductions</h4>
                    <p>Partner agrees to the following deductions:</p>
                    <ul>
                      <li>Platform Commission (%)</li>
                      <li>Lead Cost per lead</li>
                      <li>GST applicable on Platform Commission</li>
                      <li>Penalties & Fines</li>
                      <li>TDS (if applicable)</li>
                      <li>Outstanding dues from previous jobs</li>
                      <li>MG Plan adjustments</li>
                    </ul>
                    <p className="text-xs">All deductions shall be final and binding.</p>
                  </div>

                  {/* 7. Mandatory Safety Requirements */}
                  <div>
                    <h4>7. Mandatory Safety Requirements</h4>
                    <p>Partner shall:</p>
                    <ul>
                      <li>Follow safety protocols prescribed by NEXO.</li>
                      <li>Use proper tools and protective equipment.</li>
                      <li>Not perform services beyond skill level or without proper safety.</li>
                      <li>Not endanger customer, property, or themselves.</li>
                    </ul>
                    <p>Failure may result in:</p>
                    <ul>
                      <li>Immediate suspension</li>
                      <li>Penalty up to ₹5,000</li>
                      <li>Legal action for damages</li>
                    </ul>
                  </div>

                  {/* 8. Customer Safety & Code of Conduct */}
                  <div>
                    <h4>8. Customer Safety & Code of Conduct</h4>
                    <p>Partner must strictly adhere to:</p>
                    <ul>
                      <li>No harassment (verbal, physical, emotional)</li>
                      <li>No misbehaviour, disrespect, abusive language</li>
                      <li>No consumption of alcohol/drugs on duty</li>
                      <li>No theft, damage, or misconduct</li>
                      <li>No photography or unauthorised recording at customer premises</li>
                      <li>No requesting personal favours or discounts</li>
                      <li>No entering restricted areas without consent</li>
                    </ul>
                    <p>Any violation may lead to:</p>
                    <ul>
                      <li>Permanent termination</li>
                      <li>Police complaint</li>
                      <li>Forfeiture of dues and deposits</li>
                      <li>Penalties up to ₹25,000</li>
                    </ul>
                  </div>

                  {/* 9. Punctuality & Attendance */}
                  <div>
                    <h4>9. Punctuality & Attendance</h4>
                    <ul>
                      <li>Partner must accept bookings only if available.</li>
                      <li>Must reach customer location on time.</li>
                      <li>Any delay beyond 20 minutes must be informed.</li>
                    </ul>
                    <p>Repeated delays may lead to:</p>
                    <ul>
                      <li>₹50–₹200 penalty per incident</li>
                      <li>Reduced lead allocation</li>
                      <li>Temporary suspension</li>
                    </ul>
                  </div>

                  {/* 10. No Offline Deals */}
                  <div className="penalty-box">
                    <h4>10. No Offline Deals (Strictly Prohibited)</h4>
                    <p>Partner shall not:</p>
                    <ul>
                      <li>Ask customer to cancel platform booking</li>
                      <li>Offer lower pricing for offline work</li>
                      <li>Share personal phone number for future services</li>
                      <li>Accept cash or direct payments</li>
                    </ul>
                    <p><strong>Penalty:</strong></p>
                    <ul>
                      <li>₹5,000 minimum</li>
                      <li>Permanent termination</li>
                      <li>Deduction from wallet and MG plan</li>
                      <li>Legal action for business loss</li>
                    </ul>
                  </div>

                  {/* 11. Service Quality & Returns */}
                  <div>
                    <h4>11. Service Quality & Returns</h4>
                    <p>Partner must ensure:</p>
                    <ul>
                      <li>High-quality workmanship</li>
                      <li>Correct problem diagnosis</li>
                      <li>Use of original parts (if applicable)</li>
                      <li>Guarantee service quality as per NEXO policy</li>
                    </ul>
                    <p>Poor work or customer complaints may attract:</p>
                    <ul>
                      <li>Rework without charges</li>
                      <li>Penalty from ₹100–₹1,000</li>
                      <li>Suspension on repeated offences</li>
                    </ul>
                  </div>

                  {/* 12. Damage, Theft, or Loss */}
                  <div>
                    <h4>12. Damage, Theft, or Loss</h4>
                    <p>Partner shall be fully liable for:</p>
                    <ul>
                      <li>Damage to customer property</li>
                      <li>Theft or loss at customer premises</li>
                      <li>Fire, accident, or injury caused due to Partner negligence</li>
                      <li>Incorrect installation or unsafe practices</li>
                    </ul>
                    <p>Recovery will be made through:</p>
                    <ul>
                      <li>Partner wallet</li>
                      <li>Security deposit</li>
                      <li>MG payouts</li>
                      <li>Legal recovery</li>
                    </ul>
                    <p className="text-xs">Police FIR may be filed for severe cases.</p>
                  </div>

                  {/* 13. Fraudulent Activities */}
                  <div>
                    <h4>13. Fraudulent Activities</h4>
                    <p>Strictly prohibited:</p>
                    <ul>
                      <li>Faking job completion</li>
                      <li>False OTP entry</li>
                      <li>Manipulating customer rating</li>
                      <li>Overcharging</li>
                      <li>Providing false documents</li>
                    </ul>
                    <p>Penalty:</p>
                    <ul>
                      <li>Up to ₹25,000</li>
                      <li>Permanent removal</li>
                      <li>Legal prosecution</li>
                    </ul>
                  </div>

                  {/* 14. Penalty Structure */}
                  <div className="penalty-box">
                    <h4>14. Penalty Structure</h4>
                    <table className="penalty-table">
                      <thead>
                        <tr>
                          <th>Violation</th>
                          <th>Penalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Late arrival</td>
                          <td>₹50–₹200</td>
                        </tr>
                        <tr>
                          <td>Job rejection after acceptance</td>
                          <td>₹100–₹300</td>
                        </tr>
                        <tr>
                          <td>Misbehaviour</td>
                          <td>₹1,000–₹5,000</td>
                        </tr>
                        <tr>
                          <td>Unsafe work</td>
                          <td>₹2,000</td>
                        </tr>
                        <tr>
                          <td>Offline deal</td>
                          <td>₹5,000+ termination</td>
                        </tr>
                        <tr>
                          <td>Theft/misconduct</td>
                          <td>Legal action + termination</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs mt-2">NEXO reserves the right to modify penalties anytime.</p>
                  </div>

                  {/* 15. Partner Wallet & Settlement */}
                  <div>
                    <h4>15. Partner Wallet & Settlement</h4>
                    <p>Deductions will be applied in the following order:</p>
                    <ol>
                      <li>Penalties</li>
                      <li>Platform Commission</li>
                      <li>Lead cost</li>
                      <li>MG plan adjustments</li>
                      <li>Pending dues</li>
                    </ol>
                    <p>Settlement cycles will be weekly or as updated by NEXO.</p>
                  </div>

                  {/* 16. MG Plan */}
                  <div>
                    <h4>16. MG Plan (Minimum Guarantee)</h4>
                    <ul>
                      <li>MG plan is mandatory as per category.</li>
                      <li>MG provides priority leads based on plan.</li>
                      <li>MG fee is non-refundable.</li>
                      <li>Partner failing to meet service quality/minimum performance may lose MG benefits without refund.</li>
                    </ul>
                  </div>

                  {/* 17. Ratings & Reviews */}
                  <div>
                    <h4>17. Ratings & Reviews</h4>
                    <ul>
                      <li>Partner must maintain minimum rating (e.g., 4.0).</li>
                      <li>Low ratings may result in reduced leads or suspension.</li>
                      <li>False or manipulated ratings are punishable.</li>
                    </ul>
                  </div>

                  {/* 18. Use of Platform & Technology */}
                  <div>
                    <h4>18. Use of Platform & Technology</h4>
                    <p>Partner shall:</p>
                    <ul>
                      <li>Keep app updated</li>
                      <li>Not misuse customer data</li>
                      <li>Not reverse engineer, hack, or modify NEXO systems</li>
                      <li>Use genuine documents only</li>
                    </ul>
                  </div>

                  {/* 19. Termination */}
                  <div>
                    <h4>19. Termination</h4>
                    <p>NEXO may terminate partner access without notice for:</p>
                    <ul>
                      <li>Misconduct</li>
                      <li>Fraud</li>
                      <li>Unsafe behaviour</li>
                      <li>Low performance</li>
                      <li>Offline deals</li>
                      <li>Customer complaints</li>
                      <li>Violation of any Terms</li>
                    </ul>
                  </div>

                  {/* 20. Security Deposit Refund */}
                  <div>
                    <h4>20. Security Deposit Refund</h4>
                    <p>Refund only upon:</p>
                    <ul>
                      <li>30-day notice period</li>
                      <li>Return of toolkit (if applicable)</li>
                      <li>No pending dues or penalties</li>
                      <li>No active customer complaints</li>
                    </ul>
                    <p>Refund processing time: 21–45 working days.</p>
                  </div>

                  {/* 21. Dispute Resolution */}
                  <div>
                    <h4>21. Dispute Resolution</h4>
                    <ul>
                      <li><strong>Jurisdiction:</strong> Bangalore, Karnataka</li>
                      <li><strong>Governing Law:</strong> Laws of India</li>
                    </ul>
                    <p><strong>Method:</strong></p>
                    <ul>
                      <li>Internal review</li>
                      <li>Mediation</li>
                      <li>Arbitration (if required)</li>
                    </ul>
                  </div>

                  {/* 22. Amendments */}
                  <div>
                    <h4>22. Amendments</h4>
                    <p>NEXO reserves the right to change Terms anytime. Continued use of the Platform constitutes acceptance.</p>
                  </div>

                  {/* Acceptance Note */}
                  <div className="penalty-box" style={{background: '#eff6ff', borderColor: '#93c5fd'}}>
                    <p className="text-xs">
                      <strong>By signing and accepting this Agreement, Partner confirms that:</strong> (i) they have read, understood, and agree to be bound by all terms, conditions, and penalties outlined herein; (ii) they have had the opportunity to review the full terms published on the Platform; (iii) they understand that this Agreement is legally binding; and (iv) they agree to comply with all obligations and accept all penalties for violations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          

        
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">Total Earnings</span>
            <FiDollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            From {bookings.length} completed bookings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">Wallet Balance</span>
            <FiDollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">
            ₹{walletBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {transactions.length} transactions · Lead fee ₹{leadFee.toLocaleString('en-IN')}
          </p>
          <p className={`text-xs mt-2 ${walletBalance < minWalletBalance ? 'text-rose-500' : 'text-emerald-500'}`}>
            {walletStatusMessage}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">Total Bookings</span>
            <FiCalendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {bookings.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Completed bookings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">MG Plan Progress</span>
            <FiAward className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600 mb-1">
            {mgPlan?.name || 'No Plan'}
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {leadsRemaining} / {leadsGuaranteed}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Leads remaining · Used {leadsUsed}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Expires {mgPlanSummary.expiresAt ? new Date(mgPlanSummary.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {mgPlanSummary.leadAcceptancePaused && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-2xl mb-8 text-sm">
          Lead notifications are currently paused due to low wallet balance. Top up to resume assignments.
        </div>
      )}

      {/* Categories and MG Plan Display */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Service Categories & MG Plan</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-2">Selected Categories</p>
            <div className="flex flex-wrap gap-2">
              {displayCategoryNames.length > 0 ? (
                displayCategoryNames.map((catName, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {catName}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">No categories selected</span>
              )}
            </div>
            {partnerSubcategories.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Sub-Categories</p>
                <div className="flex flex-wrap gap-2">
                  {partnerSubcategories.map((subcat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {subcat?.name || 'N/A'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {partnerServices.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {partnerServices.map((service, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {service?.name || 'N/A'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {partner?.modeOfService && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Mode of Service</p>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize inline-block">
                  {partner.modeOfService === 'online' ? 'Online' : partner.modeOfService === 'offline' ? 'Offline' : partner.modeOfService}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">MG Plan</p>
            <div className="flex items-center gap-2">
              <FiAward className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-lg font-bold text-purple-600">
                  {mgPlan?.name || 'No Plan Assigned'}
                </p>
                {mgPlan?.name && (
                  <p className="text-xs text-slate-500 mt-1">
                    {mgPlan.leads || 0} leads · {mgPlan.commission || 0}% commission
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowMGPlanModal(true)}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
              >
                {mgPlan?.name ? 'Change Plan' : 'Assign Plan'}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Lead Plan</p>
            <div className="flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-lg font-bold text-indigo-600">
                  {leadPlan?.name || (partner?.leadPlanHistory?.length > 0 ? partner.leadPlanHistory[partner.leadPlanHistory.length - 1].planName : 'No Plan Assigned')}
                </p>
                {(leadPlan?.name || partner?.leadPlanLeadQuota > 0) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {partner?.leadPlanLeadQuota || 0} total leads · {Math.max((partner?.leadPlanLeadQuota || 0) - (partner?.leadPlanLeadsUsed || 0), 0)} remaining
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowLeadPlanModal(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
              >
                {leadPlan?.name || partner?.leadPlanLeadQuota > 0 ? 'Manage Plan' : 'Assign Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {refundStatus === 'eligible' && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl mb-6 text-sm">
          Plan refund eligible: guaranteed leads not met before expiry.
        </div>
      )}

   

      {/* Terms & Conditions */}
      {((partnerTerms?.signature || partnerTerms?.accepted) && Object.keys(partnerTerms).length > 0) && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            Terms & Conditions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 mb-2">Terms Accepted</p>
              {partnerTerms.accepted ? (
                <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                  <FiCheckCircle className="w-5 h-5" />
                  Accepted
                </span>
              ) : (
                <span className="text-slate-400">Not Accepted</span>
              )}
            </div>
            {partnerTerms.acceptedAt && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Accepted On</p>
                <p className="text-base text-slate-900 font-medium">
                  {new Date(partnerTerms.acceptedAt).toLocaleString('en-IN')}
                </p>
              </div>
            )}
            {partnerTerms.signature && (
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 mb-2">Digital Signature</p>
                <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 inline-block">
                  <img
                    src={partnerTerms.signature.startsWith('data:') 
                      ? partnerTerms.signature 
                      : partnerTerms.signature.startsWith('http') 
                        ? partnerTerms.signature 
                        : `/uploads/signatures/${partnerTerms.signature}`}
                    alt="Partner Signature"
                    className="max-w-xs max-h-32 h-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Hubs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Service Hubs
            </h2>
            <p className="text-xs text-slate-400">
              Assign hubs to this partner. Hubs are created in Hub Management.
            </p>
          </div>
          <button
            onClick={openHubSelection}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition"
          >
            <FiPlus /> {assignedHubs.length > 0 ? 'Update Hubs' : 'Assign Hubs'}
          </button>
        </div>

        {partnerHubsLoading ? (
          <div className="text-sm text-slate-400 py-4">Loading hubs...</div>
        ) : partnerHubsError ? (
          <div className="text-sm text-rose-500 py-4">
            Failed to load hubs: {partnerHubsError}
          </div>
        ) : assignedHubs.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
            <FiMapPin className="text-4xl text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium mb-1">No Hubs Assigned</p>
            <p className="text-xs text-slate-500">Click "Assign Hubs" to assign service hubs to this partner.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {assignedHubs.map((hub) => {
              const allPinCodes = hub.areas?.reduce((acc, area) => [...acc, ...(area.pinCodes || [])], []) || []
              const uniquePinCodes = [...new Set(allPinCodes)]
              
              return (
                <div key={hub._id} className="border-2 border-primary/20 rounded-xl p-4 bg-primary/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                      <FiMapPin className="text-primary" />
                      <p className="text-sm font-semibold text-slate-800">
                          {hub.name}
                      </p>
                    </div>
                      {(hub.city || hub.state) && (
                        <p className="text-xs text-slate-500 ml-6">
                          {[hub.city, hub.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 ml-6 mt-1">
                        {hub.areas?.length || 0} area{hub.areas?.length === 1 ? '' : 's'} • {uniquePinCodes.length} pin code{uniquePinCodes.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                  {hub.areas && hub.areas.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {hub.areas.map((area) => (
                        <div key={area._id} className="bg-white rounded-lg p-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">{area.areaName}</p>
                          {area.pinCodes && area.pinCodes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {area.pinCodes.map((pin) => (
                      <span
                        key={pin}
                                  className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary"
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MG Plan History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            MG Plan History
          </h2>
          <span className="text-xs text-slate-400">
            Commission: {mgPlanSummary.commission ?? '--'}%
          </span>
        </div>
        {(mgPlanSummary.history && mgPlanSummary.history.length > 0) ? (
          <div className="space-y-4">
            {mgPlanSummary.history.slice().reverse().map((entry, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {entry.planName} · ₹{(entry.price || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.subscribedAt ? new Date(entry.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      {" "}–{" "}
                      {entry.expiresAt ? new Date(entry.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        entry.refundStatus === 'eligible'
                          ? 'bg-amber-500/10 text-amber-600'
                          : entry.refundStatus === 'processed'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {entry.refundStatus ?? 'pending'}
                    </span>
                    <button
                      onClick={() => handleDeleteMGPlanHistory(mgPlanSummary.history.length - 1 - idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this MG plan history entry"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="block font-semibold text-slate-500">Guaranteed</span>
                    {entry.leadsGuaranteed ?? '—'} leads
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-500">Consumed</span>
                    {entry.leadsConsumed ?? 0} leads
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-500">Lead Fee</span>
                    ₹{(entry.leadFee ?? leadFee).toLocaleString('en-IN')}
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-500">Commission</span>
                    {(entry.commissionRate ?? mgPlanSummary.commission ?? 0)}%
                  </div>
                </div>
                {entry.refundNotes && (
                  <p className="mt-2 text-xs text-slate-500 italic">{entry.refundNotes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No MG plan history recorded.</p>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Add Wallet Transaction</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionType('credit')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                      transactionType === 'credit'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FiPlus className="w-4 h-4 inline mr-2" />
                    Credit (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('debit')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                      transactionType === 'debit'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FiMinus className="w-4 h-4 inline mr-2" />
                    Debit (Deduct)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Enter transaction description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reference (Optional)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Transaction reference number"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Transaction ID (show only for online payments) */}
              {paymentMode === 'online' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction/reference ID"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition ${
                    transactionType === 'credit'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Processing...' : transactionType === 'credit' ? 'Add Funds' : 'Deduct Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Partner Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Update Partner Details</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false)
                  setUpdateError('')
                  setUpdateSuccess('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setUpdateLoading(true)
                setUpdateError('')
                setUpdateSuccess('')
                try {
                  // Get selected category names
                  const selectedCategoryNames = categories
                    .filter(cat => updateForm.categories.includes(cat._id || cat.id))
                    .map(cat => cat.name)
                  
                  const updateData = {
                    name: updateForm.name,
                    email: updateForm.email,
                    phone: updateForm.phone,
                    whatsappNumber: updateForm.whatsappNumber,
                    qualification: updateForm.qualification,
                    experience: updateForm.experience,
                    partnerType: updateForm.partnerType || 'individual',
                    address: updateForm.address,
                    landmark: updateForm.landmark,
                    pincode: updateForm.pincode,
                    city: updateForm.city,
                    gstNumber: updateForm.gstNumber,
                    referralCode: updateForm.referralCode,
                    categories: updateForm.categories,
                    categoryNames: selectedCategoryNames,
                    // Bank Details
                    accountHolderName: updateForm.accountHolderName,
                    accountNumber: updateForm.accountNumber,
                    ifscCode: updateForm.ifscCode,
                    bankName: updateForm.bankName,
                    // KYC Status
                    kycStatus: updateForm.kycStatus,
                    kycRemarks: updateForm.kycRemarks,
                    // Payment Info
                    registerAmount: updateForm.registerAmount,
                    payId: updateForm.payId,
                    paidBy: updateForm.paidBy,
                    securityDeposit: updateForm.securityDeposit,
                    toolkitPrice: updateForm.toolkitPrice,
                    // Profile Status
                    profileCompleted: updateForm.profileCompleted
                  }
                  
                  const response = await adminApi.updatePartnerProfile(token, partnerId, updateData)
                  
                  if (response.success) {
                    setUpdateSuccess('Partner details updated successfully!')
                    // Refresh data after a short delay to show success message
                    setTimeout(() => {
                      window.location.reload()
                    }, 1000)
                  } else {
                    // Handle validation errors
                    if (response.errors && Array.isArray(response.errors)) {
                      setUpdateError(response.errors.join(', '))
                    } else {
                      setUpdateError(response.message || 'Failed to update partner details')
                    }
                  }
                } catch (err) {
                  console.error('Update error:', err)
                  // Handle error response
                  if (err.errors && Array.isArray(err.errors)) {
                    setUpdateError(err.errors.join(', '))
                  } else {
                    setUpdateError(err.message || 'Failed to update partner details')
                  }
                } finally {
                  setUpdateLoading(false)
                }
              }}
              className="p-6 space-y-6"
            >
              {updateError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                  {updateSuccess}
                </div>
              )}

              {/* Basic Information Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={updateForm.phone}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={updateForm.whatsappNumber}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={updateForm.qualification}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={updateForm.experience}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateForm.partnerType || 'individual'}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, partnerType: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="franchise">Franchise</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={updateForm.address}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={updateForm.landmark}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={updateForm.pincode}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={updateForm.city}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={updateForm.gstNumber}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, gstNumber: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={updateForm.referralCode}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, referralCode: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                
                </div>
              </div>

              {/* Category Selection Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiBriefcase className="w-5 h-5" />
                  Service Categories
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Categories <span className="text-red-500">*</span>
                  </label>
                  {loadingCategories ? (
                    <div className="text-sm text-slate-500 py-4">Loading categories...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 border-2 border-slate-300 rounded-lg">
                      {categories.map((category) => (
                        <label
                          key={category._id || category.id}
                          className="flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition hover:bg-slate-50"
                          style={{
                            borderColor: updateForm.categories.includes(category._id || category.id)
                              ? '#3b82f6'
                              : '#e2e8f0',
                            backgroundColor: updateForm.categories.includes(category._id || category.id)
                              ? '#eff6ff'
                              : 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={updateForm.categories.includes(category._id || category.id)}
                            onChange={(e) => {
                              const catId = category._id || category.id
                              if (e.target.checked) {
                                setUpdateForm(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, catId]
                                }))
                              } else {
                                setUpdateForm(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(id => id !== catId)
                                }))
                              }
                            }}
                            className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-700 flex-1">
                            {category.icon && <span className="mr-1">{category.icon}</span>}
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {updateForm.categories.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      {updateForm.categories.length} categor{updateForm.categories.length === 1 ? 'y' : 'ies'} selected
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Section */}
              {((partnerTerms?.signature || partnerTerms?.accepted) && Object.keys(partnerTerms).length > 0) && (
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FiFileText className="w-5 h-5" />
                    Terms & Conditions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-2">Terms Accepted</p>
                      {partnerTerms.accepted ? (
                        <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                          <FiCheckCircle className="w-5 h-5" />
                          Accepted
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Accepted</span>
                      )}
                    </div>
                    {partnerTerms.acceptedAt && (
                      <div>
                        <p className="text-sm font-semibold text-slate-500 mb-2">Accepted On</p>
                        <p className="text-base text-slate-900">
                          {new Date(partnerTerms.acceptedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                    {partnerTerms.signature && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-slate-500 mb-2">Digital Signature</p>
                        <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 inline-block">
                          <img
                            src={partnerTerms.signature.startsWith('data:') 
                              ? partnerTerms.signature 
                              : partnerTerms.signature.startsWith('http') 
                                ? partnerTerms.signature 
                                : `/uploads/signatures/${partnerTerms.signature}`}
                            alt="Partner Signature"
                            className="max-w-md h-auto"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Details Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5" />
                  Bank Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={updateForm.accountHolderName}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={updateForm.accountNumber}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={updateForm.ifscCode}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={updateForm.bankName}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* KYC Status Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiFileText className="w-5 h-5" />
                  KYC Status
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      KYC Status
                    </label>
                    <select
                      value={updateForm.kycStatus}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, kycStatus: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      KYC Remarks
                    </label>
                    <textarea
                      value={updateForm.kycRemarks}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, kycRemarks: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                      rows={3}
                      placeholder="Enter remarks or notes about KYC verification"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Status Section */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  Profile Status
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Profile Completion Status
                    </label>
                    <select
                      value={updateForm.profileCompleted ? 'completed' : 'incomplete'}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, profileCompleted: e.target.value === 'completed' }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="incomplete">INCOMPLETE</option>
                      <option value="completed">COMPLETED</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      updateForm.profileCompleted
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      Current: {updateForm.profileCompleted ? 'COMPLETED' : 'INCOMPLETE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information Section */}
              <div className="pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5" />
                  Payment Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Registration Amount
                    </label>
                    <input
                      type="number"
                      value={updateForm.registerAmount}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, registerAmount: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={updateForm.payId}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, payId: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Paid By
                    </label>
                    <input
                      type="text"
                      value={updateForm.paidBy}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, paidBy: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="e.g., UPI, Bank Transfer, Cash"
                    />
                  </div>
                </div>

                {/* Payment Status & Approval */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Payment Status
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        partner?.registerdFee && partner?.payId
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {partner?.registerdFee && partner?.payId ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>

                    {(!partner?.registerdFee || !partner?.payId) && (
                      <button
                        type="button"
                        onClick={handlePaymentApproval}
                        disabled={paymentApprovalLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {paymentApprovalLoading ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiCheckCircle className="w-4 h-4" />
                        )}
                        {paymentApprovalLoading ? 'Approving...' : 'Approve Payment'}
                      </button>
                    )}
                  </div>

                  {partner?.registerdFee && partner?.payId && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Payment has been verified and approved</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setUpdateError('')
                    setUpdateSuccess('')
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading || updateForm.categories.length === 0}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Updating...' : 'Update Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Documents Update Modal */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Update KYC Documents</h2>
              <button
                onClick={() => {
                  setShowKYCModal(false)
                  setKycFiles({
                    panCard: null,
                    aadhaar: null,
                    aadhaarback: null,
                    drivingLicence: null,
                    bill: null,
                    chequeImage: null
                  })
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                
                // Check if at least one file is selected
                const hasFiles = Object.values(kycFiles).some(file => file !== null)
                if (!hasFiles) {
                  alert('Please select at least one document to upload')
                  return
                }
                
                setUploading(true)
                try {
                  const formData = new FormData()
                  
                  // Add files that were selected
                  if (kycFiles.panCard) formData.append('panCard', kycFiles.panCard)
                  if (kycFiles.aadhaar) formData.append('aadhaar', kycFiles.aadhaar)
                  if (kycFiles.aadhaarback) formData.append('aadhaarback', kycFiles.aadhaarback)
                  if (kycFiles.drivingLicence) formData.append('drivingLicence', kycFiles.drivingLicence)
                  if (kycFiles.bill) formData.append('bill', kycFiles.bill)
                  if (kycFiles.chequeImage) formData.append('chequeImage', kycFiles.chequeImage)

                  // Add partner ID to form data
                  formData.append('id', partnerId)
                  
                  // Use admin endpoint to update KYC documents
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/updatedDocuments`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                    body: formData
                  })
                  
                  const result = await response.json()
                  
                  if (result.success === true || response.ok) {
                    const uploadedCount = result.uploadedFiles?.length || Object.values(kycFiles).filter(f => f !== null).length
                    alert(`KYC documents updated successfully! ${uploadedCount} file(s) uploaded.`)
                    setShowKYCModal(false)
                    setKycFiles({
                      panCard: null,
                      aadhaar: null,
                      aadhaarback: null,
                      drivingLicence: null,
                      bill: null,
                      chequeImage: null
                    })
                    window.location.reload()
                  } else {
                    alert(result.message || result.error || 'Failed to update KYC documents')
                  }
                } catch (err) {
                  console.error('KYC upload error:', err)
                  alert(err.message || 'Failed to update KYC documents')
                } finally {
                  setUploading(false)
                }
              }}
              className="p-6 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'panCard', label: 'PAN Card' },
                  { key: 'aadhaar', label: 'Aadhaar (Front)' },
                  { key: 'aadhaarback', label: 'Aadhaar (Back)' },
                  { key: 'drivingLicence', label: 'Driving Licence' },
                  { key: 'bill', label: 'Utility Bill' },
                  { key: 'chequeImage', label: 'Cancelled Cheque' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {label}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setKycFiles(prev => ({ ...prev, [key]: e.target.files[0] }))
                          }
                        }}
                        className="hidden"
                        id={`kyc-${key}`}
                      />
                      <label
                        htmlFor={`kyc-${key}`}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FiUpload className="text-2xl text-slate-400 mb-2" />
                        {kycFiles[key] ? (
                          <span className="text-sm text-emerald-600">✓ {kycFiles[key].name}</span>
                        ) : (
                          <span className="text-sm text-slate-600">Click to upload</span>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowKYCModal(false)
                    setKycFiles({
                      panCard: null,
                      aadhaar: null,
                      aadhaarback: null,
                      drivingLicence: null,
                      bill: null,
                      chequeImage: null
                    })
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !Object.values(kycFiles).some(file => file !== null)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Update KYC Documents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Image Update Modal */}
      {showProfileImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Update Profile Image</h2>
              <button
                onClick={() => {
                  setShowProfileImageModal(false)
                  setProfileImage(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!profileImage) {
                  alert('Please select an image')
                  return
                }
                setUploading(true)
                try {
                  const formData = new FormData()
                  formData.append('profileImage', profileImage)
                  
                  // Update profile with image using FormData
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/updatePartnerProfile/${partnerId}`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                    body: formData
                  })
                  
                  const result = await response.json()
                  if (result.success) {
                    alert('Profile image updated successfully!')
                    setShowProfileImageModal(false)
                    setProfileImage(null)
                    window.location.reload()
                  } else {
                    alert(result.message || 'Failed to update profile image')
                  }
                } catch (err) {
                  console.error('Profile image upload error:', err)
                  alert(err.message || 'Failed to update profile image')
                } finally {
                  setUploading(false)
                }
              }}
              className="space-y-4"
            >
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiImage className="text-4xl text-slate-400 mb-2" />
                  {profileImage ? (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(profileImage)}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover mx-auto"
                      />
                      <p className="text-sm text-emerald-600 mt-2">✓ {profileImage.name}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-600">Click to upload profile image</span>
                  )}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileImageModal(false)
                    setProfileImage(null)
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !profileImage}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Update Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Transactions Modal */}
      {showTransactionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Wallet Transactions</h2>
              <button
                onClick={() => setShowTransactionsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className="text-2xl font-bold text-slate-900">₹{walletBalance.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTransactionsModal(false)
                      setShowTransactionModal(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
                  >
                    <FiPlus className="w-4 h-4 inline mr-2" />
                    Add Transaction
                  </button>
                </div>
              </div>

              {walletLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-slate-500">Loading transactions...</p>
                </div>
              ) : walletError ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
                  Error loading transactions: {walletError}
                </div>
              ) : (
                <DataTable
                  columns={transactionColumns}
                  data={formattedTransactions}
                  emptyLabel="No transactions found."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Transactions Modal */}
      {showFeeTransactionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Fee Transactions</h2>
              <button
                onClick={() => setShowFeeTransactionsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {feeTransactionsData?.stats && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{feeTransactionsData.stats.totalAmount?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Successful</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ₹{feeTransactionsData.stats.successAmount?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      {feeTransactionsData.stats.successCount || 0} transactions
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {feeTransactionsData.stats.totalCount || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-lg">
                    <p className="text-sm text-rose-600">Failed</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {feeTransactionsData.stats.failedCount || 0}
                    </p>
                  </div>
                </div>
              )}

              {feeTransactionsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-slate-500">Loading fee transactions...</p>
                </div>
              ) : feeTransactionsError ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
                  Error loading fee transactions: {feeTransactionsError}
                </div>
              ) : feeTransactionsData?.data?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No fee transactions found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fee Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {feeTransactionsData?.data?.map((txn, index) => {
                        return (
                          <tr key={txn._id || index} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                txn.feeType === 'registration' ? 'bg-blue-500/10 text-blue-600' :
                                txn.feeType === 'mg_plan' ? 'bg-purple-500/10 text-purple-600' :
                                txn.feeType === 'security_deposit' ? 'bg-yellow-500/10 text-yellow-600' :
                                txn.feeType === 'toolkit' ? 'bg-green-500/10 text-green-600' :
                                'bg-slate-500/10 text-slate-600'
                              }`}>
                                {txn.feeType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{txn.amount?.toLocaleString('en-IN') || 0}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                txn.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                                txn.status === 'failed' ? 'bg-rose-500/10 text-rose-600' :
                                txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                'bg-slate-500/10 text-slate-600'
                              }`}>
                                {txn.status?.charAt(0).toUpperCase() + txn.status?.slice(1) || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                              <div>
                                <p className="truncate">{txn.description || 'N/A'}</p>
                                {txn.metadata?.priceBreakdown && (
                                  <details className="mt-1">
                                    <summary className="text-xs text-primary cursor-pointer hover:underline">
                                      View Payment Breakdown
                                    </summary>
                                    <div className="mt-1 text-xs text-slate-500 space-y-0.5 pl-2 bg-slate-50 p-2 rounded">
                                      {txn.metadata.priceBreakdown.registrationFee > 0 && (
                                        <p>Registration Fee: ₹{txn.metadata.priceBreakdown.registrationFee.toLocaleString('en-IN')}</p>
                                      )}
                                      {txn.metadata.priceBreakdown.securityDeposit > 0 && (
                                        <p>Security Deposit: ₹{txn.metadata.priceBreakdown.securityDeposit.toLocaleString('en-IN')}</p>
                                      )}
                                      {txn.metadata.priceBreakdown.toolkitPrice > 0 && (
                                        <p>Toolkit: ₹{txn.metadata.priceBreakdown.toolkitPrice.toLocaleString('en-IN')}</p>
                                      )}
                                      {txn.metadata.priceBreakdown.totalAmount > 0 && (
                                        <p className="font-semibold text-slate-700 border-t border-slate-200 pt-1 mt-1">
                                          Total Paid: ₹{txn.metadata.priceBreakdown.totalAmount.toLocaleString('en-IN')}
                                        </p>
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                              {txn.transactionId || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MG Plan Assignment Modal */}
      {showMGPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {mgPlan?.name ? 'Change MG Plan' : 'Assign MG Plan'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select a plan and provide payment details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMGPlanModal(false)
                  setSelectedMGPlanId(null)
                  setMgPlanPaymentMethod('cash')
                  setMgPlanCollectedBy('')
                  setMgPlanTransactionId('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Show existing plan details if assigned */}
            {mgPlan?.name && (
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiAward className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-900">Current Plan</h3>
                    </div>
                    {!mgPlanSummary?.paymentMethod && (
                      <button
                        type="button"
                        onClick={() => setShowUpdatePaymentDetails(!showUpdatePaymentDetails)}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-1"
                      >
                        <FiEdit2 className="w-3 h-3" />
                        {showUpdatePaymentDetails ? 'Cancel' : 'Add Payment Details'}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-slate-500">Plan Name</p>
                      <p className="font-semibold text-slate-900">{mgPlan.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Leads</p>
                      <p className="font-semibold text-slate-900">{mgPlan.leads || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Commission</p>
                      <p className="font-semibold text-slate-900">{mgPlan.commission || 0}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Price</p>
                      <p className="font-semibold text-slate-900">₹{mgPlan.price?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    {mgPlanSummary?.paymentMethod && (
                      <>
                        <div>
                          <p className="text-slate-500">Payment Method</p>
                          <p className="font-semibold text-slate-900 capitalize">{mgPlanSummary.paymentMethod}</p>
                        </div>
                        {mgPlanSummary.paymentMethod === 'cash' && mgPlanSummary.collectedBy && (
                          <div>
                            <p className="text-slate-500">Collected By</p>
                            <p className="font-semibold text-slate-900">{mgPlanSummary.collectedBy}</p>
                          </div>
                        )}
                        {(mgPlanSummary.paymentMethod === 'online' || mgPlanSummary.paymentMethod === 'upi') && mgPlanSummary.transactionId && (
                          <div>
                            <p className="text-slate-500">Transaction ID</p>
                            <p className="font-semibold text-slate-900 font-mono text-xs">{mgPlanSummary.transactionId}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Update Payment Details Form */}
                  {!mgPlanSummary?.paymentMethod && showUpdatePaymentDetails && (
                    <div className="border-t border-purple-200 pt-4 space-y-4">
                      <h4 className="text-sm font-semibold text-purple-900">Add Payment Details</h4>
                      
                      {/* Payment Method Selection */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Payment Method *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['cash', 'online', 'upi'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                setUpdatePaymentMethod(method)
                                setUpdateCollectedBy('')
                                setUpdateTransactionId('')
                              }}
                              className={`px-3 py-2 rounded-lg font-semibold text-xs transition ${
                                updatePaymentMethod === method
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {method.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Collected By (for cash) */}
                      {updatePaymentMethod === 'cash' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-2">
                            Collected By *
                          </label>
                          <input
                            type="text"
                            value={updateCollectedBy}
                            onChange={(e) => setUpdateCollectedBy(e.target.value)}
                            placeholder="Enter name of person who collected payment"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          />
                        </div>
                      )}

                      {/* Transaction ID (for online/upi) */}
                      {(updatePaymentMethod === 'online' || updatePaymentMethod === 'upi') && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-2">
                            Transaction ID *
                          </label>
                          <input
                            type="text"
                            value={updateTransactionId}
                            onChange={(e) => setUpdateTransactionId(e.target.value)}
                            placeholder="Enter transaction ID"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono"
                          />
                        </div>
                      )}

                      {/* Update Button */}
                      <button
                        type="button"
                        onClick={handleUpdatePaymentDetails}
                        disabled={updatingPayment}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {updatingPayment ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" />
                            Update Payment Details
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Warning if payment details are missing and form not shown */}
                {!mgPlanSummary?.paymentMethod && !showUpdatePaymentDetails && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-1">Payment Details Missing</h4>
                        <p className="text-sm text-amber-700 mb-2">
                          This MG plan doesn't have payment details recorded. Click "Add Payment Details" above to add them now.
                        </p>
                        <p className="text-xs text-amber-600 italic">
                          Note: When you change the plan below, you'll be required to provide payment details for the new plan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleAssignMGPlan(); }} className="space-y-6">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select MG Plan *
                </label>
                {mgPlans.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <p className="text-slate-500">No MG plans available for this partner type</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mgPlans.map((plan) => {
                      const isSelected = selectedMGPlanId === plan._id
                      return (
                        <div
                          key={plan._id}
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-slate-200 hover:border-purple-300 bg-white'
                          }`}
                          onClick={() => setSelectedMGPlanId(plan._id)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedMGPlanId(plan._id)}
                              className="mt-1 w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                                <span className="text-lg font-bold text-purple-600">
                                  ₹{plan.price?.toLocaleString('en-IN') || 0}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-500">Leads</p>
                                  <p className="font-semibold text-slate-700">{plan.leads || 0}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Commission</p>
                                  <p className="font-semibold text-slate-700">{plan.commission || 0}%</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Duration</p>
                                  <p className="font-semibold text-slate-700">{plan.duration || 0} days</p>
                                </div>
                              </div>
                              {plan.description && (
                                <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {selectedMGPlanId && (
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h3>
                  
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['cash', 'online', 'upi'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setMgPlanPaymentMethod(method)
                            setMgPlanCollectedBy('')
                            setMgPlanTransactionId('')
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                            mgPlanPaymentMethod === method
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collected By (for cash) */}
                  {mgPlanPaymentMethod === 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Collected By *
                      </label>
                      <input
                        type="text"
                        value={mgPlanCollectedBy}
                        onChange={(e) => setMgPlanCollectedBy(e.target.value)}
                        placeholder="Enter name of person who collected payment"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                      />
                    </div>
                  )}

                  {/* Transaction ID (for online/upi) */}
                  {(mgPlanPaymentMethod === 'online' || mgPlanPaymentMethod === 'upi') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={mgPlanTransactionId}
                        onChange={(e) => setMgPlanTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowMGPlanModal(false)
                    setSelectedMGPlanId(null)
                    setMgPlanPaymentMethod('cash')
                    setMgPlanCollectedBy('')
                    setMgPlanTransactionId('')
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mgPlanSubmitting || !selectedMGPlanId || mgPlans.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mgPlanSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {mgPlan?.name ? 'Change Plan' : 'Assign Plan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Plan Assignment Modal */}
      {showLeadPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Lead Plan Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Assign or manage lead plans for this partner
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLeadPlanModal(false)
                  setSelectedLeadPlanId(null)
                  setLeadPlanPaymentMethod('cash')
                  setLeadPlanCollectedBy('')
                  setLeadPlanTransactionId('')
                  setLeadPlanLeadsToAdd('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Show existing plan details if assigned */}
            {(leadPlan?.name || partner?.leadPlanLeadQuota > 0) && (
              <div className="mb-6 space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-indigo-900">Current Lead Plan</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-slate-500">Plan Name</p>
                      <p className="font-semibold text-slate-900">
                        {leadPlan?.name || (partner?.leadPlanHistory?.length > 0 ? partner.leadPlanHistory[partner.leadPlanHistory.length - 1].planName : 'Custom Plan')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Total Leads</p>
                      <p className="font-semibold text-slate-900">{partner?.leadPlanLeadQuota || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Leads Used</p>
                      <p className="font-semibold text-slate-900">{partner?.leadPlanLeadsUsed || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Leads Remaining</p>
                      <p className="font-semibold text-emerald-600">
                        {Math.max((partner?.leadPlanLeadQuota || 0) - (partner?.leadPlanLeadsUsed || 0), 0)}
                      </p>
                    </div>
                    {leadPlan?.price && (
                      <div>
                        <p className="text-slate-500">Plan Price</p>
                        <p className="font-semibold text-slate-900">₹{leadPlan.price?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    )}
                    {leadPlan?.leadFee && (
                      <div>
                        <p className="text-slate-500">Lead Fee</p>
                        <p className="font-semibold text-slate-900">₹{leadPlan.leadFee?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleAssignLeadPlan(); }} className="space-y-6">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Lead Plan *
                </label>
                {leadPlans.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <p className="text-slate-500">No Lead plans available for this partner type</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {leadPlans.map((plan) => {
                      const isSelected = selectedLeadPlanId === plan._id
                      return (
                        <div
                          key={plan._id}
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-slate-200 hover:border-indigo-300 bg-white'
                          }`}
                          onClick={() => setSelectedLeadPlanId(plan._id)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedLeadPlanId(plan._id)}
                              className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                                <span className="text-lg font-bold text-indigo-600">
                                  ₹{plan.price?.toLocaleString('en-IN') || 0}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-500">Leads</p>
                                  <p className="font-semibold text-slate-700">{plan.leads || 0}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Lead Fee</p>
                                  <p className="font-semibold text-slate-700">₹{plan.leadFee || 0}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Validity</p>
                                  <p className="font-semibold text-slate-700">{plan.validityMonths || 1} month{plan.validityMonths > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              {plan.description && (
                                <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Custom Leads Addition */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Leads (Optional)
                </label>
                <input
                  type="number"
                  value={leadPlanLeadsToAdd}
                  onChange={(e) => setLeadPlanLeadsToAdd(e.target.value)}
                  placeholder="Enter number of additional leads to add"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Add extra leads beyond the plan's default allocation
                </p>
              </div>

              {/* Payment Details */}
              {selectedLeadPlanId && (
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h3>
                  
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['cash', 'online', 'upi'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setLeadPlanPaymentMethod(method)
                            setLeadPlanCollectedBy('')
                            setLeadPlanTransactionId('')
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                            leadPlanPaymentMethod === method
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collected By (for cash) */}
                  {leadPlanPaymentMethod === 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Collected By *
                      </label>
                      <input
                        type="text"
                        value={leadPlanCollectedBy}
                        onChange={(e) => setLeadPlanCollectedBy(e.target.value)}
                        placeholder="Enter name of person who collected payment"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        required
                      />
                    </div>
                  )}

                  {/* Transaction ID (for online/upi) */}
                  {(leadPlanPaymentMethod === 'online' || leadPlanPaymentMethod === 'upi') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={leadPlanTransactionId}
                        onChange={(e) => setLeadPlanTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-mono"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeadPlanModal(false)
                    setSelectedLeadPlanId(null)
                    setLeadPlanPaymentMethod('cash')
                    setLeadPlanCollectedBy('')
                    setLeadPlanTransactionId('')
                    setLeadPlanLeadsToAdd('')
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leadPlanSubmitting || (!selectedLeadPlanId && !leadPlanLeadsToAdd) || leadPlans.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {leadPlanSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {leadPlan?.name || partner?.leadPlanLeadQuota > 0 ? 'Update Plan' : 'Assign Plan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hub Selection Modal */}
      {showHubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
              <h2 className="text-xl font-bold text-slate-900">
                  Assign Service Hubs
              </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select hubs to assign to this partner
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHubModal(false)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleHubSubmit} className="space-y-4">
              {allHubs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No hubs available. Create hubs in Hub Management first.</p>
              </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allHubs.map((hub) => {
                    const isSelected = selectedHubIds.includes(hub._id?.toString())
                    const allPinCodes = hub.areas?.reduce((acc, area) => [...acc, ...(area.pinCodes || [])], []) || []
                    const uniquePinCodes = [...new Set(allPinCodes)]
                    
                    return (
                      <div
                        key={hub._id}
                        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50 bg-white'
                        }`}
                        onClick={() => handleHubToggle(hub._id)}
                      >
                        <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                            checked={isSelected}
                            onChange={() => handleHubToggle(hub._id)}
                            className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FiMapPin className="text-primary" />
                              <h4 className="font-semibold text-slate-800">{hub.name}</h4>
              </div>
                            {(hub.city || hub.state) && (
                              <p className="text-xs text-slate-500 ml-6">
                                {[hub.city, hub.state].filter(Boolean).join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 ml-6 mt-1">
                              {hub.areas?.length || 0} area{hub.areas?.length === 1 ? '' : 's'} • {uniquePinCodes.length} pin code{uniquePinCodes.length === 1 ? '' : 's'}
                            </p>
                            {hub.areas && hub.areas.length > 0 && (
                              <div className="mt-2 ml-6 space-y-1">
                                {hub.areas.slice(0, 2).map((area) => (
                                  <div key={area._id} className="text-xs text-slate-600">
                                    • {area.areaName} ({area.pinCodes?.length || 0} pins)
                                  </div>
                                ))}
                                {hub.areas.length > 2 && (
                                  <div className="text-xs text-slate-500">
                                    + {hub.areas.length - 2} more area{hub.areas.length - 2 === 1 ? '' : 's'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  {selectedHubIds.length} hub{selectedHubIds.length === 1 ? '' : 's'} selected
                </p>
                <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowHubModal(false)
                  }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    disabled={hubSubmitting || allHubs.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {hubSubmitting ? 'Updating...' : 'Update Hubs'}
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIDCard && fullPartner && (
        <PartnerIDCard
          profile={{
            id: fullPartner._id,
            name: partnerProfile?.name || fullPartner.profile?.name || 'N/A',
            email: partnerProfile?.email || fullPartner.profile?.email || 'N/A',
            phone: fullPartner.phone || 'N/A',
            city: partnerProfile?.city || fullPartner.profile?.city || 'N/A',
            profilePicture: partnerProfile?.profileImage || fullPartner.profilePicture || null,
            kyc: {
              status: partnerKYC?.status || 'pending'
            }
          }}
          partner={fullPartner}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </div>
  )
}

export default PartnerDetails

