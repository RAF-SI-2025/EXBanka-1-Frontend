import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation'

const defaultFormData = {
  from_account: '111000100000000011',
  to_account: '111000100000000099',
  receiver_name: 'Elektro Beograd',
  amount: 5000,
  payment_code: '221',
  reference: '97 1234567890',
  description: 'Račun za struju',
}

describe('PaymentConfirmation', () => {
  const onConfirm = jest.fn()
  const onBack = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders payment details for review', () => {
    renderWithProviders(
      <PaymentConfirmation
        formData={defaultFormData}
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
    expect(screen.getByText('111000100000000011')).toBeInTheDocument()
    expect(screen.getByText('111000100000000099')).toBeInTheDocument()
  })

  it('renders Confirm and Back buttons', () => {
    renderWithProviders(
      <PaymentConfirmation
        formData={defaultFormData}
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    expect(screen.getByRole('button', { name: /potvrdi/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nazad/i })).toBeInTheDocument()
  })

  it('calls onConfirm when Confirm clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PaymentConfirmation
        formData={defaultFormData}
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    await user.click(screen.getByRole('button', { name: /potvrdi/i }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onBack when Back clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PaymentConfirmation
        formData={defaultFormData}
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={false}
        error={null}
      />
    )
    await user.click(screen.getByRole('button', { name: /nazad/i }))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows loading state when submitting is true', () => {
    renderWithProviders(
      <PaymentConfirmation
        formData={defaultFormData}
        onConfirm={onConfirm}
        onBack={onBack}
        submitting={true}
        error={null}
      />
    )
    expect(screen.getByText(/obrađuje se/i)).toBeInTheDocument()
  })
})
