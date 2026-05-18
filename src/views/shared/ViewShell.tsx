import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { viewEnter } from './animations'

interface ViewShellProps {
  // Page title (h1). Optional so a view can omit it when it owns its own header.
  title?: ReactNode
  // Optional subtitle / lead paragraph rendered under the title.
  subtitle?: ReactNode
  // Right-aligned action slot — typically primary buttons (New, Export, …).
  actions?: ReactNode
  // Override the default `p-6 space-y-4` shell padding.
  className?: string
  children: ReactNode
}

// Standardised wrapper for every submenu view module. Provides:
//  * consistent outer padding and vertical rhythm
//  * a fade + rise enter animation
//  * an optional title / subtitle / actions header row
//
// Adopting this in every `<X>View.tsx` keeps the visual language uniform and
// means individual views only need to render their own content.
export function ViewShell({ title, subtitle, actions, className, children }: ViewShellProps) {
  const hasHeader = title != null || actions != null
  return (
    <section data-testid="view-shell" className={cn('p-6 space-y-4', viewEnter, className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {title != null && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
            {subtitle != null && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions != null && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
