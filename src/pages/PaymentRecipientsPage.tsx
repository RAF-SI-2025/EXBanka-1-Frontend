import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  usePaymentRecipients,
  useCreatePaymentRecipient,
  useUpdatePaymentRecipient,
  useDeletePaymentRecipient,
} from '@/hooks/usePayments'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { paymentRecipientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof paymentRecipientSchema>

export function PaymentRecipientsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { data: recipients, isLoading } = usePaymentRecipients()
  const createRecipient = useCreatePaymentRecipient()
  const updateRecipient = useUpdatePaymentRecipient()
  const deleteRecipient = useDeletePaymentRecipient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(paymentRecipientSchema),
  })

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      updateRecipient.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            reset()
            setShowForm(false)
            setEditingId(null)
          },
        }
      )
    } else {
      createRecipient.mutate(data, {
        onSuccess: () => {
          reset()
          setShowForm(false)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sačuvani primaoci</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            reset()
          }}
        >
          {showForm ? 'Otkaži' : 'Dodaj primaoca'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Izmeni primaoca' : 'Novi primalac'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Ime primaoca</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="account_number">Broj računa</Label>
                <Input id="account_number" {...register('account_number')} />
                {errors.account_number && (
                  <p className="text-sm text-destructive">{errors.account_number.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reference">Poziv na broj</Label>
                <Input id="reference" {...register('reference')} />
              </div>
              <div>
                <Label htmlFor="payment_code">Šifra plaćanja</Label>
                <Input id="payment_code" {...register('payment_code')} />
              </div>
              <Button
                type="submit"
                disabled={createRecipient.isPending || updateRecipient.isPending}
              >
                {createRecipient.isPending || updateRecipient.isPending
                  ? 'Čuvanje...'
                  : editingId
                    ? 'Sačuvaj izmene'
                    : 'Dodaj'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime</TableHead>
              <TableHead>Broj računa</TableHead>
              <TableHead>Poziv na broj</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(recipients ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell className="font-mono text-sm">{r.account_number}</TableCell>
                <TableCell>{r.reference ?? '—'}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(r.id)
                      setShowForm(true)
                      reset({
                        name: r.name,
                        account_number: r.account_number,
                        reference: r.reference ?? '',
                        payment_code: r.payment_code ?? '',
                      })
                    }}
                  >
                    Izmeni
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRecipient.mutate(r.id)}
                  >
                    Obriši
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(recipients ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nema sačuvanih primalaca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
