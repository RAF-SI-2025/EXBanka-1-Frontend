import { useState } from 'react'
import { useOtcOffers, useBuyOtcOffer, useBuyOtcOfferOnBehalf } from '@/hooks/useOtc'
import { useClientAccounts, useAccountsByClient } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { OtcOffersTable } from '@/components/otc/OtcOffersTable'
import { BuyOtcDialog } from '@/components/otc/BuyOtcDialog'
import { BuyOnBehalfOtcDialog } from '@/components/otc/BuyOnBehalfOtcDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { notifySuccess } from '@/lib/errors'
import type { OtcOffer } from '@/types/otc'

export function OtcPortalPage() {
  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const { data, isLoading } = useOtcOffers()
  const offers = data?.offers ?? []

  const [selectedOffer, setSelectedOffer] = useState<OtcOffer | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const { data: clientAccountsData } = useClientAccounts()
  const clientAccounts = clientAccountsData?.accounts ?? []

  const { data: clientsData } = useAllClients()
  const clients = clientsData?.clients ?? []
  const { data: accountsForClientData } = useAccountsByClient(selectedClientId ?? 0)
  const accountsForClient = accountsForClientData?.accounts ?? []

  const buyMutation = useBuyOtcOffer()
  const buyOnBehalfMutation = useBuyOtcOfferOnBehalf()

  const closeDialog = () => {
    setSelectedOffer(null)
    setSelectedClientId(null)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OTC Trading Portal</h1>
      {isLoading ? <LoadingSpinner /> : <OtcOffersTable offers={offers} onBuy={setSelectedOffer} />}
      {selectedOffer &&
        (isEmployee ? (
          <BuyOnBehalfOtcDialog
            open
            onOpenChange={(open) => {
              if (!open) closeDialog()
            }}
            offer={selectedOffer}
            clients={clients}
            accountsForClient={accountsForClient}
            onClientSelect={setSelectedClientId}
            onSubmit={(payload) =>
              buyOnBehalfMutation.mutate(
                { id: selectedOffer.id, ...payload },
                {
                  onSuccess: () => {
                    notifySuccess('Purchase placed on behalf of client.')
                    closeDialog()
                  },
                }
              )
            }
            loading={buyOnBehalfMutation.isPending}
          />
        ) : (
          <BuyOtcDialog
            open
            onOpenChange={(open) => {
              if (!open) closeDialog()
            }}
            offer={selectedOffer}
            accounts={clientAccounts}
            onSubmit={(payload) =>
              buyMutation.mutate(
                { id: selectedOffer.id, ...payload },
                {
                  onSuccess: () => {
                    notifySuccess('Purchase complete.')
                    closeDialog()
                  },
                }
              )
            }
            loading={buyMutation.isPending}
          />
        ))}
    </div>
  )
}
