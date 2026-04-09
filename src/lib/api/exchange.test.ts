import { apiClient } from '@/lib/api/axios'
import { getExchangeRates, getExchangeRate, convertCurrency } from '@/lib/api/exchange'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockRate = {
  from_currency: 'EUR',
  to_currency: 'RSD',
  buy_rate: 116.5,
  sell_rate: 117.8,
  updated_at: '2026-03-13T08:00:00Z',
}

beforeEach(() => jest.clearAllMocks())

describe('getExchangeRates', () => {
  it('calls /api/exchange/rates and unwraps the rates array', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: { rates: [mockRate] } })

    const result = await getExchangeRates()

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/exchange/rates')
    expect(result).toEqual([mockRate])
  })
})

describe('getExchangeRate', () => {
  it('calls /api/exchange/rates/:from/:to with path parameters', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: mockRate })

    const result = await getExchangeRate('EUR', 'RSD')

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/exchange/rates/EUR/RSD')
    expect(result).toEqual(mockRate)
  })
})

describe('convertCurrency', () => {
  it('fetches exchange rate via GET and computes ConversionResult using buy_rate', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: {
        from_currency: 'EUR',
        to_currency: 'RSD',
        buy_rate: 117.5,
        sell_rate: 118.2,
        updated_at: '2026-03-13T08:00:00Z',
      },
    })

    const result = await convertCurrency({ from_currency: 'EUR', to_currency: 'RSD', amount: 100 })

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/exchange/rates/EUR/RSD')
    expect(result).toEqual({
      from_amount: 100,
      from_currency: 'EUR',
      to_amount: 11750,
      to_currency: 'RSD',
      rate: 117.5,
    })
  })
})
