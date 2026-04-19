import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindMyAppointmentsUseCase } from './find-my-appointments.use-case';
import type {
  IAppointmentRepository,
  AppointmentView,
  AppointmentFilters,
} from '@/core/domain/interfaces/appointment-repository.interface';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makePatient = () =>
  PatientEntity.create({
    id: 'patient-uuid',
    userId: 'user-uuid',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phones: ['(11) 91234-5678'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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

const makePaginated = (data: AppointmentView[]): PaginatedResult<AppointmentView> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

const defaultParams: AppointmentFilters = { page: 1, limit: 20 };

describe('FindMyAppointmentsUseCase', () => {
  let useCase: FindMyAppointmentsUseCase;
  let appointmentRepo: import('vitest').Mocked<IAppointmentRepository>;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    appointmentRepo = {
      findAll: vi.fn(),
      findAllWithDoctor: vi.fn(),
      findPaginatedWithDoctor: vi.fn(),
      findById: vi.fn(),
      findByIdWithDoctor: vi.fn(),
      findByPatientId: vi.fn(),
      findByPatientIdPaginated: vi.fn(),
      findConflict: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    patientRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindMyAppointmentsUseCase(appointmentRepo, patientRepo);
  });

  it('should return paginated appointments for the authenticated patient', async () => {
    patientRepo.findByUserId.mockResolvedValue(makePatient());
    appointmentRepo.findByPatientIdPaginated.mockResolvedValue(makePaginated([makeView()]));

    const result = await useCase.execute('user-uuid', defaultParams);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(patientRepo.findByUserId).toHaveBeenCalledWith('user-uuid');
    expect(appointmentRepo.findByPatientIdPaginated).toHaveBeenCalledWith('patient-uuid', defaultParams);
  });

  it('should return empty page when patient has no appointments', async () => {
    patientRepo.findByUserId.mockResolvedValue(makePatient());
    appointmentRepo.findByPatientIdPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute('user-uuid', defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should throw ResourceNotFoundError when no patient is linked to the userId', async () => {
    patientRepo.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('unknown-user', defaultParams)).rejects.toThrow(ResourceNotFoundError);
    expect(appointmentRepo.findByPatientIdPaginated).not.toHaveBeenCalled();
  });

  it('should pass filters to repository', async () => {
    const params: AppointmentFilters = { page: 2, limit: 10, status: AppointmentStatus.CONFIRMED };
    patientRepo.findByUserId.mockResolvedValue(makePatient());
    appointmentRepo.findByPatientIdPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute('user-uuid', params);

    expect(appointmentRepo.findByPatientIdPaginated).toHaveBeenCalledWith('patient-uuid', params);
  });
});
