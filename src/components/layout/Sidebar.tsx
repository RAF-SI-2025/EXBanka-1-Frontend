import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useTheme } from '@/contexts/ThemeContext'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1">
        <Link
          to="/employees"
          className="block px-3 py-2 rounded-md hover:bg-sidebar-accent text-sm text-sidebar-foreground"
        >
          Employees
        </Link>
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
