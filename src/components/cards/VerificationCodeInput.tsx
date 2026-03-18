import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VerificationCodeInputProps {
  onSubmit: (code: string) => void
  loading: boolean
}

export function VerificationCodeInput({ onSubmit, loading }: VerificationCodeInputProps) {
  const [code, setCode] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unesite verifikacioni kod</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verifikacioni kod je poslat na vašu email adresu.
        </p>
        <div>
          <Label htmlFor="code">Verifikacioni kod</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Verifikacioni kod"
            maxLength={6}
          />
        </div>
        <Button
          onClick={() => code && onSubmit(code)}
          disabled={!code || loading}
          className="w-full"
        >
          {loading ? 'Potvrđivanje...' : 'Potvrdi'}
        </Button>
      </CardContent>
    </Card>
  )
}
