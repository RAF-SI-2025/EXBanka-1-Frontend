import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormCardProps {
  title: string
  children: React.ReactNode
  isSuccess?: boolean
  successContent?: React.ReactNode
  error?: string | null
}

export function AuthFormCard({
  title,
  children,
  isSuccess,
  successContent,
  error,
}: AuthFormCardProps) {
  if (isSuccess) {
    return (
      <Card className="border-t-4 border-t-primary">
        <CardContent className="pt-6 text-center space-y-4">{successContent}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive text-center mb-4">{error}</div>}
        {children}
      </CardContent>
    </Card>
  )
}
