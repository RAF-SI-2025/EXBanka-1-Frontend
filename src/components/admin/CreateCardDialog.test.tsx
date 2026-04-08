import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateCardDialog } from '@/components/admin/CreateCardDialog'
import * as useCardsHook from '@/hooks/useCards'
import * as useAccountsHook from '@/hooks/useAccounts'
import * as useClientsHook from '@/hooks/useClients'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'
import { createMockClient } from '@/__tests__/fixtures/client-fixtures'

jest.mock('@/hooks/useCards')
jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useClients')

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
    id: triggerId,
  }: {
    children?: React.ReactNode
    'aria-label'?: string
    id?: string
  }) => (
    <button role="combobox" aria-label={ariaLabel} id={triggerId}>
      {children}
    </button>
  )

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

const mockAccount = createMockAccount({
  id: 10,
  account_number: '265-0000000010-00',
  account_name: 'Firma DOO',
  account_category: 'business',
})

const mockClient = createMockClient({
  id: 5,
  first_name: 'Ana',
  last_name: 'Anić',
  email: 'ana@test.com',
})

const mockMutate = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useCardsHook.useCreateCard).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as any)
  jest.mocked(useAccountsHook.useSearchAccounts).mockReturnValue({
    data: { accounts: [mockAccount], total: 1 },
    isLoading: false,
  } as any)
  jest.mocked(useClientsHook.useSearchClients).mockReturnValue({
    data: { clients: [mockClient], total: 1 },
    isLoading: false,
  } as any)
})

async function fillForm() {
  // Select account
  await userEvent.type(screen.getByPlaceholderText(/search account/i), '265')
  await userEvent.click(screen.getByText(/265-0000000010-00/))
  // Select client
  await userEvent.type(screen.getByPlaceholderText(/search client/i), 'Ana')
  await userEvent.click(screen.getByText(/Ana Anić/))
  // Select card brand
  await userEvent.click(screen.getByRole('combobox', { name: /card brand/i }))
  await userEvent.click(screen.getByRole('option', { name: 'Visa' }))
}

describe('CreateCardDialog', () => {
  it('renders dialog with all three fields when open', () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    expect(screen.getByPlaceholderText(/search account/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search client/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /card brand/i })).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    expect(screen.getByRole('button', { name: /create card/i })).toBeDisabled()
  })

  it('submit button is enabled only after all three fields are filled', async () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    expect(screen.getByRole('button', { name: /create card/i })).toBeEnabled()
  })

  it('calls mutation with correct args on submit', async () => {
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    expect(mockMutate).toHaveBeenCalledWith(
      { account: mockAccount, client: mockClient, cardBrand: 'VISA' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
  })

  it('calls onClose when mutation succeeds', async () => {
    const onClose = jest.fn()
    mockMutate.mockImplementation((_args: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess()
    })
    renderWithProviders(<CreateCardDialog open onClose={onClose} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error message when mutation fails', async () => {
    mockMutate.mockImplementation(
      (_args: unknown, { onError }: { onError: (e: Error) => void }) => {
        onError(new Error('Server error'))
      }
    )
    renderWithProviders(<CreateCardDialog open onClose={jest.fn()} />)
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: /create card/i }))
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('does not render content when closed', () => {
    renderWithProviders(<CreateCardDialog open={false} onClose={jest.fn()} />)
    expect(screen.queryByPlaceholderText(/search account/i)).not.toBeInTheDocument()
  })
})
