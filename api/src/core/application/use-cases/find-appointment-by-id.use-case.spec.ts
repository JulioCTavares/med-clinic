import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAppointmentByIdUseCase } from './find-appointment-by-id.use-case';
import type { IAppointmentRepository, AppointmentView } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

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

describe('FindAppointmentByIdUseCase', () => {
  let useCase: FindAppointmentByIdUseCase;
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
    useCase = new FindAppointmentByIdUseCase(appointmentRepo);
  });

  it('should return the appointment with doctor info when found', async () => {
    const view = makeView();
    appointmentRepo.findByIdWithDoctor.mockResolvedValue(view);

    const result = await useCase.execute('appt-uuid');

    expect(result.id).toBe('appt-uuid');
    expect(result.doctor?.name).toBe('Dr. House');
    expect(appointmentRepo.findByIdWithDoctor).toHaveBeenCalledWith('appt-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    appointmentRepo.findByIdWithDoctor.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
