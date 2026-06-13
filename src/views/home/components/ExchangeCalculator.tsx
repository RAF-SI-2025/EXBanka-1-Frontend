import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConvertCurrency } from '@/hooks/useExchange'
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'

export function ExchangeCalculator() {
  const [amount, setAmount] = useState(0)
  const [fromCurrency, setFromCurrency] = useState('RSD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [triggered, setTriggered] = useState(false)
  const convert = useConvertCurrency()

  const handleConvert = () => {
    if (amount > 0) {
      convert.mutate({ from_currency: fromCurrency, to_currency: toCurrency, amount })
      setTriggered(true)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Quick Conversion</h3>
      <div>
        <Label htmlFor="calc-amount">Amount</Label>
        <Input
          id="calc-amount"
          type="number"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>From</Label>
          <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v ?? 'RSD')}>
            <SelectTrigger>
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
          <Label>To</Label>
          <Select value={toCurrency} onValueChange={(v) => setToCurrency(v ?? 'EUR')}>
            <SelectTrigger>
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
      <Button
        onClick={handleConvert}
        className="w-full"
        disabled={amount <= 0 || convert.isPending}
      >
        {convert.isPending ? 'Calculating...' : 'Calculate'}
      </Button>
      {triggered && convert.data && (
        <p className="text-lg font-bold text-center">
          {formatCurrency(convert.data.to_amount, toCurrency)}
        </p>
      )}
    </div>
  )
}
