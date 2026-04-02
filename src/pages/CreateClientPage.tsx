import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateClient } from '@/hooks/useClients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientSchema } from '@/lib/utils/validation'
import { todayISO, dateToUnixTimestamp } from '@/lib/utils/dateFormatter'
import type { z } from 'zod'

type FormValues = z.infer<typeof createClientSchema>

export function CreateClientPage() {
  const navigate = useNavigate()
  const createClient = useCreateClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createClientSchema),
  })

  const onSubmit = (data: FormValues) => {
    createClient.mutate(
      { ...data, date_of_birth: dateToUnixTimestamp(data.date_of_birth) },
      { onSuccess: () => navigate('/admin/clients') }
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">New Client</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                max={todayISO()}
                {...register('date_of_birth')}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="jmbg">JMBG</Label>
              <Input id="jmbg" {...register('jmbg')} placeholder="1234567890123" />
              {errors.jmbg && <p className="text-sm text-destructive">{errors.jmbg.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/admin/clients')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? 'Creating...' : 'Create Client'}
              </Button>
            </div>

            {createClient.isError && (
              <p className="text-sm text-destructive">Error creating client. Please try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
