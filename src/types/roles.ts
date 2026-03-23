export interface Permission {
  id: number
  code: string
  description: string
  category: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
}

export interface CreateRolePayload {
  name: string
  description?: string
  permission_codes?: string[]
}
