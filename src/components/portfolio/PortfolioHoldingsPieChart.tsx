import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Holding } from '@/types/portfolio'

interface PortfolioHoldingsPieChartProps {
  holdings: Holding[]
}

const COLORS = [
  'oklch(0.67 0.14 210)',
  'oklch(0.78 0.10 210)',
  'oklch(0.55 0.12 210)',
  'oklch(0.62 0.12 200)',
  'oklch(0.45 0.10 222)',
  'oklch(0.72 0.11 200)',
  'oklch(0.38 0.10 222)',
  'oklch(0.85 0.08 30)',
  'oklch(0.65 0.20 27)',
  'oklch(0.75 0.15 90)',
]

export function PortfolioHoldingsPieChart({ holdings }: PortfolioHoldingsPieChartProps) {
  if (holdings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="holdings-pie-empty">
        You have no holdings yet — buy your first security to see it here.
      </p>
    )
  }

  const totalQty = holdings.reduce((sum, h) => sum + h.quantity, 0)
  const data = holdings.map((h) => ({
    name: h.ticker,
    value: h.quantity,
    percent: totalQty > 0 ? (h.quantity / totalQty) * 100 : 0,
  }))

  return (
    <div className="h-72 w-full" data-testid="holdings-pie">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
            label={(entry) => {
              const datum = entry as unknown as { name: string; percent: number }
              return `${datum.name} ${datum.percent.toFixed(1)}%`
            }}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, item) => {
              const payload = item.payload as { percent?: number } | undefined
              const pct = payload?.percent ?? 0
              return [`${value} (${pct.toFixed(1)}%)`, name]
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
