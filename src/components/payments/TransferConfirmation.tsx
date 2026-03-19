import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import type { CreateInternalTransferRequest } from '@/types/payment'

interface TransferConfirmationProps {
  formData: CreateInternalTransferRequest
  currency: string
  onConfirm: () => void
  onBack: () => void
  submitting: boolean
  error: string | null
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function TransferConfirmation({
  formData,
  currency,
  onConfirm,
  onBack,
  submitting,
  error,
}: TransferConfirmationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Potvrdi prenos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ConfirmRow label="Sa računa" value={formData.from_account_number} />
        <ConfirmRow label="Na račun" value={formData.to_account_number} />
        <ConfirmRow label="Iznos" value={formatCurrency(formData.amount, currency)} />
        {formData.description && <ConfirmRow label="Opis" value={formData.description} />}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Nazad
          </Button>
          <Button className="flex-1" disabled={submitting} onClick={onConfirm}>
            {submitting ? 'Obrađuje se...' : 'Potvrdi'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
