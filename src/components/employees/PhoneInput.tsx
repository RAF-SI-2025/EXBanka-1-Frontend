import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRY_CODES } from '@/lib/utils/constants'

interface PhoneInputProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

function parsePhone(full: string) {
  for (const cc of COUNTRY_CODES) {
    if (full.startsWith(cc.code)) {
      return { countryCode: cc.code, number: full.slice(cc.code.length) }
    }
  }
  return { countryCode: '+381', number: full }
}

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const parsed = parsePhone(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [number, setNumber] = useState(parsed.number)

  if (disabled) {
    return <Input type="tel" value={value} disabled />
  }

  const handleCountryChange = (code: string | null) => {
    if (!code) return
    setCountryCode(code)
    onChange(code + number)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
    setNumber(digits)
    onChange(countryCode + digits)
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0]

  return (
    <div className="flex gap-1">
      <Select value={countryCode} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[110px] shrink-0 text-xs">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.iso}</span>
              <span className="text-muted-foreground">{selectedCountry.code}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={`${c.iso}-${c.code}`} value={c.code}>
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span className="font-medium">{c.iso}</span>
                <span className="text-muted-foreground text-xs">{c.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder="Phone number"
        value={number}
        onChange={handleNumberChange}
        maxLength={15}
        inputMode="numeric"
      />
    </div>
  )
}
