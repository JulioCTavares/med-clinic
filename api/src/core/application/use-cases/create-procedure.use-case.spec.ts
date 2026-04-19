import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProcedureUseCase } from './create-procedure.use-case';
import type { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';

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

describe('CreateProcedureUseCase', () => {
  let useCase: CreateProcedureUseCase;
  let procedureRepo: import('vitest').Mocked<IProcedureRepository>;

  beforeEach(() => {
    procedureRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new CreateProcedureUseCase(procedureRepo);
  });

  it('should create a procedure and return it', async () => {
    procedureRepo.create.mockImplementation(async (proc) => proc);

    const result = await useCase.execute({ code: 'PROC-001', name: 'Consulta Geral', value: '150.00' });

    expect(result).toBeInstanceOf(ProcedureEntity);
    expect(result.code).toBe('PROC-001');
    expect(result.name).toBe('Consulta Geral');
    expect(result.value).toBe('150.00');
    expect(procedureRepo.create).toHaveBeenCalledOnce();
  });

  it('should return the entity returned by the repository', async () => {
    const stored = makeProcedure({ id: 'stored-uuid' });
    procedureRepo.create.mockResolvedValue(stored);

    const result = await useCase.execute({ code: 'PROC-001', name: 'Consulta Geral', value: '150.00' });

    expect(result.id).toBe('stored-uuid');
  });
});
