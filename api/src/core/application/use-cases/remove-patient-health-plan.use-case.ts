import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';

@Injectable()
export class RemovePatientHealthPlanUseCase {
  constructor(
    @Inject(PATIENT_HEALTH_PLAN_REPOSITORY)
    private readonly repository: IPatientHealthPlanRepository,
  ) {}

  execute(patientId: string, healthPlanId: string): Promise<void> {
    return this.repository.delete(patientId, healthPlanId);
  }
}
