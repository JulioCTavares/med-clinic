import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllAppointmentsUseCase } from './find-all-appointments.use-case';
import type { IAppointmentRepository, AppointmentView } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';

const makeView = (): AppointmentView => ({
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
  doctor: { id: 'doctor-uuid', name: 'Dr. House', crm: 'CRM-123' },
});

describe('FindAllAppointmentsUseCase', () => {
  let useCase: FindAllAppointmentsUseCase;
  let appointmentRepo: import('vitest').Mocked<IAppointmentRepository>;

  beforeEach(() => {
    appointmentRepo = {
      findAll: vi.fn(),
      findAllWithDoctor: vi.fn(),
      findById: vi.fn(),
      findByIdWithDoctor: vi.fn(),
      findByPatientId: vi.fn(),
      findConflict: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllAppointmentsUseCase(appointmentRepo);
  });

  it('should return all appointments with doctor info', async () => {
    const views = [makeView(), makeView()];
    appointmentRepo.findAllWithDoctor.mockResolvedValue(views);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].doctor?.name).toBe('Dr. House');
    expect(appointmentRepo.findAllWithDoctor).toHaveBeenCalledOnce();
  });

  it('should return empty array when no appointments exist', async () => {
    appointmentRepo.findAllWithDoctor.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
