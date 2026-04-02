import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateAccountForm } from '@/components/accounts/CreateAccountForm'

export function CreateAccountPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAccountForm onSuccess={() => navigate('/admin/accounts')} />
        </CardContent>
      </Card>
    </div>
  )
}
