import { useExchangeRates } from '@/hooks/useExchange'
import { ExchangeRateTable } from '@/components/exchange/ExchangeRateTable'

export function ExchangeRatesPage() {
  const { data: rates, isLoading } = useExchangeRates()
  const displayRates = (rates ?? []).filter((r) => r.to_currency === 'RSD')

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Exchange Rates</h1>
      <ExchangeRateTable rates={displayRates} />
    </div>
  )
}
