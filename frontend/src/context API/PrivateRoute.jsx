
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, requiredRole }) => {
  const token = sessionStorage.getItem('auth-token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null; // Decode JWT and get the role

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/account" replace />;
  }

  if (userRole !== 'Admin' && userRole !== 'Owner') {
    // If role doesn't match, redirect to unauthorized or some other page
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is good, render the component
  return <Element />;
};

export default PrivateRoute;
