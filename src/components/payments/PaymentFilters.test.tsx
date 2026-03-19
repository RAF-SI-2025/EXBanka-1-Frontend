import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentFilters } from './PaymentFilters'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'

const defaultFilters: PaymentFiltersType = {}

describe('PaymentFilters', () => {
  it('renders from_date input', () => {
    render(<PaymentFilters filters={defaultFilters} onFilterChange={jest.fn()} />)
    expect(screen.getByLabelText(/od datuma/i)).toBeInTheDocument()
  })

  it('renders to_date input', () => {
    render(<PaymentFilters filters={defaultFilters} onFilterChange={jest.fn()} />)
    expect(screen.getByLabelText(/do datuma/i)).toBeInTheDocument()
  })

  it('renders status select', () => {
    render(<PaymentFilters filters={defaultFilters} onFilterChange={jest.fn()} />)
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('calls onFilterChange with updated from_date when date input changes', async () => {
    const user = userEvent.setup()
    const onFilterChange = jest.fn()
    render(<PaymentFilters filters={defaultFilters} onFilterChange={onFilterChange} />)

    const fromDateInput = screen.getByLabelText(/od datuma/i)
    await user.type(fromDateInput, '2026-01-01')

    expect(onFilterChange).toHaveBeenCalled()
    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({ from_date: '2026-01-01' })
  })

  it('calls onFilterChange with updated to_date when date input changes', async () => {
    const user = userEvent.setup()
    const onFilterChange = jest.fn()
    render(<PaymentFilters filters={defaultFilters} onFilterChange={onFilterChange} />)

    const toDateInput = screen.getByLabelText(/do datuma/i)
    await user.type(toDateInput, '2026-03-01')

    expect(onFilterChange).toHaveBeenCalled()
    const lastCall = onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({ to_date: '2026-03-01' })
  })

  it('calls onFilterChange with updated status when select changes', async () => {
    const user = userEvent.setup()
    const onFilterChange = jest.fn()
    render(<PaymentFilters filters={defaultFilters} onFilterChange={onFilterChange} />)

    const statusSelect = screen.getByLabelText(/status/i)
    await user.selectOptions(statusSelect, 'REALIZED')

    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'REALIZED' }))
  })

  it('displays current filter values', () => {
    const filters: PaymentFiltersType = {
      from_date: '2026-01-01',
      to_date: '2026-03-01',
      status: 'REJECTED',
    }
    render(<PaymentFilters filters={filters} onFilterChange={jest.fn()} />)

    expect(screen.getByDisplayValue('2026-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-03-01')).toBeInTheDocument()
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
    expect(statusSelect.value).toBe('REJECTED')
  })
})
