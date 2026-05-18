import { Card, CardContent } from '@/components/ui/card'
import { useExchangeRates } from '@/hooks/useExchange'
import { ExchangeRateTable } from '@/views/exchangeRates/components/ExchangeRateTable'
import { LoadingState, ViewShell } from '@/views/shared'

export function ExchangeRatesView() {
  const { data: rates, isLoading } = useExchangeRates()
  const displayRates = (rates ?? []).filter((r) => r.to_currency === 'RSD')

  return (
    <ViewShell
      title="Exchange Rates"
      subtitle="Daily indicative rates for converting foreign currencies into RSD."
    >
      <Card>
        <CardContent className="pt-6">
          {isLoading ? <LoadingState /> : <ExchangeRateTable rates={displayRates} />}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
