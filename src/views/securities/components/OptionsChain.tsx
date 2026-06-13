import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Option } from '@/types/security'

interface OptionsChainProps {
  calls: Option[]
  puts: Option[]
  sharedPrice: number
  settlementDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function OptionsChain({
  calls,
  puts,
  sharedPrice,
  settlementDates,
  selectedDate,
  onDateChange,
}: OptionsChainProps) {
  const [strikeCount, setStrikeCount] = useState(5)

  const strikeMap = new Map<string, { call?: Option; put?: Option }>()
  calls.forEach((c) => {
    const entry = strikeMap.get(c.strike_price) || {}
    entry.call = c
    strikeMap.set(c.strike_price, entry)
  })
  puts.forEach((p) => {
    const entry = strikeMap.get(p.strike_price) || {}
    entry.put = p
    strikeMap.set(p.strike_price, entry)
  })

  const sortedStrikes = [...strikeMap.keys()].map(Number).sort((a, b) => a - b)
  const sharedIdx = sortedStrikes.findIndex((s) => s >= sharedPrice)
  const start = Math.max(0, sharedIdx - strikeCount)
  const end = Math.min(sortedStrikes.length, sharedIdx + strikeCount + 1)
  const visibleStrikes = sortedStrikes.slice(start, end)

  const isCallITM = (strike: number) => strike < sharedPrice
  const isPutITM = (strike: number) => strike > sharedPrice

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <Label>Settlement Date</Label>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          >
            {settlementDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="strike-count">Strikes shown</Label>
          <Input
            id="strike-count"
            type="number"
            min={1}
            value={strikeCount}
            onChange={(e) => setStrikeCount(Number(e.target.value) || 1)}
            className="w-20 ml-2 inline-block"
          />
        </div>
        <p className="text-sm font-semibold">Market Price: ${sharedPrice.toFixed(2)}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={6} className="text-center border-r">
              CALLS
            </TableHead>
            <TableHead className="text-center">Strike</TableHead>
            <TableHead colSpan={6} className="text-center border-l">
              PUTS
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Last</TableHead>
            <TableHead>Bid</TableHead>
            <TableHead>Ask</TableHead>
            <TableHead>Vol</TableHead>
            <TableHead>OI</TableHead>
            <TableHead className="border-r">Premium</TableHead>
            <TableHead className="text-center font-bold">Price</TableHead>
            <TableHead className="border-l">Last</TableHead>
            <TableHead>Bid</TableHead>
            <TableHead>Ask</TableHead>
            <TableHead>Vol</TableHead>
            <TableHead>OI</TableHead>
            <TableHead>Premium</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleStrikes.map((strike) => {
            const pair = strikeMap.get(String(strike)) || strikeMap.get(strike.toFixed(2))
            const call = pair?.call
            const put = pair?.put
            const callBg = isCallITM(strike) ? 'bg-green-50 dark:bg-green-950' : ''
            const putBg = isPutITM(strike) ? 'bg-green-50 dark:bg-green-950' : ''

            return (
              <TableRow key={strike}>
                <TableCell className={callBg}>{call?.price ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.bid ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.ask ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.volume ?? '—'}</TableCell>
                <TableCell className={callBg}>{call?.open_interest ?? '—'}</TableCell>
                <TableCell className={`${callBg} border-r`}>{call?.premium ?? '—'}</TableCell>
                <TableCell className="text-center font-bold">${strike.toFixed(2)}</TableCell>
                <TableCell className={`${putBg} border-l`}>{put?.price ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.bid ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.ask ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.volume ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.open_interest ?? '—'}</TableCell>
                <TableCell className={putBg}>{put?.premium ?? '—'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
