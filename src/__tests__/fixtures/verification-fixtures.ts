import type {
  CreateChallengeResponse,
  SubmitCodeResponse,
  ChallengeStatusResponse,
} from '@/types/verification'

export function createMockChallengeResponse(
  overrides: Partial<CreateChallengeResponse> = {}
): CreateChallengeResponse {
  return {
    challenge_id: 123,
    challenge_data: {},
    expires_at: '2026-03-19T10:10:00Z',
    ...overrides,
  }
}

export function createMockSubmitCodeResponse(
  overrides: Partial<SubmitCodeResponse> = {}
): SubmitCodeResponse {
  return {
    success: true,
    remaining_attempts: 2,
    ...overrides,
  }
}

export function createMockChallengeStatusResponse(
  overrides: Partial<ChallengeStatusResponse> = {}
): ChallengeStatusResponse {
  return {
    status: 'verified',
    method: 'email',
    verified_at: '2026-03-19T10:06:00Z',
    expires_at: '2026-03-19T10:10:00Z',
    ...overrides,
  }
}
