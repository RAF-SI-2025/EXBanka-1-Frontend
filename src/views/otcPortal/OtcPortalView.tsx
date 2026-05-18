import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { notifySuccess } from '@/lib/errors'
import type { OtcOffer, OtcLocalOffer, OtcRemoteOffer } from '@/types/otc'
import { BuyOnBehalfOtcDialog } from '@/views/otcPortal/components/BuyOnBehalfOtcDialog'
import { BuyOtcDialog } from '@/views/otcPortal/components/BuyOtcDialog'
import { BuyRemoteOtcDialog } from '@/views/otcPortal/components/BuyRemoteOtcDialog'
import { OtcOffersTable } from '@/views/otcPortal/components/OtcOffersTable'
import { OtcPeersStatusBanner } from '@/views/otcPortal/components/OtcPeersStatusBanner'
import { LoadingState, ViewShell } from '@/views/shared'

export function OtcPortalView() {
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
    <ViewShell
      title="OTC Trading Portal"
      subtitle="Browse local and peer-bank OTC offers; buy directly or negotiate cross-bank deals."
    >
      {data && (
        <OtcPeersStatusBanner
          partial={data.partial}
          peersTotal={data.peers_total}
          peersReached={data.peers_reached}
          lastRefresh={data.last_refresh}
        />
      )}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <OtcOffersTable
              offers={offers}
              onBuy={setSelectedOffer}
              currentUserId={currentUser?.id}
              isCurrentUserEmployee={isEmployee}
            />
          )}
        </CardContent>
      </Card>
      {renderDialog()}
    </ViewShell>
  )
}
