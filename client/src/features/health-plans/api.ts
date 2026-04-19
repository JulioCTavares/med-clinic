import { api } from '@/shared/lib/api'
import type { HealthPlan } from '@/entities/health-plan'

export const healthPlansApi = {
  list: () => api.get<HealthPlan[]>('/health-plans').then((r) => r.data),
  listPatientPlans: (patientId: string) =>
    api.get<HealthPlan[]>(`/patients/${patientId}/health-plans`).then((r) => r.data),
  associate: (patientId: string, healthPlanId: string, contractNumber: string) =>
    api.post(`/patients/${patientId}/health-plans`, { healthPlanId, contractNumber }).then((r) => r.data),
}
