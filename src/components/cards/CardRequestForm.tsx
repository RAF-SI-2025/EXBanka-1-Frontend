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

interface CardRequestFormProps {
  accounts: Account[]
  onSubmit: (accountNumber: string) => void
  loading: boolean
}

export function CardRequestForm({ accounts, onSubmit, loading }: CardRequestFormProps) {
  const [selected, setSelected] = useState<string>('')

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
                  {acc.name} — {acc.account_number} ({acc.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => selected && onSubmit(selected)}
          disabled={!selected || loading}
          className="w-full"
        >
          {loading ? 'Slanje zahteva...' : 'Zatraži'}
        </Button>
      </CardContent>
    </Card>
  )
}
