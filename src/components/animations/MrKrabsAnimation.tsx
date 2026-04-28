interface MrKrabsAnimationProps {
  onDone?: () => void
}

export function MrKrabsAnimation({ onDone }: MrKrabsAnimationProps) {
  return (
    <div
      data-testid="mr-krabs-animation"
      data-role="overlay"
      onAnimationEnd={(e) => {
        if ((e.target as HTMLElement).dataset.role === 'krabs') onDone?.()
      }}
      className="fixed inset-0 z-[80] pointer-events-none flex items-center"
      aria-hidden
    >
      <div
        data-role="krabs"
        className="relative animate-krabs-rush text-7xl drop-shadow-lg select-none"
      >
        <span className="inline-block animate-krabs-shake">🦀</span>
        <span className="inline-block ml-2 align-middle text-5xl">💰</span>
        <p className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200 px-2 py-0.5 rounded">
          ME MONEY!
        </p>
      </div>
    </div>
  )
}
