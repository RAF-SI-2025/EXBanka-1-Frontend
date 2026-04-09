export interface CreateChallengeRequest {
  source_service: 'transaction' | 'payment' | 'transfer'
  source_id: number
  method?: 'code_pull'
}

export interface CreateChallengeResponse {
  challenge_id: number
  challenge_data: Record<string, unknown>
  expires_at: string
}

export interface SubmitCodeResponse {
  success: boolean
  remaining_attempts: number
}

export interface ChallengeStatusResponse {
  status: 'pending' | 'verified' | 'expired' | 'failed'
  method: string
  verified_at: string | null
  expires_at: string
}
