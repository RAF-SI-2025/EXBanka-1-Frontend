import { apiClient } from '@/lib/api/axios'
import type {
  GenerateVerificationRequest,
  GenerateVerificationResponse,
  ValidateVerificationRequest,
  ValidateVerificationResponse,
} from '@/types/verification'

export async function generateVerificationCode(
  payload: GenerateVerificationRequest
): Promise<GenerateVerificationResponse> {
  const { data } = await apiClient.post('/api/verification', payload)
  return data
}

export async function validateVerificationCode(
  payload: ValidateVerificationRequest
): Promise<ValidateVerificationResponse> {
  const { data } = await apiClient.post('/api/verification/validate', payload)
  return data
}
