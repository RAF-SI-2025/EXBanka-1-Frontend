import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationControls } from '@/components/shared/PaginationControls'

const mockOnPageChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PaginationControls', () => {
  it('always renders, even on a single page', () => {
    const { container } = render(
      <PaginationControls page={1} totalPages={1} onPageChange={mockOnPageChange} />
    )
    expect(container).not.toBeEmptyDOMElement()
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })

  it('renders previous and next arrow buttons', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
  })

  it('shows current page and total pages', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
  })

  it('disables previous arrow on the first page', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  it('disables next arrow on the last page', () => {
    render(<PaginationControls page={3} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when previous is clicked', () => {
    render(<PaginationControls page={3} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /previous page/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when next is clicked', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })
})
