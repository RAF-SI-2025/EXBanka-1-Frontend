import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { FundPerformancePoint } from '@/types/fund'

interface FundPerformanceChartProps {
  performance: FundPerformancePoint[]
}

export function FundPerformanceChart({ performance }: FundPerformanceChartProps) {
  if (performance.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="performance-empty">
        No performance data yet.
      </p>
    )
  }

  const data = performance.map((p) => ({
    as_of: p.as_of,
    value: Number(p.fund_value_rsd),
  }))

  return (
    <div className="h-64 w-full" data-testid="performance-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="as_of" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent-2)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
