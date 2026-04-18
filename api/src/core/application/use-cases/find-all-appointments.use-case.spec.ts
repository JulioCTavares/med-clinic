import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllAppointmentsUseCase } from './find-all-appointments.use-case';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

const makeAppointment = () =>
  AppointmentEntity.create({
    id: 'appt-uuid',
    code: 'CONS-001',
    date: '2026-05-10',
    time: '09:00',
    isPrivate: false,
    status: AppointmentStatus.PENDING,
    patientId: 'patient-uuid',
    doctorId: 'doctor-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindAllAppointmentsUseCase', () => {
  let useCase: FindAllAppointmentsUseCase;
  let appointmentRepo: import('vitest').Mocked<IAppointmentRepository>;

  beforeEach(() => {
    appointmentRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findConflict: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllAppointmentsUseCase(appointmentRepo);
  });

  it('should return all appointments', async () => {
    const appointments = [makeAppointment(), makeAppointment()];
    appointmentRepo.findAll.mockResolvedValue(appointments);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(AppointmentEntity);
    expect(appointmentRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no appointments exist', async () => {
    appointmentRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
