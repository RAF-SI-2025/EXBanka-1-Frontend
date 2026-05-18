import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import { OTC_OPTIONS_QUERY_KEY } from '@/views/otcOptions/hooks/useOtcOptionsLists'
import { notifySuccess } from '@/lib/errors'
import type { BidOrCounterInput, OtcNegotiation, OtcParty } from '@/views/otcOptions/types'

type BidOrCounterResult = { mode: 'bid' | 'counter'; negotiation: OtcNegotiation }

function partiesMatch(a: OtcParty, b: OtcParty): boolean {
  return a.owner_type === b.owner_type && a.owner_id === b.owner_id
}

// Tries POST /otc/options/:id/bid first. On 409 (caller already has a chain
// on this listing), looks up the existing chain via
// GET /otc/options/:id/negotiations and reroutes the same terms into
// POST /me/otc/options/:id/negotiations/:nid/counter.
export function useBidOrCounter() {
  const qc = useQueryClient()

  return useMutation<BidOrCounterResult, unknown, BidOrCounterInput>({
    mutationFn: async (input) => {
      const body = {
        bidder_account_id: input.account_id,
        quantity: input.quantity,
        strike_price: input.strike_price,
        premium: input.premium,
        settlement_date: input.settlement_date,
      }

      try {
        const { negotiation } = await otcOptionsApi.placeBid(input.offer_id, body)
        return { mode: 'bid', negotiation }
      } catch (err) {
        if (!isAxiosError(err) || err.response?.status !== 409) throw err

        const { negotiations } = await otcOptionsApi.listNegotiations(input.offer_id)
        const ownChain: OtcNegotiation | undefined = negotiations.find((n) =>
          partiesMatch(n.bidder, input.bidder)
        )
        if (!ownChain) {
          throw new Error(
            'Backend reported an existing chain, but we could not find it. Refresh and try again.'
          )
        }

        const { negotiation } = await otcOptionsApi.counter(input.offer_id, ownChain.id, {
          quantity: input.quantity,
          strike_price: input.strike_price,
          premium: input.premium,
          settlement_date: input.settlement_date,
        })
        return { mode: 'counter', negotiation }
      }
    },
    onSuccess: (data, vars) => {
      notifySuccess(data.mode === 'bid' ? 'Bid placed' : 'Counter sent on your existing chain')
      qc.invalidateQueries({ queryKey: [OTC_OPTIONS_QUERY_KEY] })
      qc.invalidateQueries({
        queryKey: [OTC_OPTIONS_QUERY_KEY, 'negotiations', vars.offer_id],
      })
    },
  })
}
