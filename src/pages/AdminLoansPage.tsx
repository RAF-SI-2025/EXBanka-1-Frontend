import { useState } from 'react'
import { useAllLoans } from '@/hooks/useLoans'
import { Badge } from '@/components/ui/badge'
import { LoanFilters } from '@/components/loans/LoanFilters'
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
import type { LoanFilters as LoanFiltersType } from '@/types/loan'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivan',
  PAID_OFF: 'Isplaćen',
  DELINQUENT: 'U kašnjenju',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PAID_OFF: 'secondary',
  DELINQUENT: 'destructive',
}

const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fiksna',
  VARIABLE: 'Varijabilna',
}

export function AdminLoansPage() {
  const [filters, setFilters] = useState<LoanFiltersType>({})
  const { data, isLoading } = useAllLoans(filters)
  const loans = data?.loans ?? []
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Svi krediti</h1>

      <LoanFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broj kredita</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Tip kamate</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Rata</TableHead>
              <TableHead>Preostalo dugovanje</TableHead>
              <TableHead>Valuta</TableHead>
              <TableHead>Odobren</TableHead>
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
                  <TableCell>{loan.period} mes.</TableCell>
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
                  Nema kredita.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
