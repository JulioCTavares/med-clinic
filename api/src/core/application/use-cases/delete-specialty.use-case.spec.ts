import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteSpecialtyUseCase } from './delete-specialty.use-case';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeSpecialty = () =>
  SpecialtyEntity.create({
    id: 'spec-uuid',
    code: 'SPEC-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('DeleteSpecialtyUseCase', () => {
  let useCase: DeleteSpecialtyUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new DeleteSpecialtyUseCase(specialtyRepo);
  });

  it('should soft delete when specialty exists', async () => {
    specialtyRepo.findById.mockResolvedValue(makeSpecialty());
    specialtyRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('spec-uuid');

    expect(specialtyRepo.softDelete).toHaveBeenCalledWith('spec-uuid');
  });

  it('should throw ResourceNotFoundError when specialty does not exist', async () => {
    specialtyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
    expect(specialtyRepo.softDelete).not.toHaveBeenCalled();
  });
});
