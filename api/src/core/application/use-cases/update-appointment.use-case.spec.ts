import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateAppointmentUseCase } from './update-appointment.use-case';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { AppointmentConflictError, ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeAppointment = (overrides: Partial<Parameters<typeof AppointmentEntity.create>[0]> = {}) =>
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
    ...overrides,
  });

describe('UpdateAppointmentUseCase', () => {
  let useCase: UpdateAppointmentUseCase;
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
    useCase = new UpdateAppointmentUseCase(appointmentRepo);
  });

  it('should throw ResourceNotFoundError when appointment does not exist', async () => {
    appointmentRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', status: AppointmentStatus.CONFIRMED })).rejects.toThrow(
      ResourceNotFoundError,
    );
    expect(appointmentRepo.update).not.toHaveBeenCalled();
  });

  it('should update status without checking conflict when date/time not changed', async () => {
    const existing = makeAppointment();
    const updated = makeAppointment({ status: AppointmentStatus.CONFIRMED });
    appointmentRepo.findById.mockResolvedValue(existing);
    appointmentRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'appt-uuid', status: AppointmentStatus.CONFIRMED });

    expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    expect(appointmentRepo.findConflict).not.toHaveBeenCalled();
    expect(appointmentRepo.update).toHaveBeenCalledWith('appt-uuid', { status: AppointmentStatus.CONFIRMED });
  });

  it('should check for conflict when date is changed', async () => {
    const existing = makeAppointment();
    appointmentRepo.findById.mockResolvedValue(existing);
    appointmentRepo.findConflict.mockResolvedValue(null);
    appointmentRepo.update.mockResolvedValue(makeAppointment({ date: '2026-06-01' }));

    await useCase.execute({ id: 'appt-uuid', date: '2026-06-01' });

    expect(appointmentRepo.findConflict).toHaveBeenCalledWith(
      'doctor-uuid',
      'patient-uuid',
      '2026-06-01',
      '09:00',
      'appt-uuid',
    );
  });

  it('should check for conflict when time is changed', async () => {
    const existing = makeAppointment();
    appointmentRepo.findById.mockResolvedValue(existing);
    appointmentRepo.findConflict.mockResolvedValue(null);
    appointmentRepo.update.mockResolvedValue(makeAppointment({ time: '10:00' }));

    await useCase.execute({ id: 'appt-uuid', time: '10:00' });

    expect(appointmentRepo.findConflict).toHaveBeenCalledWith(
      'doctor-uuid',
      'patient-uuid',
      '2026-05-10',
      '10:00',
      'appt-uuid',
    );
  });

  it('should throw AppointmentConflictError when new slot has conflict', async () => {
    const existing = makeAppointment();
    appointmentRepo.findById.mockResolvedValue(existing);
    appointmentRepo.findConflict.mockResolvedValue(makeAppointment({ id: 'other-appt' }));

    await expect(useCase.execute({ id: 'appt-uuid', date: '2026-06-01' })).rejects.toThrow(AppointmentConflictError);
    expect(appointmentRepo.update).not.toHaveBeenCalled();
  });
});
