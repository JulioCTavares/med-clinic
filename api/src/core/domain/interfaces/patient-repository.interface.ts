import { PatientEntity } from '@/core/domain/entities/patient.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const PATIENT_REPOSITORY = Symbol('IPatientRepository');

export interface PatientFilters {
  name?: string;
  page: number;
  limit: number;
}

export interface IPatientRepository {
  create(patient: PatientEntity): Promise<PatientEntity>;
  findAll(): Promise<PatientEntity[]>;
  findPaginated(params: PatientFilters): Promise<PaginatedResult<PatientEntity>>;
  findById(id: string): Promise<PatientEntity | null>;
  findByUserId(userId: string): Promise<PatientEntity | null>;
  update(id: string, data: Partial<Pick<PatientEntity, 'name' | 'birthDate' | 'phones'>>): Promise<PatientEntity>;
  softDelete(id: string): Promise<void>;
}
