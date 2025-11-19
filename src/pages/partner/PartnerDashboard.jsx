import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import WalletTab from './tabs/WalletTab'
import TeamMembersTab from './tabs/TeamMembersTab'
import JobsManagementTab from './tabs/JobsManagementTab'
import SubscriptionPlanTab from './tabs/SubscriptionPlanTab'
import SparePartsTab from './tabs/SparePartsTab'
import TransactionsTab from './tabs/TransactionsTab'
import DashboardOverview from './tabs/DashboardOverview'
import ProfileTab from './tabs/ProfileTab'

const PartnerDashboard = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<ProfileTab />} />
        <Route path="wallet" element={<WalletTab />} />
        <Route path="team" element={<TeamMembersTab />} />
        <Route path="jobs" element={<JobsManagementTab />} />
        <Route path="subscription" element={<SubscriptionPlanTab />} />
        <Route path="spare-parts" element={<SparePartsTab />} />
        <Route path="transactions" element={<TransactionsTab />} />
        <Route path="*" element={<Navigate to="/partner/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default PartnerDashboard

