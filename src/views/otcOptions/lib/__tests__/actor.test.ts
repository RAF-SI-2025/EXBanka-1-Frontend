import { formatActor } from '@/views/otcOptions/lib/actor'

describe('formatActor', () => {
  it('renders <type>-<id> when a numeric principal id is present', () => {
    expect(formatActor('client', 42)).toBe('client-42')
    expect(formatActor('employee', 99)).toBe('employee-99')
  })

  it('returns "You" when the actor matches the current principal', () => {
    expect(formatActor('client', 42, { owner_type: 'client', owner_id: 42 })).toBe('You')
  })

  it('does not return "You" when the principal differs', () => {
    expect(formatActor('employee', 99, { owner_type: 'client', owner_id: 42 })).toBe('employee-99')
  })

  // The live backend identifies some actors only by trade role ("buyer" /
  // "seller") with no numeric id — the source of the "buyer-undefined" bug.
  it('renders the capitalised role when there is no numeric id', () => {
    expect(formatActor('buyer', null)).toBe('Buyer')
    expect(formatActor('seller', undefined)).toBe('Seller')
  })

  it('returns a dash when neither type nor id is present', () => {
    expect(formatActor(undefined, null)).toBe('—')
    expect(formatActor('', null)).toBe('—')
  })
})
