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
import type { CardBrand } from '@/types/card'

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
  const [selectedBrand, setSelectedBrand] = useState<CardBrand | undefined>()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <p>Loading...</p>

  const onMutationError = () => setError('An error occurred. Please try again.')

  const handleSelectAccount = (accountNumber: string, cardBrand: CardBrand) => {
    setSelectedAccount(accountNumber)
    setSelectedBrand(cardBrand)
    setError(null)
    const acc = accounts.find((a) => a.account_number === accountNumber)
    if (acc?.account_category === 'business') {
      setStep('business-choice')
    } else {
      requestCard.mutate(
        {
          account_number: accountNumber,
          card_brand: cardBrand,
        },
        { onSuccess: () => setStep('verify'), onError: onMutationError }
      )
    }
  }

  const handleRequestForSelf = () => {
    setError(null)
    requestCard.mutate(
      {
        account_number: selectedAccount,
        card_brand: selectedBrand,
      },
      { onSuccess: () => setStep('verify'), onError: onMutationError }
    )
  }

  const handleRequestForAP = (data: CreateAuthorizedPersonRequest) => {
    setError(null)
    const acc = accounts.find((a) => a.account_number === selectedAccount)
    requestForAP.mutate(
      { ...data, account_id: acc?.id ?? 0 },
      {
        onSuccess: () => {
          requestCard.mutate(
            {
              account_number: selectedAccount,
              card_brand: selectedBrand,
            },
            { onSuccess: () => setStep('verify'), onError: onMutationError }
          )
        },
        onError: onMutationError,
      }
    )
  }

  const handleConfirm = (code: string) => {
    setError(null)
    confirmCard.mutate(
      { account_number: selectedAccount, code },
      { onSuccess: () => setStep('success'), onError: onMutationError }
    )
  }

  const errorBanner = error ? (
    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
  ) : null

  if (step === 'success') {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Card successfully created!</h2>
        <Button onClick={() => navigate('/cards')}>Back to Cards</Button>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        {errorBanner}
        <VerificationCodeInput onSubmit={handleConfirm} loading={confirmCard.isPending} />
      </div>
    )
  }

  if (step === 'authorized-person') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('business-choice')}>
          ← Back
        </Button>
        {errorBanner}
        <AuthorizedPersonForm
          onSubmit={handleRequestForAP}
          loading={requestForAP.isPending || requestCard.isPending}
        />
      </div>
    )
  }

  if (step === 'business-choice') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setStep('select')}>
          ← Back
        </Button>
        {errorBanner}
        <h2 className="text-lg font-semibold">Who do you want a card for?</h2>
        <div className="flex gap-3">
          <Button onClick={handleRequestForSelf} disabled={requestCard.isPending}>
            For Myself
          </Button>
          <Button variant="outline" onClick={() => setStep('authorized-person')}>
            For Authorized Person
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/cards')}>
        ← Back
      </Button>
      {errorBanner}
      <CardRequestForm
        accounts={accounts}
        onSubmit={handleSelectAccount}
        loading={requestCard.isPending}
      />
    </div>
  )
}
