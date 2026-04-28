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
import { AdminCardRequestsPage } from '@/pages/AdminCardRequestsPage'
import { AdminLoansPage } from '@/pages/AdminLoansPage'
import { CreateClientPage } from '@/pages/CreateClientPage'
import { ActuaryListPage } from '@/pages/ActuaryListPage'
import { StockExchangesPage } from '@/pages/StockExchangesPage'
import { SecuritiesPage } from '@/pages/SecuritiesPage'
import { StockDetailPage } from '@/pages/StockDetailPage'
import { FuturesDetailPage } from '@/pages/FuturesDetailPage'
import { ForexDetailPage } from '@/pages/ForexDetailPage'
import { OptionDetailPage } from '@/pages/OptionDetailPage'
import { CreateOrderPage } from '@/pages/CreateOrderPage'
import { MyOrdersPage } from '@/pages/MyOrdersPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { HoldingTransactionsPage } from '@/pages/HoldingTransactionsPage'
import { AccountActivityPage } from '@/pages/AccountActivityPage'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import { TaxPage } from '@/pages/TaxPage'
import { AdminRolesPage } from '@/pages/AdminRolesPage'
import { AdminEmployeeLimitsPage } from '@/pages/AdminEmployeeLimitsPage'
import { AdminClientLimitsPage } from '@/pages/AdminClientLimitsPage'
import { AdminInterestRatesPage } from '@/pages/AdminInterestRatesPage'
import { AdminFeesPage } from '@/pages/AdminFeesPage'
import { OtcPortalPage } from '@/pages/OtcPortalPage'
import { FundsDiscoveryPage } from '@/pages/FundsDiscoveryPage'
import { FundDetailsPage } from '@/pages/FundDetailsPage'
import { CreateFundPage } from '@/pages/CreateFundPage'
import { ActuaryPerformancePage } from '@/pages/ActuaryPerformancePage'
import { BankFundPositionsPage } from '@/pages/BankFundPositionsPage'

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
            <ProtectedRoute requireAdmin>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute requireAdmin>
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requireAdmin>
              <EditEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/new"
          element={
            <ProtectedRoute requiredRole="Employee">
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
          path="/admin/cards/requests"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminCardRequestsPage />
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
        <Route
          path="/admin/actuaries"
          element={
            <ProtectedRoute requireSupervisorOrAdmin>
              <ActuaryListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stock-exchanges"
          element={
            <ProtectedRoute requiredRole="Employee">
              <StockExchangesPage />
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
        <Route path="/accounts/:id/activity" element={<AccountActivityPage />} />
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

        {/* Shared trading routes (any authenticated user) */}
        <Route path="/securities" element={<SecuritiesPage />} />
        <Route path="/securities/stocks/:id" element={<StockDetailPage />} />
        <Route path="/securities/futures/:id" element={<FuturesDetailPage />} />
        <Route path="/securities/forex/:id" element={<ForexDetailPage />} />
        <Route path="/securities/options/:id" element={<OptionDetailPage />} />
        <Route path="/securities/order/new" element={<CreateOrderPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/otc" element={<OtcPortalPage />} />
        <Route path="/funds" element={<FundsDiscoveryPage />} />
        <Route
          path="/funds/new"
          element={
            <ProtectedRoute requiredPermission="funds.manage">
              <CreateFundPage />
            </ProtectedRoute>
          }
        />
        <Route path="/funds/:id" element={<FundDetailsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/holdings/:id/transactions" element={<HoldingTransactionsPage />} />

        {/* Admin trading routes */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requireSupervisorOrAdmin>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tax"
          element={
            <ProtectedRoute requireAdmin>
              <TaxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profit/actuaries"
          element={
            <ProtectedRoute requiredPermission="actuaries.read.all">
              <ActuaryPerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profit/funds"
          element={
            <ProtectedRoute requiredPermission="funds.bank-position-read">
              <BankFundPositionsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin settings routes */}
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requireAdmin>
              <AdminRolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/limits/employees"
          element={
            <ProtectedRoute requireAdmin>
              <AdminEmployeeLimitsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/limits/clients"
          element={
            <ProtectedRoute requireAdmin>
              <AdminClientLimitsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/interest-rates"
          element={
            <ProtectedRoute requireAdmin>
              <AdminInterestRatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute requireAdmin>
              <AdminFeesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
