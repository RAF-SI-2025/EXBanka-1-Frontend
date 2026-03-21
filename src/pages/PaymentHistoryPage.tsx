import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useClientAccounts } from '@/hooks/useAccounts'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'Od datuma', type: 'date' },
  { key: 'date_to', label: 'Do datuma', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Realizovano', value: 'COMPLETED' },
      { label: 'Odbijeno', value: 'FAILED' },
      { label: 'U obradi', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min iznos', type: 'number' },
  { key: 'amount_max', label: 'Max iznos', type: 'number' },
]

export function PaymentHistoryPage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
  }

  const effectiveAccount = selectedAccountNumber || accounts[0]?.account_number
  const { data, isLoading } = usePayments(effectiveAccount, apiFilters)
  const payments = data?.payments ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija plaćanja</h1>
      {accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Račun:</Label>
          <Select
            value={selectedAccountNumber}
            onValueChange={(v) => setSelectedAccountNumber(v ?? '')}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Svi računi" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.account_number} value={acc.account_number}>
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <FilterBar fields={PAYMENT_FILTER_FIELDS} values={filterValues} onChange={setFilterValues} />
      {isLoading ? <p>Učitavanje...</p> : <PaymentHistoryTable payments={payments} />}
    </div>
  )
}
