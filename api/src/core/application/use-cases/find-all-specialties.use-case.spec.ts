import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllSpecialtiesUseCase } from './find-all-specialties.use-case';
import type { ISpecialtyRepository, SpecialtyFilters } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makeSpecialty = () =>
  SpecialtyEntity.create({
    id: 'spec-uuid',
    code: 'SPEC-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const defaultParams: SpecialtyFilters = { page: 1, limit: 20 };

const makePaginated = (data: SpecialtyEntity[]): PaginatedResult<SpecialtyEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllSpecialtiesUseCase', () => {
  let useCase: FindAllSpecialtiesUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllSpecialtiesUseCase(specialtyRepo);
  });

  it('should return paginated specialties', async () => {
    const specialties = [makeSpecialty(), makeSpecialty()];
    specialtyRepo.findPaginated.mockResolvedValue(makePaginated(specialties));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(SpecialtyEntity);
    expect(result.meta.total).toBe(2);
    expect(specialtyRepo.findPaginated).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no specialties exist', async () => {
    specialtyRepo.findPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass name filter to repository', async () => {
    const params: SpecialtyFilters = { page: 1, limit: 10, name: 'Cardio' };
    specialtyRepo.findPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(specialtyRepo.findPaginated).toHaveBeenCalledWith(params);
  });
});
