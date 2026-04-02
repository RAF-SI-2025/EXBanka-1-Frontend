import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Processing',
  FAILED: 'Rejected',
}

interface TransactionDetailsDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({
  payment,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Transaction ID</span>
            <span>{payment.id}</span>
            <span className="text-muted-foreground">From Account</span>
            <span>{formatAccountNumber(payment.from_account_number)}</span>
            <span className="text-muted-foreground">To Account</span>
            <span>{formatAccountNumber(payment.to_account_number)}</span>
            <span className="text-muted-foreground">Recipient</span>
            <span>{payment.recipient_name}</span>
            <span className="text-muted-foreground">Amount</span>
            <span>{formatCurrency(payment.initial_amount, 'RSD')}</span>
            <span className="text-muted-foreground">Payment Code</span>
            <span>{payment.payment_code}</span>
            {payment.reference_number && (
              <>
                <span className="text-muted-foreground">Reference Number</span>
                <span>{payment.reference_number}</span>
              </>
            )}
            {payment.payment_purpose && (
              <>
                <span className="text-muted-foreground">Purpose</span>
                <span>{payment.payment_purpose}</span>
              </>
            )}
            <span className="text-muted-foreground">Status</span>
            <span>
              <Badge>{STATUS_LABELS[payment.status] ?? payment.status}</Badge>
            </span>
            <span className="text-muted-foreground">Date</span>
            <span>{formatDate(payment.timestamp)}</span>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => generateReceiptPdf(payment)}>
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
