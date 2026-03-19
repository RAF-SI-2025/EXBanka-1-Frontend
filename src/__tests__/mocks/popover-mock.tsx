import { createContext, useContext, useState } from 'react'
import React from 'react'

const PopoverContext = createContext<{
  open: boolean
  setOpen: (v: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }
  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children?: React.ReactNode
  asChild?: boolean
}) {
  const { setOpen, open } = useContext(PopoverContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(!open),
    })
  }
  return <button onClick={() => setOpen(!open)}>{children}</button>
}

export function PopoverContent({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  const { open } = useContext(PopoverContext)
  if (!open) return null
  return (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  )
}
