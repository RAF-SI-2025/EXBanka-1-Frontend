import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import type { PriceHistoryEntry, PriceHistoryPeriod } from '@/types/security'

interface PriceChartProps {
  data: PriceHistoryEntry[]
  selectedPeriod: PriceHistoryPeriod
  onPeriodChange: (period: PriceHistoryPeriod) => void
  isLoading?: boolean
}

const PERIODS: { label: string; value: PriceHistoryPeriod }[] = [
  { label: '1D', value: 'day' },
  { label: '1W', value: 'week' },
  { label: '1M', value: 'month' },
  { label: '1Y', value: 'year' },
  { label: '5Y', value: '5y' },
  { label: 'All', value: 'all' },
]

const BULL_COLOR = '#16a34a'
const BEAR_COLOR = '#dc2626'

interface CandleDatum {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  wick: [number, number]
  body: [number, number]
  bullish: boolean
}

function toCandle(entry: PriceHistoryEntry): CandleDatum {
  const close = Number(entry.price)
  const change = Number(entry.change)
  const high = Number(entry.high)
  const low = Number(entry.low)
  const open = close - change
  return {
    date: entry.date,
    open,
    close,
    high,
    low,
    volume: entry.volume,
    wick: [low, high],
    body: [Math.min(open, close), Math.max(open, close)],
    bullish: close >= open,
  }
}

function fmtTick(period: PriceHistoryPeriod): (value: string) => string {
  return (value: string) => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    if (period === 'day') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (period === 'week' || period === 'month') {
      return d.toLocaleDateString([], { month: 'short', day: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', year: 'numeric' })
  }
}

function Wick(props: unknown) {
  const { x, y, width, height, payload } = props as {
    x: number
    y: number
    width: number
    height: number
    payload: CandleDatum
  }
  const color = payload.bullish ? BULL_COLOR : BEAR_COLOR
  const cx = x + width / 2
  return (
    <line
      data-testid="candle-wick"
      data-bullish={payload.bullish ? 'true' : 'false'}
      x1={cx}
      x2={cx}
      y1={y}
      y2={y + height}
      stroke={color}
      strokeWidth={1}
    />
  )
}

function CandleBody(props: unknown) {
  const { x, y, width, height, payload } = props as {
    x: number
    y: number
    width: number
    height: number
    payload: CandleDatum
  }
  const color = payload.bullish ? BULL_COLOR : BEAR_COLOR
  const bodyWidth = Math.max(2, width * 0.6)
  const bodyX = x + (width - bodyWidth) / 2
  const bodyHeight = Math.max(1, height)
  return (
    <rect
      data-testid="candle-body"
      data-bullish={payload.bullish ? 'true' : 'false'}
      x={bodyX}
      y={y}
      width={bodyWidth}
      height={bodyHeight}
      fill={color}
    />
  )
}

interface CandleTooltipPayloadItem {
  payload?: CandleDatum
}

function CandleTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: CandleTooltipPayloadItem[]
}) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null
  const d = payload[0].payload
  return (
    <div className="rounded border bg-background p-2 text-xs shadow">
      <div className="font-medium">{d.date}</div>
      <div>O: {d.open.toFixed(2)}</div>
      <div>H: {d.high.toFixed(2)}</div>
      <div>L: {d.low.toFixed(2)}</div>
      <div>C: {d.close.toFixed(2)}</div>
      <div>Vol: {d.volume.toLocaleString()}</div>
    </div>
  )
}

export function PriceChart({ data, selectedPeriod, onPeriodChange, isLoading }: PriceChartProps) {
  const chartData = data.map(toCandle)

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={selectedPeriod === p.value ? 'default' : 'outline'}
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading chart...
        </div>
      ) : chartData.length < 1 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          No historical data available for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={fmtTick(selectedPeriod)} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip content={<CandleTooltip />} />
            <Bar dataKey="wick" shape={<Wick />} isAnimationActive={false} />
            <Bar dataKey="body" shape={<CandleBody />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
