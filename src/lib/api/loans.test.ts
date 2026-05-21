import { apiClient } from '@/lib/api/axios'
import { getLoan, getLoans, getAllLoans } from '@/lib/api/loans'

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
    expect(result).toMatchObject(mockLoan)
  })

  it('fills period from repayment_period when API omits period', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        id: 1,
        loan_number: 'LN-001',
        loan_type: 'CASH',
        account_number: '111000100000000011',
        amount: 100000,
        status: 'ACTIVE',
        created_at: '2026-01-15T10:00:00Z',
        repayment_period: 60,
      },
    })
    const loan = await getLoan(1)
    expect(loan.period).toBe(60)
  })

  it('fills interest_rate from nominal_interest_rate when API omits interest_rate', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        id: 1,
        loan_number: 'LN-001',
        loan_type: 'CASH',
        account_number: '111000100000000011',
        amount: 100000,
        status: 'ACTIVE',
        created_at: '2026-01-15T10:00:00Z',
        nominal_interest_rate: 6.5,
      },
    })
    const loan = await getLoan(1)
    expect(loan.interest_rate).toBe(6.5)
  })

  it('prefers an explicit period over repayment_period when both are present', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        id: 1,
        loan_number: 'LN-001',
        loan_type: 'CASH',
        account_number: '111000100000000011',
        amount: 100000,
        status: 'ACTIVE',
        created_at: '2026-01-15T10:00:00Z',
        period: 36,
        repayment_period: 60,
      },
    })
    const loan = await getLoan(1)
    expect(loan.period).toBe(36)
  })

  it('leaves period and interest_rate undefined when the API omits all related fields', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        id: 1,
        loan_number: 'LN-001',
        loan_type: 'CASH',
        account_number: '111000100000000011',
        amount: 100000,
        status: 'ACTIVE',
        created_at: '2026-01-15T10:00:00Z',
      },
    })
    const loan = await getLoan(1)
    expect(loan.period).toBeUndefined()
    expect(loan.interest_rate).toBeUndefined()
  })
})

describe('getLoans', () => {
  it('normalizes each loan in the list response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        loans: [
          {
            id: 1,
            loan_number: 'LN-001',
            loan_type: 'CASH',
            account_number: '111000100000000011',
            amount: 100000,
            status: 'ACTIVE',
            created_at: '2026-01-15T10:00:00Z',
            repayment_period: 60,
            nominal_interest_rate: 6.5,
          },
          {
            id: 2,
            loan_number: 'LN-002',
            loan_type: 'HOUSING',
            account_number: '111000100000000012',
            amount: 5000000,
            status: 'ACTIVE',
            created_at: '2026-01-15T10:00:00Z',
            repayment_period: 240,
            nominal_interest_rate: 4.2,
          },
        ],
        total: 2,
      },
    })

    const result = await getLoans()

    expect(mockGet).toHaveBeenCalledWith('/me/loans')
    expect(result.loans[0].period).toBe(60)
    expect(result.loans[0].interest_rate).toBe(6.5)
    expect(result.loans[1].period).toBe(240)
    expect(result.loans[1].interest_rate).toBe(4.2)
    expect(result.total).toBe(2)
  })
})

describe('getAllLoans', () => {
  it('normalizes each loan in the admin list response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        loans: [
          {
            id: 10,
            loan_number: 'LN-010',
            loan_type: 'CASH',
            account_number: '111000100000000099',
            amount: 250000,
            status: 'ACTIVE',
            created_at: '2026-01-15T10:00:00Z',
            repayment_period: 24,
            nominal_interest_rate: 9.1,
          },
        ],
        total: 1,
      },
    })

    const result = await getAllLoans()

    expect(result.loans[0].period).toBe(24)
    expect(result.loans[0].interest_rate).toBe(9.1)
  })
})
