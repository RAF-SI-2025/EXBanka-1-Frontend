import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'
import type { ConversionResult } from '@/types/exchange'

interface EquivalenceCalculatorProps {
  onConvert: (params: { from_currency: string; to_currency: string; amount: number }) => void
  result: ConversionResult | null
  loading: boolean
}

export function EquivalenceCalculator({ onConvert, result, loading }: EquivalenceCalculatorProps) {
  const [amount, setAmount] = useState<number>(0)
  const [fromCurrency, setFromCurrency] = useState('RSD')
  const [toCurrency, setToCurrency] = useState('EUR')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0) {
      onConvert({ from_currency: fromCurrency, to_currency: toCurrency, amount })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveri ekvivalentnost</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Iznos</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Iznos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Iz valute</Label>
              <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v ?? 'RSD')}>
                <SelectTrigger aria-label="Iz valute">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>U valutu</Label>
              <Select value={toCurrency} onValueChange={(v) => setToCurrency(v ?? 'EUR')}>
                <SelectTrigger aria-label="U valutu">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || amount <= 0}>
            {loading ? 'Izračunavanje...' : 'Izračunaj'}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <p className="text-lg font-semibold text-center">
              {formatCurrency(result.from_amount, result.from_currency)} ={' '}
              {formatCurrency(result.to_amount, result.to_currency)}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Kurs: {result.rate.toFixed(4)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
