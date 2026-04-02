import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { MultiselectDropdown } from '@/components/ui/MultiselectDropdown'

jest.mock('@/components/ui/popover', () => require('@/__tests__/mocks/popover-mock'))

const OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
]

describe('MultiselectDropdown', () => {
  it('renders trigger button with label when nothing selected', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument()
  })

  it('shows count in trigger when items selected', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B']} onChange={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Status (2)' })).toBeInTheDocument()
  })

  it('does not show dropdown content when closed', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument()
  })

  it('shows options when trigger is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
    expect(screen.getByLabelText('Select all')).toBeInTheDocument()
    expect(screen.getByLabelText('Option A')).toBeInTheDocument()
    expect(screen.getByLabelText('Option B')).toBeInTheDocument()
    expect(screen.getByLabelText('Option C')).toBeInTheDocument()
  })

  it('calls onChange with all values when Select All clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    await user.click(screen.getByLabelText('Select all'))
    expect(onChange).toHaveBeenCalledWith(['A', 'B', 'C'])
  })

  it('calls onChange with empty array when Select All clicked and all are selected', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B', 'C']} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (3)' }))
    await user.click(screen.getByLabelText('Select all'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('calls onChange with single value when one option clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    await user.click(screen.getByLabelText('Option B'))
    expect(onChange).toHaveBeenCalledWith(['B'])
  })

  it('removes value when already-selected option clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B']} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (2)' }))
    await user.click(screen.getByLabelText('Option A'))
    expect(onChange).toHaveBeenCalledWith(['B'])
  })

  it('shows Select All as checked when all options are selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B', 'C']} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (3)' }))
    expect(screen.getByLabelText('Select all')).toBeChecked()
  })

  it('shows Select All as unchecked when not all options are selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A']} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (1)' }))
    expect(screen.getByLabelText('Select all')).not.toBeChecked()
  })
})
