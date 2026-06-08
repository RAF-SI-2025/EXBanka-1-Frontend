import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FundNavPoint } from '@/types/fund'

interface FundNavChartProps {
  history?: FundNavPoint[]
  averageHistory?: FundNavPoint[]
}

/**
 * Fund NAV performance vs. the system-average benchmark, both indexed to 100 at
 * the fund's first snapshot so the two series are comparable on one axis.
 */
export function FundNavChart({ history = [], averageHistory = [] }: FundNavChartProps) {
  if (history.length < 2) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="fund-nav-chart-empty">
        Not enough history yet to chart performance — check back after a few more daily snapshots.
      </p>
    )
  }

  const base = Number(history[0].total_value_rsd)
  const avgByDate = new Map(averageHistory.map((p) => [p.date, Number(p.total_value_rsd)]))
  const data = history.map((point) => {
    const value = Number(point.total_value_rsd)
    const avg = avgByDate.get(point.date)
    return {
      date: point.date,
      fund: base ? (value / base) * 100 : 100,
      average: avg != null && Number.isFinite(avg) ? avg : undefined,
    }
  })

  return (
    <div className="h-64 w-full" data-testid="fund-nav-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} width={44} />
          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="fund"
            name="Fund"
            stroke="var(--accent-2)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="average"
            name="System avg"
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
