import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useClientAccounts } from '@/hooks/useAccounts'
import { submitLoanRequest, resetLoanFlow } from '@/store/slices/loanSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoanApplicationForm } from '@/components/loans/LoanApplicationForm'
import type { CreateLoanRequest } from '@/types/loan'

export function LoanApplicationPage() {
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
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Zahtev za kredit uspešno podnet!</h2>
        <p className="text-muted-foreground">Vaš zahtev je u obradi.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/loans')}>Nazad na kredite</Button>
          <Button variant="outline" onClick={() => dispatch(resetLoanFlow())}>
            Novi zahtev
          </Button>
        </div>
      </div>
    )
  }

  const onSubmit = (data: Omit<CreateLoanRequest, 'client_id'>) => {
    if (!currentUser) return
    dispatch(submitLoanRequest({ ...data, client_id: currentUser.id }))
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Podnesi zahtev za kredit</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanApplicationForm
            accounts={accounts}
            onSubmit={onSubmit}
            submitting={submitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
