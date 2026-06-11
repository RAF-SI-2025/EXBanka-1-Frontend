import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { OtcView } from '@/views/otc/OtcView'

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/otc" element={<OtcView />}>
          <Route path="options" element={<p>options-panel</p>} />
          <Route path="contracts" element={<p>contracts-panel</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('OtcView', () => {
  it('renders the OTC title + the two tab labels (no legacy Market portal tab)', () => {
    renderAt('/otc/options')
    expect(screen.getByRole('heading', { name: 'OTC Trading', level: 1 })).toBeInTheDocument()
    // The options marketplace tab is now labelled "Market".
    expect(screen.getByRole('tab', { name: 'Market' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Contracts' })).toBeInTheDocument()
    // The old standalone "Options" label is gone.
    expect(screen.queryByRole('tab', { name: 'Options' })).not.toBeInTheDocument()
  })

  it('renders the panel matching the current sub-route', () => {
    renderAt('/otc/options')
    expect(screen.getByText('options-panel')).toBeInTheDocument()
    expect(screen.queryByText('contracts-panel')).not.toBeInTheDocument()
  })

  it('the "Market" tab points at the options sub-route', () => {
    renderAt('/otc/contracts')
    expect(screen.getByText('contracts-panel')).toBeInTheDocument()
    return userEvent.click(screen.getByRole('tab', { name: 'Market' })).then(async () => {
      expect(await screen.findByText('options-panel')).toBeInTheDocument()
    })
  })

  it('navigates to the corresponding sub-route when a tab is clicked', async () => {
    renderAt('/otc/options')
    await userEvent.click(screen.getByRole('tab', { name: 'Contracts' }))
    expect(await screen.findByText('contracts-panel')).toBeInTheDocument()
  })

  it('wraps the outlet in an animated container', () => {
    renderAt('/otc/options')
    expect(screen.getByTestId('otc-view')).toHaveClass('animate-in')
  })
})
