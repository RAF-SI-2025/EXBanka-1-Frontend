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
        <CardTitle>Verifikacija</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeRequested ? (
          <>
            <p className="text-sm text-muted-foreground">
              Kliknite dugme ispod da biste dobili verifikacioni kod na email.
            </p>
            <Button onClick={onRequestCode} disabled={loading}>
              {loading ? 'Slanje...' : 'Pošalji kod'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Unesite 6-cifreni kod koji ste dobili na email. Kod važi 5 minuta.
            </p>
            <div>
              <Label htmlFor="verification-code">Verifikacioni kod</Label>
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
                Nazad
              </Button>
              <Button onClick={handleSubmit} disabled={loading || code.length === 0}>
                {loading ? 'Provera...' : 'Potvrdi'}
              </Button>
            </div>
          </>
        )}
        {!codeRequested && (
          <Button variant="ghost" onClick={onBack}>
            Nazad
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
