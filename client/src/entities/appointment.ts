export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  code: string
  date: string
  time: string
  isPrivate: boolean
  status: AppointmentStatus
  patientId: string
  doctorId: string
  patient?: { id: string; name: string }
  doctor?: { id: string; name: string; crm: string }
  procedures?: { id: string; name: string }[]
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentPayload {
  code: string
  date: string
  time: string
  isPrivate: boolean
  patientId: string
  doctorId: string
  procedureIds?: string[]
}
