import { useQuery } from '@tanstack/react-query'
import { notificationTemplatesApi } from '@/views/notificationTemplates/api/notificationTemplatesApi'
import type { NotificationChannel, NotificationTemplate } from '@/views/notificationTemplates/types'

export const NOTIFICATION_TEMPLATES_QUERY_KEY = 'notification-templates-view'

export function useNotificationTemplates(channel?: NotificationChannel) {
  return useQuery({
    queryKey: [NOTIFICATION_TEMPLATES_QUERY_KEY, channel ?? 'all'],
    queryFn: () => notificationTemplatesApi.listAll(channel),
  })
}

export function useNotificationTemplate(channel: NotificationChannel, type: string) {
  return useQuery<NotificationTemplate>({
    queryKey: [NOTIFICATION_TEMPLATES_QUERY_KEY, 'one', channel, type],
    queryFn: () => notificationTemplatesApi.getOne(channel, type),
  })
}
