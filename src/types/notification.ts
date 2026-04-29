export type NotificationType =
  | 'account_created'
  | 'card_issued'
  | 'card_blocked'
  | 'money_sent'
  | 'money_received'
  | 'loan_approved'
  | 'loan_rejected'
  | 'password_changed'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  ref_type: string | null
  ref_id: number | null
  created_at: string
}

export interface NotificationListResponse {
  notifications: Notification[]
  total: number
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface NotificationFilters {
  page?: number
  page_size?: number
  read?: 'read' | 'unread'
}
