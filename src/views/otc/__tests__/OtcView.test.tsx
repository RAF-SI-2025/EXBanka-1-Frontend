import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { OtcView } from '@/views/otc/OtcView'

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/otc" element={<OtcView />}>
          <Route path="market" element={<p>market-panel</p>} />
          <Route path="options" element={<p>options-panel</p>} />
          <Route path="contracts" element={<p>contracts-panel</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('OtcView', () => {
  it('renders the OTC title + all tab labels', () => {
    renderAt('/otc/market')
    expect(screen.getByRole('heading', { name: 'OTC Trading', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Market' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Options' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Contracts' })).toBeInTheDocument()
  })

  it('renders the panel matching the current sub-route', () => {
    renderAt('/otc/options')
    expect(screen.getByText('options-panel')).toBeInTheDocument()
    expect(screen.queryByText('market-panel')).not.toBeInTheDocument()
  })

  it('navigates to the corresponding sub-route when a tab is clicked', async () => {
    renderAt('/otc/market')
    await userEvent.click(screen.getByRole('tab', { name: 'Contracts' }))
    expect(await screen.findByText('contracts-panel')).toBeInTheDocument()
  })

  it('wraps the outlet in an animated container', () => {
    renderAt('/otc/market')
    expect(screen.getByTestId('otc-view')).toHaveClass('animate-in')
  })
})
