import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

export const APPOINTMENT_REPOSITORY = Symbol('IAppointmentRepository');

export interface IAppointmentRepository {
  findAll(): Promise<AppointmentEntity[]>;
  findById(id: string): Promise<AppointmentEntity | null>;
  findConflict(doctorId: string, patientId: string, date: string, time: string, excludeId?: string): Promise<AppointmentEntity | null>;
  create(appointment: AppointmentEntity): Promise<AppointmentEntity>;
  update(id: string, data: { status?: AppointmentStatus; date?: string; time?: string; isPrivate?: boolean }): Promise<AppointmentEntity>;
  softDelete(id: string): Promise<void>;
}
