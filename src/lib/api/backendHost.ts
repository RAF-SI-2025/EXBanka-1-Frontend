// Runtime-configurable backend host. The user picks one of the presets — or a
// custom URL — from the login screen / sidebar; the choice is persisted in
// localStorage and read by axios on every request, so a switch takes effect
// immediately without a rebuild.
//
// The build-time VITE_API_HOST (see vite.config.ts) is only used as the
// fallback "default" when the user has never made a selection.

declare const __API_HOST__: string | undefined

export const STORAGE_KEY_PRESET = 'exbanka.backendPreset'
export const STORAGE_KEY_CUSTOM_URL = 'exbanka.backendCustomUrl'

export type BackendPresetId = 'localhost' | 'instance1' | 'instance2' | 'instance3' | 'custom'

export interface BackendPreset {
  id: BackendPresetId
  label: string
  baseUrl: string
  isCustom?: boolean
}

const VLUPSIC_BASE = 'https://exbanka.vlupsic.dev'

export const BACKEND_PRESETS: ReadonlyArray<BackendPreset> = [
  { id: 'localhost', label: 'Localhost — http://localhost:8080', baseUrl: 'http://localhost:8080' },
  {
    id: 'instance1',
    label: `Instance 1 — ${VLUPSIC_BASE}/instance1`,
    baseUrl: `${VLUPSIC_BASE}/instance1`,
  },
  {
    id: 'instance2',
    label: `Instance 2 — ${VLUPSIC_BASE}/instance2`,
    baseUrl: `${VLUPSIC_BASE}/instance2`,
  },
  {
    id: 'instance3',
    label: `Instance 3 — ${VLUPSIC_BASE}/instance3`,
    baseUrl: `${VLUPSIC_BASE}/instance3`,
  },
  { id: 'custom', label: 'Custom (enter URL)', baseUrl: '', isCustom: true },
]

export const CUSTOM_PRESET_ID: BackendPresetId = 'custom'

const ENV_DEFAULT_HOST =
  typeof __API_HOST__ !== 'undefined' && __API_HOST__ ? __API_HOST__ : 'http://localhost:8080'

function pickDefaultPresetId(): BackendPresetId {
  const match = BACKEND_PRESETS.find((p) => !p.isCustom && p.baseUrl === ENV_DEFAULT_HOST)
  return match ? match.id : 'localhost'
}

export const DEFAULT_PRESET_ID: BackendPresetId = pickDefaultPresetId()

function readStoredPresetId(): BackendPresetId {
  const raw = localStorage.getItem(STORAGE_KEY_PRESET)
  if (!raw) return DEFAULT_PRESET_ID
  if (BACKEND_PRESETS.some((p) => p.id === raw)) return raw as BackendPresetId
  return DEFAULT_PRESET_ID
}

function readStoredCustomUrl(): string {
  return localStorage.getItem(STORAGE_KEY_CUSTOM_URL) ?? ''
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function isValidUrl(value: string): boolean {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export interface BackendSelection {
  presetId: BackendPresetId
  customUrl: string
  host: string
}

export function getCurrentSelection(): BackendSelection {
  const presetId = readStoredPresetId()
  const customUrl = readStoredCustomUrl()
  const host = stripTrailingSlash(resolveHost(presetId, customUrl))
  return { presetId, customUrl, host }
}

export function getCurrentHost(): string {
  return getCurrentSelection().host
}

function resolveHost(presetId: BackendPresetId, customUrl: string): string {
  if (presetId === 'custom') {
    return customUrl && isValidUrl(customUrl)
      ? customUrl
      : (BACKEND_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)?.baseUrl ?? ENV_DEFAULT_HOST)
  }
  const preset = BACKEND_PRESETS.find((p) => p.id === presetId)
  return preset?.baseUrl || ENV_DEFAULT_HOST
}

export interface SetSelectionInput {
  presetId: BackendPresetId
  customUrl?: string
}

export function setSelection({ presetId, customUrl }: SetSelectionInput): void {
  if (presetId === 'custom') {
    if (!customUrl || !isValidUrl(customUrl)) {
      throw new Error('Custom backend URL must be a valid http(s) URL')
    }
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, stripTrailingSlash(customUrl))
  }
  localStorage.setItem(STORAGE_KEY_PRESET, presetId)
  emit(getCurrentHost())
}

type Listener = (host: string) => void
const listeners = new Set<Listener>()

export function subscribeToHostChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit(host: string): void {
  for (const listener of listeners) {
    listener(host)
  }
}
