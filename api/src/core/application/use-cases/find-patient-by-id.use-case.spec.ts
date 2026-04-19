import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindPatientByIdUseCase } from './find-patient-by-id.use-case';
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

describe('FindPatientByIdUseCase', () => {
  let useCase: FindPatientByIdUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindPatientByIdUseCase(patientRepo);
  });

  it('should return the patient when found', async () => {
    patientRepo.findById.mockResolvedValue(makePatient());

    const result = await useCase.execute('patient-uuid');

    expect(result).toBeInstanceOf(PatientEntity);
    expect(patientRepo.findById).toHaveBeenCalledWith('patient-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    patientRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
