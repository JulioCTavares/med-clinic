import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindPatientByUserIdUseCase } from './find-patient-by-user-id.use-case';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makePatient = () =>
  PatientEntity.create({
    id: 'patient-uuid',
    userId: 'user-uuid',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phones: ['(11) 91234-5678'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindPatientByUserIdUseCase', () => {
  let useCase: FindPatientByUserIdUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindPatientByUserIdUseCase(patientRepo);
  });

  it('should return the patient when found by userId', async () => {
    patientRepo.findByUserId.mockResolvedValue(makePatient());

    const result = await useCase.execute('user-uuid');

    expect(result).toBeInstanceOf(PatientEntity);
    expect(result.userId).toBe('user-uuid');
    expect(patientRepo.findByUserId).toHaveBeenCalledWith('user-uuid');
  });

  it('should throw ResourceNotFoundError when no patient is linked to the userId', async () => {
    patientRepo.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('unknown-user')).rejects.toThrow(ResourceNotFoundError);
  });

  it('should propagate unexpected repository errors', async () => {
    patientRepo.findByUserId.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('user-uuid')).rejects.toThrow('DB error');
  });
});
