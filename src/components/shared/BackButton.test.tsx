import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BackButton } from '@/components/shared/BackButton'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('BackButton', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders with aria-label Back', () => {
    renderWithProviders(<BackButton />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('navigates to provided `to` path when clicked', () => {
    renderWithProviders(<BackButton to="/employees" />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/employees')
  })

  it('navigates back in history when no `to` is provided', () => {
    renderWithProviders(<BackButton />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
