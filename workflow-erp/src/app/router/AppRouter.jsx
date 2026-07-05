import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore';

// Layout
import MainLayout from '../layout/MainLayout';

// Pages
import LoginPage from '../../modules/users/LoginPage';
import DashboardPage from '../../modules/dashboard/DashboardPage';
import WorkflowListPage from '../../modules/workflow/WorkflowListPage';
import WorkflowDetailPage from '../../modules/workflow/WorkflowDetailPage';
import ApprovalListPage from '../../modules/approvals/ApprovalListPage';
import ApprovalDetailPage from '../../modules/approvals/ApprovalDetailPage';
import DocumentListPage from '../../modules/documents/DocumentListPage';
import ProjectListPage from '../../modules/projects/ProjectListPage';
import ProjectDetailPage from '../../modules/projects/ProjectDetailPage';
import UsersPage from '../../modules/users/UsersPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PermissionRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="workflows" element={<WorkflowListPage />} />
          <Route path="workflows/:id" element={<WorkflowDetailPage />} />
          <Route path="approvals" element={<PermissionRoute permission="approve"><ApprovalListPage /></PermissionRoute>} />
          <Route path="approvals/:id" element={<PermissionRoute permission="approve"><ApprovalDetailPage /></PermissionRoute>} />
          <Route path="documents" element={<DocumentListPage />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="users" element={<PermissionRoute permission="manage_users"><UsersPage /></PermissionRoute>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
