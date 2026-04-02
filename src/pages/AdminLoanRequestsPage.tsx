import { useState } from 'react'
import { useLoanRequests, useApproveLoanRequest, useRejectLoanRequest } from '@/hooks/useLoans'
import { useAllClients } from '@/hooks/useClients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LOAN_TYPES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'
import type { LoanType } from '@/types/loan'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 10

const LOAN_REQUEST_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: 'loan_type',
    label: 'Loan Type',
    type: 'multiselect',
    options: LOAN_TYPES.map((t) => ({ label: t.label, value: t.value })),
  },
  { key: 'account_number', label: 'Account Number', type: 'text' },
  { key: 'name', label: 'Client Name', type: 'text' },
]

export function AdminLoanRequestsPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const { data, isLoading } = useLoanRequests({
    status: 'pending',
    loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
    account_number: (filterValues.account_number as string) || undefined,
    page,
    page_size: PAGE_SIZE,
  })
  const { data: clientsData } = useAllClients()
  const approve = useApproveLoanRequest()
  const reject = useRejectLoanRequest()

  const requests = data?.requests ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const clientsById = Object.fromEntries((clientsData?.clients ?? []).map((c) => [c.id, c]))

  const nameFilter = (filterValues.name as string) ?? ''
  const filtered = nameFilter
    ? requests.filter((req) => {
        const client = clientsById[req.client_id ?? -1]
        if (!client) return false
        return `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(nameFilter.toLowerCase())
      })
    : requests

  const isDisabled = approve.isPending || reject.isPending

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Loan Requests</h1>

      <FilterBar
        fields={LOAN_REQUEST_FILTER_FIELDS}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Repayment Period</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No requests.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => {
                const client = clientsById[req.client_id ?? -1]
                const clientName = client
                  ? `${client.first_name} ${client.last_name}`
                  : `Client #${req.client_id}`
                const currency = req.currency_code ?? 'RSD'

                return (
                  <TableRow key={req.id}>
                    <TableCell>{clientName}</TableCell>
                    <TableCell className="font-mono text-sm">{req.account_number}</TableCell>
                    <TableCell>{formatCurrency(req.amount, currency)}</TableCell>
                    <TableCell>{currency}</TableCell>
                    <TableCell>{req.repayment_period} months</TableCell>
                    <TableCell>{req.purpose ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve.mutate(req.id)}
                          disabled={isDisabled}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reject.mutate(req.id)}
                          disabled={isDisabled}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
