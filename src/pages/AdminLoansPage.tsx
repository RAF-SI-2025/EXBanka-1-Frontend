import { useState } from 'react'
import { useAllLoans } from '@/hooks/useLoans'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

export function AdminLoansPage() {
  const [accountNumber, setAccountNumber] = useState('')
  const { data, isLoading } = useAllLoans({ account_number: accountNumber || undefined })
  const loans = data?.loans ?? []
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Svi krediti</h1>

      <Input
        placeholder="Broj računa..."
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broj kredita</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Rata</TableHead>
              <TableHead>Odobren</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-mono text-sm">{loan.loan_number}</TableCell>
                <TableCell>{loanTypeLabel(loan.loan_type)}</TableCell>
                <TableCell>{formatCurrency(loan.amount, 'RSD')}</TableCell>
                <TableCell>{formatCurrency(loan.installment_amount, 'RSD')}</TableCell>
                <TableCell>{formatDate(loan.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[loan.status] ?? 'secondary'}>
                    {STATUS_LABELS[loan.status] ?? loan.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {loans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
