import { useState } from 'react'
import {
  usePaymentRecipients,
  useCreatePaymentRecipient,
  useUpdatePaymentRecipient,
  useDeletePaymentRecipient,
} from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RecipientForm } from '@/components/payments/RecipientForm'
import { RecipientList } from '@/components/payments/RecipientList'
import { paymentRecipientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'
import type { PaymentRecipient } from '@/types/payment'

type FormValues = z.infer<typeof paymentRecipientSchema>

export function PaymentRecipientsPage() {
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
        onSuccess: () => {
          setShowForm(false)
        },
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

  const formDefaultValues = editingRecipient
    ? {
        recipient_name: editingRecipient.recipient_name,
        account_number: editingRecipient.account_number,
      }
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Saved Recipients</h1>
        <Button onClick={handleToggleForm}>{showForm ? 'Cancel' : 'Add Recipient'}</Button>
      </div>

      {showForm && (
        <Card>
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

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <RecipientList recipients={recipients ?? []} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Dialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipient?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteRecipient.isPending}
              onClick={() => {
                if (deletingId !== null) {
                  deleteRecipient.mutate(deletingId, { onSuccess: () => setDeletingId(null) })
                }
              }}
            >
              {deleteRecipient.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
