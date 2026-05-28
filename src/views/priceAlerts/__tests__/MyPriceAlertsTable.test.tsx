import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { MyPriceAlertsTable } from '@/views/priceAlerts/components/MyPriceAlertsTable'
import { createMockPriceAlert } from '@/__tests__/fixtures/priceAlert-fixtures'
import * as securitiesApi from '@/lib/api/securities'

jest.mock('@/lib/api/securities')

beforeEach(() => {
  jest.mocked(securitiesApi.getStocks).mockResolvedValue({ stocks: [], total_count: 0 })
  jest.mocked(securitiesApi.getFutures).mockResolvedValue({ futures: [], total_count: 0 })
  jest.mocked(securitiesApi.getForexPairs).mockResolvedValue({ forex_pairs: [], total_count: 0 })
})

function setup(overrides: Partial<React.ComponentProps<typeof MyPriceAlertsTable>> = {}) {
  const defaults = {
    alerts: [createMockPriceAlert()],
    onPause: jest.fn(),
    onResume: jest.fn(),
    onDelete: jest.fn(),
    busyId: undefined,
  }
  const props = { ...defaults, ...overrides }
  renderWithProviders(<MyPriceAlertsTable {...props} />)
  return props
}

describe('MyPriceAlertsTable', () => {
  it('shows an empty-state message when there are no alerts', () => {
    setup({ alerts: [] })
    expect(screen.getByText(/no price alerts/i)).toBeInTheDocument()
  })

  it('renders one row per alert with condition + threshold + status', () => {
    setup({
      alerts: [
        createMockPriceAlert({ id: 1, condition: 'gte', threshold: '200.00', active: true }),
        createMockPriceAlert({ id: 2, condition: 'lte', threshold: '50.00', active: false }),
      ],
    })
    expect(screen.getByText(/≥ 200\.00/)).toBeInTheDocument()
    expect(screen.getByText(/≤ 50\.00/)).toBeInTheDocument()
    expect(screen.getByText(/active/i)).toBeInTheDocument()
    expect(screen.getByText(/paused/i)).toBeInTheDocument()
  })

  it('formats recurring cooldown as hours (3600s → "Every 1h")', () => {
    setup({
      alerts: [createMockPriceAlert({ is_recurring: true, cooldown_seconds: 3600 })],
    })
    expect(screen.getByText(/every 1h/i)).toBeInTheDocument()
  })

  it('renders "Single-shot" for non-recurring alerts', () => {
    setup({ alerts: [createMockPriceAlert({ is_recurring: false })] })
    expect(screen.getByText(/single-shot/i)).toBeInTheDocument()
  })

  it('looks up ticker + name from the listing map for each alert row', async () => {
    jest.mocked(securitiesApi.getStocks).mockResolvedValue({
      stocks: [
        {
          id: 1,
          listing_id: 42,
          ticker: 'AAPL',
          name: 'Apple Inc.',
          outstanding_shares: 1,
          dividend_yield: 0,
          exchange_acronym: 'NYSE',
          price: '180',
          ask: '180.10',
          bid: '179.90',
          change: '1',
          volume: 1,
          last_refresh: '2026-01-01',
          market_cap: '1',
          maintenance_margin: '0',
          initial_margin_cost: '0',
        },
      ],
      total_count: 1,
    })
    setup({ alerts: [createMockPriceAlert({ id: 1, listing_id: 42 })] })
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('falls back to "#<id>" when the listing is not yet in the map', () => {
    setup({ alerts: [createMockPriceAlert({ id: 1, listing_id: 999 })] })
    expect(screen.getByText('#999')).toBeInTheDocument()
  })

  it('calls onPause when the Pause button is clicked for an active alert', () => {
    const onPause = jest.fn()
    setup({ alerts: [createMockPriceAlert({ id: 9, active: true })], onPause })
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(onPause).toHaveBeenCalledWith(9)
  })

  it('calls onResume when the Resume button is clicked for a paused alert', () => {
    const onResume = jest.fn()
    setup({ alerts: [createMockPriceAlert({ id: 7, active: false })], onResume })
    fireEvent.click(screen.getByRole('button', { name: /resume/i }))
    expect(onResume).toHaveBeenCalledWith(7)
  })

  it('calls onDelete when the Delete button is clicked', () => {
    const onDelete = jest.fn()
    setup({ alerts: [createMockPriceAlert({ id: 5 })], onDelete })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(5)
  })

  it('disables row action buttons when busyId matches the alert id', () => {
    setup({ alerts: [createMockPriceAlert({ id: 11 })], busyId: 11 })
    expect(screen.getByRole('button', { name: /pause/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled()
  })
})
