import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FilterOption } from '@/types/filters'

interface MultiselectDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiselectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiselectDropdownProps) {
  const [open, setOpen] = useState(false)
  const allSelected = options.length > 0 && selected.length === options.length

  const handleSelectAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.value))
  }

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const triggerLabel = selected.length > 0 ? `${label} (${selected.length})` : label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'border-input')}>
        {triggerLabel}
        <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <label className="flex items-center gap-2 px-2 py-1 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label="Select all"
            />
            Select all
          </label>
          <div className="border-t my-1" />
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                aria-label={opt.label}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
