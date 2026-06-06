import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EditClientForm } from '@/views/clients/components/EditClientForm'
import { isDuplicateEmailError, notifyError } from '@/lib/errors'
import type { UpdateClientRequest } from '@/types/client'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

export function EditClientView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clientId = Number(id)
  const [emailDuplicate, setEmailDuplicate] = useState<string | undefined>()
  const { data: client, isLoading } = useClient(clientId)
  const updateClient = useUpdateClient(clientId, {
    onError: (err) => {
      if (isDuplicateEmailError(err)) {
        setEmailDuplicate('Email is already in use')
        return
      }
      notifyError(err)
    },
  })

  if (isLoading) {
    return (
      <ViewShell>
        <LoadingState />
      </ViewShell>
    )
  }
  if (!client) {
    return (
      <ViewShell title="Client">
        <EmptyState title="Client not found." />
      </ViewShell>
    )
  }

  const handleSubmit = (data: UpdateClientRequest) => {
    setEmailDuplicate(undefined)
    updateClient.mutate(data, { onSuccess: () => navigate('/admin/clients') })
  }

  return (
    <ViewShell title="Edit Client" subtitle="Update profile details for this client.">
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <EditClientForm
            client={client}
            onSubmit={handleSubmit}
            submitting={updateClient.isPending}
            externalEmailError={emailDuplicate}
          />
          {updateClient.isError && !emailDuplicate && (
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
    </ViewShell>
  )
}
