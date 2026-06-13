import type { Notification } from '@/types/notification'

export function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: 'money_received',
    title: 'Money Received',
    message: 'You received 5000.00 to account 1234567890.',
    is_read: false,
    ref_type: 'transfer',
    ref_id: 123,
    created_at: '2026-04-09T14:30:00Z',
    ...overrides,
  }
}

export const mockNotifications: Notification[] = [
  createMockNotification({ id: 1, is_read: false }),
  createMockNotification({
    id: 2,
    type: 'card_issued',
    title: 'Card Issued',
    message: 'A new card has been issued.',
    is_read: false,
    created_at: '2026-04-08T09:15:00Z',
  }),
  createMockNotification({
    id: 3,
    type: 'password_changed',
    title: 'Password Changed',
    message: 'Your password was changed.',
    is_read: true,
    created_at: '2026-03-20T08:00:00Z',
  }),
]
