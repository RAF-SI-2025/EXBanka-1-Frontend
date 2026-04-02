import { useState } from 'react'
import { useAllLoans } from '@/hooks/useLoans'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { LoanFilters as LoanFiltersType, LoanType, LoanStatus } from '@/types/loan'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PAID_OFF: 'Paid Off',
  DELINQUENT: 'Delinquent',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PAID_OFF: 'secondary',
  DELINQUENT: 'destructive',
}
const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fixed',
  VARIABLE: 'Variable',
}

const LOAN_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: 'loan_type',
    label: 'Loan Type',
    type: 'multiselect',
    options: LOAN_TYPES.map((t) => ({ label: t.label, value: t.value })),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Paid Off', value: 'PAID_OFF' },
      { label: 'Overdue', value: 'DELINQUENT' },
    ],
  },
  { key: 'account_number', label: 'Account Number', type: 'text' },
]

export function AdminLoansPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const apiFilters: LoanFiltersType = {
    loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
    status: (filterValues.status as string[])?.[0] as LoanStatus | undefined,
    account_number: (filterValues.account_number as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  }
  const { data, isLoading } = useAllLoans(apiFilters)
  const loans = data?.loans ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All Loans</h1>

      <FilterBar fields={LOAN_FILTER_FIELDS} values={filterValues} onChange={handleFilterChange} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Interest Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Installment</TableHead>
              <TableHead>Remaining Debt</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const currency = loan.currency_code ?? 'RSD'
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono text-sm">{loan.loan_number}</TableCell>
                  <TableCell>{loanTypeLabel(loan.loan_type)}</TableCell>
                  <TableCell>
                    {loan.interest_type ? (INTEREST_TYPE_LABELS[loan.interest_type] ?? '—') : '—'}
                  </TableCell>
                  <TableCell>{formatCurrency(loan.amount, currency)}</TableCell>
                  <TableCell>{loan.period} months</TableCell>
                  <TableCell>{formatCurrency(loan.installment_amount, currency)}</TableCell>
                  <TableCell>
                    {loan.remaining_debt !== undefined
                      ? formatCurrency(loan.remaining_debt, currency)
                      : '—'}
                  </TableCell>
                  <TableCell>{currency}</TableCell>
                  <TableCell>{formatDate(loan.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[loan.status] ?? 'secondary'}>
                      {STATUS_LABELS[loan.status] ?? loan.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {loans.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No loans.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
