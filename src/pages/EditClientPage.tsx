import { useParams, useNavigate } from 'react-router-dom'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EditClientForm } from '@/components/admin/EditClientForm'
import type { UpdateClientRequest } from '@/types/client'

export function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clientId = Number(id)
  const { data: client, isLoading } = useClient(clientId)
  const updateClient = useUpdateClient(clientId)

  if (isLoading) return <p>Loading...</p>
  if (!client) return <p>Client not found.</p>

  const handleSubmit = (data: UpdateClientRequest) => {
    updateClient.mutate(data, { onSuccess: () => navigate('/admin/clients') })
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <EditClientForm
            client={client}
            onSubmit={handleSubmit}
            submitting={updateClient.isPending}
          />
          {updateClient.isError && (
            <p className="text-sm text-destructive mt-2">Error saving. Please try again.</p>
          )}
          <Button
            variant="outline"
            type="button"
            className="mt-3"
            onClick={() => navigate('/admin/clients')}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
