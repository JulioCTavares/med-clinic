import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateSpecialtyUseCase } from './update-specialty.use-case';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeSpecialty = (overrides: Partial<Parameters<typeof SpecialtyEntity.create>[0]> = {}) =>
  SpecialtyEntity.create({
    id: 'spec-uuid',
    code: 'SPEC-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('UpdateSpecialtyUseCase', () => {
  let useCase: UpdateSpecialtyUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new UpdateSpecialtyUseCase(specialtyRepo);
  });

  it('should throw ResourceNotFoundError when specialty does not exist', async () => {
    specialtyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', name: 'Novo' })).rejects.toThrow(ResourceNotFoundError);
    expect(specialtyRepo.update).not.toHaveBeenCalled();
  });

  it('should update and return the updated specialty', async () => {
    const existing = makeSpecialty();
    const updated = makeSpecialty({ name: 'Neurologia' });
    specialtyRepo.findById.mockResolvedValue(existing);
    specialtyRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'spec-uuid', name: 'Neurologia' });

    expect(result.name).toBe('Neurologia');
    expect(specialtyRepo.update).toHaveBeenCalledWith('spec-uuid', { name: 'Neurologia' });
  });

  it('should pass only provided fields to repository', async () => {
    specialtyRepo.findById.mockResolvedValue(makeSpecialty());
    specialtyRepo.update.mockResolvedValue(makeSpecialty({ code: 'SPEC-002' }));

    await useCase.execute({ id: 'spec-uuid', code: 'SPEC-002' });

    expect(specialtyRepo.update).toHaveBeenCalledWith('spec-uuid', { code: 'SPEC-002' });
  });
});
