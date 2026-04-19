export interface Patient {
  id: string
  userId: string
  name: string
  birthDate?: string
  phones?: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdatePatientPayload {
  name?: string
  birthDate?: string
  phones?: string[]
}
