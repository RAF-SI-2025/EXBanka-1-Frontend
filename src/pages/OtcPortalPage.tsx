import { useState } from 'react'
import {
  useOtcOffers,
  useBuyOtcOffer,
  useBuyOtcOfferOnBehalf,
  useCreatePeerOtcNegotiation,
} from '@/hooks/useOtc'
import { useClientAccounts, useAccountsByClient } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType, selectCurrentUser } from '@/store/selectors/authSelectors'
import { OtcOffersTable } from '@/components/otc/OtcOffersTable'
import { OtcPeersStatusBanner } from '@/components/otc/OtcPeersStatusBanner'
import { BuyOtcDialog } from '@/components/otc/BuyOtcDialog'
import { BuyOnBehalfOtcDialog } from '@/components/otc/BuyOnBehalfOtcDialog'
import { BuyRemoteOtcDialog } from '@/components/otc/BuyRemoteOtcDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { notifySuccess } from '@/lib/errors'
import type { OtcOffer, OtcLocalOffer, OtcRemoteOffer } from '@/types/otc'

export function OtcPortalPage() {
  const userType = useAppSelector(selectUserType)
  const currentUser = useAppSelector(selectCurrentUser)
  const isEmployee = userType === 'employee'

  const { data, isLoading } = useOtcOffers()
  const offers = data?.offers ?? []

  const [selectedOffer, setSelectedOffer] = useState<OtcOffer | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const { data: clientAccountsData } = useClientAccounts()
  const clientAccounts = clientAccountsData?.accounts ?? []

  const { data: clientsData } = useAllClients(undefined, { enabled: isEmployee })
  const clients = clientsData?.clients ?? []
  const { data: accountsForClientData } = useAccountsByClient(selectedClientId ?? 0)
  const accountsForClient = accountsForClientData?.accounts ?? []

  const buyMutation = useBuyOtcOffer()
  const buyOnBehalfMutation = useBuyOtcOfferOnBehalf()
  const peerNegotiationMutation = useCreatePeerOtcNegotiation()

  const closeDialog = () => {
    setSelectedOffer(null)
    setSelectedClientId(null)
  }

  const renderDialog = () => {
    if (!selectedOffer) return null

    if (selectedOffer.kind === 'remote') {
      const remoteOffer: OtcRemoteOffer = selectedOffer
      return (
        <BuyRemoteOtcDialog
          open
          onOpenChange={(open) => {
            if (!open) closeDialog()
          }}
          offer={remoteOffer}
          onSubmit={(payload) =>
            peerNegotiationMutation.mutate(payload, {
              onSuccess: () => {
                notifySuccess('Negotiation submitted to peer bank.')
                closeDialog()
              },
            })
          }
          loading={peerNegotiationMutation.isPending}
        />
      )
    }

    const localOffer: OtcLocalOffer = selectedOffer
    if (isEmployee) {
      return (
        <BuyOnBehalfOtcDialog
          open
          onOpenChange={(open) => {
            if (!open) closeDialog()
          }}
          offer={localOffer}
          clients={clients}
          accountsForClient={accountsForClient}
          onClientSelect={setSelectedClientId}
          onSubmit={(payload) =>
            buyOnBehalfMutation.mutate(
              { id: localOffer.id, ...payload },
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
      )
    }

    return (
      <BuyOtcDialog
        open
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        offer={localOffer}
        accounts={clientAccounts}
        onSubmit={(payload) =>
          buyMutation.mutate(
            { id: localOffer.id, ...payload },
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
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OTC Trading Portal</h1>
      {data && (
        <OtcPeersStatusBanner
          partial={data.partial}
          peersTotal={data.peers_total}
          peersReached={data.peers_reached}
          lastRefresh={data.last_refresh}
        />
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <OtcOffersTable offers={offers} onBuy={setSelectedOffer} currentUserId={currentUser?.id} />
      )}
      {renderDialog()}
    </div>
  )
}
