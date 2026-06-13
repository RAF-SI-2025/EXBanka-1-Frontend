import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import type { CreatePaymentRequest } from '@/types/payment'

interface PaymentConfirmationProps {
  formData: CreatePaymentRequest
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

export function PaymentConfirmation({
  formData,
  currency,
  onConfirm,
  onBack,
  submitting,
  error,
}: PaymentConfirmationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ConfirmRow label="From Account" value={formData.from_account_number} />
        <ConfirmRow label="To Account" value={formData.to_account_number} />
        <ConfirmRow label="Recipient" value={formData.recipient_name} />
        <ConfirmRow label="Amount" value={formatCurrency(formData.amount, currency)} />
        <ConfirmRow label="Code" value={formData.payment_code} />
        {formData.reference_number && (
          <ConfirmRow label="Reference Number" value={formData.reference_number} />
        )}
        {formData.payment_purpose && (
          <ConfirmRow label="Description" value={formData.payment_purpose} />
        )}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button className="flex-1" disabled={submitting} onClick={onConfirm}>
            {submitting ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
