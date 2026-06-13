import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationItem } from './NotificationItem'
import { createMockNotification } from '@/__tests__/fixtures/notification-fixtures'

describe('NotificationItem', () => {
  it('renders title and message', () => {
    const n = createMockNotification({ title: 'Money Received', message: 'You received 5000.' })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.getByText('Money Received')).toBeInTheDocument()
    expect(screen.getByText('You received 5000.')).toBeInTheDocument()
  })

  it('shows an unread indicator when is_read=false', () => {
    const n = createMockNotification({ is_read: false })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.getByTestId('unread-dot')).toBeInTheDocument()
  })

  it('omits the unread indicator when is_read=true', () => {
    const n = createMockNotification({ is_read: true })
    render(<NotificationItem notification={n} onClick={() => {}} />)
    expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument()
  })

  it('calls onClick with the notification when clicked', () => {
    const onClick = jest.fn()
    const n = createMockNotification({ id: 99, title: 'Money Received' })
    render(<NotificationItem notification={n} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /money received/i }))
    expect(onClick).toHaveBeenCalledWith(n)
  })
})
