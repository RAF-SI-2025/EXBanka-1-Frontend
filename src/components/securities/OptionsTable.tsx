import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Option } from '@/types/security'

interface OptionsTableProps {
  options: Option[]
  onRowClick: (id: number) => void
  onBuy: (option: Option) => void
}

export function OptionsTable({ options, onRowClick, onBuy }: OptionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Strike Price</TableHead>
          <TableHead>Premium</TableHead>
          <TableHead>Settlement Date</TableHead>
          <TableHead>Implied Volatility</TableHead>
          <TableHead>Open Interest</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {options.map((option) => (
          <TableRow
            key={option.id}
            className="cursor-pointer"
            onClick={() => onRowClick(option.id)}
          >
            <TableCell className="font-mono font-semibold">{option.ticker}</TableCell>
            <TableCell>
              <Badge variant={option.option_type === 'call' ? 'default' : 'secondary'}>
                {option.option_type === 'call' ? 'Call' : 'Put'}
              </Badge>
            </TableCell>
            <TableCell>{option.strike_price}</TableCell>
            <TableCell>{option.premium}</TableCell>
            <TableCell>{option.settlement_date}</TableCell>
            <TableCell>{option.implied_volatility}</TableCell>
            <TableCell>{(option.open_interest ?? 0).toLocaleString()}</TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBuy(option)
                }}
              >
                Buy
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
