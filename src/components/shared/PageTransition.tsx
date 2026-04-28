import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div
      key={pathname}
      data-testid="page-transition"
      className="animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {children}
    </div>
  )
}
