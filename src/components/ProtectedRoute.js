import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const userRole = localStorage.getItem('userRole');
  const isLead = userRole === 'lead';
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Free routes for leads - explicitly list all allowed paths
  const allowedPaths = ['/dashboard', '/settings', '/services', '/generate-forms', '/discover', '/dataroom', '/subscription-required'];
  
  // Check exact path match first
  const exactMatch = allowedPaths.includes(currentPath);
  
  // Then check for path prefixes
  const prefixMatch = allowedPaths.some(path => 
    currentPath.startsWith(`${path}/`)
  );
  
  // If user is lead and trying to access restricted path, redirect to subscription page
  if (isLead && !exactMatch && !prefixMatch) {
    return <Navigate to="/subscription-required" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
