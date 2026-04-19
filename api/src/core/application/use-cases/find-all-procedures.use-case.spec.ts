import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllProceduresUseCase } from './find-all-procedures.use-case';
import type { IProcedureRepository, ProcedureFilters } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makeProcedure = () =>
  ProcedureEntity.create({
    id: 'proc-uuid',
    code: 'PROC-001',
    name: 'Consulta Geral',
    value: '150.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const defaultParams: ProcedureFilters = { page: 1, limit: 20 };

const makePaginated = (data: ProcedureEntity[]): PaginatedResult<ProcedureEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllProceduresUseCase', () => {
  let useCase: FindAllProceduresUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllProceduresUseCase(procedureRepo);
  });

  it('should return paginated procedures', async () => {
    const procedures = [makeProcedure(), makeProcedure()];
    procedureRepo.findPaginated.mockResolvedValue(makePaginated(procedures));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(ProcedureEntity);
    expect(result.meta.total).toBe(2);
    expect(procedureRepo.findPaginated).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no procedures exist', async () => {
    procedureRepo.findPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass name filter to repository', async () => {
    const params: ProcedureFilters = { page: 1, limit: 10, name: 'Consulta' };
    procedureRepo.findPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(procedureRepo.findPaginated).toHaveBeenCalledWith(params);
  });
});
