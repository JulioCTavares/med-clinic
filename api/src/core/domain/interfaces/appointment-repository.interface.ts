import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const APPOINTMENT_REPOSITORY = Symbol('IAppointmentRepository');

export interface AppointmentView {
  id: string;
  code: string;
  date: string;
  time: string;
  isPrivate: boolean;
  status: AppointmentStatus;
  patientId: string;
  doctorId: string;
  createdAt: Date;
  updatedAt: Date;
  doctor: { id: string; name: string; crm: string } | null;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  doctorId?: string;
  patientId?: string;
  date?: string;
  page: number;
  limit: number;
}

export interface IAppointmentRepository {
  findAll(): Promise<AppointmentEntity[]>;
  findAllWithDoctor(): Promise<AppointmentView[]>;
  findPaginatedWithDoctor(params: AppointmentFilters): Promise<PaginatedResult<AppointmentView>>;
  findById(id: string): Promise<AppointmentEntity | null>;
  findByIdWithDoctor(id: string): Promise<AppointmentView | null>;
  findByPatientId(patientId: string): Promise<AppointmentView[]>;
  findByPatientIdPaginated(patientId: string, params: AppointmentFilters): Promise<PaginatedResult<AppointmentView>>;
  findConflict(doctorId: string, patientId: string, date: string, time: string, excludeId?: string): Promise<AppointmentEntity | null>;
  create(appointment: AppointmentEntity): Promise<AppointmentEntity>;
  update(id: string, data: { status?: AppointmentStatus; date?: string; time?: string; isPrivate?: boolean }): Promise<AppointmentEntity>;
  softDelete(id: string): Promise<void>;
}
