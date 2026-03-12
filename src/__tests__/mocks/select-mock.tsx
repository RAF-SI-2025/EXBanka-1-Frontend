// Shared mock for @/components/ui/select.
// Uses React context to pass onValueChange down to SelectItem without
// any render-time side effects (avoids react-hooks/globals lint rule).
import { createContext, useContext } from 'react'

const SelectContext = createContext<((v: string | null) => void) | undefined>(undefined)

export function Select({
  onValueChange,
  children,
}: {
  value?: string
  onValueChange?: (v: string | null) => void
  children?: React.ReactNode
}) {
  return <SelectContext.Provider value={onValueChange}>{children}</SelectContext.Provider>
}

export function SelectTrigger({ children }: { children?: React.ReactNode }) {
  return (
    <button role="combobox" data-testid="select-trigger">
      {children}
    </button>
  )
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
  return <div data-testid="select-content">{children}</div>
}

export function SelectItem({ value, children }: { value: string; children?: React.ReactNode }) {
  const onValueChange = useContext(SelectContext)
  return (
    <div role="option" data-value={value} onClick={() => onValueChange?.(value)}>
      {children}
    </div>
  )
}

export function SelectValue() {
  return null
}
