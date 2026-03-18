import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ExchangeRate } from '@/types/exchange'

interface ExchangeRateTableProps {
  rates: ExchangeRate[]
}

export function ExchangeRateTable({ rates }: ExchangeRateTableProps) {
  if (rates.length === 0) {
    return <p className="text-muted-foreground">Nema podataka o kursnoj listi.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Oznaka</TableHead>
          <TableHead>Valuta</TableHead>
          <TableHead className="text-right">Kupovni kurs</TableHead>
          <TableHead className="text-right">Prodajni kurs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.map((rate) => (
          <TableRow key={rate.currency_code}>
            <TableCell className="font-medium">{rate.currency_code}</TableCell>
            <TableCell>{rate.currency_name}</TableCell>
            <TableCell className="text-right">{rate.buy_rate.toFixed(2)}</TableCell>
            <TableCell className="text-right">{rate.sell_rate.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
