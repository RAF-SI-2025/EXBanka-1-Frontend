import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TransactionDetailsDialog } from '@/components/payments/TransactionDetailsDialog'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Processing',
  FAILED: 'Rejected',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  COMPLETED: 'default',
  FAILED: 'destructive',
  PENDING: 'secondary',
}

interface PaymentHistoryTableProps {
  payments: Payment[]
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>From Account</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelectedPayment(p)}>
              <TableCell>{formatDate(p.timestamp)}</TableCell>
              <TableCell className="font-mono text-sm">
                {formatAccountNumber(p.from_account_number)}
              </TableCell>
              <TableCell>{p.recipient_name}</TableCell>
              <TableCell>{formatCurrency(p.initial_amount, 'RSD')}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                  {STATUS_LABELS[p.status] ?? p.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    generateReceiptPdf(p)
                  }}
                >
                  PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No payments.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TransactionDetailsDialog
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
      />
    </>
  )
}
