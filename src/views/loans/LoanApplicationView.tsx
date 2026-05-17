import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { submitLoanRequest, resetLoanFlow } from '@/store/slices/loanSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoanApplicationForm } from '@/views/loans/components/LoanApplicationForm'
import type { CreateLoanRequest } from '@/types/loan'
import { ViewShell } from '@/views/shared'

export function LoanApplicationView() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { step, submitting, error, result } = useAppSelector((s) => s.loan)
  const currentUser = useAppSelector(selectCurrentUser)
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  useEffect(() => {
    return () => {
      dispatch(resetLoanFlow())
    }
  }, [dispatch])

  if (step === 'success' && result) {
    return (
      <ViewShell title="Loan request submitted">
        <p className="text-muted-foreground">Your request is being processed.</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/loans')}>Back to Loans</Button>
          <Button variant="outline" onClick={() => dispatch(resetLoanFlow())}>
            New Request
          </Button>
        </div>
      </ViewShell>
    )
  }

  const onSubmit = (data: Omit<CreateLoanRequest, 'client_id'>) => {
    if (!currentUser) return
    dispatch(submitLoanRequest({ ...data, client_id: currentUser.id }))
  }

  return (
    <ViewShell
      title="Submit Loan Request"
      subtitle="Apply for a personal, cash, mortgage, or business loan."
    >
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <LoanApplicationForm
            accounts={accounts}
            onSubmit={onSubmit}
            submitting={submitting}
            error={error}
          />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
