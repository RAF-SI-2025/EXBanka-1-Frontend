import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateClientSchema } from '@/lib/utils/validation'
import type { Client, UpdateClientRequest } from '@/types/client'
import type { z } from 'zod'

type FormValues = z.infer<typeof updateClientSchema>

interface EditClientFormProps {
  client: Client
  onSubmit: (data: UpdateClientRequest) => void
  submitting: boolean
}

export function EditClientForm({ client, onSubmit, submitting }: EditClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateClientSchema),
  })

  useEffect(() => {
    reset({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone ?? '',
      address: client.address ?? '',
      gender: client.gender ?? '',
    })
  }, [client, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
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
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
