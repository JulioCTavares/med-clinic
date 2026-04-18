import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateProcedureUseCase } from './update-procedure.use-case';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeProcedure = (overrides: Partial<Parameters<typeof ProcedureEntity.create>[0]> = {}) =>
  ProcedureEntity.create({
    id: 'proc-uuid',
    code: 'PROC-001',
    name: 'Consulta Geral',
    value: '150.00',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('UpdateProcedureUseCase', () => {
  let useCase: UpdateProcedureUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new UpdateProcedureUseCase(procedureRepo);
  });

  it('should throw ResourceNotFoundError when procedure does not exist', async () => {
    procedureRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', name: 'Novo' })).rejects.toThrow(ResourceNotFoundError);
    expect(procedureRepo.update).not.toHaveBeenCalled();
  });

  it('should update and return the updated procedure', async () => {
    const existing = makeProcedure();
    const updated = makeProcedure({ value: '200.00' });
    procedureRepo.findById.mockResolvedValue(existing);
    procedureRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'proc-uuid', value: '200.00' });

    expect(result.value).toBe('200.00');
    expect(procedureRepo.update).toHaveBeenCalledWith('proc-uuid', { value: '200.00' });
  });

  it('should pass only provided fields to repository', async () => {
    procedureRepo.findById.mockResolvedValue(makeProcedure());
    procedureRepo.update.mockResolvedValue(makeProcedure({ name: 'Eletrocardiograma' }));

    await useCase.execute({ id: 'proc-uuid', name: 'Eletrocardiograma' });

    expect(procedureRepo.update).toHaveBeenCalledWith('proc-uuid', { name: 'Eletrocardiograma' });
  });
});
