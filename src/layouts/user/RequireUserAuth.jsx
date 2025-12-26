import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RequireUserAuth = () => {
  const token = localStorage.getItem('userToken');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireUserAuth;
