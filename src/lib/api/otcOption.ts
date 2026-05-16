import { apiClient } from '@/lib/api/axios'
import type {
  ExerciseContractPayload,
  ExerciseOtcContractResponse,
  MyContractsFilters,
  MyOtcContractsResponse,
  OptionContract,
  OtcParty,
} from '@/types/otcOption'

// The backend ships contract rows with flat `buyer_owner_type` /
// `buyer_owner_id` (+ seller equivalents) fields, a `ticker` (the
// human-readable stock symbol), and `premium_paid` (instead of `premium`)
// per REST_API_v3.md §7874. Downstream consumers (OtcContractsTable, the
// Exercise dialog, the contract detail page, etc.) expect nested
// `buyer` / `seller` OtcParty objects and a `premium` field, so we normalise
// on the way out. Mirrors `normalizeNegotiation` in
// src/views/otcOptions/api/otcOptionsApi.ts.
type RawOptionContract = Omit<Partial<OptionContract>, 'buyer' | 'seller'> & {
  buyer?: OtcParty
  seller?: OtcParty
  buyer_owner_type?: string | null
  buyer_owner_id?: number | string | null
  seller_owner_type?: string | null
  seller_owner_id?: number | string | null
  ticker?: string
  premium_paid?: string
}

function buildParty(
  ownerType: string | null | undefined,
  ownerId: number | string | null | undefined
): OtcParty {
  const t = (ownerType as OtcParty['owner_type']) || 'client'
  const id =
    ownerId == null || ownerId === ''
      ? null
      : typeof ownerId === 'number'
        ? ownerId
        : Number.isNaN(Number(ownerId))
          ? null
          : Number(ownerId)
  return { owner_type: t, owner_id: id }
}

function normalizeContract(raw: RawOptionContract): OptionContract {
  const buyer: OtcParty = raw.buyer ?? buildParty(raw.buyer_owner_type, raw.buyer_owner_id)
  const seller: OtcParty = raw.seller ?? buildParty(raw.seller_owner_type, raw.seller_owner_id)
  return {
    id: raw.id ?? 0,
    status: raw.status ?? 'ACTIVE',
    ticker: raw.ticker ?? '',
    quantity: raw.quantity ?? '',
    strike_price: raw.strike_price ?? '',
    // Prefer the wire field `premium_paid`; fall back to the already-nested
    // `premium` to stay compatible with fixtures using the post-normalised
    // shape (e.g. createMockOptionContract).
    premium: raw.premium_paid ?? raw.premium ?? '',
    settlement_date: raw.settlement_date ?? '',
    buyer,
    seller,
  }
}

export async function getOtcOptionContract(id: number): Promise<{ contract: OptionContract }> {
  const { data } = await apiClient.get<{ contract: RawOptionContract }>(`/otc/contracts/${id}`)
  return { contract: normalizeContract(data.contract) }
}

export async function getMyOtcOptionContracts(
  filters: MyContractsFilters = {}
): Promise<MyOtcContractsResponse> {
  const { data } = await apiClient.get<
    Omit<MyOtcContractsResponse, 'contracts'> & { contracts?: RawOptionContract[] }
  >('/me/otc/contracts', {
    params: filters,
  })
  return { ...data, contracts: (data.contracts ?? []).map(normalizeContract) }
}

export async function exerciseOtcOptionContract(
  id: number,
  payload: ExerciseContractPayload
): Promise<ExerciseOtcContractResponse> {
  const { data } = await apiClient.post<
    Omit<ExerciseOtcContractResponse, 'contract'> & { contract: RawOptionContract }
  >(`/otc/contracts/${id}/exercise`, payload)
  return { ...data, contract: normalizeContract(data.contract) }
}
