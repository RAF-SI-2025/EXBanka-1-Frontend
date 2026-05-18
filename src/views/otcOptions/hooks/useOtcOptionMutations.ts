import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { OTC_OPTIONS_QUERY_KEY } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { notifySuccess } from '@/lib/errors'
import type {
  AcceptNegotiationPayload,
  CounterNegotiationPayload,
  CreateOtcOptionPayload,
} from '@/views/otcOptions/types'

function useInvalidateLists() {
  const qc = useQueryClient()
  return (offerId?: number) => {
    qc.invalidateQueries({ queryKey: [OTC_OPTIONS_QUERY_KEY] })
    if (offerId != null) {
      qc.invalidateQueries({
        queryKey: [OTC_OPTIONS_QUERY_KEY, 'negotiations', offerId],
      })
    }
  }
}

export function useCreateOtcOption() {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: (payload: CreateOtcOptionPayload) => otcOptionsApi.createListing(payload),
    onSuccess: () => {
      notifySuccess('Listing posted')
      invalidate()
    },
  })
}

export function useCancelOtcOption() {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: (offerId: number) => otcOptionsApi.cancelListing(offerId),
    onSuccess: (_d, offerId) => {
      notifySuccess('Listing cancelled')
      invalidate(offerId)
    },
  })
}

export function useAcceptNegotiation(offerId: number) {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: ({
      negotiationId,
      payload,
    }: {
      negotiationId: number
      payload: AcceptNegotiationPayload
    }) => otcOptionsApi.acceptNegotiation(offerId, negotiationId, payload),
    onSuccess: (data) => {
      // Spec §47.2 stage 2: the accept may flip the negotiation to `accepted`
      // but the contract-formation saga can still abort (seller short on
      // shares / buyer short on cash). In that case the parent is consumed,
      // siblings are cancelled, but no contract is minted — surface a warning,
      // not a celebratory success.
      if (data.contract) {
        notifySuccess(`Contract #${data.contract.id} minted`)
      } else {
        toast.warning('Negotiation accepted, but contract was not formed', {
          description:
            'The formation saga aborted (insufficient shares or premium). The listing is consumed — consider re-listing.',
        })
      }
      invalidate(offerId)
    },
  })
}

export function useRejectNegotiation(offerId: number) {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: (negotiationId: number) => otcOptionsApi.rejectNegotiation(offerId, negotiationId),
    onSuccess: () => {
      notifySuccess('Bid rejected')
      invalidate(offerId)
    },
  })
}

export function useCounterNegotiation(offerId: number) {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: ({
      negotiationId,
      payload,
    }: {
      negotiationId: number
      payload: CounterNegotiationPayload
    }) => otcOptionsApi.counter(offerId, negotiationId, payload),
    onSuccess: () => {
      notifySuccess('Counter sent')
      invalidate(offerId)
    },
  })
}

export function useWithdrawNegotiation(offerId: number) {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: (negotiationId: number) =>
      otcOptionsApi.withdrawNegotiation(offerId, negotiationId),
    onSuccess: () => {
      notifySuccess('Bid withdrawn')
      invalidate(offerId)
    },
  })
}
