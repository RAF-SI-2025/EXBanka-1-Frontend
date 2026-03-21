import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { todayISO, dateToUnixTimestamp } from '@/lib/utils/dateFormatter'
import type { CreateAuthorizedPersonRequest } from '@/types/authorized-person'

interface AuthorizedPersonFormProps {
  onSubmit: (data: CreateAuthorizedPersonRequest) => void
  loading: boolean
}

export function AuthorizedPersonForm({ onSubmit, loading }: AuthorizedPersonFormProps) {
  const [form, setForm] = useState<
    Omit<CreateAuthorizedPersonRequest, 'date_of_birth'> & { date_of_birth: string }
  >({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
  })

  const isValid = form.first_name && form.last_name && form.email

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podaci ovlašćenog lica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ap-fname">Ime</Label>
            <Input
              id="ap-fname"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ap-lname">Prezime</Label>
            <Input
              id="ap-lname"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ap-email">Email</Label>
          <Input
            id="ap-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ap-phone">Telefon</Label>
          <Input
            id="ap-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ap-address">Adresa</Label>
          <Input
            id="ap-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ap-dob">Datum rođenja</Label>
          <Input
            id="ap-dob"
            type="date"
            max={todayISO()}
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
        </div>
        <Button
          onClick={() =>
            isValid && onSubmit({ ...form, date_of_birth: dateToUnixTimestamp(form.date_of_birth) })
          }
          disabled={!isValid || loading}
          className="w-full"
        >
          {loading ? 'Slanje...' : 'Zatraži karticu za ovlašćeno lice'}
        </Button>
      </CardContent>
    </Card>
  )
}
