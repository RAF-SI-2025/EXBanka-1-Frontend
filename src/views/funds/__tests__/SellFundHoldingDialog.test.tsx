import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { SellFundHoldingDialog } from '@/views/funds/components/SellFundHoldingDialog'
import { createMockFundHolding } from '@/__tests__/fixtures/fund-fixtures'
import { createMockStock } from '@/__tests__/fixtures/security-fixtures'
import { createMockOrder } from '@/__tests__/fixtures/order-fixtures'
import * as ordersApi from '@/lib/api/orders'
import * as securitiesApi from '@/lib/api/securities'
import * as errors from '@/lib/errors'

jest.mock('@/lib/api/orders')
jest.mock('@/lib/api/securities')
jest.mock('@/lib/errors', () => ({
  ...jest.requireActual('@/lib/errors'),
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}))

const mockedGetStocks = jest.mocked(securitiesApi.getStocks)
const mockedGetFutures = jest.mocked(securitiesApi.getFutures)
const mockedCreateOrderOnBehalfFund = jest.mocked(ordersApi.createOrderOnBehalfFund)

const holding = createMockFundHolding({
  security_type: 'stock',
  security_id: 42,
  ticker: 'AAPL',
  quantity: '100',
})

function setup(overrides: Partial<React.ComponentProps<typeof SellFundHoldingDialog>> = {}) {
  const onOpenChange = jest.fn()
  renderWithProviders(
    <SellFundHoldingDialog
      open
      onOpenChange={onOpenChange}
      holding={holding}
      fundId={9}
      fundName="Alpha Growth Fund"
      {...overrides}
    />
  )
  return { onOpenChange }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedGetStocks.mockResolvedValue({
    stocks: [createMockStock({ ticker: 'AAPL', listing_id: 42, exchange_acronym: 'NASDAQ' })],
    total_count: 1,
  })
  mockedGetFutures.mockResolvedValue({ futures: [], total_count: 0 })
  mockedCreateOrderOnBehalfFund.mockResolvedValue(createMockOrder())
})

describe('SellFundHoldingDialog', () => {
  it('submits a market sell on behalf of the fund with the resolved listing', async () => {
    const { onOpenChange } = setup()

    await screen.findByRole('option', { name: /NASDAQ — AAPL/ })
    fireEvent.click(screen.getByRole('button', { name: /place sell order/i }))

    await waitFor(() => {
      expect(mockedCreateOrderOnBehalfFund).toHaveBeenCalledTimes(1)
    })
    expect(mockedCreateOrderOnBehalfFund).toHaveBeenCalledWith({
      on_behalf_of_fund_id: 9,
      listing_id: 42,
      direction: 'sell',
      order_type: 'market',
      quantity: 100,
      security_type: 'stock',
    })
    await waitFor(() => {
      expect(errors.notifySuccess).toHaveBeenCalledWith('Sell order placed for 100 AAPL')
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables submit when the quantity exceeds the holding', async () => {
    setup()

    await screen.findByRole('option', { name: /NASDAQ — AAPL/ })
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '101' } })

    expect(screen.getByRole('button', { name: /place sell order/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /place sell order/i }))
    expect(mockedCreateOrderOnBehalfFund).not.toHaveBeenCalled()
  })

  it('shows a no-venue message and disables submit when no listing resolves', async () => {
    mockedGetStocks.mockResolvedValue({ stocks: [], total_count: 0 })
    setup()

    await screen.findByText(/no sell venue found for AAPL/i)
    expect(screen.getByRole('button', { name: /place sell order/i })).toBeDisabled()
  })
})
