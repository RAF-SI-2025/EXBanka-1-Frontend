import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { authorizedPersonSchema } from '@/lib/utils/validation'
import { GENDERS } from '@/lib/utils/constants'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'
import type { z } from 'zod'

type FormValues = z.infer<typeof authorizedPersonSchema>

interface AuthorizedPersonFormProps {
  onSubmit: (data: CreateAuthorizedPersonRequest) => void
  loading: boolean
}

export function AuthorizedPersonForm({ onSubmit, loading }: AuthorizedPersonFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(authorizedPersonSchema) })

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      date_of_birth: new Date(data.date_of_birth).getTime() / 1000,
      gender: data.gender ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorized Person Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ap-fname">First Name</Label>
              <Input id="ap-fname" {...register('first_name')} aria-label="First Name" />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="ap-lname">Last Name</Label>
              <Input id="ap-lname" {...register('last_name')} aria-label="Last Name" />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ap-dob">Date of Birth</Label>
            <Input
              id="ap-dob"
              type="date"
              {...register('date_of_birth')}
              aria-label="Date of Birth"
            />
            {errors.date_of_birth && (
              <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ap-gender">Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger id="ap-gender" aria-label="Gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="ap-email">Email</Label>
            <Input id="ap-email" type="email" {...register('email')} aria-label="Email" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="ap-phone">Phone</Label>
            <Input id="ap-phone" {...register('phone')} aria-label="Phone" />
          </div>
          <div>
            <Label htmlFor="ap-address">Address</Label>
            <Input id="ap-address" {...register('address')} aria-label="Address" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Request Card for Authorized Person'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
