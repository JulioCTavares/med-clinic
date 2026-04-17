import { DoctorEntity } from '@/core/domain/entities/doctor.entity';

export const DOCTOR_REPOSITORY = Symbol('IDoctorRepository');

export interface IDoctorRepository {
  create(doctor: DoctorEntity): Promise<DoctorEntity>;
}
