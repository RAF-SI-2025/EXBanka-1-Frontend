import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { PiggyAnimation, type PiggyMode } from '@/components/animations/PiggyAnimation'
import { MrKrabsAnimation } from '@/components/animations/MrKrabsAnimation'
import { PiggyContext } from '@/hooks/usePiggy'

export function PiggyProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<{ mode: PiggyMode; key: number } | null>(null)
  const [krabs, setKrabs] = useState<number | null>(null)

  const triggerPiggy = useCallback((mode: PiggyMode) => {
    setActive({ mode, key: Date.now() })
  }, [])

  const triggerMrKrabs = useCallback(() => {
    setKrabs(Date.now())
  }, [])

  return (
    <PiggyContext.Provider value={{ triggerPiggy, triggerMrKrabs }}>
      {children}
      {active && (
        <PiggyAnimation key={active.key} mode={active.mode} onDone={() => setActive(null)} />
      )}
      {krabs && <MrKrabsAnimation key={krabs} onDone={() => setKrabs(null)} />}
    </PiggyContext.Provider>
  )
}
