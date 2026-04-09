import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployeeLimits,
  updateEmployeeLimits,
  applyLimitTemplate,
  getLimitTemplates,
  createLimitTemplate,
  getClientLimits,
  updateClientLimits,
} from '@/lib/api/limits'
import type {
  UpdateEmployeeLimitsPayload,
  UpdateClientLimitsPayload,
  CreateLimitTemplatePayload,
} from '@/types/limits'

export function useEmployeeLimits(id: number) {
  return useQuery({
    queryKey: ['employeeLimits', id],
    queryFn: () => getEmployeeLimits(id),
    enabled: id > 0,
  })
}

export function useUpdateEmployeeLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeeLimitsPayload }) =>
      updateEmployeeLimits(id, payload),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['employeeLimits', vars.id] }),
  })
}

export function useApplyLimitTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, templateName }: { employeeId: number; templateName: string }) =>
      applyLimitTemplate(employeeId, templateName),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['employeeLimits', vars.employeeId] }),
  })
}

export function useLimitTemplates() {
  return useQuery({ queryKey: ['limitTemplates'], queryFn: getLimitTemplates })
}

export function useCreateLimitTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLimitTemplatePayload) => createLimitTemplate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['limitTemplates'] }),
  })
}

export function useClientLimits(id: number) {
  return useQuery({
    queryKey: ['clientLimits', id],
    queryFn: () => getClientLimits(id),
    enabled: id > 0,
  })
}

export function useUpdateClientLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClientLimitsPayload }) =>
      updateClientLimits(id, payload),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['clientLimits', vars.id] }),
  })
}
