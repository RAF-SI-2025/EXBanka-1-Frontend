import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAccounts } from '@/hooks/useAccounts'
import {
  useRequestCard,
  useConfirmCardRequest,
  useRequestCardForAuthorizedPerson,
} from '@/hooks/useCards'
import { CardRequestForm } from '@/components/cards/CardRequestForm'
import { AuthorizedPersonForm } from '@/components/cards/AuthorizedPersonForm'
import { VerificationCodeInput } from '@/components/cards/VerificationCodeInput'
import { Button } from '@/components/ui/button'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

type Step = 'select' | 'business-choice' | 'authorized-person' | 'verify' | 'success'

export function CardRequestPage() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const requestCard = useRequestCard()
  const confirmCard = useConfirmCardRequest()
  const requestForAP = useRequestCardForAuthorizedPerson()
  const [step, setStep] = useState<Step>('select')
  const [selectedAccount, setSelectedAccount] = useState('')

  if (isLoading) return <p>Učitavanje...</p>

  const handleSelectAccount = (accountNumber: string) => {
    setSelectedAccount(accountNumber)
    const acc = accounts.find((a) => a.account_number === accountNumber)
    if (acc?.account_category === 'COMPANY') {
      setStep('business-choice')
    } else {
      requestCard.mutate({ account_number: accountNumber }, { onSuccess: () => setStep('verify') })
    }
  }

  const handleRequestForSelf = () => {
    requestCard.mutate({ account_number: selectedAccount }, { onSuccess: () => setStep('verify') })
  }

  const handleRequestForAP = (data: CreateAuthorizedPersonRequest) => {
    requestForAP.mutate(
      { account_number: selectedAccount, authorized_person: data },
      { onSuccess: () => setStep('verify') }
    )
  }

  const handleConfirm = (code: string) => {
    confirmCard.mutate(
      { account_number: selectedAccount, code },
      { onSuccess: () => setStep('success') }
    )
  }

  if (step === 'success') {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Kartica uspešno kreirana!</h2>
        <Button onClick={() => navigate('/cards')}>Nazad na kartice</Button>
      </div>
    )
  }

  if (step === 'verify') {
    return <VerificationCodeInput onSubmit={handleConfirm} loading={confirmCard.isPending} />
  }

  if (step === 'authorized-person') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('business-choice')}>
          ← Nazad
        </Button>
        <AuthorizedPersonForm onSubmit={handleRequestForAP} loading={requestForAP.isPending} />
      </div>
    )
  }

  if (step === 'business-choice') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('select')}>
          ← Nazad
        </Button>
        <h2 className="text-lg font-semibold">Za koga tražite karticu?</h2>
        <div className="flex gap-3">
          <Button onClick={handleRequestForSelf} disabled={requestCard.isPending}>
            Za sebe
          </Button>
          <Button variant="outline" onClick={() => setStep('authorized-person')}>
            Za ovlašćeno lice
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/cards')}>
        ← Nazad
      </Button>
      <CardRequestForm
        accounts={accounts}
        onSubmit={handleSelectAccount}
        loading={requestCard.isPending}
      />
    </div>
  )
}
