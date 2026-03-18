import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { VerificationCodeInput } from '@/components/cards/VerificationCodeInput'

describe('VerificationCodeInput', () => {
  const onSubmit = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('renders code input and confirm button', () => {
    renderWithProviders(<VerificationCodeInput onSubmit={onSubmit} loading={false} />)
    expect(screen.getByLabelText(/verifikacioni kod/i)).toBeInTheDocument()
    expect(screen.getByText(/potvrdi/i)).toBeInTheDocument()
  })

  it('submits the code', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VerificationCodeInput onSubmit={onSubmit} loading={false} />)
    await user.type(screen.getByLabelText(/verifikacioni kod/i), '123456')
    await user.click(screen.getByText(/potvrdi/i))
    expect(onSubmit).toHaveBeenCalledWith('123456')
  })
})
