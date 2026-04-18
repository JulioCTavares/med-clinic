import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteProcedureUseCase } from './delete-procedure.use-case';
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

describe('DeleteProcedureUseCase', () => {
  let useCase: DeleteProcedureUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new DeleteProcedureUseCase(procedureRepo);
  });

  it('should soft delete when procedure exists', async () => {
    procedureRepo.findById.mockResolvedValue(makeProcedure());
    procedureRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('proc-uuid');

    expect(procedureRepo.softDelete).toHaveBeenCalledWith('proc-uuid');
  });

  it('should throw ResourceNotFoundError when procedure does not exist', async () => {
    procedureRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
    expect(procedureRepo.softDelete).not.toHaveBeenCalled();
  });
});
