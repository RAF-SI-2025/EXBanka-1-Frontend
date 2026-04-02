import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'
import type { Account } from '@/types/account'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

// Mock the Select components so we can inspect rendered items directly.
// base-ui Select uses portals that don't render in jsdom; the mock renders
// a plain <select> so we can verify which options are present.
jest.mock('@/components/ui/select', () => {
  const React = require('react')
  type ChildrenProps = { children?: React.ReactNode }
  type SelectProps = {
    onValueChange?: (val: string) => void
    value?: string
    children?: React.ReactNode
  }
  type SelectTriggerProps = { children?: React.ReactNode; 'aria-label'?: string }

  const capturedOnValueChange: Record<string, ((val: string) => void) | undefined> = {}
  let triggerCount = 0

  const Select = ({ onValueChange, value, children }: SelectProps) => {
    const id = React.useRef(String(triggerCount++))
    capturedOnValueChange[id.current] = onValueChange
    return (
      <div data-testid={`select-${id.current}`} data-value={value}>
        {children}
      </div>
    )
  }
  const SelectTrigger = ({ children, 'aria-label': ariaLabel }: SelectTriggerProps) => (
    <button aria-label={ariaLabel}>{children}</button>
  )
  const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>
  const SelectContent = ({ children }: ChildrenProps) => (
    <div data-testid="select-content">{children}</div>
  )
  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  )
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
})

const mockAccounts = [
  {
    id: 1,
    account_number: '111000100000000011',
    name: 'Tekući RSD',
    currency: 'RSD',
    available_balance: 50000,
  },
  {
    id: 2,
    account_number: '111000100000000022',
    name: 'Devizni EUR',
    currency: 'EUR',
    available_balance: 500,
  },
]

describe('CreateTransferForm', () => {
  const onSubmit = jest.fn()

  it('renders from/to account selectors and amount field', () => {
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/source account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destination account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)
    expect(screen.getByText(/make transfer/i)).toBeInTheDocument()
  })

  it('shows same-currency accounts in the destination dropdown', async () => {
    const accounts: Account[] = [
      createMockAccount({
        id: 1,
        account_number: '111000100000000011',
        account_name: 'Checking RSD',
        currency_code: 'RSD',
        available_balance: 1000,
      }),
      createMockAccount({
        id: 2,
        account_number: '111000100000000022',
        account_name: 'Savings RSD',
        currency_code: 'RSD',
        available_balance: 2000,
      }),
    ]

    const { container } = renderWithProviders(
      <CreateTransferForm accounts={accounts} onSubmit={jest.fn()} />
    )

    // The destination SelectContent should list all accounts (same-currency transfers allowed).
    // Before any source selection, toAccounts = all accounts.
    const destContents = container.querySelectorAll('[data-testid="select-content"]')
    // Second select-content is the destination
    const destContent = destContents[1]
    const initialDestItems = destContent?.querySelectorAll('[data-testid="select-item"]')
    expect(initialDestItems?.length).toBe(2)
  })
})
