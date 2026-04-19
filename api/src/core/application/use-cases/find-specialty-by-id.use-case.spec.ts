import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindSpecialtyByIdUseCase } from './find-specialty-by-id.use-case';
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

describe('FindSpecialtyByIdUseCase', () => {
  let useCase: FindSpecialtyByIdUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindSpecialtyByIdUseCase(specialtyRepo);
  });

  it('should return the specialty when found', async () => {
    specialtyRepo.findById.mockResolvedValue(makeSpecialty());

    const result = await useCase.execute('spec-uuid');

    expect(result).toBeInstanceOf(SpecialtyEntity);
    expect(specialtyRepo.findById).toHaveBeenCalledWith('spec-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    specialtyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
