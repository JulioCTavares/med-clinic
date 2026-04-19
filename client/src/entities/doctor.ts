export interface Doctor {
  id: string
  userId: string
  name: string
  crm: string
  specialtyId: string
  specialty?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}
