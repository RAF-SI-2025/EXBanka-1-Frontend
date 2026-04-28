import { NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsSupervisorOrAdmin,
  selectUserType,
} from '@/store/selectors/authSelectors'
import { useTheme } from '@/contexts/ThemeContext'

const navLinkClass =
  'group relative block pl-4 pr-3 py-2 rounded-md text-sm text-sidebar-foreground/85 ' +
  'transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground ' +
  'before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-0.5 before:rounded-full before:bg-accent-2 before:transition-all before:duration-200 ' +
  'hover:before:h-4 aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-foreground aria-[current=page]:before:h-5'

function ClientNav() {
  return (
    <>
      <NavLink to="/home" className={navLinkClass}>
        Home
      </NavLink>
      <NavLink to="/accounts" className={navLinkClass}>
        My Accounts
      </NavLink>
      <NavLink to="/cards" className={navLinkClass}>
        Cards
      </NavLink>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Payments
        </p>
        <NavLink to="/payments/new" className={navLinkClass}>
          New Payment
        </NavLink>
        <NavLink to="/payments/transfer" className={navLinkClass}>
          Internal Transfer
        </NavLink>
        <NavLink to="/payments/history" className={navLinkClass}>
          Payment History
        </NavLink>
        <NavLink to="/payments/recipients" className={navLinkClass}>
          Recipients
        </NavLink>
      </div>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Transfers
        </p>
        <NavLink to="/transfers/new" className={navLinkClass}>
          New Transfer
        </NavLink>
        <NavLink to="/transfers/history" className={navLinkClass}>
          Transfer History
        </NavLink>
      </div>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Exchange
        </p>
        <NavLink to="/exchange/rates" className={navLinkClass}>
          Exchange Rates
        </NavLink>
        <NavLink to="/exchange/calculator" className={navLinkClass}>
          Calculator
        </NavLink>
      </div>
      <NavLink to="/loans" className={navLinkClass}>
        Loans
      </NavLink>
      <div className="mt-2">
        <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
          Trading
        </p>
        <NavLink to="/securities" className={navLinkClass}>
          Securities
        </NavLink>
        <NavLink to="/otc" className={navLinkClass}>
          OTC Market
        </NavLink>
        <NavLink to="/orders" className={navLinkClass}>
          My Orders
        </NavLink>
        <NavLink to="/portfolio" className={navLinkClass}>
          Portfolio
        </NavLink>
      </div>
    </>
  )
}

function EmployeeNav({
  isAdmin,
  isSupervisorOrAdmin,
}: {
  isAdmin: boolean
  isSupervisorOrAdmin: boolean
}) {
  return (
    <>
      {isAdmin && (
        <NavLink to="/employees" className={navLinkClass}>
          Employees
        </NavLink>
      )}
      <NavLink to="/admin/accounts" className={navLinkClass}>
        Accounts Management
      </NavLink>
      <NavLink to="/admin/clients" className={navLinkClass}>
        Clients
      </NavLink>
      <NavLink to="/admin/loans/requests" className={navLinkClass}>
        Loan Requests
      </NavLink>
      <NavLink to="/admin/cards/requests" className={navLinkClass}>
        Card Requests
      </NavLink>
      <NavLink to="/admin/loans" className={navLinkClass}>
        All Loans
      </NavLink>
      {isSupervisorOrAdmin && (
        <NavLink to="/admin/actuaries" className={navLinkClass}>
          Actuaries
        </NavLink>
      )}
      <NavLink to="/admin/stock-exchanges" className={navLinkClass}>
        Stock Exchanges
      </NavLink>
      <NavLink to="/securities" className={navLinkClass}>
        Securities
      </NavLink>
      <NavLink to="/otc" className={navLinkClass}>
        OTC Market
      </NavLink>
      <NavLink to="/orders" className={navLinkClass}>
        My Orders
      </NavLink>
      <NavLink to="/portfolio" className={navLinkClass}>
        Portfolio
      </NavLink>
      {isSupervisorOrAdmin && (
        <NavLink to="/admin/orders" className={navLinkClass}>
          Order Approval
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin/tax" className={navLinkClass}>
          Tax
        </NavLink>
      )}
      {isAdmin && (
        <div className="mt-2">
          <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
            Settings
          </p>
          <NavLink to="/admin/roles" className={navLinkClass}>
            Roles & Permissions
          </NavLink>
          <NavLink to="/admin/limits/employees" className={navLinkClass}>
            Limits
          </NavLink>
          <NavLink to="/admin/interest-rates" className={navLinkClass}>
            Interest Rates
          </NavLink>
          <NavLink to="/admin/fees" className={navLinkClass}>
            Transfer Fees
          </NavLink>
        </div>
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
          <EmployeeNav isAdmin={isAdmin} isSupervisorOrAdmin={isSupervisorOrAdmin} />
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
