import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormCardProps {
  title: string
  children: React.ReactNode
  isSuccess?: boolean
  successContent?: React.ReactNode
  error?: string | null
  onTitleClick?: () => void
}

export function AuthFormCard({
  title,
  children,
  isSuccess,
  successContent,
  error,
  onTitleClick,
}: AuthFormCardProps) {
  if (isSuccess) {
    return (
      <Card className="border-t-4 border-t-primary">
        <CardContent className="pt-6 text-center space-y-4">{successContent}</CardContent>
      </Card>
    )
  }

  const titleNode = onTitleClick ? (
    <span data-testid="auth-form-title-secret" onClick={onTitleClick}>
      {title}
    </span>
  ) : (
    title
  )

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{titleNode}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive text-center mb-4">{error}</div>}
        {children}
      </CardContent>
    </Card>
  )
}
