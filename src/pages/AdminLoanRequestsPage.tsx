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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LOAN_TYPES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'
import type { LoanType } from '@/types/loan'

export function AdminLoanRequestsPage() {
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType | undefined>()
  const [accountFilter, setAccountFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')

  const { data, isLoading } = useLoanRequests({
    status: 'pending',
    loan_type: loanTypeFilter,
    account_number: accountFilter || undefined,
    page: 1,
    page_size: 100,
  })
  const { data: clientsData } = useAllClients()
  const approve = useApproveLoanRequest()
  const reject = useRejectLoanRequest()

  const requests = data?.requests ?? []
  const clientsById = Object.fromEntries((clientsData?.clients ?? []).map((c) => [c.id, c]))

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
      <h1 className="text-2xl font-bold">Zahtevi za kredite</h1>

      <div className="flex gap-3 flex-wrap">
        <Select
          value={loanTypeFilter ?? 'all'}
          onValueChange={(v) => setLoanTypeFilter(v && v !== 'all' ? (v as LoanType) : undefined)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Svi tipovi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi tipovi</SelectItem>
            {LOAN_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Broj računa..."
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="max-w-xs"
        />

        <Input
          placeholder="Ime klijenta..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klijent</TableHead>
              <TableHead>Broj računa</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Valuta</TableHead>
              <TableHead>Period otplate</TableHead>
              <TableHead>Svrha</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nema zahteva.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => {
                const client = clientsById[req.client_id ?? -1]
                const clientName = client
                  ? `${client.first_name} ${client.last_name}`
                  : `Klijent #${req.client_id}`
                const currency = req.currency_code ?? 'RSD'

                return (
                  <TableRow key={req.id}>
                    <TableCell>{clientName}</TableCell>
                    <TableCell className="font-mono text-sm">{req.account_number}</TableCell>
                    <TableCell>{formatCurrency(req.amount, currency)}</TableCell>
                    <TableCell>{currency}</TableCell>
                    <TableCell>{req.repayment_period} mes.</TableCell>
                    <TableCell>{req.purpose ?? '—'}</TableCell>
                    <TableCell>
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
