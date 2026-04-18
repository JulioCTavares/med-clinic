import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindProcedureByIdUseCase } from './find-procedure-by-id.use-case';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeProcedure = () =>
  ProcedureEntity.create({
    id: 'proc-uuid',
    code: 'PROC-001',
    name: 'Consulta Geral',
    value: '150.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindProcedureByIdUseCase', () => {
  let useCase: FindProcedureByIdUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindProcedureByIdUseCase(procedureRepo);
  });

  it('should return the procedure when found', async () => {
    procedureRepo.findById.mockResolvedValue(makeProcedure());

    const result = await useCase.execute('proc-uuid');

    expect(result).toBeInstanceOf(ProcedureEntity);
    expect(procedureRepo.findById).toHaveBeenCalledWith('proc-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    procedureRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
