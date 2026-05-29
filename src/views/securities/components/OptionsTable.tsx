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
import { hoverLift, rowEnter } from '@/views/shared'
import { WatchlistButton } from '@/views/securities/components/WatchlistButton'

interface OptionsTableProps {
  options: Option[]
  onRowClick: (id: number) => void
  onBuy: (option: Option) => void
  watchlistIds?: Set<number>
  onToggleWatchlist?: (listingId: number, inWatchlist: boolean) => void
}

export function OptionsTable({
  options,
  onRowClick,
  onBuy,
  watchlistIds,
  onToggleWatchlist,
}: OptionsTableProps) {
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
            className={`${hoverLift} ${rowEnter}`}
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBuy(option)
                  }}
                >
                  Buy
                </Button>
                {onToggleWatchlist && (
                  <WatchlistButton
                    listingId={option.id}
                    ticker={option.ticker}
                    inWatchlist={watchlistIds?.has(option.id) ?? false}
                    onToggle={onToggleWatchlist}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
