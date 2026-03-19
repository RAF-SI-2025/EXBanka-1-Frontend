import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Realizovano',
  PENDING: 'U obradi',
  FAILED: 'Odbijeno',
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
          <DialogTitle>Detalji transakcije</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">ID transakcije</span>
            <span>{payment.id}</span>
            <span className="text-muted-foreground">Sa računa</span>
            <span>{formatAccountNumber(payment.from_account_number)}</span>
            <span className="text-muted-foreground">Na račun</span>
            <span>{formatAccountNumber(payment.to_account_number)}</span>
            <span className="text-muted-foreground">Primalac</span>
            <span>{payment.recipient_name}</span>
            <span className="text-muted-foreground">Iznos</span>
            <span>{formatCurrency(payment.initial_amount, 'RSD')}</span>
            <span className="text-muted-foreground">Šifra plaćanja</span>
            <span>{payment.payment_code}</span>
            {payment.reference_number && (
              <>
                <span className="text-muted-foreground">Poziv na broj</span>
                <span>{payment.reference_number}</span>
              </>
            )}
            {payment.payment_purpose && (
              <>
                <span className="text-muted-foreground">Svrha</span>
                <span>{payment.payment_purpose}</span>
              </>
            )}
            <span className="text-muted-foreground">Status</span>
            <span>
              <Badge>{STATUS_LABELS[payment.status] ?? payment.status}</Badge>
            </span>
            <span className="text-muted-foreground">Datum</span>
            <span>{formatDate(payment.timestamp)}</span>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => generateReceiptPdf(payment)}>
            Štampaj potvrdu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
