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
const NEUTRAL_COLOR = '#94a3b8'

type Direction = 'bull' | 'bear' | 'flat'

interface CandleDatum {
  date: string
  ts: number
  open: number
  close: number
  high: number
  low: number
  volume: number
  range: [number, number]
  direction: Direction
}

function toCandle(entry: PriceHistoryEntry): CandleDatum {
  const close = Number(entry.price)
  const change = Number(entry.change)
  const high = Number(entry.high)
  const low = Number(entry.low)
  const open = close - change
  let direction: Direction = 'flat'
  if (close > open) direction = 'bull'
  else if (close < open) direction = 'bear'
  return {
    date: entry.date,
    ts: new Date(entry.date).getTime(),
    open,
    close,
    high,
    low,
    volume: entry.volume,
    range: [low, high],
    direction,
  }
}

function colorForDirection(d: Direction): string {
  if (d === 'bull') return BULL_COLOR
  if (d === 'bear') return BEAR_COLOR
  return NEUTRAL_COLOR
}

function fmtTick(period: PriceHistoryPeriod): (value: number) => string {
  return (value: number) => {
    if (!Number.isFinite(value)) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    if (period === 'day') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (period === 'week') {
      return d.toLocaleDateString([], { weekday: 'short', day: '2-digit' })
    }
    if (period === 'month') {
      return d.toLocaleDateString([], { month: 'short', day: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', year: 'numeric' })
  }
}

function fmtTooltipDate(period: PriceHistoryPeriod, ts: number, fallback: string): string {
  if (!Number.isFinite(ts)) return fallback
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return fallback
  if (period === 'day') {
    return d.toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })
}

// For the 1D view, return a numeric domain centered on Date.now() so the
// latest candle sits in the middle and the chart appears to "slide" forward
// as new data lands (the frontend polls /history every 60s).
// Other periods are static historical views — use auto-fit on the data.
function domainForPeriod(period: PriceHistoryPeriod): [number, number] | ['dataMin', 'dataMax'] {
  if (period !== 'day') return ['dataMin', 'dataMax']
  const halfWindowMs = 6 * 60 * 60 * 1000 // 6 hours each side → 12h total
  const now = Date.now()
  return [now - halfWindowMs, now + halfWindowMs]
}

function Candle(props: unknown) {
  const { x, y, width, height, payload } = props as {
    x: number
    y: number
    width: number
    height: number
    payload: CandleDatum
  }
  const { open, close, high, low, direction } = payload
  const color = colorForDirection(direction)
  const cx = x + width / 2

  const valueRange = high - low
  let bodyTop: number
  let bodyBottom: number
  if (valueRange <= 0) {
    bodyTop = y
    bodyBottom = y + Math.max(1, height)
  } else {
    const pxPerVal = height / valueRange
    bodyTop = y + (high - Math.max(open, close)) * pxPerVal
    bodyBottom = y + (high - Math.min(open, close)) * pxPerVal
  }
  const bodyWidth = Math.max(2, width * 0.6)
  const bodyX = x + (width - bodyWidth) / 2
  const bodyHeight = Math.max(1, bodyBottom - bodyTop)

  return (
    <g data-testid="candle" data-direction={direction}>
      <line
        data-testid="candle-wick"
        x1={cx}
        x2={cx}
        y1={y}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        data-testid="candle-body"
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
      />
    </g>
  )
}

interface CandleTooltipPayloadItem {
  payload?: CandleDatum
}

function CandleTooltip({
  active,
  payload,
  period,
}: {
  active?: boolean
  payload?: CandleTooltipPayloadItem[]
  period: PriceHistoryPeriod
}) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null
  const d = payload[0].payload
  const label = fmtTooltipDate(period, d.ts, d.date)
  return (
    <div className="rounded border bg-background p-2 text-xs shadow">
      <div className="font-medium">{label}</div>
      <div>O: {d.open.toFixed(2)}</div>
      <div>H: {d.high.toFixed(2)}</div>
      <div>L: {d.low.toFixed(2)}</div>
      <div>C: {d.close.toFixed(2)}</div>
      <div>Vol: {d.volume.toLocaleString()}</div>
    </div>
  )
}

export function PriceChart({ data, selectedPeriod, onPeriodChange, isLoading }: PriceChartProps) {
  const chartData = data
    .map(toCandle)
    .filter((c) => Number.isFinite(c.ts))
    .sort((a, b) => a.ts - b.ts)

  const domain = domainForPeriod(selectedPeriod)
  const visibleData =
    selectedPeriod === 'day' && Array.isArray(domain)
      ? chartData.filter(
          (c) =>
            c.ts >= (domain as [number, number])[0] && c.ts <= (domain as [number, number])[1],
        )
      : chartData

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
      ) : visibleData.length < 1 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          No historical data available for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={domain}
              allowDataOverflow
              tickFormatter={fmtTick(selectedPeriod)}
              minTickGap={40}
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip content={<CandleTooltip period={selectedPeriod} />} />
            <Bar dataKey="range" shape={<Candle />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
