import { useExchangeRates } from '@/hooks/useExchange'
import { ExchangeRateTable } from '@/components/exchange/ExchangeRateTable'

export function ExchangeRatesPage() {
  const { data: rates, isLoading } = useExchangeRates()

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kursna lista</h1>
      <ExchangeRateTable rates={rates ?? []} />
    </div>
  )
}
