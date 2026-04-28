import { NavLink } from 'react-router-dom'
import {
  Moon,
  Sun,
  Home,
  Wallet,
  CreditCard,
  Send,
  ArrowRightLeft,
  History,
  Users,
  Coins,
  TrendingUp,
  Calculator,
  HandCoins,
  LineChart,
  Handshake,
  MessageSquare,
  FileSignature,
  PiggyBank,
  PlusSquare,
  ListOrdered,
  Briefcase,
  FileQuestion,
  Files,
  UserCheck,
  Building2,
  CheckSquare,
  Receipt,
  Shield,
  Gauge,
  Percent,
  Banknote,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import {
  selectCurrentUser,
  selectHasPermission,
  selectIsAdmin,
  selectIsSupervisorOrAdmin,
  selectUserType,
} from '@/store/selectors/authSelectors'
import { useTheme } from '@/contexts/ThemeContext'

const navLinkClass =
  'group relative flex items-center gap-2 pl-4 pr-3 py-2 rounded-md text-sm text-sidebar-foreground/85 ' +
  'transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground ' +
  'before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-0.5 before:rounded-full before:bg-accent-2 before:transition-all before:duration-200 ' +
  'hover:before:h-4 aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-foreground aria-[current=page]:before:h-5'

interface NavItemProps {
  to: string
  icon: LucideIcon
  children: React.ReactNode
}

function NavItem({ to, icon: Icon, children }: NavItemProps) {
  return (
    <NavLink to={to} end className={navLinkClass}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{children}</span>
    </NavLink>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  )
}

function ClientNav({ canManageFunds }: { canManageFunds: boolean }) {
  return (
    <>
      <NavItem to="/home" icon={Home}>
        Home
      </NavItem>
      <NavItem to="/accounts" icon={Wallet}>
        My Accounts
      </NavItem>
      <NavItem to="/cards" icon={CreditCard}>
        Cards
      </NavItem>
      <NavGroup label="Payments">
        <NavItem to="/payments/new" icon={Send}>
          New Payment
        </NavItem>
        <NavItem to="/payments/transfer" icon={ArrowRightLeft}>
          Internal Transfer
        </NavItem>
        <NavItem to="/payments/history" icon={History}>
          Payment History
        </NavItem>
        <NavItem to="/payments/recipients" icon={Users}>
          Recipients
        </NavItem>
      </NavGroup>
      <NavGroup label="Transfers">
        <NavItem to="/transfers/new" icon={Send}>
          New Transfer
        </NavItem>
        <NavItem to="/transfers/history" icon={History}>
          Transfer History
        </NavItem>
      </NavGroup>
      <NavGroup label="Exchange">
        <NavItem to="/exchange/rates" icon={TrendingUp}>
          Exchange Rates
        </NavItem>
        <NavItem to="/exchange/calculator" icon={Calculator}>
          Calculator
        </NavItem>
      </NavGroup>
      <NavItem to="/loans" icon={HandCoins}>
        Loans
      </NavItem>
      <NavGroup label="Trading">
        <NavItem to="/securities" icon={LineChart}>
          Securities
        </NavItem>
        <NavItem to="/otc" icon={Handshake}>
          OTC Market
        </NavItem>
        <NavItem to="/otc/offers" icon={MessageSquare}>
          OTC Offers
        </NavItem>
        <NavItem to="/otc/contracts" icon={FileSignature}>
          OTC Contracts
        </NavItem>
        <NavItem to="/funds" icon={PiggyBank}>
          Funds
        </NavItem>
        {canManageFunds && (
          <NavItem to="/funds/new" icon={PlusSquare}>
            Create Fund
          </NavItem>
        )}
        <NavItem to="/orders" icon={ListOrdered}>
          My Orders
        </NavItem>
        <NavItem to="/portfolio" icon={Briefcase}>
          Portfolio
        </NavItem>
      </NavGroup>
    </>
  )
}

function EmployeeNav({
  isAdmin,
  isSupervisorOrAdmin,
  canManageFunds,
  canReadActuaryProfit,
  canReadBankFundPositions,
}: {
  isAdmin: boolean
  isSupervisorOrAdmin: boolean
  canManageFunds: boolean
  canReadActuaryProfit: boolean
  canReadBankFundPositions: boolean
}) {
  return (
    <>
      {isAdmin && (
        <NavItem to="/employees" icon={Users}>
          Employees
        </NavItem>
      )}
      <NavItem to="/admin/accounts" icon={Wallet}>
        Accounts Management
      </NavItem>
      <NavItem to="/admin/clients" icon={Users}>
        Clients
      </NavItem>
      <NavItem to="/admin/loans/requests" icon={FileQuestion}>
        Loan Requests
      </NavItem>
      <NavItem to="/admin/cards/requests" icon={FileQuestion}>
        Card Requests
      </NavItem>
      <NavItem to="/admin/loans" icon={Files}>
        All Loans
      </NavItem>
      {isSupervisorOrAdmin && (
        <NavItem to="/admin/actuaries" icon={UserCheck}>
          Actuaries
        </NavItem>
      )}
      <NavItem to="/admin/stock-exchanges" icon={Building2}>
        Stock Exchanges
      </NavItem>
      <NavGroup label="Trading">
        <NavItem to="/securities" icon={LineChart}>
          Securities
        </NavItem>
        <NavItem to="/otc" icon={Handshake}>
          OTC Market
        </NavItem>
        <NavItem to="/otc/offers" icon={MessageSquare}>
          OTC Offers
        </NavItem>
        <NavItem to="/otc/contracts" icon={FileSignature}>
          OTC Contracts
        </NavItem>
        <NavItem to="/funds" icon={PiggyBank}>
          Funds
        </NavItem>
        {canManageFunds && (
          <NavItem to="/funds/new" icon={PlusSquare}>
            Create Fund
          </NavItem>
        )}
        <NavItem to="/orders" icon={ListOrdered}>
          My Orders
        </NavItem>
        <NavItem to="/portfolio" icon={Briefcase}>
          Portfolio
        </NavItem>
        {isSupervisorOrAdmin && (
          <NavItem to="/admin/orders" icon={CheckSquare}>
            Order Approval
          </NavItem>
        )}
      </NavGroup>
      {isAdmin && (
        <NavItem to="/admin/tax" icon={Receipt}>
          Tax
        </NavItem>
      )}
      {(canReadActuaryProfit || canReadBankFundPositions) && (
        <NavGroup label="Bank Profit">
          {canReadActuaryProfit && (
            <NavItem to="/admin/profit/actuaries" icon={TrendingUp}>
              Actuary Profit
            </NavItem>
          )}
          {canReadBankFundPositions && (
            <NavItem to="/admin/profit/funds" icon={Coins}>
              Fund Positions
            </NavItem>
          )}
        </NavGroup>
      )}
      {isAdmin && (
        <NavGroup label="Settings">
          <NavItem to="/admin/roles" icon={Shield}>
            Roles &amp; Permissions
          </NavItem>
          <NavItem to="/admin/limits/employees" icon={Gauge}>
            Limits
          </NavItem>
          <NavItem to="/admin/interest-rates" icon={Percent}>
            Interest Rates
          </NavItem>
          <NavItem to="/admin/fees" icon={Banknote}>
            Transfer Fees
          </NavItem>
        </NavGroup>
      )}
    </>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const { isDark, toggleTheme } = useTheme()

  const userType = useAppSelector(selectUserType)
  const isClient = userType === 'client'
  const isAdmin = useAppSelector(selectIsAdmin)
  const isSupervisorOrAdmin = useAppSelector(selectIsSupervisorOrAdmin)
  const canManageFunds = useAppSelector((state) => selectHasPermission(state, 'funds.manage'))
  const canReadActuaryProfit = useAppSelector((state) =>
    selectHasPermission(state, 'actuaries.read.all')
  )
  const canReadBankFundPositions = useAppSelector((state) =>
    selectHasPermission(state, 'funds.bank-position-read')
  )

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {isClient ? (
          <ClientNav canManageFunds={canManageFunds} />
        ) : (
          <EmployeeNav
            isAdmin={isAdmin}
            isSupervisorOrAdmin={isSupervisorOrAdmin}
            canManageFunds={canManageFunds}
            canReadActuaryProfit={canReadActuaryProfit}
            canReadBankFundPositions={canReadBankFundPositions}
          />
        )}
      </nav>
      <div className="border-t border-sidebar-border pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-sidebar-foreground/70 truncate">{user?.email}</p>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground shrink-0"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-accent-2 text-white border-accent-2 hover:bg-accent-2/90"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </aside>
  )
}
