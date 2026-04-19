import { api } from '@/shared/lib/api'
import type { HealthPlan } from '@/entities/health-plan'
import type { PaginatedResult } from '@/shared/types/paginated-result'

export type ListHealthPlansParams = {
  page?: number
  limit?: number
  code?: string
  description?: string
}

export const healthPlansApi = {
  list: (params?: ListHealthPlansParams) =>
    api.get<PaginatedResult<HealthPlan>>('/health-plans', { params }).then((r) => r.data),
  listPatientPlans: (patientId: string) =>
    api.get<HealthPlan[]>(`/patients/${patientId}/health-plans`).then((r) => r.data),
  associate: (patientId: string, healthPlanId: string, contractNumber: string) =>
    api.post(`/patients/${patientId}/health-plans`, { healthPlanId, contractNumber }).then((r) => r.data),
}
