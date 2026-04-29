import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { statusTone, type StatusTone } from '@/lib/utils/statusTone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { LoanInstallment } from '@/types/loan'

interface InstallmentTableProps {
  installments: LoanInstallment[]
}

const INSTALLMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
}

const INSTALLMENT_TONE_OVERRIDES: Record<string, StatusTone> = {
  OVERDUE: 'danger',
}

export function InstallmentTable({ installments }: InstallmentTableProps) {
  if (installments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No installments to display.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Installments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.map((inst, index) => (
              <TableRow key={inst.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{formatDate(inst.expected_date)}</TableCell>
                <TableCell>{formatCurrency(inst.amount, inst.currency_code ?? 'RSD')}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={inst.status}
                    tone={INSTALLMENT_TONE_OVERRIDES[inst.status] ?? statusTone(inst.status)}
                  >
                    {INSTALLMENT_STATUS_LABELS[inst.status] ?? inst.status}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
