import type { GenerateVerificationResponse } from '@/types/verification'

export function createMockVerificationResponse(
  overrides: Partial<GenerateVerificationResponse> = {}
): GenerateVerificationResponse {
  return {
    code: '847291',
    expires_at: '2026-03-19T10:10:00Z',
    ...overrides,
  }
}
