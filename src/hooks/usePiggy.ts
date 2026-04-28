import { createContext, useContext } from 'react'
import type { PiggyMode } from '@/components/animations/PiggyAnimation'

export interface PiggyContextValue {
  triggerPiggy: (mode: PiggyMode) => void
  triggerMrKrabs: () => void
}

export const PiggyContext = createContext<PiggyContextValue | undefined>(undefined)

export function usePiggy(): PiggyContextValue {
  const ctx = useContext(PiggyContext)
  if (!ctx) {
    return { triggerPiggy: () => {}, triggerMrKrabs: () => {} }
  }
  return ctx
}
