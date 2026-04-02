import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferConfirmation } from '@/components/payments/TransferConfirmation'

const defaultFormData = {
  from_account_number: '111000100000000011',
  to_account_number: '111000100000000022',
  amount: 1300,
  description: 'Test prenos',
}

describe('TransferConfirmation', () => {
  const onConfirm = jest.fn()
  const onBack = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders transfer details', () => {
    renderWithProviders(
      <TransferConfirmation
        formData={defaultFormData}
        currency="RSD"
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
    expect(screen.getByText('111000100000000022')).toBeInTheDocument()
  })

  it('renders Confirm and Back buttons', () => {
    renderWithProviders(
      <TransferConfirmation
        formData={defaultFormData}
        currency="RSD"
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('calls onConfirm when Confirm clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TransferConfirmation
        formData={defaultFormData}
        currency="RSD"
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onBack when Back clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TransferConfirmation
        formData={defaultFormData}
        currency="RSD"
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
