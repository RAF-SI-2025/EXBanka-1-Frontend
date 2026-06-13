import { apiClient } from '@/lib/api/axios'
import type {
  NotificationListResponse,
  UnreadCountResponse,
  NotificationFilters,
} from '@/types/notification'

export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<NotificationListResponse>('/me/notifications', {
    params: filters,
  })
  return { ...data, notifications: data.notifications ?? [] }
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>('/me/notifications/unread-count')
  return data
}

export async function markNotificationRead(id: number): Promise<{ success: boolean }> {
  const { data } = await apiClient.post<{ success: boolean }>(`/me/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead(): Promise<{
  success: boolean
  count: number
}> {
  const { data } = await apiClient.post<{ success: boolean; count: number }>(
    '/me/notifications/read-all'
  )
  return data
}
