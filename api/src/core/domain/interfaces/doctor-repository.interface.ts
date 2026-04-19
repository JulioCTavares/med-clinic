import { DoctorEntity } from '@/core/domain/entities/doctor.entity';

export const DOCTOR_REPOSITORY = Symbol('IDoctorRepository');

export interface IDoctorRepository {
  create(doctor: DoctorEntity): Promise<DoctorEntity>;
  findAll(): Promise<DoctorEntity[]>;
  findById(id: string): Promise<DoctorEntity | null>;
  update(id: string, data: Partial<Pick<DoctorEntity, 'name' | 'crm' | 'specialtyId'>>): Promise<DoctorEntity>;
  softDelete(id: string): Promise<void>;
}
