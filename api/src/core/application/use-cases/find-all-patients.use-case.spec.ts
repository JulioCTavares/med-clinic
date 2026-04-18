import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllPatientsUseCase } from './find-all-patients.use-case';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';

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

describe('FindAllPatientsUseCase', () => {
  let useCase: FindAllPatientsUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllPatientsUseCase(patientRepo);
  });

  it('should return all patients', async () => {
    const patients = [makePatient(), makePatient()];
    patientRepo.findAll.mockResolvedValue(patients);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(PatientEntity);
    expect(patientRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no patients exist', async () => {
    patientRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
