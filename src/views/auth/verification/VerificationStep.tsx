import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getChallengeStatus } from '@/lib/api/verification'

const POLL_INTERVAL_MS = 3000

interface VerificationStepProps {
  challengeId: number | null
  onStatusVerified: () => void
  onVerified: (code: string) => void
  onBack: () => void
  loading: boolean
  error: string | null
  codeRequested: boolean
}

export function VerificationStep({
  challengeId,
  onStatusVerified,
  onVerified,
  onBack,
  loading,
  error,
  codeRequested,
}: VerificationStepProps) {
  const [code, setCode] = useState('')
  const [pollError, setPollError] = useState<string | null>(null)
  const [prevChallengeId, setPrevChallengeId] = useState(challengeId)
  if (prevChallengeId !== challengeId) {
    setPrevChallengeId(challengeId)
    setPollError(null)
  }
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onStatusVerifiedRef = useRef(onStatusVerified)
  useEffect(() => {
    onStatusVerifiedRef.current = onStatusVerified
  }, [onStatusVerified])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!challengeId || !codeRequested) return

    const poll = async () => {
      try {
        const status = await getChallengeStatus(challengeId)
        if (status.status === 'verified') {
          stopPolling()
          onStatusVerifiedRef.current()
        } else if (status.status === 'expired') {
          stopPolling()
          setPollError('Verification challenge has expired. Please go back and try again.')
        } else if (status.status === 'failed') {
          stopPolling()
          setPollError('Verification failed. Maximum attempts exceeded.')
        }
      } catch {
        // Don't stop polling on transient network errors
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      stopPolling()
    }
  }, [challengeId, codeRequested, stopPolling])

  const handleSubmit = () => {
    if (code.length > 0) {
      onVerified(code)
    }
  }

  const polling = !!challengeId && codeRequested && !pollError
  const displayError = error || pollError

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeRequested ? (
          <>
            <p className="text-sm text-muted-foreground">
              Waiting for verification challenge to be created...
            </p>
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          </>
        ) : (
          <>
            {polling && (
              <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/50">
                <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">
                  Waiting for mobile app authorization... You can also enter the code manually
                  below.
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            {displayError && <p className="text-sm text-destructive">{displayError}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || code.length === 0}>
                {loading ? 'Verifying...' : 'Confirm'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
