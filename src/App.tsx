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
import { HomePage } from '@/pages/HomePage'
import { AccountListPage } from '@/pages/AccountListPage'
import { AccountDetailsPage } from '@/pages/AccountDetailsPage'
import { CreateAccountPage } from '@/pages/CreateAccountPage'
import { CardListPage } from '@/pages/CardListPage'
import { CardRequestPage } from '@/pages/CardRequestPage'
import { ExchangeRatesPage } from '@/pages/ExchangeRatesPage'
import { ExchangeCalculatorPage } from '@/pages/ExchangeCalculatorPage'
import { CreateTransferPage } from '@/pages/CreateTransferPage'
import { TransferHistoryPage } from '@/pages/TransferHistoryPage'
import { NewPaymentPage } from '@/pages/NewPaymentPage'
import { InternalTransferPage } from '@/pages/InternalTransferPage'
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage'
import { PaymentRecipientsPage } from '@/pages/PaymentRecipientsPage'
import { LoanListPage } from '@/pages/LoanListPage'
import { LoanDetailsPage } from '@/pages/LoanDetailsPage'
import { LoanApplicationPage } from '@/pages/LoanApplicationPage'
import { AdminAccountsPage } from '@/pages/AdminAccountsPage'
import { AdminAccountCardsPage } from '@/pages/AdminAccountCardsPage'
import { AdminClientsPage } from '@/pages/AdminClientsPage'
import { EditClientPage } from '@/pages/EditClientPage'
import { AdminLoanRequestsPage } from '@/pages/AdminLoanRequestsPage'
import { AdminLoansPage } from '@/pages/AdminLoansPage'
import { CreateClientPage } from '@/pages/CreateClientPage'
import { SecuritiesPage } from '@/pages/SecuritiesPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'

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
        {/* Employee routes */}
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
        <Route
          path="/accounts/new"
          element={
            <ProtectedRoute requiredPermission="accounts.create">
              <CreateAccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts/:id/cards"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminAccountCardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute requiredRole="Employee">
              <EditClientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/new"
          element={
            <ProtectedRoute requiredRole="Employee">
              <CreateClientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans/requests"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminLoanRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminLoansPage />
            </ProtectedRoute>
          }
        />

        {/* Client routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="Client">
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute requiredRole="Client">
              <AccountListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/:id"
          element={
            <ProtectedRoute requiredRole="Client">
              <AccountDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute requiredRole="Client">
              <CardListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards/request"
          element={
            <ProtectedRoute requiredRole="Client">
              <CardRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchange/rates"
          element={
            <ProtectedRoute requiredRole="Client">
              <ExchangeRatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchange/calculator"
          element={
            <ProtectedRoute requiredRole="Client">
              <ExchangeCalculatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers/new"
          element={
            <ProtectedRoute requiredRole="Client">
              <CreateTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers/history"
          element={
            <ProtectedRoute requiredRole="Client">
              <TransferHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/new"
          element={
            <ProtectedRoute requiredRole="Client">
              <NewPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/transfer"
          element={
            <ProtectedRoute requiredRole="Client">
              <InternalTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/history"
          element={
            <ProtectedRoute requiredRole="Client">
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/recipients"
          element={
            <ProtectedRoute requiredRole="Client">
              <PaymentRecipientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/apply"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/:id"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Securities & Portfolio (all authenticated users) */}
        <Route path="/securities" element={<SecuritiesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />

        {/* Admin Orders */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requiredPermission="orders.approve">
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
