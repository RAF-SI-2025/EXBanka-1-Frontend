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
        <CardTitle>Potvrdi transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DetailRow label="Klijent" value={clientName} />
        <DetailRow label="Sa računa" value={formatAccountNumber(fromAccount)} />
        <DetailRow label="Na račun" value={formatAccountNumber(toAccount)} />
        <DetailRow label="Iznos" value={formatCurrency(amount, fromCurrency)} />
        <DetailRow label="Kurs" value={String(rate)} />
        <DetailRow label="Provizija" value={formatCurrency(commission, toCurrency)} />
        <DetailRow label="Krajnji iznos" value={formatCurrency(finalAmount, toCurrency)} />

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Nazad
          </Button>
          <Button onClick={onConfirm} disabled={submitting} className="flex-1">
            {submitting ? 'Obrađuje se...' : 'Potvrdi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
