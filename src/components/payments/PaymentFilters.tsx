import type { PaymentFilters as PaymentFiltersType, PaymentStatus } from '@/types/payment'

interface PaymentFiltersProps {
  filters: PaymentFiltersType
  onFilterChange: (filters: PaymentFiltersType) => void
}

const STATUS_OPTIONS: { value: PaymentStatus | ''; label: string }[] = [
  { value: '', label: 'Svi statusi' },
  { value: 'REALIZED', label: 'Realizovano' },
  { value: 'REJECTED', label: 'Odbijeno' },
  { value: 'PROCESSING', label: 'U obradi' },
]

export function PaymentFilters({ filters, onFilterChange }: PaymentFiltersProps) {
  function handleFromDate(e: React.ChangeEvent<HTMLInputElement>) {
    onFilterChange({ ...filters, from_date: e.target.value || undefined })
  }

  function handleToDate(e: React.ChangeEvent<HTMLInputElement>) {
    onFilterChange({ ...filters, to_date: e.target.value || undefined })
  }

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PaymentStatus | ''
    onFilterChange({ ...filters, status: value || undefined })
  }

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="from_date" className="text-sm font-medium">
          Od datuma
        </label>
        <input
          id="from_date"
          type="date"
          value={filters.from_date ?? ''}
          onChange={handleFromDate}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="to_date" className="text-sm font-medium">
          Do datuma
        </label>
        <input
          id="to_date"
          type="date"
          value={filters.to_date ?? ''}
          onChange={handleToDate}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          value={filters.status ?? ''}
          onChange={handleStatus}
          className="border rounded px-2 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
