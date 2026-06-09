import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NotificationDropdown } from './NotificationDropdown'
import * as notificationsApi from '@/lib/api/notifications'
import {
  mockNotifications,
  createMockNotification,
} from '@/__tests__/fixtures/notification-fixtures'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@/lib/api/notifications')

beforeEach(() => {
  jest.clearAllMocks()
  mockNavigate.mockClear()
  jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
    notifications: mockNotifications,
    total: mockNotifications.length,
  })
  jest.mocked(notificationsApi.markNotificationRead).mockResolvedValue({ success: true })
  jest
    .mocked(notificationsApi.markAllNotificationsRead)
    .mockResolvedValue({ success: true, count: 2 })
})

describe('NotificationDropdown', () => {
  it('shows loading state initially', () => {
    jest.mocked(notificationsApi.getNotifications).mockReturnValue(new Promise(() => {}))
    renderWithProviders(<NotificationDropdown />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders notifications list', async () => {
    renderWithProviders(<NotificationDropdown />)
    expect(await screen.findByText(mockNotifications[0].title)).toBeInTheDocument()
  })

  it('shows empty state when there are no notifications', async () => {
    jest
      .mocked(notificationsApi.getNotifications)
      .mockResolvedValue({ notifications: [], total: 0 })
    renderWithProviders(<NotificationDropdown />)
    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument()
  })

  it('marks a notification read when an unread item is clicked', async () => {
    renderWithProviders(<NotificationDropdown />)
    const item = await screen.findByRole('button', { name: mockNotifications[0].title })
    fireEvent.click(item)
    await waitFor(() =>
      expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(mockNotifications[0].id)
    )
  })

  it('marks all read when "Mark all as read" is clicked', async () => {
    renderWithProviders(<NotificationDropdown />)
    await screen.findByText(mockNotifications[0].title)
    fireEvent.click(screen.getByRole('button', { name: /mark all as read/i }))
    await waitFor(() => expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalledTimes(1))
  })

  it('navigates to /otc/options when an OTC counter notification is clicked', async () => {
    const otcNotification = createMockNotification({
      id: 10,
      type: 'OTC_OFFER_COUNTERED',
      title: 'Counter received',
      message: 'The owner countered your bid.',
      is_read: false,
      ref_type: 'otc_negotiation',
      ref_id: null,
    })
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: [otcNotification],
      total: 1,
    })

    renderWithProviders(<NotificationDropdown />)
    const item = await screen.findByRole('button', { name: /counter received/i })
    fireEvent.click(item)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/otc/options'))
  })

  it('does not navigate for standard (non-OTC) notification types', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: [createMockNotification({ id: 5, type: 'money_received', is_read: false })],
      total: 1,
    })

    renderWithProviders(<NotificationDropdown />)
    const item = await screen.findByRole('button', { name: /money received/i })
    fireEvent.click(item)
    await waitFor(() => expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(5))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('hides "Mark all as read" when there are no unread items', async () => {
    jest.mocked(notificationsApi.getNotifications).mockResolvedValue({
      notifications: [{ ...mockNotifications[2], is_read: true }],
      total: 1,
    })
    renderWithProviders(<NotificationDropdown />)
    await screen.findByText(mockNotifications[2].title)
    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument()
  })
})
