import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSpecialtyUseCase } from './create-specialty.use-case';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';

const makeSpecialty = (overrides: Partial<Parameters<typeof SpecialtyEntity.create>[0]> = {}) =>
  SpecialtyEntity.create({
    id: 'spec-uuid',
    code: 'SPEC-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('CreateSpecialtyUseCase', () => {
  let useCase: CreateSpecialtyUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new CreateSpecialtyUseCase(specialtyRepo);
  });

  it('should create a specialty and return it', async () => {
    specialtyRepo.create.mockImplementation(async (spec) => spec);

    const result = await useCase.execute({ code: 'SPEC-001', name: 'Cardiologia' });

    expect(result).toBeInstanceOf(SpecialtyEntity);
    expect(result.code).toBe('SPEC-001');
    expect(result.name).toBe('Cardiologia');
    expect(specialtyRepo.create).toHaveBeenCalledOnce();
  });

  it('should return the entity returned by the repository', async () => {
    const stored = makeSpecialty({ id: 'stored-uuid' });
    specialtyRepo.create.mockResolvedValue(stored);

    const result = await useCase.execute({ code: 'SPEC-001', name: 'Cardiologia' });

    expect(result.id).toBe('stored-uuid');
  });
});
