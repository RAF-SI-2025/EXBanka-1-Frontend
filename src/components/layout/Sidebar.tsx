import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

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
        <p className="text-sm text-sidebar-foreground/70 mb-2">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </aside>
  )
}
