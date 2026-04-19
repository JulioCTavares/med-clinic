import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllPatientsUseCase } from './find-all-patients.use-case';
import type { IPatientRepository, PatientFilters } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makePatient = () =>
  PatientEntity.create({
    id: 'patient-uuid',
    userId: 'user-uuid',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phones: ['11999999999'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const defaultParams: PatientFilters = { page: 1, limit: 20 };

const makePaginated = (data: PatientEntity[]): PaginatedResult<PatientEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllPatientsUseCase', () => {
  let useCase: FindAllPatientsUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllPatientsUseCase(patientRepo);
  });

  it('should return paginated patients', async () => {
    const patients = [makePatient(), makePatient()];
    patientRepo.findPaginated.mockResolvedValue(makePaginated(patients));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(PatientEntity);
    expect(result.meta.total).toBe(2);
    expect(patientRepo.findPaginated).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no patients exist', async () => {
    patientRepo.findPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass name filter to repository', async () => {
    const params: PatientFilters = { page: 1, limit: 10, name: 'Maria' };
    patientRepo.findPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(patientRepo.findPaginated).toHaveBeenCalledWith(params);
  });
});
