import { useState } from 'react'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BackendSelector } from '@/views/auth/components/BackendSelector'
import { getCurrentHost } from '@/lib/api/backendHost'

interface BackendSwitcherButtonProps {
  onHostChange?: (host: string) => void
}

export function BackendSwitcherButton({ onHostChange }: BackendSwitcherButtonProps) {
  const [open, setOpen] = useState(false)
  const currentHost = getCurrentHost()

  const handleHostChange = (host: string) => {
    setOpen(false)
    onHostChange?.(host)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        onClick={() => setOpen(true)}
      >
        <Server className="size-4 mr-2" aria-hidden />
        <span className="truncate">Backend</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Switch backend</DialogTitle>
            <DialogDescription>
              Currently connected to {currentHost}. Switching will sign you out so you can log in
              against the new backend.
            </DialogDescription>
          </DialogHeader>
          <BackendSelector onHostChange={handleHostChange} />
        </DialogContent>
      </Dialog>
    </>
  )
}
