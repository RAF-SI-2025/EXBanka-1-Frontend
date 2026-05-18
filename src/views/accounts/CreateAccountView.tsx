import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { CreateAccountForm } from '@/views/accounts/components/CreateAccountForm'
import { ViewShell } from '@/views/shared'

export function CreateAccountView() {
  const navigate = useNavigate()

  return (
    <ViewShell title="Create Account" subtitle="Open a new account for an existing client.">
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <CreateAccountForm onSuccess={() => navigate('/admin/accounts')} />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
