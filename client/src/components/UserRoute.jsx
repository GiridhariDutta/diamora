import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';

export default function UserRoute({ children }) {
  const storedUser = localStorage.getItem('user');
  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error('Failed to parse user session:', err);
    }
  }

  const { onOpenAuthModal } = useOutletContext() || {};

  if (!user) {
    if (onOpenAuthModal) {
      setTimeout(() => onOpenAuthModal(), 150);
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
