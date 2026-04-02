import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAccountNumber, formatCurrency } from '@/lib/utils/format'

interface TransferPreviewProps {
  clientName: string
  fromAccount: string
  toAccount: string
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  commission: number
  finalAmount: number
  onConfirm: () => void
  onBack: () => void
  submitting: boolean
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function TransferPreview({
  clientName,
  fromAccount,
  toAccount,
  amount,
  fromCurrency,
  toCurrency,
  rate,
  commission,
  finalAmount,
  onConfirm,
  onBack,
  submitting,
}: TransferPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DetailRow label="Client" value={clientName} />
        <DetailRow label="From Account" value={formatAccountNumber(fromAccount)} />
        <DetailRow label="To Account" value={formatAccountNumber(toAccount)} />
        <DetailRow label="Amount" value={formatCurrency(amount, fromCurrency)} />
        <DetailRow label="Rate" value={String(rate)} />
        <DetailRow label="Commission" value={formatCurrency(commission, toCurrency)} />
        <DetailRow label="Final Amount" value={formatCurrency(finalAmount, toCurrency)} />

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={onConfirm} disabled={submitting} className="flex-1">
            {submitting ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
