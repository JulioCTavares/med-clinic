import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAppointmentByIdUseCase } from './find-appointment-by-id.use-case';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

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

describe('FindAppointmentByIdUseCase', () => {
  let useCase: FindAppointmentByIdUseCase;
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
    useCase = new FindAppointmentByIdUseCase(appointmentRepo);
  });

  it('should return the appointment when found', async () => {
    const appointment = makeAppointment();
    appointmentRepo.findById.mockResolvedValue(appointment);

    const result = await useCase.execute('appt-uuid');

    expect(result).toBeInstanceOf(AppointmentEntity);
    expect(appointmentRepo.findById).toHaveBeenCalledWith('appt-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    appointmentRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
