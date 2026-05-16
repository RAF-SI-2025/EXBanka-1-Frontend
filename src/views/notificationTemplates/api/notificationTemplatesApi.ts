// Self-contained API surface for the Notification Templates view module.
// Only external dependency is the shared axios instance.

import { apiClient } from '@/lib/api/axios'
import type {
  NotificationChannel,
  NotificationTemplate,
  NotificationTemplatesResponse,
  UpdateTemplatePayload,
} from '@/views/notificationTemplates/types'

async function listAll(channel?: NotificationChannel): Promise<NotificationTemplatesResponse> {
  const { data } = await apiClient.get<NotificationTemplatesResponse>('/notification-templates', {
    params: channel ? { channel } : undefined,
  })
  return { templates: data.templates ?? [] }
}

async function getOne(channel: NotificationChannel, type: string): Promise<NotificationTemplate> {
  const { data } = await apiClient.get<NotificationTemplate>(
    `/notification-templates/${channel}/${encodeURIComponent(type)}`
  )
  return data
}

async function update(
  channel: NotificationChannel,
  type: string,
  payload: UpdateTemplatePayload
): Promise<NotificationTemplate> {
  const { data } = await apiClient.put<NotificationTemplate>(
    `/notification-templates/${channel}/${encodeURIComponent(type)}`,
    payload
  )
  return data
}

async function revert(channel: NotificationChannel, type: string): Promise<NotificationTemplate> {
  const { data } = await apiClient.delete<NotificationTemplate>(
    `/notification-templates/${channel}/${encodeURIComponent(type)}`
  )
  return data
}

export const notificationTemplatesApi = {
  listAll,
  getOne,
  update,
  revert,
}
