import { render, screen } from '@testing-library/react'
import { OtcPeersStatusBanner } from '@/components/otc/OtcPeersStatusBanner'

describe('OtcPeersStatusBanner', () => {
  it('renders nothing prominent when not partial — only the refresh footer', () => {
    render(
      <OtcPeersStatusBanner
        partial={false}
        peersTotal={2}
        peersReached={2}
        lastRefresh="2026-05-07T21:18:00Z"
      />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/last refreshed/i)).toBeInTheDocument()
  })

  it('shows an alert when partial=true with peers reached / total', () => {
    render(
      <OtcPeersStatusBanner
        partial
        peersTotal={3}
        peersReached={1}
        lastRefresh="2026-05-07T21:18:00Z"
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/showing offers from 1 of 3 banks/i)).toBeInTheDocument()
    expect(screen.getByText(/2 peers unreachable/i)).toBeInTheDocument()
  })

  it('handles empty last_refresh gracefully', () => {
    render(<OtcPeersStatusBanner partial={false} peersTotal={0} peersReached={0} lastRefresh="" />)
    expect(screen.getByText(/awaiting first peer refresh/i)).toBeInTheDocument()
  })
})
