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
import { LoanRequestCard } from '@/components/loans/LoanRequestCard'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { LoanRequestFilters, LoanType, LoanRequestStatus } from '@/types/loan'

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
            {requests.map((req) => (
              <LoanRequestCard
                key={req.id}
                request={req}
                onApprove={(id) => approve.mutate(id)}
                onReject={(id) => reject.mutate(id)}
                approving={approve.isPending}
                rejecting={reject.isPending}
              />
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground">
                  Nema zahteva.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
