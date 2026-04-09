import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

interface LimitsUsageCardProps {
  dailyLimit: number | undefined
  monthlyLimit: number | undefined
  dailySpending: number | undefined
  monthlySpending: number | undefined
  currency: string
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function LimitRow({
  label,
  spent,
  limit,
  currency,
}: {
  label: string
  spent: number | undefined
  limit: number | undefined
  currency: string
}) {
  if (!limit) {
    return (
      <div className="space-y-1">
        <span className="text-sm font-medium">{label}</span>
        <p className="text-sm text-muted-foreground">No limit configured</p>
      </div>
    )
  }

  const spentAmount = spent ?? 0
  const percentage = Math.min(Math.round((spentAmount / limit) * 100), 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatCurrency(spentAmount, currency)} / {formatCurrency(limit, currency)} ({percentage}
          %)
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          data-testid="progress-fill"
          className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function LimitsUsageCard({
  dailyLimit,
  monthlyLimit,
  dailySpending,
  monthlySpending,
  currency,
}: LimitsUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LimitRow label="Daily" spent={dailySpending} limit={dailyLimit} currency={currency} />
        <LimitRow
          label="Monthly"
          spent={monthlySpending}
          limit={monthlyLimit}
          currency={currency}
        />
      </CardContent>
    </Card>
  )
}
