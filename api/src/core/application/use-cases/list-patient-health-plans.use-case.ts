import { Inject, Injectable } from '@nestjs/common';
import { PATIENT_HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';

@Injectable()
export class ListPatientHealthPlansUseCase {
  constructor(
    @Inject(PATIENT_HEALTH_PLAN_REPOSITORY)
    private readonly repository: IPatientHealthPlanRepository,
  ) {}

  execute(patientId: string): Promise<PatientHealthPlanEntity[]> {
    return this.repository.findByPatient(patientId);
  }
}
