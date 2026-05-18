// Shared animation tokens for the views layer. All animations are powered by
// `tw-animate-css` (Tailwind utility classes prefixed with `animate-in`).
// Centralising the class strings keeps every view module visually consistent
// and means a future redesign only edits one file.

export const viewEnter = 'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out'

export const cardEnter = 'animate-in fade-in zoom-in-95 duration-300 ease-out'

export const panelEnter = 'animate-in fade-in slide-in-from-right-4 duration-300 ease-out'

export const rowEnter = 'animate-in fade-in slide-in-from-left-1 duration-200'

// Dialog body enter — pair with shadcn `<DialogContent>` to get a polished
// pop-in on top of the radix backdrop fade.
export const dialogEnter = 'animate-in fade-in zoom-in-95 duration-200 ease-out'

// Tab content enter — apply to a key-changing wrapper inside `<TabsContent>`
// so switching tabs feels alive rather than instant.
export const tabContentEnter = 'animate-in fade-in duration-200 ease-out'

// Hover lift used on clickable rows / cards
export const hoverLift = 'transition-colors duration-150 hover:bg-muted/40 cursor-pointer'
