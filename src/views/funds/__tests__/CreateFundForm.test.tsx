import { render, screen, fireEvent } from '@testing-library/react'
import { CreateFundForm } from '@/views/funds/components/CreateFundForm'

describe('CreateFundForm', () => {
  it('shows an error when submitted with no name', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects non-decimal minimum contribution', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Alpha' } })
    fireEvent.change(screen.getByLabelText(/minimum contribution/i), {
      target: { value: 'abc' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(screen.getByText(/decimal value/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed name + minimum when valid', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: '  Alpha  ' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'IT' } })
    fireEvent.change(screen.getByLabelText(/minimum contribution/i), {
      target: { value: '1000.00' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Alpha',
      description: 'IT',
      minimum_contribution_rsd: '1000.00',
    })
  })

  it('submits without optional fields when blank', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Solo' } })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Solo' })
  })

  it('disables the submit button while submitting', () => {
    render(<CreateFundForm onSubmit={() => {}} submitting={true} />)
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('rejects minimum contribution above 10,000,000 RSD', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Big' } })
    fireEvent.change(screen.getByLabelText(/minimum contribution/i), {
      target: { value: '10000001' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(screen.getByText(/10,000,000/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('accepts minimum contribution exactly at the 10,000,000 boundary', () => {
    const onSubmit = jest.fn()
    render(<CreateFundForm onSubmit={onSubmit} submitting={false} />)
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Edge' } })
    fireEvent.change(screen.getByLabelText(/minimum contribution/i), {
      target: { value: '10000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Edge',
      minimum_contribution_rsd: '10000000',
    })
  })
})
