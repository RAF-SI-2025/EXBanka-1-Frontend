import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VerificationStepProps {
  onVerified: (code: string) => void
  onBack: () => void
  onRequestCode: () => void
  loading: boolean
  error: string | null
  codeRequested: boolean
}

export function VerificationStep({
  onVerified,
  onBack,
  onRequestCode,
  loading,
  error,
  codeRequested,
}: VerificationStepProps) {
  const [code, setCode] = useState('')

  const handleSubmit = () => {
    if (code.length > 0) {
      onVerified(code)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeRequested ? (
          <>
            <p className="text-sm text-muted-foreground">
              Click the button below to receive a verification code via email.
            </p>
            <Button onClick={onRequestCode} disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code you received via email. The code is valid for 5 minutes.
            </p>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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
        {!codeRequested && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
