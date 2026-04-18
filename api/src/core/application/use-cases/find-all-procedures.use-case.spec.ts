import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllProceduresUseCase } from './find-all-procedures.use-case';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';

const makeProcedure = () =>
  ProcedureEntity.create({
    id: 'proc-uuid',
    code: 'PROC-001',
    name: 'Consulta Geral',
    value: '150.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindAllProceduresUseCase', () => {
  let useCase: FindAllProceduresUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllProceduresUseCase(procedureRepo);
  });

  it('should return all procedures', async () => {
    const procedures = [makeProcedure(), makeProcedure()];
    procedureRepo.findAll.mockResolvedValue(procedures);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(ProcedureEntity);
    expect(procedureRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no procedures exist', async () => {
    procedureRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
