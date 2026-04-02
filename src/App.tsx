import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { PasswordResetRequestPage } from '@/pages/PasswordResetRequestPage'
import { PasswordResetPage } from '@/pages/PasswordResetPage'
import { ActivationPage } from '@/pages/ActivationPage'
import { EmployeeListPage } from '@/pages/EmployeeListPage'
import { CreateEmployeePage } from '@/pages/CreateEmployeePage'
import { EditEmployeePage } from '@/pages/EditEmployeePage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/activate" element={<ActivationPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredPermission="employees.read">
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute requiredPermission="employees.create">
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requiredPermission="employees.update">
              <EditEmployeePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
