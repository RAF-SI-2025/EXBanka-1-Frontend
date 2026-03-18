import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationControls } from '@/components/shared/PaginationControls'

const mockOnPageChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('PaginationControls', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <PaginationControls page={1} totalPages={1} onPageChange={mockOnPageChange} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders Previous and Next buttons when totalPages > 1', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('shows current page and total pages', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
  })

  it('disables Previous on the first page', () => {
    render(<PaginationControls page={1} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next on the last page', () => {
    render(<PaginationControls page={3} totalPages={3} onPageChange={mockOnPageChange} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when Previous is clicked', () => {
    render(<PaginationControls page={3} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when Next is clicked', () => {
    render(<PaginationControls page={2} totalPages={5} onPageChange={mockOnPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })
})
