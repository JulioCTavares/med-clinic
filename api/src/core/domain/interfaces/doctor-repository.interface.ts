import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const DOCTOR_REPOSITORY = Symbol('IDoctorRepository');

export interface DoctorFilters {
  name?: string;
  specialtyId?: string;
  page: number;
  limit: number;
}

export interface IDoctorRepository {
  create(doctor: DoctorEntity): Promise<DoctorEntity>;
  findAll(): Promise<DoctorEntity[]>;
  findPaginated(params: DoctorFilters): Promise<PaginatedResult<DoctorEntity>>;
  findById(id: string): Promise<DoctorEntity | null>;
  update(id: string, data: Partial<Pick<DoctorEntity, 'name' | 'crm' | 'specialtyId'>>): Promise<DoctorEntity>;
  softDelete(id: string): Promise<void>;
}
