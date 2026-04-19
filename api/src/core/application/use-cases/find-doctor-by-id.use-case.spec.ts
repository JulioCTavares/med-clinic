import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindDoctorByIdUseCase } from './find-doctor-by-id.use-case';
import type { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeDoctor = () =>
  DoctorEntity.create({
    id: 'doctor-uuid',
    userId: 'user-uuid',
    name: 'Dr. João',
    crm: 'CRM-12345',
    specialtyId: 'spec-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindDoctorByIdUseCase', () => {
  let useCase: FindDoctorByIdUseCase;
  let doctorRepo: import('vitest').Mocked<IDoctorRepository>;

  beforeEach(() => {
    doctorRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindDoctorByIdUseCase(doctorRepo);
  });

  it('should return the doctor when found', async () => {
    doctorRepo.findById.mockResolvedValue(makeDoctor());

    const result = await useCase.execute('doctor-uuid');

    expect(result).toBeInstanceOf(DoctorEntity);
    expect(doctorRepo.findById).toHaveBeenCalledWith('doctor-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    doctorRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
