import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllDoctorsUseCase } from './find-all-doctors.use-case';
import type { IDoctorRepository, DoctorFilters } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makeDoctor = () =>
  DoctorEntity.create({
    id: 'doctor-uuid',
    userId: 'user-uuid',
    name: 'Dr. João',
    crm: 'CRM-12345',
    specialtyId: 'spec-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const defaultParams: DoctorFilters = { page: 1, limit: 20 };

const makePaginated = (data: DoctorEntity[]): PaginatedResult<DoctorEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllDoctorsUseCase', () => {
  let useCase: FindAllDoctorsUseCase;
  let doctorRepo: import('vitest').Mocked<IDoctorRepository>;

  beforeEach(() => {
    doctorRepo = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllDoctorsUseCase(doctorRepo);
  });

  it('should return paginated doctors', async () => {
    const doctors = [makeDoctor(), makeDoctor()];
    doctorRepo.findPaginated.mockResolvedValue(makePaginated(doctors));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(DoctorEntity);
    expect(result.meta.total).toBe(2);
    expect(doctorRepo.findPaginated).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no doctors exist', async () => {
    doctorRepo.findPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass name filter to repository', async () => {
    const params: DoctorFilters = { page: 1, limit: 10, name: 'João' };
    doctorRepo.findPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(doctorRepo.findPaginated).toHaveBeenCalledWith(params);
  });
});
