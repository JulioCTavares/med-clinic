import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeletePatientUseCase } from './delete-patient.use-case';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makePatient = () =>
  PatientEntity.create({
    id: 'patient-uuid',
    userId: 'user-uuid',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phones: ['11999999999'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('DeletePatientUseCase', () => {
  let useCase: DeletePatientUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new DeletePatientUseCase(patientRepo);
  });

  it('should soft delete when patient exists', async () => {
    patientRepo.findById.mockResolvedValue(makePatient());
    patientRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('patient-uuid');

    expect(patientRepo.softDelete).toHaveBeenCalledWith('patient-uuid');
  });

  it('should throw ResourceNotFoundError when patient does not exist', async () => {
    patientRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
    expect(patientRepo.softDelete).not.toHaveBeenCalled();
  });
});
