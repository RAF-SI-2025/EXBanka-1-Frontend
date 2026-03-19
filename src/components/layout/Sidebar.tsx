import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser, selectIsAdmin } from '@/store/selectors/authSelectors'
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
    </>
  )
}

function EmployeeNav({ isAdmin }: { isAdmin: boolean }) {
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
        Zahtevi za kredite
      </Link>
      <Link to="/admin/loans" className={navLinkClass}>
        Svi krediti
      </Link>
    </>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const { isDark, toggleTheme } = useTheme()

  const isClient = user?.role === 'Client'
  const isAdmin = useAppSelector(selectIsAdmin)

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {isClient ? <ClientNav /> : <EmployeeNav isAdmin={isAdmin} />}
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
