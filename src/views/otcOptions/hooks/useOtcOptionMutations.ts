import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { OTC_OPTIONS_QUERY_KEY } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { notifySuccess, parseApiError } from '@/lib/errors'
import type {
  AcceptNegotiationPayload,
  CounterNegotiationPayload,
  CreateOtcOptionPayload,
  UpdateOtcOptionPayload,
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

export function useUpdateOtcOption() {
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: ({ offerId, payload }: { offerId: number; payload: UpdateOtcOptionPayload }) =>
      otcOptionsApi.updateListing(offerId, payload),
    onSuccess: (_d, { offerId }) => {
      notifySuccess('Amount updated')
      invalidate(offerId)
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
      if (data.contract) {
        // Local (intra-bank) accept: the formation saga ran inline and minted
        // the contract synchronously (spec §47.2 stage 2).
        notifySuccess(`Contract #${data.contract.id} minted`)
      } else {
        // Cross-bank accept: the contract is minted asynchronously on the
        // counterparty bank via SI-TX settlement, so it isn't in this
        // synchronous response (it carries `cross_bank_transaction_id`
        // instead). This is NOT an abort — a real saga abort is a 412 and lands
        // in `onError`, never here as a 200 with `contract: null`.
        notifySuccess(
          'Negotiation accepted — the cross-bank contract is settling and will appear in your contracts shortly.'
        )
      }
      invalidate(offerId)
    },
    onError: (err) => {
      // Genuine local-abort path (HTTP 412): the saga rolled back because the
      // seller was short on shares or the buyer short on premium. Surface the
      // backend's real reason so the "insufficient shares/premium" wording only
      // appears when it is actually true.
      const { message } = parseApiError(err)
      toast.error("Couldn't form the contract", { description: message })
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
