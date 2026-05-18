import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'

interface CompanyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  errors: FieldErrors
  prefix?: string
}

export function CompanyForm({ register, errors, prefix = 'company' }: CompanyFormProps) {
  const field = (name: string) => `${prefix}.${name}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (name: string) => (errors?.[prefix] as any)?.[name]?.message as string | undefined

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-semibold text-sm">Company Information</h3>
      <div>
        <Label htmlFor={field('name')}>Company Name</Label>
        <Input id={field('name')} {...register(field('name'))} />
        {error('name') && <p className="text-sm text-destructive mt-1">{error('name')}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={field('registration_number')}>Registration Number</Label>
          <Input
            id={field('registration_number')}
            {...register(field('registration_number'))}
            placeholder="12345678"
          />
          {error('registration_number') && (
            <p className="text-sm text-destructive mt-1">{error('registration_number')}</p>
          )}
        </div>
        <div>
          <Label htmlFor={field('tax_number')}>Tax Number (PIB)</Label>
          <Input
            id={field('tax_number')}
            {...register(field('tax_number'))}
            placeholder="123456789"
          />
          {error('tax_number') && (
            <p className="text-sm text-destructive mt-1">{error('tax_number')}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor={field('activity_code')}>Activity Code</Label>
        <Input
          id={field('activity_code')}
          {...register(field('activity_code'))}
          placeholder="62.01"
        />
        {error('activity_code') && (
          <p className="text-sm text-destructive mt-1">{error('activity_code')}</p>
        )}
      </div>
      <div>
        <Label htmlFor={field('address')}>Address</Label>
        <Input id={field('address')} {...register(field('address'))} />
        {error('address') && <p className="text-sm text-destructive mt-1">{error('address')}</p>}
      </div>
    </div>
  )
}
