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
import { VerificationStep } from '@/components/verification/VerificationStep'
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
  const [step, setStep] = useState<'form' | 'verification'>('form')
  const [pendingLimits, setPendingLimits] = useState<{
    daily_limit: number
    monthly_limit: number
  } | null>(null)

  const hasChanged = dailyLimit !== currentDailyLimit || monthlyLimit !== currentMonthlyLimit
  const isValid = hasChanged && dailyLimit > 0 && monthlyLimit > 0 && dailyLimit <= monthlyLimit

  const handleSave = () => {
    if (isValid) {
      setPendingLimits({ daily_limit: dailyLimit, monthly_limit: monthlyLimit })
      setStep('verification')
    }
  }

  const handleVerified = () => {
    if (pendingLimits) {
      onSubmit(pendingLimits)
      setStep('form')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Limits</DialogTitle>
        </DialogHeader>
        {step === 'verification' ? (
          <VerificationStep
            challengeId={null}
            codeRequested
            loading={false}
            error={null}
            onStatusVerified={handleVerified}
            onVerified={handleVerified}
            onBack={() => setStep('form')}
          />
        ) : (
          <>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Current: {formatCurrency(currentDailyLimit, currency)} / day,{' '}
                {formatCurrency(currentMonthlyLimit, currency)} / month
              </p>
              <div>
                <Label htmlFor="daily-limit">Daily Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="monthly-limit">Monthly Limit</Label>
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
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isValid || loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
