import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllAppointmentsUseCase } from './find-all-appointments.use-case';
import type { IAppointmentRepository, AppointmentView, AppointmentFilters } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import type { PaginatedResult } from '@/common/types/paginated-result';

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

const defaultParams: AppointmentFilters = { page: 1, limit: 20 };

const makePaginated = (data: AppointmentView[]): PaginatedResult<AppointmentView> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllAppointmentsUseCase', () => {
  let useCase: FindAllAppointmentsUseCase;
  let appointmentRepo: import('vitest').Mocked<IAppointmentRepository>;

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
    useCase = new FindAllAppointmentsUseCase(appointmentRepo);
  });

  it('should return paginated appointments with doctor info', async () => {
    const views = [makeView(), makeView()];
    appointmentRepo.findPaginatedWithDoctor.mockResolvedValue(makePaginated(views));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].doctor?.name).toBe('Dr. House');
    expect(result.meta.total).toBe(2);
    expect(appointmentRepo.findPaginatedWithDoctor).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no appointments exist', async () => {
    appointmentRepo.findPaginatedWithDoctor.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass filters to repository', async () => {
    const params: AppointmentFilters = { page: 1, limit: 10, status: AppointmentStatus.CONFIRMED };
    appointmentRepo.findPaginatedWithDoctor.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(appointmentRepo.findPaginatedWithDoctor).toHaveBeenCalledWith(params);
  });
});
