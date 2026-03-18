import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateClientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof updateClientSchema>

export function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clientId = Number(id)
  const { data: client, isLoading } = useClient(clientId)
  const updateClient = useUpdateClient(clientId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateClientSchema),
  })

  useEffect(() => {
    if (client) {
      reset({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone ?? '',
        address: client.address ?? '',
        gender: client.gender ?? '',
      })
    }
  }, [client, reset])

  if (isLoading) return <p>Učitavanje...</p>
  if (!client) return <p>Klijent nije pronađen.</p>

  const onSubmit = (data: FormValues) => {
    updateClient.mutate(data, { onSuccess: () => navigate('/admin/clients') })
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Izmeni klijenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Ime</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Prezime</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <div>
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/admin/clients')}>
                Otkaži
              </Button>
              <Button type="submit" disabled={updateClient.isPending}>
                {updateClient.isPending ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </div>

            {updateClient.isError && (
              <p className="text-sm text-destructive">Greška pri čuvanju. Pokušajte ponovo.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
