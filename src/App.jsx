import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ComingSoonProvider } from './contexts/ComingSoonContext'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ServiceDetail from './pages/ServiceDetail'
import PartnerOnboarding from './pages/PartnerOnboarding'
import LeadMarketplace from './pages/LeadMarketplace'
import MaterialStore from './pages/MaterialStore'
import EmergencyBooking from './pages/EmergencyBooking'
import CorporateAMC from './pages/CorporateAMC'
import BrandPartnerships from './pages/BrandPartnerships'
import AdminMarketingPage from './pages/AdminDashboard'
import PartnerOnboardingForm from './pages/PartnerOnboardingForm.jsx'
import PartnerTerms from './pages/PartnerTerms.jsx'
import CustomerTerms from './pages/CustomerTerms.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import CustomerRefundPolicy from './pages/CustomerRefundPolicy.jsx'
import PartnerRefundPolicy from './pages/PartnerRefundPolicy.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './layouts/admin/AdminLayout.jsx'
import RequireAdminAuth from './layouts/admin/RequireAdminAuth.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import PartnerControl from './pages/admin/PartnerControl.jsx'
import PartnerDetails from './pages/admin/PartnerDetails.jsx'
import CustomerBookings from './pages/admin/CustomerBookings.jsx'
import SpareParts from './pages/admin/SpareParts.jsx'
import AMCManagement from './pages/admin/AMCManagement.jsx'
import LeadManagement from './pages/admin/LeadManagement.jsx'
import Reports from './pages/admin/Reports.jsx'
import Notifications from './pages/admin/Notifications.jsx'
import RefundManagement from './pages/admin/RefundManagement.jsx'
import MGPlanManagement from './pages/admin/MGPlanManagement.jsx'
import FeeManagement from './pages/admin/FeeManagement.jsx'
import FeeTransactions from './pages/admin/FeeTransactions.jsx'
import CategoryManagement from './pages/admin/CategoryManagement.jsx'
import HubManagement from './pages/admin/HubManagement.jsx'
import PopularServicesManagement from './pages/admin/PopularServicesManagement.jsx'
import SubscriptionPlanManagement from './pages/admin/SubscriptionPlanManagement.jsx'
import FeaturedReviewsManagement from './pages/admin/FeaturedReviewsManagement.jsx'
import PartnerLogin from './pages/PartnerLogin.jsx'
import PartnerDashboard from './pages/partner/PartnerDashboard.jsx'
import PartnerLayout from './layouts/partner/PartnerLayout.jsx'
import RequirePartnerAuth from './layouts/partner/RequirePartnerAuth.jsx'
import VerifyPartner from './pages/VerifyPartner.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <ComingSoonProvider>
      <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/service/:serviceName" element={<ServiceDetail />} />
          <Route path="/partner" element={<PartnerOnboarding />} />
          <Route path="/leads" element={<LeadMarketplace />} />
          <Route path="/materials" element={<MaterialStore />} />
          <Route path="/emergency" element={<EmergencyBooking />} />
          <Route path="/amc" element={<CorporateAMC />} />
          <Route path="/brand-partnerships" element={<BrandPartnerships />} />
          {/* <Route path="/admin-dashboard" element={<AdminMarketingPage />} /> */}
          <Route path="/partner/onboard" element={<PartnerOnboardingForm />} />
          <Route path="/partner-terms" element={<PartnerTerms />} />
          <Route path="/terms" element={<CustomerTerms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<CustomerRefundPolicy />} />
          <Route path="/partner-refund-policy" element={<PartnerRefundPolicy />} />
          <Route path="/verify/partner/:partnerId" element={<VerifyPartner />} />
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />

        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminOverview />} />
                  <Route path="/admin/partners" element={<PartnerControl />} />
                  <Route path="/admin/partners/:partnerId" element={<PartnerDetails />} />
            <Route path="/admin/bookings" element={<CustomerBookings />} />
            <Route path="/admin/spares" element={<SpareParts />} />
            <Route path="/admin/amc" element={<AMCManagement />} />
            <Route path="/admin/leads" element={<LeadManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/refunds" element={<RefundManagement />} />
            <Route path="/admin/mg-plans" element={<MGPlanManagement />} />
            <Route path="/admin/fees" element={<FeeManagement />} />
            <Route path="/admin/fee-transactions" element={<FeeTransactions />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/hubs" element={<HubManagement />} />
            <Route path="/admin/popular-services" element={<PopularServicesManagement />} />
            <Route path="/admin/subscription-plans" element={<SubscriptionPlanManagement />} />
            <Route path="/admin/featured-reviews" element={<FeaturedReviewsManagement />} />
          </Route>
        </Route>

        <Route element={<RequirePartnerAuth />}>
          <Route element={<PartnerLayout />}>
            <Route path="/partner/dashboard/*" element={<PartnerDashboard />} />
          </Route>
        </Route>

        {/* 404 Page - Catch all unmatched routes (without header/footer) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ComingSoonProvider>
  )
}

export default App

