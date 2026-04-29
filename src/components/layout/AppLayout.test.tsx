import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AppLayout } from './AppLayout'
import * as notificationsApi from '@/lib/api/notifications'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/notifications')
jest.mock('@/lib/api/auth', () => ({
  ...jest.requireActual('@/lib/api/auth'),
  logout: jest.fn().mockResolvedValue(undefined),
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(notificationsApi.getUnreadCount).mockResolvedValue({ unread_count: 0 })
})

describe('AppLayout', () => {
  it('renders the notification bell', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>child</div>} />
        </Route>
      </Routes>,
      {
        preloadedState: { auth: createMockAuthState() },
      }
    )
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument()
  })
})
