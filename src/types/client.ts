export interface Client {
  id: number
  first_name: string
  last_name: string
  date_of_birth: number
  gender?: string
  email: string
  phone?: string
  address?: string
  jmbg?: string
}

export interface ClientListResponse {
  clients: Client[]
  total_count: number
}

export interface ClientFilters {
  name?: string
  email?: string
  page?: number
  page_size?: number
}

export interface CreateClientRequest {
  first_name: string
  last_name: string
  date_of_birth: number
  email: string
  gender?: string
  phone?: string
  address?: string
  jmbg?: string
}

export type UpdateClientRequest = Partial<Omit<CreateClientRequest, 'jmbg'>>
