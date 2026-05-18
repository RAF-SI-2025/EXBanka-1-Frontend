import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationTemplatesApi } from '@/views/notificationTemplates/api/notificationTemplatesApi'
import { NOTIFICATION_TEMPLATES_QUERY_KEY } from '@/views/notificationTemplates/hooks/useNotificationTemplatesLists'
import { notifySuccess } from '@/lib/errors'
import type {
  NotificationChannel,
  UpdateTemplatePayload,
} from '@/views/notificationTemplates/types'

function useInvalidateTemplates() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [NOTIFICATION_TEMPLATES_QUERY_KEY] })
}

interface UpdateArgs {
  channel: NotificationChannel
  type: string
  payload: UpdateTemplatePayload
}

export function useUpdateNotificationTemplate() {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: ({ channel, type, payload }: UpdateArgs) =>
      notificationTemplatesApi.update(channel, type, payload),
    onSuccess: () => {
      notifySuccess('Template saved')
      invalidate()
    },
  })
}

interface RevertArgs {
  channel: NotificationChannel
  type: string
}

export function useRevertNotificationTemplate() {
  const invalidate = useInvalidateTemplates()
  return useMutation({
    mutationFn: ({ channel, type }: RevertArgs) => notificationTemplatesApi.revert(channel, type),
    onSuccess: () => {
      notifySuccess('Template reverted to default')
      invalidate()
    },
  })
}
