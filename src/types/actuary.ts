export interface Actuary {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  active: boolean
  limit: string
  used_limit: string
  need_approval: boolean
}

export interface ActuaryListResponse {
  actuaries: Actuary[]
  total_count: number
}

export interface ActuaryFilters {
  page?: number
  page_size?: number
  search?: string
  position?: string
}

export interface SetLimitPayload {
  limit: string
}

export interface SetApprovalPayload {
  need_approval: boolean
}
