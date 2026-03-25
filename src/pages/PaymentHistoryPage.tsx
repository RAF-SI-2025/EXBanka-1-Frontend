import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useClientAccounts } from '@/hooks/useAccounts'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import { PaginationControls } from '@/components/shared/PaginationControls'
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

const PAGE_SIZE = 10

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Rejected', value: 'FAILED' },
      { label: 'Processing', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min Amount', type: 'number' },
  { key: 'amount_max', label: 'Max Amount', type: 'number' },
]

export function PaymentHistoryPage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleAccountChange = (value: string | null) => {
    setSelectedAccountNumber(value ?? '')
    setPage(1)
  }

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
    page,
    page_size: PAGE_SIZE,
  }

  const { data, isLoading } = usePayments(apiFilters)
  const payments = data?.payments ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment History</h1>
      {accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Account:</Label>
          <Select value={selectedAccountNumber} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Accounts" />
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
      <FilterBar
        fields={PAYMENT_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />
      {isLoading ? <p>Loading...</p> : <PaymentHistoryTable payments={payments} />}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
