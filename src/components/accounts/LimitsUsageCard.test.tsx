import { render, screen } from '@testing-library/react'
import { LimitsUsageCard } from './LimitsUsageCard'

describe('LimitsUsageCard', () => {
  it('renders daily and monthly progress bars with amounts', () => {
    render(
      <LimitsUsageCard
        dailyLimit={250000}
        monthlyLimit={1000000}
        dailySpending={150000}
        monthlySpending={600000}
        currency="RSD"
      />
    )

    expect(screen.getByText('Spending Limits')).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    // Serbian locale: 150.000,00 RSD / 250.000,00 RSD (60%)
    // Both daily and monthly are 60%, so 2 elements match
    expect(screen.getAllByText(/60%/)).toHaveLength(2)
    // Verify both rows render with currency
    expect(screen.getAllByText(/RSD/).length).toBeGreaterThanOrEqual(2)
  })

  it('shows green color when usage is below 70%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={50000}
        monthlySpending={200000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-green-500')
    expect(progressBars[1]).toHaveClass('bg-green-500')
  })

  it('shows yellow color when usage is between 70% and 90%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={80000}
        monthlySpending={400000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-yellow-500')
    expect(progressBars[1]).toHaveClass('bg-yellow-500')
  })

  it('shows red color when usage is above 90%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={95000}
        monthlySpending={460000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-red-500')
    expect(progressBars[1]).toHaveClass('bg-red-500')
  })

  it('shows "No limit configured" when limits are undefined', () => {
    render(
      <LimitsUsageCard
        dailyLimit={undefined}
        monthlyLimit={undefined}
        dailySpending={undefined}
        monthlySpending={undefined}
        currency="RSD"
      />
    )

    expect(screen.getAllByText('No limit configured')).toHaveLength(2)
  })

  it('handles zero limit gracefully', () => {
    render(
      <LimitsUsageCard
        dailyLimit={0}
        monthlyLimit={0}
        dailySpending={0}
        monthlySpending={0}
        currency="RSD"
      />
    )

    expect(screen.getAllByText('No limit configured')).toHaveLength(2)
  })
})
