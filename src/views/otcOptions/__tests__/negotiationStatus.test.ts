import { isNegotiationActive } from '@/views/otcOptions/lib/negotiationStatus'
import type { OtcNegotiationStatus } from '@/views/otcOptions/types'

describe('isNegotiationActive', () => {
  it.each<OtcNegotiationStatus>(['open', 'countered', 'ongoing'])(
    'returns true for the active status %s',
    (status) => {
      expect(isNegotiationActive(status)).toBe(true)
    }
  )

  it.each<OtcNegotiationStatus>(['accepted', 'rejected', 'cancelled', 'expired', 'failed'])(
    'returns false for the terminal status %s',
    (status) => {
      expect(isNegotiationActive(status)).toBe(false)
    }
  )
})
