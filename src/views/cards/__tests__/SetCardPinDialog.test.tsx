import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { SetCardPinDialog } from '@/views/cards/components/SetCardPinDialog'
import { createMockCard } from '@/__tests__/fixtures/card-fixtures'
import * as useCardsHook from '@/hooks/useCards'

jest.mock('@/hooks/useCards')
jest.mock('@/lib/errors', () => ({
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}))

const mockCardWithPin = createMockCard({ pin: '1234' })

describe('SetCardPinDialog', () => {
  const onOpenChange = jest.fn()
  const mockVerifyMutate = jest.fn()
  const mockSetPinMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useCardsHook.useMyCard).mockReturnValue({
      data: mockCardWithPin,
      isLoading: false,
    } as any)
    jest.mocked(useCardsHook.useVerifyCardPin).mockReturnValue({
      mutate: mockVerifyMutate,
      isPending: false,
    } as any)
    jest.mocked(useCardsHook.useSetCardPin).mockReturnValue({
      mutate: mockSetPinMutate,
      isPending: false,
    } as any)
  })

  it('renders a current PIN field', () => {
    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)
    expect(screen.getByLabelText(/current pin/i)).toBeInTheDocument()
  })

  it('renders new PIN and confirm PIN fields', () => {
    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)
    expect(screen.getByLabelText(/new pin/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm pin/i)).toBeInTheDocument()
  })

  it('Save PIN button is disabled when fields are empty', () => {
    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)
    expect(screen.getByRole('button', { name: /save pin/i })).toBeDisabled()
  })

  it('calls verifyCardPin before setCardPin on submit', async () => {
    const user = userEvent.setup()

    // Make verifyMutate call onSuccess immediately
    mockVerifyMutate.mockImplementation(
      (_vars: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      }
    )
    // Make setPinMutate call onSuccess immediately
    mockSetPinMutate.mockImplementation(
      (_vars: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      }
    )

    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

    await user.type(screen.getByLabelText(/current pin/i), '1234')
    await user.type(screen.getByLabelText(/^new pin/i), '5678')
    await user.type(screen.getByLabelText(/confirm pin/i), '5678')

    await user.click(screen.getByRole('button', { name: /save pin/i }))

    expect(mockVerifyMutate).toHaveBeenCalledWith(
      { cardId: 1, pin: '1234' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
    expect(mockSetPinMutate).toHaveBeenCalledWith(
      { cardId: 1, pin: '5678' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )

    // verify is called before setPin
    expect(mockVerifyMutate.mock.invocationCallOrder[0]).toBeLessThan(
      mockSetPinMutate.mock.invocationCallOrder[0]
    )
  })

  it('does not call setCardPin when verifyCardPin fails', async () => {
    const user = userEvent.setup()

    mockVerifyMutate.mockImplementation((_vars: unknown, { onError }: { onError: () => void }) => {
      onError()
    })

    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

    await user.type(screen.getByLabelText(/current pin/i), '0000')
    await user.type(screen.getByLabelText(/^new pin/i), '5678')
    await user.type(screen.getByLabelText(/confirm pin/i), '5678')

    await user.click(screen.getByRole('button', { name: /save pin/i }))

    expect(mockVerifyMutate).toHaveBeenCalled()
    expect(mockSetPinMutate).not.toHaveBeenCalled()
  })

  it('shows inline error when current PIN is incorrect', async () => {
    const user = userEvent.setup()

    mockVerifyMutate.mockImplementation((_vars: unknown, { onError }: { onError: () => void }) => {
      onError()
    })

    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

    await user.type(screen.getByLabelText(/current pin/i), '9999')
    await user.type(screen.getByLabelText(/^new pin/i), '1234')
    await user.type(screen.getByLabelText(/confirm pin/i), '1234')

    await user.click(screen.getByRole('button', { name: /save pin/i }))

    expect(screen.getByText(/incorrect current pin/i)).toBeInTheDocument()
  })

  it('shows PIN mismatch error when confirm does not match new PIN', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

    await user.type(screen.getByLabelText(/^new pin/i), '1234')
    await user.type(screen.getByLabelText(/confirm pin/i), '5678')

    expect(screen.getByText(/pins do not match/i)).toBeInTheDocument()
  })

  it('closes dialog on successful PIN change', async () => {
    const user = userEvent.setup()

    mockVerifyMutate.mockImplementation(
      (_vars: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      }
    )
    mockSetPinMutate.mockImplementation(
      (_vars: unknown, { onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      }
    )

    renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

    await user.type(screen.getByLabelText(/current pin/i), '1234')
    await user.type(screen.getByLabelText(/^new pin/i), '5678')
    await user.type(screen.getByLabelText(/confirm pin/i), '5678')

    await user.click(screen.getByRole('button', { name: /save pin/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  describe('when the card has no PIN yet (card.pin is null/undefined)', () => {
    beforeEach(() => {
      jest.mocked(useCardsHook.useMyCard).mockReturnValue({
        data: { ...mockCardWithPin, pin: null },
        isLoading: false,
      } as any)
    })

    it('does NOT render a current PIN field', () => {
      renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)
      expect(screen.queryByLabelText(/current pin/i)).not.toBeInTheDocument()
    })

    it('shows the "Set card PIN" title', () => {
      renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)
      expect(screen.getByRole('heading', { name: /set card pin/i })).toBeInTheDocument()
    })

    it('calls setCardPin without first calling verifyCardPin', async () => {
      const user = userEvent.setup()
      mockSetPinMutate.mockImplementation(
        (_vars: unknown, { onSuccess }: { onSuccess: () => void }) => {
          onSuccess()
        }
      )

      renderWithProviders(<SetCardPinDialog open onOpenChange={onOpenChange} cardId={1} />)

      await user.type(screen.getByLabelText(/^new pin/i), '5678')
      await user.type(screen.getByLabelText(/confirm pin/i), '5678')
      await user.click(screen.getByRole('button', { name: /save pin/i }))

      expect(mockVerifyMutate).not.toHaveBeenCalled()
      expect(mockSetPinMutate).toHaveBeenCalledWith(
        { cardId: 1, pin: '5678' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })
  })
})
