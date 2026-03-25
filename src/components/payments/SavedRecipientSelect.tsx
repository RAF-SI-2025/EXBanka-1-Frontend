import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaymentRecipient } from '@/types/payment'

interface SavedRecipientSelectProps {
  recipients: PaymentRecipient[]
  onSelect: (recipientId: string) => void
}

export function SavedRecipientSelect({ recipients, onSelect }: SavedRecipientSelectProps) {
  return (
    <div>
      <Label>Saved Recipients</Label>
      <Select onValueChange={(val) => onSelect(val as string)}>
        <SelectTrigger>
          <SelectValue placeholder="Select recipient" />
        </SelectTrigger>
        <SelectContent>
          {recipients.map((r) => (
            <SelectItem key={r.id} value={String(r.id)}>
              {r.recipient_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
