import { maskCardNumber } from '@/lib/utils/format'
import type { Card as CardType } from '@/types/card'
import { CardBrandLogo } from './CardBrandLogo'

const BRAND_GRADIENTS: Record<string, string> = {
  VISA: 'from-blue-900 via-blue-700 to-blue-500',
  MASTERCARD: 'from-gray-900 via-gray-700 to-gray-500',
  DINACARD: 'from-emerald-900 via-emerald-700 to-emerald-500',
  AMEX: 'from-slate-800 via-slate-600 to-slate-400',
}

function formatExpiry(expiresAt: string): string {
  const d = new Date(expiresAt)
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = String(d.getUTCFullYear()).slice(-2)
  return `${month}/${year}`
}

interface CardVisualProps {
  card: CardType
  className?: string
}

export function CardVisual({ card, className = '' }: CardVisualProps) {
  const gradient = BRAND_GRADIENTS[card.brand] ?? 'from-gray-800 to-gray-600'
  const isInactive = card.status !== 'ACTIVE'

  return (
    <div
      className={`relative w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl text-white select-none overflow-hidden ${className}`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5" />

      {/* Chip */}
      <div className="absolute top-6 left-6">
        <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
          <div className="h-full w-full rounded-md border border-amber-300/50 grid grid-cols-2 grid-rows-3 gap-px p-0.5 opacity-60">
            <div className="bg-amber-500/40 rounded-sm" />
            <div className="bg-amber-500/40 rounded-sm" />
            <div className="bg-amber-500/40 rounded-sm col-span-2" />
            <div className="bg-amber-500/40 rounded-sm" />
            <div className="bg-amber-500/40 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Brand logo — top right */}
      <div className="absolute top-5 right-6">
        <CardBrandLogo brand={card.brand} className="h-10 w-auto" />
      </div>

      {/* Card number — center */}
      <div className="absolute top-[48%] left-6 right-6 -translate-y-1/2">
        <p className="font-mono text-lg sm:text-xl tracking-[0.15em] drop-shadow-md">
          {maskCardNumber(card.card_number)}
        </p>
      </div>

      {/* Card name — below number */}
      <p className="absolute top-[60%] left-6 text-[10px] text-white/50 uppercase tracking-wider">
        {card.card_name}
      </p>

      {/* Bottom section: owner + expiry */}
      <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">Card Holder</p>
          <p className="text-sm font-medium tracking-wide uppercase">{card.owner_name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">Expires</p>
          <p className="text-sm font-mono">{formatExpiry(card.expires_at)}</p>
        </div>
      </div>

      {/* Status overlay for non-active cards */}
      {isInactive && (
        <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-lg font-bold tracking-widest uppercase text-white/90 border-2 border-white/30 px-4 py-1.5 rounded-lg">
            {card.status === 'BLOCKED' ? 'BLOCKED' : 'DEACTIVATED'}
          </span>
        </div>
      )}
    </div>
  )
}
