export type OtcStockDirection = 'sell' | 'buy'

export interface OtcLocalOffer {
  kind: 'local'
  bank_code: string
  id: number
  seller_id: number
  seller_name: string
  /** Optional party type so UI can tell client-owned from bank-owned listings. */
  seller_type?: 'client' | 'bank' | 'employee'
  security_type: 'stock' | 'futures'
  ticker: string
  name: string
  quantity: number
  price_per_unit: string
  created_at: string
  /** Phase 8: /otc/stocks may carry sell- or buy-direction listings. */
  direction?: OtcStockDirection
}

export interface OtcRemoteOffer {
  kind: 'remote'
  bank_code: string
  owner_id: string
  security_type: 'stock' | 'futures'
  ticker: string
  quantity: number
  price_per_unit: string
  currency: string
  direction?: OtcStockDirection
}

export type OtcOffer = OtcLocalOffer | OtcRemoteOffer

export interface OtcOfferListResponse {
  offers: OtcOffer[]
  total_count: number
  peers_total: number
  peers_reached: number
  partial: boolean
  last_refresh: string
}

export interface OtcBuyRequest {
  quantity: number
  account_id: number
}

export interface OtcBuyOnBehalfRequest {
  client_id: number
  account_id: number
  quantity: number
}

export interface OtcFilters {
  page?: number
  page_size?: number
  security_type?: 'stock' | 'futures'
  ticker?: string
  kind?: 'local' | 'remote'
  bank_code?: string
}

export interface MoneyAmount {
  amount: string
  currency: string
}

export interface PeerOtcNegotiationRequest {
  seller_bank_code: string
  seller_id: string
  stock: { ticker: string }
  amount: number
  settlement_date: string
  price_per_unit: MoneyAmount
  premium: MoneyAmount
}

export interface PeerOtcNegotiationResponse {
  routingNumber: number
  id: string
}
