import { render, screen, fireEvent } from '@testing-library/react'
import { PhoneInput } from '@/components/employees/PhoneInput'

jest.mock('@/components/ui/select', () => require('@/__tests__/mocks/select-mock'))

const mockOnChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PhoneInput', () => {
  it('renders a country select and number input when not disabled', () => {
    render(<PhoneInput value="+38161000000" onChange={mockOnChange} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument()
  })

  it('renders a single disabled input with the full value when disabled', () => {
    render(<PhoneInput value="+38161000000" onChange={mockOnChange} disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveValue('+38161000000')
  })

  it('calls onChange with updated number when digits are entered', () => {
    render(<PhoneInput value="+381" onChange={mockOnChange} />)
    const input = screen.getByPlaceholderText('Phone number')
    fireEvent.change(input, { target: { value: '61123456' } })
    expect(mockOnChange).toHaveBeenCalledWith('+38161123456')
  })

  it('strips non-digit characters from the phone number input', () => {
    render(<PhoneInput value="+381" onChange={mockOnChange} />)
    const input = screen.getByPlaceholderText('Phone number')
    fireEvent.change(input, { target: { value: 'abc123def' } })
    expect(mockOnChange).toHaveBeenCalledWith('+381123')
  })

  it('calls onChange with new country code when country is changed', () => {
    render(<PhoneInput value="+38161000000" onChange={mockOnChange} />)
    fireEvent.click(screen.getByRole('option', { name: /USA/i }))
    expect(mockOnChange).toHaveBeenCalledWith('+161000000')
  })
})
