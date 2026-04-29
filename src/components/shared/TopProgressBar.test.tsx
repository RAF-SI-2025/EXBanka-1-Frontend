import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { TopProgressBar } from './TopProgressBar'
import { createQueryClient } from '@/lib/queryClient'

function FetchingChild() {
  useQuery({
    queryKey: ['fetching-child'],
    queryFn: () => new Promise(() => {}), // never resolves
  })
  return null
}

function renderWith(children: React.ReactNode) {
  const client = createQueryClient()
  client.setDefaultOptions({ queries: { retry: false } })
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>)
}

describe('TopProgressBar', () => {
  it('is hidden initially', () => {
    renderWith(<TopProgressBar />)
    const bar = screen.getByTestId('top-progress-bar')
    expect(bar).toHaveClass('opacity-0')
  })

  it('becomes visible after the show-after delay while a query is fetching', async () => {
    renderWith(
      <>
        <TopProgressBar />
        <FetchingChild />
      </>
    )
    const bar = screen.getByTestId('top-progress-bar')
    expect(bar).toHaveClass('opacity-0')
    await waitFor(() => expect(bar).toHaveClass('opacity-100'), { timeout: 1000 })
  })
})
