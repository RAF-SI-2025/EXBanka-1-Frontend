// Self-contained types for the Notification Templates view module.
// All shapes mirror the §15 contract in docs/REST_API_v3.md.

export type NotificationChannel = 'email' | 'push'

export interface TemplateVariable {
  name: string
  description: string
  example: string
}

export interface NotificationTemplate {
  type: string
  channel: NotificationChannel
  description: string
  variables: TemplateVariable[]
  default_subject: string
  default_body: string
  current_subject: string
  current_body: string
  is_customized: boolean
}

export interface NotificationTemplatesResponse {
  templates: NotificationTemplate[]
}

export interface UpdateTemplatePayload {
  subject: string
  body: string
}

// The view's channel-filter UI surfaces three options. 'all' is the local-only
// "no filter" value — the API simply omits the `channel` query parameter.
export type ChannelFilter = 'all' | NotificationChannel

export interface TemplateKey {
  channel: NotificationChannel
  type: string
}
