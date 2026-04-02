import { useState } from 'react'
import { useConvertCurrency, useExchangeRates } from '@/hooks/useExchange'
import { EquivalenceCalculator } from '@/components/exchange/EquivalenceCalculator'
import type { ConversionResult, ConvertCurrencyRequest, ExchangeRate } from '@/types/exchange'

function computeLocalConversion(
  rates: ExchangeRate[],
  from: string,
  to: string,
  amount: number
): ConversionResult | null {
  const direct = rates.find((r) => r.from_currency === from && r.to_currency === to)
  if (direct) {
    const rate = Number(direct.buy_rate)
    return {
      from_amount: amount,
      from_currency: from,
      to_amount: amount * rate,
      to_currency: to,
      rate,
    }
  }
  const inverse = rates.find((r) => r.from_currency === to && r.to_currency === from)
  if (inverse) {
    const rate = 1 / Number(inverse.buy_rate)
    return {
      from_amount: amount,
      from_currency: from,
      to_amount: amount * rate,
      to_currency: to,
      rate,
    }
  }
  return null
}

export function ExchangeCalculatorPage() {
  const conversion = useConvertCurrency()
  const { data: localRates } = useExchangeRates()
  const [result, setResult] = useState<ConversionResult | null>(null)

  const handleConvert = (params: ConvertCurrencyRequest) => {
    setResult(null)
    conversion.mutate(params, {
      onSuccess: (data) => setResult(data),
      onError: () => {
        const fallback = computeLocalConversion(
          localRates ?? [],
          params.from_currency,
          params.to_currency,
          params.amount
        )
        setResult(fallback)
      },
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      <EquivalenceCalculator
        onConvert={handleConvert}
        result={result}
        loading={conversion.isPending}
      />
    </div>
  )
}
