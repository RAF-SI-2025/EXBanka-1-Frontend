import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const INSTALLMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PAID: 'default',
  PENDING: 'secondary',
  OVERDUE: 'destructive',
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
                  <Badge variant={INSTALLMENT_VARIANT[inst.status] ?? 'secondary'}>
                    {INSTALLMENT_STATUS_LABELS[inst.status] ?? inst.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
