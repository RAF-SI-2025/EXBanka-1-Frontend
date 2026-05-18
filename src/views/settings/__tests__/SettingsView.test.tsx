import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SettingsView } from '@/views/settings/SettingsView'

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/admin/settings" element={<SettingsView />}>
          <Route path="notifications" element={<p>notifications-panel</p>} />
          <Route path="fees" element={<p>fees-panel</p>} />
          <Route path="roles" element={<p>roles-panel</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('SettingsView', () => {
  it('renders the Settings title + all tab labels', () => {
    renderAt('/admin/settings/notifications')
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Transfer Fees' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Peer Banks' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Roles & Permissions' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Interest Rates' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Employee Limits' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Client Limits' })).toBeInTheDocument()
  })

  it('renders the child route inside the outlet', () => {
    renderAt('/admin/settings/notifications')
    expect(screen.getByText('notifications-panel')).toBeInTheDocument()
  })

  it('renders the panel matching the current sub-route', () => {
    renderAt('/admin/settings/fees')
    expect(screen.getByText('fees-panel')).toBeInTheDocument()
    expect(screen.queryByText('notifications-panel')).not.toBeInTheDocument()
  })

  it('navigates to the corresponding sub-route when a tab is clicked', async () => {
    renderAt('/admin/settings/notifications')
    await userEvent.click(screen.getByRole('tab', { name: 'Roles & Permissions' }))
    expect(await screen.findByText('roles-panel')).toBeInTheDocument()
  })

  it('wraps the outlet in an animated container', () => {
    renderAt('/admin/settings/notifications')
    expect(screen.getByTestId('settings-view')).toHaveClass('animate-in')
  })
})
