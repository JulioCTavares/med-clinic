import { api } from '@/shared/lib/api'
import type { Specialty } from '@/entities/specialty'
import type { Doctor } from '@/entities/doctor'
import type { Procedure } from '@/entities/procedure'
import type { PaginatedResult } from '@/shared/types/paginated-result'

export type ListSpecialtiesParams = {
  page?: number
  limit?: number
  name?: string
  code?: string
}

export type ListDoctorsParams = {
  page?: number
  limit?: number
  name?: string
  specialtyId?: string
}

export type ListProceduresParams = {
  page?: number
  limit?: number
  name?: string
  code?: string
}

export const catalogApi = {
  specialties: (params?: ListSpecialtiesParams) =>
    api.get<PaginatedResult<Specialty>>('/specialties', { params }).then((r) => r.data),
  doctors: (params?: ListDoctorsParams) =>
    api.get<PaginatedResult<Doctor>>('/doctors', { params }).then((r) => r.data),
  procedures: (params?: ListProceduresParams) =>
    api.get<PaginatedResult<Procedure>>('/procedures', { params }).then((r) => r.data),
}
