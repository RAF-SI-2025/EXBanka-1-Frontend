import { apiClient } from '@/lib/api/axios'
import { getLoan } from '@/lib/api/loans'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockGet = jest.mocked(apiClient.get)

beforeEach(() => jest.clearAllMocks())

describe('getLoan', () => {
  it('fetches from the client me endpoint', async () => {
    const mockLoan = { id: 5, loan_type: 'CASH', amount: 100000 }
    mockGet.mockResolvedValue({ data: mockLoan })

    const result = await getLoan(5)

    expect(mockGet).toHaveBeenCalledWith('/me/loans/5')
    expect(result).toEqual(mockLoan)
  })
})
