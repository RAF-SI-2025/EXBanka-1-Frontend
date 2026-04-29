export interface OtcOffer {
  id: number
  ticker: string
  name: string
  security_type: 'stock' | 'futures'
  quantity: number
  price: string
  seller_id: number
}

export interface OtcOfferListResponse {
  offers: OtcOffer[]
  total_count: number
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
  security_type?: string
  ticker?: string
}
