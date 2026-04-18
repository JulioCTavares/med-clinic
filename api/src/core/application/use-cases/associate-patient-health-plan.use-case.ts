import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';

interface AssociatePatientHealthPlanInput {
  patientId: string;
  healthPlanId: string;
  contractNumber: string;
}

@Injectable()
export class AssociatePatientHealthPlanUseCase {
  constructor(
    @Inject(PATIENT_HEALTH_PLAN_REPOSITORY)
    private readonly repository: IPatientHealthPlanRepository,
  ) {}

  execute(input: AssociatePatientHealthPlanInput): Promise<PatientHealthPlanEntity> {
    const entity = PatientHealthPlanEntity.create(input);
    return this.repository.create(entity);
  }
}
