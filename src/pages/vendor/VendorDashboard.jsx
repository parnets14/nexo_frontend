import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardOverview from './tabs/DashboardOverview'
import SparePartsTab from './tabs/SparePartsTab'
import AddSparePartTab from './tabs/AddSparePartTab'
import BookingsTab from './tabs/BookingsTab'
import TransactionsTab from './tabs/TransactionsTab'

const VendorDashboard = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="spare-parts" element={<SparePartsTab />} />
        <Route path="add-spare-part" element={<AddSparePartTab />} />
        <Route path="bookings" element={<BookingsTab />} />
        <Route path="transactions" element={<TransactionsTab />} />
        <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default VendorDashboard

