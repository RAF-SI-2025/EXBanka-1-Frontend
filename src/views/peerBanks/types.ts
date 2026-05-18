export interface PeerBank {
  id: number
  bank_code: string
  routing_number: number
  base_url: string
  api_token_preview: string
  hmac_enabled: boolean
  active: boolean
  created_at: number
  updated_at: number
}

export interface PeerBankListResponse {
  peer_banks: PeerBank[]
}

export interface CreatePeerBankPayload {
  bank_code: string
  routing_number: number
  base_url: string
  api_token: string
  hmac_inbound_key?: string
  hmac_outbound_key?: string
  active: boolean
}

export interface UpdatePeerBankPayload {
  base_url?: string
  api_token?: string
  hmac_inbound_key?: string
  hmac_outbound_key?: string
  active?: boolean
}
