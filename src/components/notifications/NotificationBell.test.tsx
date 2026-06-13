import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NotificationBell } from './NotificationBell'
import * as notificationsApi from '@/lib/api/notifications'
import { mockNotifications } from '@/__tests__/fixtures/notification-fixtures'

jest.mock('@/lib/api/notifications')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
    notifications: mockNotifications,
    total: mockNotifications.length,
  })
})

describe('NotificationBell', () => {
  it('renders a bell button', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
    renderWithProviders(<NotificationBell />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows the unread count badge when count > 0', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 7 })
    renderWithProviders(<NotificationBell />)
    expect(await screen.findByText('7')).toBeInTheDocument()
  })

  it('shows "9+" when unread count exceeds 9', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 42 })
    renderWithProviders(<NotificationBell />)
    expect(await screen.findByText('9+')).toBeInTheDocument()
  })

  it('hides badge when unread count is 0', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
    renderWithProviders(<NotificationBell />)
    await screen.findByRole('button', { name: /notifications/i })
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 1 })
    renderWithProviders(<NotificationBell />)
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    expect(await screen.findByText(mockNotifications[0].title)).toBeInTheDocument()
  })
})
