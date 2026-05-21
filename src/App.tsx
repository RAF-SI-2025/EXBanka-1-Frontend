import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import {
  ActivationView,
  LoginView,
  PasswordResetRequestView,
  PasswordResetView,
} from '@/views/auth'
import { CreateEmployeeView, EditEmployeeView, EmployeeListView } from '@/views/employees'
import { HomeView } from '@/views/home'
import {
  AccountActivityView,
  AccountDetailsView,
  AccountListView,
  AdminAccountCardsView,
  AdminAccountsView,
  BankAccountActivityView,
  CreateAccountView,
} from '@/views/accounts'
import { AdminCardRequestsView, CardListView, CardRequestView } from '@/views/cards'
import { ExchangeCalculatorView, ExchangeRatesView } from '@/views/exchangeRates'
import { CreateTransferView, TransferHistoryView } from '@/views/transfers'
import { InternalTransferView, NewPaymentView, PaymentHistoryView } from '@/views/payments'
import { PaymentRecipientsView } from '@/views/paymentRecipients'
import { AdminClientsView, CreateClientView, EditClientView } from '@/views/clients'
import {
  AdminLoanRequestsView,
  AdminLoansView,
  LoanApplicationView,
  LoanDetailsView,
  LoanListView,
} from '@/views/loans'
import { ActuaryListView, ActuaryPerformanceView } from '@/views/actuaries'
import { StockExchangesView } from '@/views/stockExchanges'
import {
  ForexDetailView,
  FuturesDetailView,
  OptionDetailView,
  SecuritiesView,
  StockDetailView,
} from '@/views/securities'
import { AdminOrdersView, CreateOrderView, MyOrdersView } from '@/views/orders'
import { HoldingTransactionsView, PortfolioView } from '@/views/portfolio'
import { TaxView } from '@/views/tax'
import { RolesView } from '@/views/roles'
import { EmployeeLimitsView } from '@/views/employeeLimits'
import { ClientLimitsView } from '@/views/clientLimits'
import { InterestRatesView } from '@/views/interestRates'
import { AdminFeesView } from '@/views/adminFees'
import { PeerBanksView } from '@/views/peerBanks'
import { OtcView } from '@/views/otc'
import { OtcPortalView } from '@/views/otcPortal'
import { BankFundPositionsView, CreateFundView, FundDetailsView, FundsView } from '@/views/funds'
import { OtcContractDetailView, OtcContractsView } from '@/views/otcContracts'
import { OtcOptionsView } from '@/views/otcOptions'
import { NotificationTemplatesView } from '@/views/notificationTemplates'
import { SettingsView } from '@/views/settings'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/password-reset-request" element={<PasswordResetRequestView />} />
        <Route path="/password-reset" element={<PasswordResetView />} />
        <Route path="/password-reset/:token" element={<PasswordResetView />} />
        {/* Aliases — backend email template uses /reset-password?token=... */}
        <Route path="/reset-password" element={<PasswordResetView />} />
        <Route path="/reset-password/:token" element={<PasswordResetView />} />
        <Route path="/activate" element={<ActivationView />} />
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
              <EmployeeListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute requireAdmin>
              <CreateEmployeeView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requireAdmin>
              <EditEmployeeView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/new"
          element={
            <ProtectedRoute requiredRole="Employee">
              <CreateAccountView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminAccountsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts/:id/cards"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminAccountCardsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bank-accounts/:id/activity"
          element={
            <ProtectedRoute requiredRole="Employee">
              <BankAccountActivityView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminClientsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute requiredRole="Employee">
              <EditClientView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/new"
          element={
            <ProtectedRoute requiredRole="Employee">
              <CreateClientView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans/requests"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminLoanRequestsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cards/requests"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminCardRequestsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans"
          element={
            <ProtectedRoute requiredRole="Employee">
              <AdminLoansView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/actuaries"
          element={
            <ProtectedRoute requireSupervisorOrAdmin>
              <ActuaryListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stock-exchanges"
          element={
            <ProtectedRoute requiredRole="Employee">
              <StockExchangesView />
            </ProtectedRoute>
          }
        />

        {/* Client routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="Client">
              <HomeView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute requiredRole="Client">
              <AccountListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/:id"
          element={
            <ProtectedRoute requiredRole="Client">
              <AccountDetailsView />
            </ProtectedRoute>
          }
        />
        <Route path="/accounts/:id/activity" element={<AccountActivityView />} />
        <Route
          path="/cards"
          element={
            <ProtectedRoute requiredRole="Client">
              <CardListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards/request"
          element={
            <ProtectedRoute requiredRole="Client">
              <CardRequestView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchange/rates"
          element={
            <ProtectedRoute requiredRole="Client">
              <ExchangeRatesView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exchange/calculator"
          element={
            <ProtectedRoute requiredRole="Client">
              <ExchangeCalculatorView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers/new"
          element={
            <ProtectedRoute requiredRole="Client">
              <CreateTransferView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers/history"
          element={
            <ProtectedRoute requiredRole="Client">
              <TransferHistoryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/new"
          element={
            <ProtectedRoute requiredRole="Client">
              <NewPaymentView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/transfer"
          element={
            <ProtectedRoute requiredRole="Client">
              <InternalTransferView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/history"
          element={
            <ProtectedRoute requiredRole="Client">
              <PaymentHistoryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/recipients"
          element={
            <ProtectedRoute requiredRole="Client">
              <PaymentRecipientsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanListView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/apply"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanApplicationView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/:id"
          element={
            <ProtectedRoute requiredRole="Client">
              <LoanDetailsView />
            </ProtectedRoute>
          }
        />

        {/* Shared trading routes (any authenticated user) */}
        <Route path="/securities" element={<SecuritiesView />} />
        <Route path="/securities/stocks/:id" element={<StockDetailView />} />
        <Route path="/securities/futures/:id" element={<FuturesDetailView />} />
        <Route path="/securities/forex/:id" element={<ForexDetailView />} />
        <Route path="/securities/options/:id" element={<OptionDetailView />} />
        <Route path="/securities/order/new" element={<CreateOrderView />} />
        <Route path="/orders" element={<MyOrdersView />} />
        {/* OTC hub — single sidebar entry, three internal tabs. Legacy
            top-level URLs redirect to /otc/<tab>. */}
        <Route path="/otc" element={<OtcView />}>
          <Route index element={<Navigate to="market" replace />} />
          <Route path="market" element={<OtcPortalView />} />
          <Route path="options" element={<OtcOptionsView />} />
          <Route path="contracts" element={<OtcContractsView />} />
          <Route path="contracts/:id" element={<OtcContractDetailView />} />
        </Route>
        <Route path="/funds" element={<FundsView />} />
        <Route
          path="/funds/new"
          element={
            <ProtectedRoute requiredPermission="funds.manage">
              <CreateFundView />
            </ProtectedRoute>
          }
        />
        <Route path="/funds/:id" element={<FundDetailsView />} />
        <Route path="/portfolio" element={<PortfolioView />} />
        <Route path="/portfolio/holdings/:id/transactions" element={<HoldingTransactionsView />} />

        {/* Admin trading routes */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requireSupervisorOrAdmin>
              <AdminOrdersView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tax"
          element={
            <ProtectedRoute requireAdmin>
              <TaxView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profit/actuaries"
          element={
            <ProtectedRoute requiredPermission="actuaries.read.all">
              <ActuaryPerformanceView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profit/funds"
          element={
            <ProtectedRoute requiredPermission="funds.bank-position-read">
              <BankFundPositionsView />
            </ProtectedRoute>
          }
        />

        {/* Admin settings — consolidated under one /admin/settings hub */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin>
              <SettingsView />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="notifications" replace />} />
          <Route
            path="notifications"
            element={
              <ProtectedRoute requiredPermission="notifications.templates.manage">
                <NotificationTemplatesView />
              </ProtectedRoute>
            }
          />
          <Route path="fees" element={<AdminFeesView />} />
          <Route path="peer-banks" element={<PeerBanksView />} />
          <Route path="roles" element={<RolesView />} />
          <Route path="interest-rates" element={<InterestRatesView />} />
          <Route path="employee-limits" element={<EmployeeLimitsView />} />
          <Route path="client-limits" element={<ClientLimitsView />} />
        </Route>

        {/* Legacy settings routes — redirect to the consolidated hub so
            existing links and bookmarks keep working. */}
        <Route path="/admin/roles" element={<Navigate to="/admin/settings/roles" replace />} />
        <Route
          path="/admin/limits/employees"
          element={<Navigate to="/admin/settings/employee-limits" replace />}
        />
        <Route
          path="/admin/limits/clients"
          element={<Navigate to="/admin/settings/client-limits" replace />}
        />
        <Route
          path="/admin/interest-rates"
          element={<Navigate to="/admin/settings/interest-rates" replace />}
        />
        <Route path="/admin/fees" element={<Navigate to="/admin/settings/fees" replace />} />
        <Route
          path="/admin/peer-banks"
          element={<Navigate to="/admin/settings/peer-banks" replace />}
        />
        <Route
          path="/admin/notification-templates"
          element={<Navigate to="/admin/settings/notifications" replace />}
        />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
