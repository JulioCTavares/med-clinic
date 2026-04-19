import { api } from '@/shared/lib/api'
import type { Specialty } from '@/entities/specialty'
import type { Doctor } from '@/entities/doctor'
import type { Procedure } from '@/entities/procedure'

export const catalogApi = {
  specialties: () => api.get<Specialty[]>('/specialties').then((r) => r.data),
  doctors: () => api.get<Doctor[]>('/doctors').then((r) => r.data),
  procedures: () => api.get<Procedure[]>('/procedures').then((r) => r.data),
}
