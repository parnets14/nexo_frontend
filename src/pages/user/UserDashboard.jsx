import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserOverview from './UserOverview';
import MyBookings from './MyBookings';
import BookingDetails from './BookingDetails';
import MyProfile from './MyProfile';
import MyAddresses from './MyAddresses';
import MyWallet from './MyWallet';
import MyReviews from './MyReviews';
import Notifications from './Notifications';
import Support from './Support';
import MySubscriptions from './MySubscriptions';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <Routes>
        <Route index element={<UserOverview />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="bookings/:bookingId" element={<BookingDetails />} />
        <Route path="subscriptions" element={<MySubscriptions />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="addresses" element={<MyAddresses />} />
        <Route path="wallet" element={<MyWallet />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default UserDashboard;
