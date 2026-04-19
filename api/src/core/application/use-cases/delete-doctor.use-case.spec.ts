import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteDoctorUseCase } from './delete-doctor.use-case';
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

describe('DeleteDoctorUseCase', () => {
  let useCase: DeleteDoctorUseCase;
  let doctorRepo: import('vitest').Mocked<IDoctorRepository>;

  beforeEach(() => {
    doctorRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new DeleteDoctorUseCase(doctorRepo);
  });

  it('should soft delete when doctor exists', async () => {
    doctorRepo.findById.mockResolvedValue(makeDoctor());
    doctorRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('doctor-uuid');

    expect(doctorRepo.softDelete).toHaveBeenCalledWith('doctor-uuid');
  });

  it('should throw ResourceNotFoundError when doctor does not exist', async () => {
    doctorRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
    expect(doctorRepo.softDelete).not.toHaveBeenCalled();
  });
});
