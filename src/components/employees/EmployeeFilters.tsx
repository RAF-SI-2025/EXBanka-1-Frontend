import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FilterCategory } from '@/types/employee'

const FILTER_CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'position', label: 'Position' },
]

interface EmployeeFiltersProps {
  onFilterChange: (filter: { category: FilterCategory; value: string } | null) => void
}

export function EmployeeFilters({ onFilterChange }: EmployeeFiltersProps) {
  const [category, setCategory] = useState<FilterCategory>('name')
  const [value, setValue] = useState('')

  const handleCategoryChange = (newCategory: string | null) => {
    if (!newCategory) return
    const cat = newCategory as FilterCategory
    setCategory(cat)
    if (value.trim()) {
      onFilterChange({ category: cat, value })
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    if (newValue.trim()) {
      onFilterChange({ category, value: newValue })
    } else {
      onFilterChange(null)
    }
  }

  const handleClear = () => {
    setValue('')
    onFilterChange(null)
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[160px] shrink-0">
          <SelectValue>{FILTER_CATEGORIES.find((c) => c.value === category)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FILTER_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative max-w-sm flex-1">
        <Input
          placeholder="Type to filter..."
          value={value}
          onChange={handleValueChange}
          className="pr-8"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear filter"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
