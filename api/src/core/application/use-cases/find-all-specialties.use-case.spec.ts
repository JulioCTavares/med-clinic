import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllSpecialtiesUseCase } from './find-all-specialties.use-case';
import type { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';

const makeSpecialty = () =>
  SpecialtyEntity.create({
    id: 'spec-uuid',
    code: 'SPEC-001',
    name: 'Cardiologia',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindAllSpecialtiesUseCase', () => {
  let useCase: FindAllSpecialtiesUseCase;
  let specialtyRepo: import('vitest').Mocked<ISpecialtyRepository>;

  beforeEach(() => {
    specialtyRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllSpecialtiesUseCase(specialtyRepo);
  });

  it('should return all specialties', async () => {
    const specialties = [makeSpecialty(), makeSpecialty()];
    specialtyRepo.findAll.mockResolvedValue(specialties);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(SpecialtyEntity);
    expect(specialtyRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no specialties exist', async () => {
    specialtyRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
