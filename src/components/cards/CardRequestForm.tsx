import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Account } from '@/types/account'
import type { CardBrand } from '@/types/card'

const CARD_BRAND_OPTIONS: { value: CardBrand; label: string }[] = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'MasterCard' },
  { value: 'DINA', label: 'DinaCard' },
]

interface CardRequestFormProps {
  accounts: Account[]
  onSubmit: (accountNumber: string, cardBrand: CardBrand) => void
  loading: boolean
}

export function CardRequestForm({ accounts, onSubmit, loading }: CardRequestFormProps) {
  const [selected, setSelected] = useState<string>('')
  const [cardBrand, setCardBrand] = useState<CardBrand | ''>('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zatraži novu karticu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Račun</Label>
          <Select value={selected} onValueChange={(v) => setSelected(v ?? '')}>
            <SelectTrigger aria-label="Račun">
              <SelectValue placeholder="Izaberite račun" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.account_number} value={acc.account_number}>
                  {acc.account_name} — {acc.account_number} ({acc.currency_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tip kartice</Label>
          <Select value={cardBrand} onValueChange={(v) => setCardBrand(v as CardBrand)}>
            <SelectTrigger aria-label="Tip kartice">
              <SelectValue placeholder="Izaberite tip kartice" />
            </SelectTrigger>
            <SelectContent>
              {CARD_BRAND_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => selected && cardBrand && onSubmit(selected, cardBrand)}
          disabled={!selected || !cardBrand || loading}
          className="w-full"
        >
          {loading ? 'Slanje zahteva...' : 'Zatraži'}
        </Button>
      </CardContent>
    </Card>
  )
}
