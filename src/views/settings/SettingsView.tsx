import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { viewEnter } from '@/views/shared'
import { cn } from '@/lib/utils'

// All admin settings sub-routes live under /admin/settings/<tab>. The hub
// provides a single sidebar entry, a top tab strip, and an animated outlet
// that renders the selected child view. Each child renders its own header +
// padding (via its own ViewShell), so this wrapper deliberately omits the
// bottom padding to keep the visual rhythm tight.

interface TabDef {
  value: string
  label: string
}

const TABS: readonly TabDef[] = [
  { value: 'notifications', label: 'Notifications' },
  { value: 'fees', label: 'Transfer Fees' },
  { value: 'peer-banks', label: 'Peer Banks' },
  { value: 'roles', label: 'Roles & Permissions' },
  { value: 'interest-rates', label: 'Interest Rates' },
  { value: 'employee-limits', label: 'Employee Limits' },
  { value: 'client-limits', label: 'Client Limits' },
]

const DEFAULT_TAB = TABS[0].value

function extractTab(pathname: string): string {
  const match = pathname.match(/\/admin\/settings\/([^/]+)/)
  return match?.[1] ?? DEFAULT_TAB
}

export function SettingsView() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = useMemo(() => extractTab(location.pathname), [location.pathname])

  return (
    <section data-testid="settings-view" className={cn('px-6 pt-6 pb-0 space-y-4', viewEnter)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bank-wide configuration — notification copy, fees, peer banks, roles, interest rate tiers,
          and operating limits.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => navigate(`/admin/settings/${v}`)}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className={cn('-mx-6', viewEnter)} key={currentTab}>
        <Outlet />
      </div>
    </section>
  )
}
