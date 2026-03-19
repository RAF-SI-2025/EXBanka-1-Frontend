import { useMutation } from '@tanstack/react-query'
import { generateVerificationCode, validateVerificationCode } from '@/lib/api/verification'

export function useGenerateVerification() {
  return useMutation({
    mutationFn: generateVerificationCode,
  })
}

export function useValidateVerification() {
  return useMutation({
    mutationFn: validateVerificationCode,
  })
}
