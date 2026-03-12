import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  to?: string
}

export function BackButton({ to }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Back"
      onClick={() => navigate(to ?? (-1 as never))}
      className="text-accent-2 border-accent-2 hover:bg-accent-2/10"
    >
      ←
    </Button>
  )
}
