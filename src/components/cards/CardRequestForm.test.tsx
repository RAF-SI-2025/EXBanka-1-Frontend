import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CardRequestForm } from '@/components/cards/CardRequestForm'

// Mock Select components — Base UI Select uses portals that don't render in JSDOM.
jest.mock('@/components/ui/select', () => {
  const React = require('react')
  const contexts: Record<string, ((val: string) => void) | undefined> = {}
  let count = 0

  const Select = ({
    onValueChange,
    children,
  }: {
    onValueChange?: (val: string) => void
    value?: string
    children?: React.ReactNode
  }) => {
    const id = React.useRef(String(count++))
    contexts[id.current] = onValueChange
    return <div data-select-id={id.current}>{children}</div>
  }

  const SelectTrigger = ({
    children,
    'aria-label': ariaLabel,
  }: {
    children?: React.ReactNode
    'aria-label'?: string
  }) => <button aria-label={ariaLabel}>{children}</button>

  const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>

  const SelectContent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>

  const SelectItem = ({ value, children }: { value: string; children?: React.ReactNode }) => {
    const handleClick = (e: React.MouseEvent) => {
      let el: HTMLElement | null = e.currentTarget as HTMLElement
      while (el && !el.dataset.selectId) el = el.parentElement
      if (el) contexts[el.dataset.selectId!]?.(value)
    }
    return (
      <div role="option" data-value={value} onClick={handleClick}>
        {children}
      </div>
    )
  }

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
})

const mockAccounts = [
  {
    id: 1,
    account_number: '111000100000000011',
    account_name: 'Main RSD',
    currency_code: 'RSD',
    account_category: 'personal',
  },
]

describe('CardRequestForm', () => {
  const onSubmit = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders account selector', () => {
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    expect(screen.getByLabelText(/account/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request/i })).toBeInTheDocument()
  })

  it('renders card brand dropdown', () => {
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    expect(screen.getByLabelText(/card type/i)).toBeInTheDocument()
  })

  it('calls onSubmit with account number and card brand', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CardRequestForm accounts={mockAccounts as any} onSubmit={onSubmit} loading={false} />
    )
    await user.click(screen.getByText(/111000100000000011/i))
    await user.click(screen.getByText(/visa/i))
    await user.click(screen.getByRole('button', { name: /request/i }))
    expect(onSubmit).toHaveBeenCalledWith('111000100000000011', 'VISA')
  })
})
