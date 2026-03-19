export interface FilterOption {
  label: string
  value: string
}

export type FilterFieldDef =
  | { key: string; label: string; type: 'text' | 'date' | 'number' }
  | { key: string; label: string; type: 'multiselect'; options: FilterOption[] }

export type FilterValues = Record<string, string | string[]>
