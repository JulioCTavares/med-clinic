import { api } from '@/shared/lib/api'
import type { Patient, UpdatePatientPayload } from '@/entities/patient'

export const profileApi = {
  update: (id: string, payload: UpdatePatientPayload) =>
    api.patch<Patient>(`/patients/${id}`, payload).then((r) => r.data),
}
