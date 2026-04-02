import { useState } from 'react'
import { useStocks } from '@/hooks/useSecurities'
import { useCreateOrder } from '@/hooks/useOrders'
import { useTradingAccounts } from '@/hooks/useAccounts'
import { SecuritiesTable } from '@/components/securities/SecuritiesTable'
import { BuyOrderDialog } from '@/components/securities/BuyOrderDialog'
import type { Stock } from '@/types/security'

export function SecuritiesPage() {
  const { data, isLoading } = useStocks()
  const { data: accountsData } = useTradingAccounts()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const [selectedSecurity, setSelectedSecurity] = useState<Stock | null>(null)

  if (isLoading) return <p>Loading...</p>

  const securities = data?.stocks ?? []
  const accounts = accountsData?.accounts ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Securities</h1>
      <SecuritiesTable securities={securities} onBuy={setSelectedSecurity} />
      {selectedSecurity && (
        <BuyOrderDialog
          open={!!selectedSecurity}
          onOpenChange={(open) => {
            if (!open) setSelectedSecurity(null)
          }}
          security={selectedSecurity}
          accounts={accounts}
          onSubmit={(payload) => {
            createOrder(payload, { onSuccess: () => setSelectedSecurity(null) })
          }}
          loading={isPending}
        />
      )}
    </div>
  )
}
