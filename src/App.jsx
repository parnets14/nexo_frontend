import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ComingSoonProvider } from './contexts/ComingSoonContext'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ServiceDetail from './pages/ServiceDetail'
import ServiceCheckout from './pages/ServiceCheckout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PartnerOnboarding from './pages/PartnerOnboarding'
import LeadMarketplace from './pages/LeadMarketplace'
import MaterialStore from './pages/MaterialStore'
import EmergencyServices from './pages/EmergencyServices'
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
import ManualPartnerRegistration from './pages/admin/ManualPartnerRegistration.jsx'
import VendorManagement from './pages/admin/VendorManagement.jsx'
import VendorDetails from './pages/admin/VendorDetails.jsx'
import CustomerManagement from './pages/admin/CustomerManagement.jsx'
import CustomerBookings from './pages/admin/CustomerBookings.jsx'
import SpareParts from './pages/admin/SpareParts.jsx'
import AMCManagement from './pages/admin/AMCManagement.jsx'
import CityManagement from './pages/admin/CityManagement.jsx'
import LeadManagement from './pages/admin/LeadManagement.jsx'
import Reports from './pages/admin/Reports.jsx'
import Notifications from './pages/admin/Notifications.jsx'
import AdminNotifications from './pages/admin/AdminNotifications.jsx'
import RefundManagement from './pages/admin/RefundManagement.jsx'
import MGPlanManagement from './pages/admin/MGPlanManagement.jsx'
import LeadPlanManagement from './pages/admin/LeadPlanManagement.jsx'
import FeeManagement from './pages/admin/FeeManagement.jsx'
import TaxManagement from './pages/admin/TaxManagement.jsx'
import FeeTransactions from './pages/admin/FeeTransactions.jsx'
import CategoryManagement from './pages/admin/CategoryManagement.jsx'
import HubManagement from './pages/admin/HubManagement.jsx'
import PopularServicesManagement from './pages/admin/PopularServicesManagement.jsx'
import SubscriptionPlanManagement from './pages/admin/SubscriptionPlanManagement.jsx'
import FeaturedReviewsManagement from './pages/admin/FeaturedReviewsManagement.jsx'
import AMCPlanManagement from './pages/admin/AMCPlanManagement.jsx'
import SupportManagement from './pages/admin/SupportManagement.jsx'
import WhatsAppSettings from './pages/admin/WhatsAppSettings.jsx'
import PartnerLogin from './pages/PartnerLogin.jsx'
import PartnerDashboard from './pages/partner/PartnerDashboard.jsx'
import PartnerLayout from './layouts/partner/PartnerLayout.jsx'
import RequirePartnerAuth from './layouts/partner/RequirePartnerAuth.jsx'
import VendorLogin from './pages/VendorLogin.jsx'
import VendorDashboard from './pages/vendor/VendorDashboard.jsx'
import VendorLayout from './layouts/vendor/VendorLayout.jsx'
import RequireVendorAuth from './layouts/vendor/RequireVendorAuth.jsx'
import VerifyPartner from './pages/VerifyPartner.jsx'
import NotFound from './pages/NotFound.jsx'
import NotificationPermissionPrompt from './components/NotificationPermissionPrompt.jsx'
import UserDashboard from './pages/user/UserDashboard.jsx'
import UserLayout from './layouts/user/UserLayout.jsx'
import RequireUserAuth from './layouts/user/RequireUserAuth.jsx'
import UserLogin from './pages/UserLogin.jsx'
import UserRegister from './pages/UserRegister.jsx'
import PaymentResult from './pages/PaymentResult.jsx'
import TestPayment from './pages/TestPayment.jsx'
import TestPartnerWalletPayment from './pages/TestPartnerWalletPayment.jsx'
import InvoicePage from './pages/InvoicePage.jsx'
import InvoiceViewer from './components/InvoiceViewer.jsx'
import AdminInvoiceViewer from './components/AdminInvoiceViewer.jsx'

