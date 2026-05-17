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
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{company.name}</span>
          <span className="text-muted-foreground">Registration Number</span>
          <span>{company.registration_number}</span>
          <span className="text-muted-foreground">Tax ID</span>
          <span>{company.tax_number}</span>
          <span className="text-muted-foreground">Activity Code</span>
          <span>{company.activity_code}</span>
          <span className="text-muted-foreground">Address</span>
          <span>{company.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
