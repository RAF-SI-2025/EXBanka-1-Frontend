import { Input } from '@/components/ui/input'
import { MultiselectDropdown } from '@/components/ui/MultiselectDropdown'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

interface FilterBarProps {
  fields: FilterFieldDef[]
  values: FilterValues
  onChange: (values: FilterValues) => void
}

export function FilterBar({ fields, values, onChange }: FilterBarProps) {
  const handleChange = (key: string, value: string | string[]) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      {fields.map((field) => {
        if (field.type === 'multiselect') {
          return (
            <MultiselectDropdown
              key={field.key}
              label={field.label}
              options={field.options}
              selected={(values[field.key] as string[]) ?? []}
              onChange={(v) => handleChange(field.key, v)}
            />
          )
        }
        return (
          <Input
            key={field.key}
            type={field.type}
            placeholder={field.label}
            value={(values[field.key] as string) ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="max-w-[200px]"
          />
        )
      })}
    </div>
  )
}
