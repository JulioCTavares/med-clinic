import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';

export const PATIENT_HEALTH_PLAN_REPOSITORY = Symbol('IPatientHealthPlanRepository');

export interface IPatientHealthPlanRepository {
  create(entity: PatientHealthPlanEntity): Promise<PatientHealthPlanEntity>;
  findByPatient(patientId: string): Promise<PatientHealthPlanEntity[]>;
  delete(patientId: string, healthPlanId: string): Promise<void>;
}