function App() {
  return (
    <ComingSoonProvider>
      <Router>
      <ScrollToTop />
      <NotificationPermissionPrompt />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/service/:serviceName" element={<ServiceDetail />} />
          <Route path="/service/:serviceName/checkout" element={<ServiceCheckout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment-success" element={<PaymentResult />} />
          <Route path="/payment-failure" element={<PaymentResult />} />
          <Route path="/payment" element={<PaymentResult />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/test-payment" element={<TestPayment />} />
          <Route path="/test-partner-wallet-payment" element={<TestPartnerWalletPayment />} />
          <Route path="/invoice" element={<InvoiceViewer />} />
          <Route path="/invoice/sample" element={<InvoicePage />} />
          <Route path="/partner" element={<PartnerOnboarding />} />
          <Route path="/leads" element={<LeadMarketplace />} />
          {/* <Route path="/materials" element={<MaterialStore />} /> */}
          <Route path="/emergency" element={<EmergencyServices />} />
          <Route path="/amc" element={<CorporateAMC />} />
          <Route path="/brand-partnerships" element={<BrandPartnerships />} />
          {/* <Route path="/admin-dashboard" element={<AdminMarketingPage />} /> */}
          <Route path="/partner/onboard" element={<PartnerOnboardingForm />} />
          <Route path="/partner-onboarding" element={<PartnerOnboardingForm />} />
          <Route path="/partner-terms" element={<PartnerTerms />} />
          <Route path="/terms" element={<CustomerTerms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<CustomerRefundPolicy />} />
          <Route path="/partner-refund-policy" element={<PartnerRefundPolicy />} />
          <Route path="/verify/partner/:partnerId" element={<VerifyPartner />} />
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />

        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminOverview />} />
                  <Route path="/admin/partners" element={<PartnerControl />} />
                  <Route path="/admin/partners/manual-register" element={<ManualPartnerRegistration />} />
                  <Route path="/admin/partners/:partnerId" element={<PartnerDetails />} />
            <Route path="/admin/vendors" element={<VendorManagement />} />
            <Route path="/admin/vendors/:vendorId" element={<VendorDetails />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/customer-bookings" element={<CustomerBookings />} />
            <Route path="/admin/spares" element={<SpareParts />} />
            <Route path="/admin/amc" element={<AMCManagement />} />
            <Route path="/admin/cities" element={<CityManagement />} />
            <Route path="/admin/leads" element={<LeadManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/notification-templates" element={<Notifications />} />
            <Route path="/admin/refunds" element={<RefundManagement />} />
            <Route path="/admin/mg-plans" element={<MGPlanManagement />} />
            <Route path="/admin/lead-plans" element={<LeadPlanManagement />} />
            <Route path="/admin/fees" element={<FeeManagement />} />
            <Route path="/admin/tax-management" element={<TaxManagement />} />
            <Route path="/admin/fee-transactions" element={<FeeTransactions />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/hubs" element={<HubManagement />} />
            <Route path="/admin/popular-services" element={<PopularServicesManagement />} />

            <Route path="/admin/amc-plans" element={<AMCPlanManagement />} />
            <Route path="/admin/featured-reviews" element={<FeaturedReviewsManagement />} />
            <Route path="/admin/support" element={<SupportManagement />} />
            <Route path="/admin/whatsapp-settings" element={<WhatsAppSettings />} />
            <Route path="/admin/invoice" element={<AdminInvoiceViewer />} />
          </Route>
        </Route>

        <Route element={<RequirePartnerAuth />}>
          <Route element={<PartnerLayout />}>
            <Route path="/partner/dashboard/*" element={<PartnerDashboard />} />
          </Route>
        </Route>

        <Route element={<RequireVendorAuth />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor/dashboard/*" element={<VendorDashboard />} />
          </Route>
        </Route>

        <Route element={<RequireUserAuth />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard/*" element={<UserDashboard />} />
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

