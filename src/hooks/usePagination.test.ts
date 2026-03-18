import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

const items = Array.from({ length: 25 }, (_, i) => i + 1)

describe('usePagination', () => {
  it('starts on page 1', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    expect(result.current.page).toBe(1)
  })

  it('returns the first page of items', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    expect(result.current.paginatedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('calculates total pages correctly', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    expect(result.current.totalPages).toBe(3)
  })

  it('returns the correct slice after setPage', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.setPage(2))
    expect(result.current.paginatedItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('returns the last partial page correctly', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.setPage(3))
    expect(result.current.paginatedItems).toEqual([21, 22, 23, 24, 25])
  })

  it('returns totalPages of 1 for an empty list', () => {
    const { result } = renderHook(() => usePagination([], 10))
    expect(result.current.totalPages).toBe(1)
    expect(result.current.paginatedItems).toEqual([])
  })
})
