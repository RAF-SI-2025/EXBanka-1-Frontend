import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const SHOW_AFTER_MS = 250

export function TopProgressBar() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const active = isFetching > 0 || isMutating > 0
  const [delayElapsed, setDelayElapsed] = useState(false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setDelayElapsed(true), SHOW_AFTER_MS)
    return () => {
      clearTimeout(t)
      setDelayElapsed(false)
    }
  }, [active])

  const visible = active && delayElapsed

  return (
    <div
      data-testid="top-progress-bar"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full w-full overflow-hidden bg-accent-2/15">
        <div className="h-full w-1/3 origin-left animate-progress-slide rounded-r-full bg-accent-2" />
      </div>
    </div>
  )
}
