import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MyFundsList } from './MyFundsList'
import { createMockClientFundPosition } from '@/__tests__/fixtures/fund-fixtures'

function renderList(props: Partial<React.ComponentProps<typeof MyFundsList>> = {}) {
  const defaults = {
    positions: [createMockClientFundPosition()],
    onInvest: jest.fn(),
    onRedeem: jest.fn(),
  }
  const merged = { ...defaults, ...props }
  render(
    <MemoryRouter>
      <MyFundsList {...merged} />
    </MemoryRouter>
  )
  return merged
}

describe('MyFundsList', () => {
  it('shows empty state when there are no positions', () => {
    renderList({ positions: [] })
    expect(screen.getByText(/no positions/i)).toBeInTheDocument()
  })

  it('renders the fund name and current value', () => {
    renderList()
    expect(screen.getByText('Alpha Growth Fund')).toBeInTheDocument()
    expect(screen.getByText('27000.00 RSD')).toBeInTheDocument()
  })

  it('fires onInvest with the position', () => {
    const position = createMockClientFundPosition({ fund_id: 9 })
    const onInvest = jest.fn()
    renderList({ positions: [position], onInvest })
    fireEvent.click(screen.getByRole('button', { name: /invest/i }))
    expect(onInvest).toHaveBeenCalledWith(position)
  })

  it('fires onRedeem with the position', () => {
    const position = createMockClientFundPosition({ fund_id: 9 })
    const onRedeem = jest.fn()
    renderList({ positions: [position], onRedeem })
    fireEvent.click(screen.getByRole('button', { name: /redeem/i }))
    expect(onRedeem).toHaveBeenCalledWith(position)
  })
})
