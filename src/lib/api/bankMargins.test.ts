import { apiClient } from '@/lib/api/axios'
import { getBankMargins, updateBankMargin } from '@/lib/api/bankMargins'
import type { BankMargin } from '@/types/bankMargins'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), put: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)
const mockPut = jest.mocked(apiClient.put)

beforeEach(() => jest.clearAllMocks())

describe('getBankMargins', () => {
  it('GET /api/bank-margins returns margins', async () => {
    const mockData = {
      margins: [
        {
          id: 1,
          loan_type: 'PERSONAL',
          margin: 2.5,
          active: true,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    }
    mockGet.mockResolvedValue({ data: mockData })

    const result = await getBankMargins()

    expect(mockGet).toHaveBeenCalledWith('/api/bank-margins')
    expect(result).toEqual(mockData)
  })
})

describe('updateBankMargin', () => {
  it('PUT /api/bank-margins/:id updates margin', async () => {
    const updated: BankMargin = {
      id: 1,
      loan_type: 'PERSONAL',
      margin: 3.0,
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-03-21T00:00:00Z',
    }
    mockPut.mockResolvedValue({ data: updated })

    const result = await updateBankMargin(1, 3.0)

    expect(mockPut).toHaveBeenCalledWith('/api/bank-margins/1', { margin: 3.0 })
    expect(result).toEqual(updated)
  })
})
