export type CardRequestStatus = 'pending' | 'approved' | 'rejected'

export interface CardRequest {
  id: number
  client_id: number
  account_number: string
  card_brand: string
  card_type: string
  card_name: string
  status: CardRequestStatus
  reason: string
  approved_by: number
  created_at: string
  updated_at: string
}

export interface CardRequestListResponse {
  requests: CardRequest[]
  total: number
}

export interface CardRequestFilters {
  status?: CardRequestStatus
  page?: number
  page_size?: number
}
