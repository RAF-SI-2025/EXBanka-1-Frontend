import { createContext, useContext } from 'react'

export interface CapybaraContextValue {
  /** True while the capybara has stolen the menu (overlay is showing). */
  stolen: boolean
}

export const CapybaraContext = createContext<CapybaraContextValue>({ stolen: false })

export function useCapybara(): CapybaraContextValue {
  return useContext(CapybaraContext)
}
