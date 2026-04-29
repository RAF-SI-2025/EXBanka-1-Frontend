import { PiggyBank, Coins } from 'lucide-react'

export type PiggyMode = 'break' | 'fill'

interface PiggyAnimationProps {
  mode: PiggyMode
  onDone?: () => void
}

const COIN_DELAYS = ['0s', '0.15s', '0.3s', '0.45s', '0.6s']

export function PiggyAnimation({ mode, onDone }: PiggyAnimationProps) {
  return (
    <div
      data-testid="piggy-animation"
      data-mode={mode}
      onAnimationEnd={(e) => {
        if ((e.target as HTMLElement).dataset.role === 'overlay') onDone?.()
      }}
      className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center bg-background/30 backdrop-blur-sm animate-overlay-fade"
      data-role="overlay"
      aria-hidden
    >
      <div className="relative">
        {mode === 'fill' ? (
          <>
            {COIN_DELAYS.map((d, i) => (
              <Coins
                key={i}
                className="absolute -top-32 left-1/2 -translate-x-1/2 h-8 w-8 text-amber-500 animate-coin-fall"
                style={{
                  animationDelay: d,
                  marginLeft: `${(i - Math.floor(COIN_DELAYS.length / 2)) * 14}px`,
                }}
                aria-hidden
              />
            ))}
            <PiggyBank
              className="h-32 w-32 text-pink-400 drop-shadow-lg animate-piggy-shake"
              aria-hidden
            />
          </>
        ) : (
          <>
            {/* Two halves drift apart */}
            <div className="relative h-32 w-32 animate-piggy-shake">
              <div className="absolute inset-0 overflow-hidden animate-piggy-shatter-left">
                <PiggyBank
                  className="h-32 w-32 text-pink-400 drop-shadow-lg"
                  style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                  aria-hidden
                />
              </div>
              <div className="absolute inset-0 overflow-hidden animate-piggy-shatter-right">
                <PiggyBank
                  className="h-32 w-32 text-pink-400 drop-shadow-lg"
                  style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
                  aria-hidden
                />
              </div>
            </div>
            {/* Coins escape outward */}
            {COIN_DELAYS.slice(0, 4).map((d, i) => (
              <Coins
                key={i}
                className="absolute h-7 w-7 text-amber-500 animate-coin-fall"
                style={{
                  top: '40%',
                  left: '50%',
                  marginLeft: `${(i - 1.5) * 22}px`,
                  animationDelay: d,
                }}
                aria-hidden
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
