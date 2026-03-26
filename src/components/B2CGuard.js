import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const B2CGuard = () => {
  const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType');
  
  if (String(userType).toUpperCase() === 'B2B') {
    return <Navigate to="/b2b-dashboard" replace />;
  }
  
  return <Outlet />;
};

export default B2CGuard;