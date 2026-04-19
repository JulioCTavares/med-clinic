import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import type { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { AppointmentConflictError } from '@/core/application/errors/application.error';

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

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
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

    useCase = new CreateAppointmentUseCase(appointmentRepo);
  });

  describe('execute — success', () => {
    it('should create appointment when no conflict exists', async () => {
      appointmentRepo.findConflict.mockResolvedValue(null);
      appointmentRepo.create.mockResolvedValue(makeAppointment());

      const result = await useCase.execute({
        code: 'CONS-001',
        date: '2026-05-10',
        time: '09:00',
        isPrivate: false,
        patientId: 'patient-uuid',
        doctorId: 'doctor-uuid',
      });

      expect(result).toBeInstanceOf(AppointmentEntity);
      expect(appointmentRepo.create).toHaveBeenCalledOnce();
    });

    it('should set status as PENDING on creation', async () => {
      appointmentRepo.findConflict.mockResolvedValue(null);
      appointmentRepo.create.mockImplementation(async (appt) => appt);

      const result = await useCase.execute({
        code: 'CONS-001',
        date: '2026-05-10',
        time: '09:00',
        isPrivate: false,
        patientId: 'patient-uuid',
        doctorId: 'doctor-uuid',
      });

      expect(result.status).toBe(AppointmentStatus.PENDING);
    });

    it('should check for conflict with correct doctor, patient, date and time', async () => {
      appointmentRepo.findConflict.mockResolvedValue(null);
      appointmentRepo.create.mockResolvedValue(makeAppointment());

      await useCase.execute({
        code: 'CONS-001',
        date: '2026-05-10',
        time: '09:00',
        isPrivate: false,
        patientId: 'patient-uuid',
        doctorId: 'doctor-uuid',
      });

      expect(appointmentRepo.findConflict).toHaveBeenCalledWith(
        'doctor-uuid',
        'patient-uuid',
        '2026-05-10',
        '09:00',
      );
    });
  });

  describe('execute — conflict', () => {
    it('should throw AppointmentConflictError when doctor already has appointment', async () => {
      appointmentRepo.findConflict.mockResolvedValue(makeAppointment());

      await expect(
        useCase.execute({
          code: 'CONS-002',
          date: '2026-05-10',
          time: '09:00',
          isPrivate: false,
          patientId: 'other-patient-uuid',
          doctorId: 'doctor-uuid',
        }),
      ).rejects.toThrow(AppointmentConflictError);
    });

    it('should throw AppointmentConflictError when patient already has appointment', async () => {
      appointmentRepo.findConflict.mockResolvedValue(makeAppointment());

      await expect(
        useCase.execute({
          code: 'CONS-003',
          date: '2026-05-10',
          time: '09:00',
          isPrivate: true,
          patientId: 'patient-uuid',
          doctorId: 'other-doctor-uuid',
        }),
      ).rejects.toThrow(AppointmentConflictError);
    });

    it('should not call create when conflict is detected', async () => {
      appointmentRepo.findConflict.mockResolvedValue(makeAppointment());

      await expect(
        useCase.execute({
          code: 'CONS-004',
          date: '2026-05-10',
          time: '09:00',
          isPrivate: false,
          patientId: 'patient-uuid',
          doctorId: 'doctor-uuid',
        }),
      ).rejects.toThrow(AppointmentConflictError);

      expect(appointmentRepo.create).not.toHaveBeenCalled();
    });
  });
});
