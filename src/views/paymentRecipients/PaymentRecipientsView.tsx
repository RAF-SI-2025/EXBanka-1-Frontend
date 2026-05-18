import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useCreatePaymentRecipient,
  useDeletePaymentRecipient,
  usePaymentRecipients,
  useUpdatePaymentRecipient,
} from '@/hooks/usePayments'
import { paymentRecipientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'
import type { PaymentRecipient } from '@/types/payment'
import { DeleteRecipientDialog } from '@/views/paymentRecipients/components/DeleteRecipientDialog'
import { RecipientForm } from '@/views/paymentRecipients/components/RecipientForm'
import { RecipientList } from '@/views/paymentRecipients/components/RecipientList'
import { LoadingState, ViewShell, cardEnter } from '@/views/shared'

type FormValues = z.infer<typeof paymentRecipientSchema>

export function PaymentRecipientsView() {
  const [showForm, setShowForm] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<PaymentRecipient | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { data: recipients, isLoading } = usePaymentRecipients()
  const createRecipient = useCreatePaymentRecipient()
  const updateRecipient = useUpdatePaymentRecipient()
  const deleteRecipient = useDeletePaymentRecipient()

  const handleSubmit = (data: FormValues) => {
    if (editingRecipient) {
      updateRecipient.mutate(
        { id: editingRecipient.id, ...data },
        {
          onSuccess: () => {
            setShowForm(false)
            setEditingRecipient(null)
          },
        }
      )
    } else {
      createRecipient.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  const handleEdit = (recipient: PaymentRecipient) => {
    setEditingRecipient(recipient)
    setShowForm(true)
  }

  const handleDelete = (id: number) => setDeletingId(id)

  const handleToggleForm = () => {
    setShowForm(!showForm)
    setEditingRecipient(null)
  }

  const handleConfirmDelete = () => {
    if (deletingId !== null) {
      deleteRecipient.mutate(deletingId, { onSuccess: () => setDeletingId(null) })
    }
  }

  const formDefaultValues = editingRecipient
    ? {
        recipient_name: editingRecipient.recipient_name,
        account_number: editingRecipient.account_number,
      }
    : undefined

  return (
    <ViewShell
      title="Saved Recipients"
      subtitle="Recipients you’ve saved for fast re-use in payments."
      actions={<Button onClick={handleToggleForm}>{showForm ? 'Cancel' : 'Add Recipient'}</Button>}
    >
      {showForm && (
        <Card className={cardEnter}>
          <CardHeader>
            <CardTitle>{editingRecipient ? 'Edit Recipient' : 'New Recipient'}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientForm
              key={editingRecipient?.id ?? 'new'}
              onSubmit={handleSubmit}
              onCancel={handleToggleForm}
              submitting={createRecipient.isPending || updateRecipient.isPending}
              isEditing={!!editingRecipient}
              defaultValues={formDefaultValues}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <RecipientList
              recipients={recipients ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <DeleteRecipientDialog
        open={deletingId !== null}
        loading={deleteRecipient.isPending}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </ViewShell>
  )
}
