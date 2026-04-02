import { useState } from 'react'
import { useOtcOffers, useBuyOtcOffer } from '@/hooks/useOtc'
import { useTradingAccounts } from '@/hooks/useAccounts'
import { OtcOffersTable } from '@/components/otc/OtcOffersTable'
import { BuyOtcDialog } from '@/components/otc/BuyOtcDialog'
import type { OtcOffer } from '@/types/otc'

export function OtcPortalPage() {
  const { data, isLoading } = useOtcOffers()
  const { data: accountsData } = useTradingAccounts()
  const { mutate: buyOffer, isPending } = useBuyOtcOffer()
  const [selectedOffer, setSelectedOffer] = useState<OtcOffer | null>(null)

  if (isLoading) return <p>Loading...</p>

  const offers = data?.offers ?? []
  const accounts = accountsData?.accounts ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OTC Trading Portal</h1>
      <OtcOffersTable offers={offers} onBuy={setSelectedOffer} />
      {selectedOffer && (
        <BuyOtcDialog
          open={!!selectedOffer}
          onOpenChange={(open) => {
            if (!open) setSelectedOffer(null)
          }}
          offer={selectedOffer}
          accounts={accounts}
          onSubmit={(payload) => {
            buyOffer(
              { id: selectedOffer.id, ...payload },
              { onSuccess: () => setSelectedOffer(null) }
            )
          }}
          loading={isPending}
        />
      )}
    </div>
  )
}
