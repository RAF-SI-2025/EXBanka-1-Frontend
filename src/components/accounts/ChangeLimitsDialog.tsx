import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'

interface ChangeLimitsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDailyLimit: number
  currentMonthlyLimit: number
  currency: string
  onSubmit: (limits: { daily_limit: number; monthly_limit: number }) => void
  loading: boolean
}

export function ChangeLimitsDialog({
  open,
  onOpenChange,
  currentDailyLimit,
  currentMonthlyLimit,
  currency,
  onSubmit,
  loading,
}: ChangeLimitsDialogProps) {
  const [dailyLimit, setDailyLimit] = useState(currentDailyLimit)
  const [monthlyLimit, setMonthlyLimit] = useState(currentMonthlyLimit)

  const hasChanged = dailyLimit !== currentDailyLimit || monthlyLimit !== currentMonthlyLimit
  const isValid = hasChanged && dailyLimit > 0 && monthlyLimit > 0 && dailyLimit <= monthlyLimit

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({ daily_limit: dailyLimit, monthly_limit: monthlyLimit })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promena limita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Trenutno: {formatCurrency(currentDailyLimit, currency)} / dan,{' '}
            {formatCurrency(currentMonthlyLimit, currency)} / mesec
          </p>
          <div>
            <Label htmlFor="daily-limit">Dnevni limit</Label>
            <Input
              id="daily-limit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="monthly-limit">Mesečni limit</Label>
            <Input
              id="monthly-limit"
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
