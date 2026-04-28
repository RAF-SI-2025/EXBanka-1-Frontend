import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Capybara } from '@/components/animations/Capybara'
import { CapybaraContext } from '@/hooks/useCapybara'

const APPEAR_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const VISIBLE_MS = 5_000

interface Position {
  top: number
  left: number
}

function randomPosition(): Position {
  // Stay 24px clear of the edges so the icon is fully visible.
  const w = typeof window !== 'undefined' ? window.innerWidth : 800
  const h = typeof window !== 'undefined' ? window.innerHeight : 600
  return {
    top: 24 + Math.random() * (h - 64),
    left: 24 + Math.random() * (w - 64),
  }
}

export function CapybaraProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Position | null>(null)
  const [stolen, setStolen] = useState(false)

  // Schedule capybara appearances every 5 minutes.
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(randomPosition())
    }, APPEAR_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Auto-hide the capybara after VISIBLE_MS if not clicked.
  useEffect(() => {
    if (!position) return
    const t = setTimeout(() => setPosition(null), VISIBLE_MS)
    return () => clearTimeout(t)
  }, [position])

  // Any click while stolen restores the menu.
  useEffect(() => {
    if (!stolen) return
    const handler = () => setStolen(false)
    // Defer attachment to next tick so the capybara click that set
    // `stolen=true` doesn't immediately undo itself.
    const timer = setTimeout(() => {
      window.addEventListener('click', handler, { once: true })
    }, 0)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handler)
    }
  }, [stolen])

  const handleCapybaraClick = () => {
    setStolen(true)
    setPosition(null)
  }

  return (
    <CapybaraContext.Provider value={{ stolen }}>
      {children}
      {position && (
        <Capybara top={position.top} left={position.left} onClick={handleCapybaraClick} />
      )}
    </CapybaraContext.Provider>
  )
}
