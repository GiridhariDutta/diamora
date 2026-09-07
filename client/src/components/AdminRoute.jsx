import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const storedUser = localStorage.getItem('user');
  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error('Failed to parse user session:', err);
    }
  }

  // If user is not authenticated or not an admin, redirect to storefront
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
