interface CapybaraProps {
  top: number
  left: number
  onClick: () => void
}

/**
 * Tiny icon-sized capybara that bobs. The "capybara" is approximated by a
 * stack of two emoji (🦦 sized down) since there's no Unicode capybara —
 * we tag it with an aria-label and a data-testid so it's identifiable.
 */
export function Capybara({ top, left, onClick }: CapybaraProps) {
  return (
    <button
      type="button"
      data-testid="capybara"
      aria-label="Capybara"
      onClick={onClick}
      className="fixed z-[75] h-5 w-5 inline-flex items-center justify-center text-base leading-none cursor-pointer animate-capybara-bob hover:scale-150 transition-transform"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <span aria-hidden>🦫</span>
    </button>
  )
}
