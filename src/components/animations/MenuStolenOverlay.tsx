interface MenuStolenOverlayProps {
  onDismiss: () => void
}

const STOLEN_ITEMS = [
  '🥬 Lettuce Account',
  '🌾 Grass Reserves',
  '💧 Pond Holdings',
  '🍉 Watermelon Vault',
  '🥕 Carrot Loans',
  '🪴 Riverbank Funds',
  '🐠 Fishy Transfers',
  '🌻 Sunflower Cards',
  '🍃 Leaf Statements',
  '🪨 Rock Securities',
  '🥒 Cucumber Tax',
  '🌿 Reed Limits',
]

export function MenuStolenOverlay({ onDismiss }: MenuStolenOverlayProps) {
  return (
    <div
      data-testid="menu-stolen-overlay"
      onClick={onDismiss}
      className="absolute inset-0 z-[78] bg-sidebar/95 text-sidebar-foreground flex flex-col p-4 cursor-pointer overflow-y-auto"
      role="alert"
    >
      <div className="flex items-center gap-2 text-lg font-bold text-amber-300 mb-3 animate-pulse-soft">
        <span aria-hidden>🦫</span>
        <span>Capybara stole the menu!</span>
      </div>
      <p className="text-xs text-sidebar-foreground/70 mb-4">(Click anywhere to chase it off.)</p>
      <div className="space-y-1">
        {STOLEN_ITEMS.map((label, i) => (
          <div
            key={i}
            className="block pl-4 pr-3 py-2 rounded-md text-sm text-sidebar-foreground/85 italic"
            style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)` }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
