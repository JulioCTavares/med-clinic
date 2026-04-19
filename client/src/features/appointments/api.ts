import { api } from '@/shared/lib/api'
import type { Appointment, AppointmentStatus, CreateAppointmentPayload } from '@/entities/appointment'
import type { PaginatedResult } from '@/shared/types/paginated-result'

export type ListAppointmentsParams = {
  page?: number
  limit?: number
  status?: AppointmentStatus
  doctorId?: string
  patientId?: string
  date?: string
}

export const appointmentsApi = {
  list: (params?: ListAppointmentsParams) =>
    api.get<PaginatedResult<Appointment>>('/appointments', { params }).then((r) => r.data),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  create: (payload: CreateAppointmentPayload) =>
    api.post<Appointment>('/appointments', payload).then((r) => r.data),
}
