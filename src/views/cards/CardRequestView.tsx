import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useRequestCard, useRequestCardForAuthorizedPerson } from '@/hooks/useCards'
import { CardRequestForm } from '@/views/cards/components/CardRequestForm'
import { AuthorizedPersonForm } from '@/views/cards/components/AuthorizedPersonForm'
import { Button } from '@/components/ui/button'
import { isDuplicateEmailError } from '@/lib/errors'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { CardBrand } from '@/types/card'
import { LoadingState, ViewShell } from '@/views/shared'

type Step = 'select' | 'business-choice' | 'authorized-person' | 'success'

export function CardRequestView() {
  const navigate = useNavigate()
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [emailDuplicate, setEmailDuplicate] = useState<string | undefined>()
  const requestCard = useRequestCard()
  const requestForAP = useRequestCardForAuthorizedPerson({
    onError: (err) => {
      if (isDuplicateEmailError(err)) {
        setEmailDuplicate('Email is already in use')
      }
    },
  })
  const [step, setStep] = useState<Step>('select')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<CardBrand | undefined>()
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }

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
        { onSuccess: () => setStep('success'), onError: onMutationError }
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
      { onSuccess: () => setStep('success'), onError: onMutationError }
    )
  }

  const handleRequestForAP = (data: CreateAuthorizedPersonRequest) => {
    setError(null)
    setEmailDuplicate(undefined)
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
            { onSuccess: () => setStep('success'), onError: onMutationError }
          )
        },
        onError: (err) => {
          if (!isDuplicateEmailError(err)) {
            onMutationError()
          }
        },
      }
    )
  }

  const errorBanner = error ? (
    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
  ) : null

  if (step === 'success') {
    return (
      <ViewShell title="Card request submitted!">
        <p className="text-muted-foreground">
          Your card request has been received and is pending approval.
        </p>
        <Button onClick={() => navigate('/cards')}>Back to Cards</Button>
      </ViewShell>
    )
  }

  if (step === 'authorized-person') {
    return (
      <ViewShell
        title={
          <span className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep('business-choice')}>
              ← Back
            </Button>
            Authorized Person Details
          </span>
        }
      >
        {errorBanner}
        <AuthorizedPersonForm
          onSubmit={handleRequestForAP}
          loading={requestForAP.isPending || requestCard.isPending}
          externalEmailError={emailDuplicate}
        />
      </ViewShell>
    )
  }

  if (step === 'business-choice') {
    return (
      <ViewShell
        title={
          <span className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
              ← Back
            </Button>
            Who do you want a card for?
          </span>
        }
      >
        {errorBanner}
        <div className="flex gap-3">
          <Button onClick={handleRequestForSelf} disabled={requestCard.isPending}>
            For Myself
          </Button>
          <Button variant="outline" onClick={() => setStep('authorized-person')}>
            For Authorized Person
          </Button>
        </div>
      </ViewShell>
    )
  }

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cards')}>
            ← Back
          </Button>
          Request a Card
        </span>
      }
    >
      {errorBanner}
      <CardRequestForm
        accounts={accounts}
        onSubmit={handleSelectAccount}
        loading={requestCard.isPending}
      />
    </ViewShell>
  )
}
