type Direction = 'buy' | 'sell' | 'BUY' | 'SELL'

interface DirectionBadgeProps {
  direction: Direction | string
  className?: string
}

/** Buy/sell pill — buy is always green, sell is always red. */
export function DirectionBadge({ direction, className = '' }: DirectionBadgeProps) {
  const lower = direction.toLowerCase()
  const isSell = lower === 'sell'
  const tone = isSell
    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'

  return (
    <span
      className={`inline-flex items-center justify-center h-7 w-16 rounded-lg text-xs font-semibold uppercase tracking-wider ${tone} ${className}`}
    >
      {lower === 'buy' ? 'Buy' : lower === 'sell' ? 'Sell' : direction}
    </span>
  )
}
