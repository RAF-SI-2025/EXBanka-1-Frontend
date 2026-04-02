import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FilterBar } from '@/components/ui/FilterBar'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

jest.mock('@/components/ui/MultiselectDropdown', () => ({
  MultiselectDropdown: ({
    label,
    selected,
    onChange,
  }: {
    label: string
    options: { label: string; value: string }[]
    selected: string[]
    onChange: (v: string[]) => void
  }) => (
    <div>
      <span data-testid={`multiselect-${label}`}>
        {label} ({selected.length})
      </span>
      <button onClick={() => onChange(['VAL1'])}>trigger-{label}</button>
    </div>
  ),
}))

const TEXT_FIELD: FilterFieldDef = { key: 'name', label: 'Ime', type: 'text' }
const DATE_FIELD: FilterFieldDef = { key: 'date_from', label: 'Od datuma', type: 'date' }
const NUMBER_FIELD: FilterFieldDef = { key: 'amount', label: 'Iznos', type: 'number' }
const MULTI_FIELD: FilterFieldDef = {
  key: 'status',
  label: 'Status',
  type: 'multiselect',
  options: [{ label: 'Aktivan', value: 'ACTIVE' }],
}

describe('FilterBar', () => {
  it('renders text input for text field', () => {
    renderWithProviders(<FilterBar fields={[TEXT_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Ime')).toBeInTheDocument()
  })

  it('renders date input for date field', () => {
    renderWithProviders(<FilterBar fields={[DATE_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Od datuma')).toHaveAttribute('type', 'date')
  })

  it('renders number input for number field', () => {
    renderWithProviders(<FilterBar fields={[NUMBER_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Iznos')).toHaveAttribute('type', 'number')
  })

  it('renders MultiselectDropdown for multiselect field', () => {
    renderWithProviders(<FilterBar fields={[MULTI_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByTestId('multiselect-Status')).toBeInTheDocument()
  })

  it('calls onChange with updated text value', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[TEXT_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Ime'), { target: { value: 'Ana' } })
    expect(onChange).toHaveBeenCalledWith({ name: 'Ana' })
  })

  it('calls onChange with updated date value', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[DATE_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Od datuma'), { target: { value: '2024-01-01' } })
    expect(onChange).toHaveBeenCalledWith({ date_from: '2024-01-01' })
  })

  it('calls onChange with updated number value as string', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[NUMBER_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Iznos'), { target: { value: '100' } })
    expect(onChange).toHaveBeenCalledWith({ amount: '100' })
  })

  it('calls onChange with updated array from multiselect', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[MULTI_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.click(screen.getByText('trigger-Status'))
    expect(onChange).toHaveBeenCalledWith({ status: ['VAL1'] })
  })

  it('preserves existing values when one field changes', () => {
    const onChange = jest.fn()
    renderWithProviders(
      <FilterBar
        fields={[TEXT_FIELD, DATE_FIELD]}
        values={{ name: 'Ana' }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Od datuma'), { target: { value: '2024-01-01' } })
    expect(onChange).toHaveBeenCalledWith({ name: 'Ana', date_from: '2024-01-01' })
  })

  it('shows current values in inputs', () => {
    renderWithProviders(
      <FilterBar
        fields={[TEXT_FIELD]}
        values={{ name: 'Marko' }}
        onChange={jest.fn()}
      />
    )
    expect(screen.getByPlaceholderText('Ime')).toHaveValue('Marko')
  })
})
