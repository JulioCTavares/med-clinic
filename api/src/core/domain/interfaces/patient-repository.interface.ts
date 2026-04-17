import { PatientEntity } from '@/core/domain/entities/patient.entity';

export const PATIENT_REPOSITORY = Symbol('IPatientRepository');

export interface IPatientRepository {
  create(patient: PatientEntity): Promise<PatientEntity>;
}
