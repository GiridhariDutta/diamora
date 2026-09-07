import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import HomePage from '../pages/HomePage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: '*', element: <Navigate to="/admin" replace /> }
    ]
  }
]);
