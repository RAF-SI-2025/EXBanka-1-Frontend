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

  const isSameCurrency = fromCurrency === toCurrency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount > 0 && !isSameCurrency) {
      onConvert({ from_currency: fromCurrency, to_currency: toCurrency, amount })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Equivalence</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Amount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Currency</Label>
              <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v ?? 'RSD')}>
                <SelectTrigger aria-label="From Currency">
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
              <Label>To Currency</Label>
              <Select value={toCurrency} onValueChange={(v) => setToCurrency(v ?? 'EUR')}>
                <SelectTrigger aria-label="To Currency">
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

          {isSameCurrency && (
            <p className="text-sm text-destructive text-center">
              Cannot convert to same currency, idiot
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || amount <= 0 || isSameCurrency}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <p className="text-lg font-semibold text-center">
              {formatCurrency(result.from_amount, result.from_currency)} ={' '}
              {formatCurrency(result.to_amount, result.to_currency)}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Rate: {result.rate.toFixed(4)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
