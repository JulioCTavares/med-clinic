import { api } from '@/shared/lib/api'
import type { Appointment, CreateAppointmentPayload } from '@/entities/appointment'

export const appointmentsApi = {
  list: () => api.get<Appointment[]>('/appointments').then((r) => r.data),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  create: (payload: CreateAppointmentPayload) =>
    api.post<Appointment>('/appointments', payload).then((r) => r.data),
}
