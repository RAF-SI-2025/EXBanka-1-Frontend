import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ActuaryTable } from '@/components/actuaries/ActuaryTable'
import { createMockActuary } from '@/__tests__/fixtures/actuary-fixtures'

const mockActuaries = [
  createMockActuary({
    id: 1,
    first_name: 'Agent',
    last_name: 'Smith',
    email: 'smith@test.com',
    position: 'Agent',
    limit: '100000.00',
    used_limit: '15000.00',
    need_approval: true,
  }),
  createMockActuary({
    id: 2,
    first_name: 'Agent',
    last_name: 'Jones',
    email: 'jones@test.com',
    position: 'Agent',
    limit: '50000.00',
    used_limit: '0',
    need_approval: false,
  }),
]

describe('ActuaryTable', () => {
  const defaultProps = {
    actuaries: mockActuaries,
    onEditLimit: jest.fn(),
    onResetLimit: jest.fn(),
    onToggleApproval: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders table headers', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
    expect(screen.getByText('Used Limit')).toBeInTheDocument()
    expect(screen.getByText('Approval')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders actuary rows', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Agent Smith')).toBeInTheDocument()
    expect(screen.getByText('smith@test.com')).toBeInTheDocument()
    expect(screen.getByText('Agent Jones')).toBeInTheDocument()
    expect(screen.getByText('jones@test.com')).toBeInTheDocument()
  })

  it('displays limit and used_limit values', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('100000.00')).toBeInTheDocument()
    expect(screen.getByText('15000.00')).toBeInTheDocument()
    expect(screen.getByText('50000.00')).toBeInTheDocument()
  })

  it('displays approval status as Yes/No', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('calls onEditLimit when Edit Limit button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const editButtons = screen.getAllByRole('button', { name: /edit limit/i })
    fireEvent.click(editButtons[0])
    expect(defaultProps.onEditLimit).toHaveBeenCalledWith(mockActuaries[0])
  })

  it('calls onResetLimit when Reset button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const resetButtons = screen.getAllByRole('button', { name: /reset/i })
    fireEvent.click(resetButtons[0])
    expect(defaultProps.onResetLimit).toHaveBeenCalledWith(1)
  })

  it('calls onToggleApproval when approval toggle button is clicked', () => {
    renderWithProviders(<ActuaryTable {...defaultProps} />)
    const toggleButtons = screen.getAllByRole('button', { name: /toggle approval/i })
    fireEvent.click(toggleButtons[0])
    expect(defaultProps.onToggleApproval).toHaveBeenCalledWith(1, true)
  })
})
