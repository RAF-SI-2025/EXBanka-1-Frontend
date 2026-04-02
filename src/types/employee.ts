export interface Employee {
  id: number
  first_name: string
  last_name: string
  date_of_birth: number
  gender: string
  email: string
  phone: string
  address: string
  username: string
  position: string
  department: string
  active: boolean
  role: string
  permissions: string[]
  jmbg?: string
}

export interface EmployeeListResponse {
  employees: Employee[]
  total_count: number
}

export interface EmployeeFilters {
  email?: string
  name?: string
  position?: string
  page?: number
  page_size?: number
}

export interface CreateEmployeeRequest {
  first_name: string
  last_name: string
  date_of_birth: number
  gender?: string
  email: string
  phone?: string
  address?: string
  username: string
  position?: string
  department?: string
  role: string
  active?: boolean
  jmbg?: string
}

export interface UpdateEmployeeRequest {
  last_name?: string
  gender?: string
  phone?: string
  address?: string
  position?: string
  department?: string
  role?: string
  active?: boolean
  jmbg?: string
}
