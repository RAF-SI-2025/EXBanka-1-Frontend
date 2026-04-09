import { apiClient } from '@/lib/api/axios'
import type {
  CreateChallengeRequest,
  CreateChallengeResponse,
  SubmitCodeResponse,
  ChallengeStatusResponse,
} from '@/types/verification'

export async function createChallenge(
  payload: CreateChallengeRequest
): Promise<CreateChallengeResponse> {
  const { data } = await apiClient.post<CreateChallengeResponse>('/api/v1/verifications', payload)
  return data
}

export async function submitVerificationCode(
  challengeId: number,
  code: string
): Promise<SubmitCodeResponse> {
  const { data } = await apiClient.post<SubmitCodeResponse>(
    `/api/v1/verifications/${challengeId}/code`,
    { code }
  )
  return data
}

export async function getChallengeStatus(challengeId: number): Promise<ChallengeStatusResponse> {
  const { data } = await apiClient.get<ChallengeStatusResponse>(
    `/api/v1/verifications/${challengeId}/status`
  )
  return data
}
