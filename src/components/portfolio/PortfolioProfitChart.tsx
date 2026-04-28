import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import type { PortfolioSummary } from '@/types/portfolio'

interface PortfolioProfitChartProps {
  summary: PortfolioSummary
}

export function PortfolioProfitChart({ summary }: PortfolioProfitChartProps) {
  const data = [
    { label: 'This month', value: Number(summary.realized_profit_this_month_rsd) || 0 },
    { label: 'This year', value: Number(summary.realized_profit_this_year_rsd) || 0 },
    { label: 'Lifetime', value: Number(summary.realized_profit_lifetime_rsd) || 0 },
  ]
  const allZero = data.every((d) => d.value === 0)

  if (allZero) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="profit-chart-empty">
        No realised profit yet — make your first trade to see it here.
      </p>
    )
  }

  return (
    <div className="h-56 w-full" data-testid="profit-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => {
              const num = Number(value)
              if (Number.isNaN(num)) return String(value)
              return new Intl.NumberFormat('sr-RS', {
                style: 'currency',
                currency: 'RSD',
                maximumFractionDigits: 2,
              }).format(num)
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? 'var(--accent-2)' : 'var(--destructive)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
