import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import {
  selectCurrentUser,
  selectIsAdmin,
  selectUserType,
  selectHasPermission,
} from '@/store/selectors/authSelectors'
import { useTheme } from '@/contexts/ThemeContext'

const navLinkClass =
  'block px-3 py-2 rounded-md hover:bg-sidebar-accent text-sm text-sidebar-foreground'

function ClientNav() {
  return (
    <>
      <Link to="/home" className={navLinkClass}>
        Home
      </Link>
      <Link to="/accounts" className={navLinkClass}>
        My Accounts
      </Link>
      <Link to="/cards" className={navLinkClass}>
        Cards
      </Link>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Payments
        </p>
        <Link to="/payments/new" className={navLinkClass}>
          New Payment
        </Link>
        <Link to="/payments/transfer" className={navLinkClass}>
          Internal Transfer
        </Link>
        <Link to="/payments/history" className={navLinkClass}>
          Payment History
        </Link>
        <Link to="/payments/recipients" className={navLinkClass}>
          Recipients
        </Link>
      </div>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Transfers
        </p>
        <Link to="/transfers/new" className={navLinkClass}>
          New Transfer
        </Link>
        <Link to="/transfers/history" className={navLinkClass}>
          Transfer History
        </Link>
      </div>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Exchange
        </p>
        <Link to="/exchange/rates" className={navLinkClass}>
          Exchange Rates
        </Link>
        <Link to="/exchange/calculator" className={navLinkClass}>
          Calculator
        </Link>
      </div>
      <Link to="/loans" className={navLinkClass}>
        Loans
      </Link>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Trading
        </p>
        <Link to="/securities" className={navLinkClass}>
          Securities
        </Link>
        <Link to="/orders" className={navLinkClass}>
          My Orders
        </Link>
        <Link to="/portfolio" className={navLinkClass}>
          Portfolio
        </Link>
      </div>
    </>
  )
}

function EmployeeNav({
  isAdmin,
  canManageAgents,
  canApproveOrders,
  canManageTax,
}: {
  isAdmin: boolean
  canManageAgents: boolean
  canApproveOrders: boolean
  canManageTax: boolean
}) {
  return (
    <>
      {isAdmin && (
        <Link to="/employees" className={navLinkClass}>
          Employees
        </Link>
      )}
      <Link to="/admin/accounts" className={navLinkClass}>
        Accounts Management
      </Link>
      <Link to="/admin/clients" className={navLinkClass}>
        Clients
      </Link>
      <Link to="/admin/loans/requests" className={navLinkClass}>
        Loan Requests
      </Link>
      <Link to="/admin/cards/requests" className={navLinkClass}>
        Card Requests
      </Link>
      <Link to="/admin/loans" className={navLinkClass}>
        All Loans
      </Link>
      {canManageAgents && (
        <Link to="/admin/actuaries" className={navLinkClass}>
          Actuaries
        </Link>
      )}
      <Link to="/admin/stock-exchanges" className={navLinkClass}>
        Stock Exchanges
      </Link>
      <Link to="/securities" className={navLinkClass}>
        Securities
      </Link>
      <Link to="/orders" className={navLinkClass}>
        My Orders
      </Link>
      <Link to="/portfolio" className={navLinkClass}>
        Portfolio
      </Link>
      {canApproveOrders && (
        <Link to="/admin/orders" className={navLinkClass}>
          Order Approval
        </Link>
      )}
      {canManageTax && (
        <Link to="/admin/tax" className={navLinkClass}>
          Tax
        </Link>
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
  const canManageAgents = useAppSelector((state) => selectHasPermission(state, 'agents.manage'))
  const canApproveOrders = useAppSelector((state) => selectHasPermission(state, 'orders.approve'))
  const canManageTax = useAppSelector((state) => selectHasPermission(state, 'tax.manage'))

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {isClient ? (
          <ClientNav />
        ) : (
          <EmployeeNav
            isAdmin={isAdmin}
            canManageAgents={canManageAgents}
            canApproveOrders={canApproveOrders}
            canManageTax={canManageTax}
          />
        )}
      </nav>
      <div className="border-t border-sidebar-border pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-sidebar-foreground/70">{user?.email}</p>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
