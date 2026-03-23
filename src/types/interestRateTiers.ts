export interface InterestRateTier {
  id: number
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
}

export interface CreateTierPayload {
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
}
