import { useState } from 'react'
import { useLoanRequests, useApproveLoanRequest, useRejectLoanRequest } from '@/hooks/useLoans'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LOAN_TYPES } from '@/lib/constants/banking'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { LoanRequestFilters, LoanType, LoanRequestStatus } from '@/types/loan'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Na čekanju',
  APPROVED: 'Odobren',
  REJECTED: 'Odbijen',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fiksna',
  VARIABLE: 'Varijabilna',
}

export function AdminLoanRequestsPage() {
  const [filters, setFilters] = useState<LoanRequestFilters>({ page: 1, page_size: 50 })
  const { data, isLoading } = useLoanRequests(filters)
  const approve = useApproveLoanRequest()
  const reject = useRejectLoanRequest()
  const requests = data?.requests ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Zahtevi za kredite</h1>

      <div className="flex gap-3 flex-wrap">
        <Select
          value={filters.loan_type ?? ''}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              loan_type: (v || undefined) as LoanType | undefined,
              page: 1,
            }))
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
            setFilters((f) => ({
              ...f,
              status: (v || undefined) as LoanRequestStatus | undefined,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Svi statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Svi statusi</SelectItem>
            <SelectItem value="PENDING">Na čekanju</SelectItem>
            <SelectItem value="APPROVED">Odobreni</SelectItem>
            <SelectItem value="REJECTED">Odbijeni</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Broj računa..."
          value={filters.account_number ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, account_number: e.target.value || undefined, page: 1 }))
          }
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tip</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Broj računa</TableHead>
              <TableHead>Tip kamate</TableHead>
              <TableHead>Valuta</TableHead>
              <TableHead>Svrha</TableHead>
              <TableHead>Mesečna plata</TableHead>
              <TableHead>Status zaposlenja</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground">
                  Nema zahteva.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => {
                const currency = req.currency_code ?? 'RSD'
                const loanTypeLabel =
                  LOAN_TYPES.find((t) => t.value === req.loan_type)?.label ?? req.loan_type
                const isDisabled = approve.isPending || reject.isPending

                return (
                  <TableRow key={req.id}>
                    <TableCell>{loanTypeLabel}</TableCell>
                    <TableCell>{formatCurrency(req.amount, currency)}</TableCell>
                    <TableCell>{req.repayment_period} mes.</TableCell>
                    <TableCell>{req.account_number}</TableCell>
                    <TableCell>
                      {req.interest_type ? (INTEREST_TYPE_LABELS[req.interest_type] ?? '—') : '—'}
                    </TableCell>
                    <TableCell>{req.currency_code ?? '—'}</TableCell>
                    <TableCell>{req.purpose ?? '—'}</TableCell>
                    <TableCell>
                      {req.monthly_salary ? formatCurrency(req.monthly_salary, 'RSD') : '—'}
                    </TableCell>
                    <TableCell>{req.employment_status ?? '—'}</TableCell>
                    <TableCell>{req.phone ?? '—'}</TableCell>
                    <TableCell>{formatDate(req.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[req.status] ?? 'secondary'}>
                        {STATUS_LABELS[req.status] ?? req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approve.mutate(req.id)}
                            disabled={isDisabled}
                          >
                            Odobri
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reject.mutate(req.id)}
                            disabled={isDisabled}
                          >
                            Odbij
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
