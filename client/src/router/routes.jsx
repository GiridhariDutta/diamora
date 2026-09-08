import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import HomePage from '../pages/HomePage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminCollectionsPage from '../pages/admin/AdminCollectionsPage';
import AdminColorsPage from '../pages/admin/AdminColorsPage';
import AdminPurityPage from '../pages/admin/AdminPurityPage';
import AdminDiamondQualityPage from '../pages/admin/AdminDiamondQualityPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminDynamicPageEditor from '../pages/admin/AdminDynamicPageEditor';

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
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'collections', element: <AdminCollectionsPage /> },
      { path: 'colors', element: <AdminColorsPage /> },
      { path: 'purities', element: <AdminPurityPage /> },
      { path: 'diamond-qualities', element: <AdminDiamondQualityPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'settings', element: <Navigate to="/admin/settings/about-us" replace /> },
      { path: 'settings/about-us', element: <AdminDynamicPageEditor pageKey="about_us" defaultTitle="About Us" /> },
      { path: 'settings/privacy-policy', element: <AdminDynamicPageEditor pageKey="privacy_policy" defaultTitle="Privacy Policy" /> },
      { path: 'settings/terms-conditions', element: <AdminDynamicPageEditor pageKey="terms_conditions" defaultTitle="Terms & Conditions" /> },
      { path: 'pages/about-us', element: <Navigate to="/admin/settings/about-us" replace /> },
      { path: 'pages/*', element: <Navigate to="/admin/settings/about-us" replace /> },
      { path: '*', element: <Navigate to="/admin" replace /> }
    ]
  }
]);
