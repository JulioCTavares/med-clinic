import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdatePatientUseCase } from './update-patient.use-case';
import type { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makePatient = (overrides: Partial<Parameters<typeof PatientEntity.create>[0]> = {}) =>
  PatientEntity.create({
    id: 'patient-uuid',
    userId: 'user-uuid',
    name: 'Maria Silva',
    birthDate: '1990-05-15',
    phones: ['11999999999'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('UpdatePatientUseCase', () => {
  let useCase: UpdatePatientUseCase;
  let patientRepo: import('vitest').Mocked<IPatientRepository>;

  beforeEach(() => {
    patientRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new UpdatePatientUseCase(patientRepo);
  });

  it('should throw ResourceNotFoundError when patient does not exist', async () => {
    patientRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', name: 'Novo Nome' })).rejects.toThrow(ResourceNotFoundError);
    expect(patientRepo.update).not.toHaveBeenCalled();
  });

  it('should update and return the updated patient', async () => {
    const existing = makePatient();
    const updated = makePatient({ name: 'Ana Souza' });
    patientRepo.findById.mockResolvedValue(existing);
    patientRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'patient-uuid', name: 'Ana Souza' });

    expect(result.name).toBe('Ana Souza');
    expect(patientRepo.update).toHaveBeenCalledWith('patient-uuid', { name: 'Ana Souza' });
  });

  it('should allow updating phones', async () => {
    patientRepo.findById.mockResolvedValue(makePatient());
    patientRepo.update.mockResolvedValue(makePatient({ phones: ['11888888888', '11777777777'] }));

    const result = await useCase.execute({ id: 'patient-uuid', phones: ['11888888888', '11777777777'] });

    expect(result.phones).toEqual(['11888888888', '11777777777']);
    expect(patientRepo.update).toHaveBeenCalledWith('patient-uuid', { phones: ['11888888888', '11777777777'] });
  });

  it('should pass only provided fields to repository', async () => {
    patientRepo.findById.mockResolvedValue(makePatient());
    patientRepo.update.mockResolvedValue(makePatient({ birthDate: '1995-10-20' }));

    await useCase.execute({ id: 'patient-uuid', birthDate: '1995-10-20' });

    expect(patientRepo.update).toHaveBeenCalledWith('patient-uuid', { birthDate: '1995-10-20' });
  });
});
