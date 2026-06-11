import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { viewEnter } from '@/views/shared'
import { cn } from '@/lib/utils'

// All OTC sub-routes live under /otc/<tab>. The hub provides a single
// sidebar entry, a top tab strip, and an animated outlet that renders the
// selected child view (options marketplace, contracts).

interface TabDef {
  value: string
  label: string
}

// The options marketplace is the default surface; its tab is labelled
// "Market". The legacy stock-offers portal (formerly the "Market" tab) has
// been removed — `/otc/market` now redirects to `/otc/options`.
const TABS: readonly TabDef[] = [
  { value: 'options', label: 'Market' },
  { value: 'contracts', label: 'Contracts' },
]

const DEFAULT_TAB = TABS[0].value

function extractTab(pathname: string): string {
  const match = pathname.match(/\/otc\/([^/]+)/)
  return match?.[1] ?? DEFAULT_TAB
}

export function OtcView() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = useMemo(() => extractTab(location.pathname), [location.pathname])

  return (
    <section data-testid="otc-view" className={cn('px-6 pt-6 pb-0 space-y-4', viewEnter)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">OTC Trading</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Over-the-counter marketplace — place option bids and exercise active contracts. Both
          surfaces share the same liquidity pool.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => navigate(`/otc/${v}`)}>
        <TabsList>
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
