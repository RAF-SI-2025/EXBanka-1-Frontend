import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Company } from '@/types/account'

interface BusinessAccountInfoProps {
  company?: Company
}

export function BusinessAccountInfo({ company }: BusinessAccountInfoProps) {
  if (!company) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podaci o firmi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Naziv</span>
          <span>{company.name}</span>
          <span className="text-muted-foreground">Matični broj</span>
          <span>{company.registration_number}</span>
          <span className="text-muted-foreground">PIB</span>
          <span>{company.tax_number}</span>
          <span className="text-muted-foreground">Šifra delatnosti</span>
          <span>{company.activity_code}</span>
          <span className="text-muted-foreground">Adresa</span>
          <span>{company.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
