import { maskCardNumber } from '@/lib/utils/format'
import type { Card as CardType } from '@/types/card'
import { CardBrandLogo } from './CardBrandLogo'

const BRAND_GRADIENTS: Record<string, string> = {
  VISA: 'from-[#0c2d8e] via-[#1751e9] to-[#3d8bff]',
  MASTERCARD: 'from-[#1a1a1a] via-[#3a1410] to-[#7a1f12]',
  DINACARD: 'from-[#0c1a4a] via-[#7a1320] to-[#c8102e]',
  AMEX: 'from-[#0a3d62] via-[#0f6f8b] to-[#62a8ad]',
}

function formatExpiry(expiresAt: string): string {
  const d = new Date(expiresAt)
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = String(d.getUTCFullYear()).slice(-2)
  return `${month}/${year}`
}

interface CardVisualProps {
  card: CardType
  holderName?: string
  className?: string
}

/**
 * Brand-specific decorative pattern. Designs are evocative, not replicas —
 * we don't reproduce the trademarked logos here (CardBrandLogo handles
 * the actual marks via its own SVGs).
 */
function BrandPattern({ brand }: { brand: string }) {
  if (brand === 'VISA') {
    // Diagonal pinstripe shimmer
    return (
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 400 252"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern
            id="visa-stripes"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke="white" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="400" height="252" fill="url(#visa-stripes)" />
      </svg>
    )
  }
  if (brand === 'MASTERCARD') {
    // Two overlapping semi-transparent circles — evocative of MC color theme
    return (
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 400 252"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <circle cx="290" cy="190" r="80" fill="#eb001b" opacity="0.45" />
        <circle cx="350" cy="190" r="80" fill="#f79e1b" opacity="0.45" />
      </svg>
    )
  }
  if (brand === 'DINACARD') {
    // Horizontal stripes — Serbian flag inspired
    return (
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        viewBox="0 0 400 252"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect x="0" y="0" width="400" height="84" fill="#c8102e" />
        <rect x="0" y="84" width="400" height="84" fill="#0c1a4a" />
        <rect x="0" y="168" width="400" height="84" fill="white" />
      </svg>
    )
  }
  if (brand === 'AMEX') {
    // Subtle dot grid — premium feel
    return (
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 400 252"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern id="amex-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="400" height="252" fill="url(#amex-dots)" />
      </svg>
    )
  }
  return null
}

export function CardVisual({ card, holderName, className = '' }: CardVisualProps) {
  const gradient = BRAND_GRADIENTS[card.brand] ?? 'from-gray-800 to-gray-600'
  const status = card.status?.toUpperCase()
  const isInactive = status !== 'ACTIVE'
  const isVirtual = Boolean(card.is_virtual)
  const usageLabel =
    card.usage_type === 'single_use'
      ? 'Single use'
      : card.usage_type === 'multi_use'
        ? `Multi-use${card.max_uses ? ` · ${card.max_uses}×` : ''}`
        : null

  return (
    <div
      className={`relative w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl text-white select-none overflow-hidden ${className}`}
    >
      <BrandPattern brand={card.brand} />

      {/* Decorative circles (kept on top of pattern but below content) */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5" />

      {/* Virtual ribbon — top-left corner, above the chip */}
      {isVirtual && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/90 text-[10px] font-bold tracking-widest uppercase shadow">
            Virtual
          </span>
          {usageLabel && (
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium tracking-wider uppercase">
              {usageLabel}
            </span>
          )}
        </div>
      )}

      {/* Holographic shimmer overlay for virtual cards */}
      {isVirtual && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, rgba(255,180,255,0.18) 50%, rgba(180,210,255,0.18) 55%, transparent 70%)',
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* Chip */}
      <div className={`absolute ${isVirtual ? 'top-14' : 'top-6'} left-6`}>
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
      <p className="absolute top-[60%] left-6 text-[10px] text-white/60 uppercase tracking-wider">
        {card.card_name}
      </p>

      {/* Bottom section: owner + expiry */}
      <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">Card Holder</p>
          <p className="text-sm font-medium tracking-wide uppercase">
            {holderName ?? card.owner_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">Expires</p>
          <p className="text-sm font-mono">{formatExpiry(card.expires_at)}</p>
        </div>
      </div>

      {/* Status overlay for non-active cards */}
      {isInactive && (
        <div className="absolute inset-0 rounded-2xl bg-black/55 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-lg font-bold tracking-widest uppercase text-white/90 border-2 border-white/30 px-4 py-1.5 rounded-lg">
            {status === 'BLOCKED' ? 'BLOCKED' : 'DEACTIVATED'}
          </span>
        </div>
      )}
    </div>
  )
}
