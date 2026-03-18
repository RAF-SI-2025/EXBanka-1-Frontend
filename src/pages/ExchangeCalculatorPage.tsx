import { useConvertCurrency } from '@/hooks/useExchange'
import { EquivalenceCalculator } from '@/components/exchange/EquivalenceCalculator'

export function ExchangeCalculatorPage() {
  const conversion = useConvertCurrency()

  const handleConvert = (params: {
    from_currency: string
    to_currency: string
    amount: number
  }) => {
    conversion.mutate(params)
  }

  return (
    <div className="max-w-lg mx-auto">
      <EquivalenceCalculator
        onConvert={handleConvert}
        result={conversion.data ?? null}
        loading={conversion.isPending}
      />
    </div>
  )
}
