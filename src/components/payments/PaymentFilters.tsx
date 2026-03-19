import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'

interface PaymentFiltersProps {
  filters: PaymentFiltersType
  onFilterChange: (filters: PaymentFiltersType) => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'Svi statusi' },
  { value: 'COMPLETED', label: 'Realizovano' },
  { value: 'FAILED', label: 'Odbijeno' },
  { value: 'PENDING', label: 'U obradi' },
]

export function PaymentFilters({ filters, onFilterChange }: PaymentFiltersProps) {
  function handleFromDate(e: React.ChangeEvent<HTMLInputElement>) {
    onFilterChange({ ...filters, date_from: e.target.value || undefined })
  }

  function handleToDate(e: React.ChangeEvent<HTMLInputElement>) {
    onFilterChange({ ...filters, date_to: e.target.value || undefined })
  }

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    onFilterChange({ ...filters, status_filter: e.target.value || undefined })
  }

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="date_from" className="text-sm font-medium">
          Od datuma
        </label>
        <input
          id="date_from"
          type="date"
          value={filters.date_from ?? ''}
          onChange={handleFromDate}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date_to" className="text-sm font-medium">
          Do datuma
        </label>
        <input
          id="date_to"
          type="date"
          value={filters.date_to ?? ''}
          onChange={handleToDate}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status_filter" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status_filter"
          value={filters.status_filter ?? ''}
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

      <div className="flex flex-col gap-1">
        <label htmlFor="amount_min" className="text-sm font-medium">
          Min iznos
        </label>
        <input
          id="amount_min"
          type="number"
          value={filters.amount_min ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              amount_min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="amount_max" className="text-sm font-medium">
          Max iznos
        </label>
        <input
          id="amount_max"
          type="number"
          value={filters.amount_max ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              amount_max: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  )
}
