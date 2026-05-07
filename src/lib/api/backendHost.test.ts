import {
  BACKEND_PRESETS,
  DEFAULT_PRESET_ID,
  CUSTOM_PRESET_ID,
  getCurrentHost,
  getCurrentSelection,
  setSelection,
  subscribeToHostChange,
  STORAGE_KEY_PRESET,
  STORAGE_KEY_CUSTOM_URL,
} from '@/lib/api/backendHost'

describe('BACKEND_PRESETS', () => {
  it('exposes the five required options in order: localhost, instance1-3, custom', () => {
    const ids = BACKEND_PRESETS.map((p) => p.id)
    expect(ids).toEqual(['localhost', 'instance1', 'instance2', 'instance3', 'custom'])
  })

  it('points the bytenity presets at project-exbanka.bytenity.com/instanceN', () => {
    const byId = Object.fromEntries(BACKEND_PRESETS.map((p) => [p.id, p]))
    expect(byId.instance1.baseUrl).toBe('https://project-exbanka.bytenity.com/instance1')
    expect(byId.instance2.baseUrl).toBe('https://project-exbanka.bytenity.com/instance2')
    expect(byId.instance3.baseUrl).toBe('https://project-exbanka.bytenity.com/instance3')
  })

  it('points localhost preset at http://localhost:8080', () => {
    const localhost = BACKEND_PRESETS.find((p) => p.id === 'localhost')
    expect(localhost?.baseUrl).toBe('http://localhost:8080')
  })

  it('uses custom as the user-configurable preset id', () => {
    expect(CUSTOM_PRESET_ID).toBe('custom')
    expect(BACKEND_PRESETS.find((p) => p.id === 'custom')).toBeDefined()
  })
})

describe('getCurrentHost / getCurrentSelection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('falls back to the default preset when nothing is stored', () => {
    const selection = getCurrentSelection()
    expect(selection.presetId).toBe(DEFAULT_PRESET_ID)
    const expected = BACKEND_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)?.baseUrl
    expect(getCurrentHost()).toBe(expected)
  })

  it('returns the stored preset host when one is selected', () => {
    localStorage.setItem(STORAGE_KEY_PRESET, 'instance2')
    expect(getCurrentHost()).toBe('https://project-exbanka.bytenity.com/instance2')
  })

  it('returns the stored custom URL when custom is selected', () => {
    localStorage.setItem(STORAGE_KEY_PRESET, 'custom')
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, 'https://my.custom.api')
    expect(getCurrentHost()).toBe('https://my.custom.api')
  })

  it('falls back to default when custom is selected but no URL was saved', () => {
    localStorage.setItem(STORAGE_KEY_PRESET, 'custom')
    expect(getCurrentHost()).toBe(BACKEND_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)?.baseUrl)
  })

  it('strips trailing slashes from the resolved host', () => {
    localStorage.setItem(STORAGE_KEY_PRESET, 'custom')
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, 'https://my.api/')
    expect(getCurrentHost()).toBe('https://my.api')
  })
})

describe('setSelection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists a preset selection', () => {
    setSelection({ presetId: 'instance1' })
    expect(localStorage.getItem(STORAGE_KEY_PRESET)).toBe('instance1')
    expect(getCurrentHost()).toBe('https://project-exbanka.bytenity.com/instance1')
  })

  it('persists a custom selection with URL', () => {
    setSelection({ presetId: 'custom', customUrl: 'https://staging.example.com' })
    expect(localStorage.getItem(STORAGE_KEY_PRESET)).toBe('custom')
    expect(localStorage.getItem(STORAGE_KEY_CUSTOM_URL)).toBe('https://staging.example.com')
    expect(getCurrentHost()).toBe('https://staging.example.com')
  })

  it('rejects an empty custom URL', () => {
    expect(() => setSelection({ presetId: 'custom', customUrl: '' })).toThrow(/url/i)
  })

  it('rejects a non-http(s) custom URL', () => {
    expect(() => setSelection({ presetId: 'custom', customUrl: 'ftp://x' })).toThrow(/url/i)
  })
})

describe('subscribeToHostChange', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('notifies subscribers when the host changes', () => {
    const listener = jest.fn()
    const unsubscribe = subscribeToHostChange(listener)
    setSelection({ presetId: 'instance3' })
    expect(listener).toHaveBeenCalledWith('https://project-exbanka.bytenity.com/instance3')
    unsubscribe()
  })

  it('does not call listener after unsubscribe', () => {
    const listener = jest.fn()
    const unsubscribe = subscribeToHostChange(listener)
    unsubscribe()
    setSelection({ presetId: 'instance1' })
    expect(listener).not.toHaveBeenCalled()
  })
})
