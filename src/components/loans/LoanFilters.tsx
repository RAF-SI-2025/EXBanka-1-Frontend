import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { LoanFilters as LoanFiltersType, LoanType, LoanStatus } from '@/types/loan'

interface LoanFiltersProps {
  filters: LoanFiltersType
  onFilterChange: (filters: LoanFiltersType) => void
}

export function LoanFilters({ filters, onFilterChange }: LoanFiltersProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Select
        value={filters.loan_type ?? ''}
        onValueChange={(v) =>
          onFilterChange({ ...filters, loan_type: (v || undefined) as LoanType | undefined })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Svi tipovi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Svi tipovi</SelectItem>
          {LOAN_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ''}
        onValueChange={(v) =>
          onFilterChange({ ...filters, status: (v || undefined) as LoanStatus | undefined })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Svi statusi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Svi statusi</SelectItem>
          <SelectItem value="ACTIVE">Aktivan</SelectItem>
          <SelectItem value="PAID_OFF">Isplaćen</SelectItem>
          <SelectItem value="DELINQUENT">U kašnjenju</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Broj računa..."
        value={filters.account_number ?? ''}
        onChange={(e) =>
          onFilterChange({ ...filters, account_number: e.target.value || undefined })
        }
        className="max-w-xs"
      />
    </div>
  )
}
