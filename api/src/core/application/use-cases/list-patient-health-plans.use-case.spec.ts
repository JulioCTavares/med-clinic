import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListPatientHealthPlansUseCase } from './list-patient-health-plans.use-case';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';

const makeEntity = (overrides: Partial<Parameters<typeof PatientHealthPlanEntity.create>[0]> = {}) =>
  PatientHealthPlanEntity.create({
    patientId: 'patient-uuid',
    healthPlanId: 'plan-uuid',
    contractNumber: 'CONTRACT-001',
    ...overrides,
  });

describe('ListPatientHealthPlansUseCase', () => {
  let useCase: ListPatientHealthPlansUseCase;
  let repository: import('vitest').Mocked<IPatientHealthPlanRepository>;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findByPatient: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new ListPatientHealthPlansUseCase(repository);
  });

  it('should return all health plans for the patient', async () => {
    const plans = [
      makeEntity({ healthPlanId: 'plan-1', contractNumber: 'C-001' }),
      makeEntity({ healthPlanId: 'plan-2', contractNumber: 'C-002' }),
    ];
    repository.findByPatient.mockResolvedValue(plans);

    const result = await useCase.execute('patient-uuid');

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(PatientHealthPlanEntity);
    expect(repository.findByPatient).toHaveBeenCalledWith('patient-uuid');
  });

  it('should return empty array when patient has no plans', async () => {
    repository.findByPatient.mockResolvedValue([]);

    const result = await useCase.execute('patient-uuid');

    expect(result).toEqual([]);
    expect(repository.findByPatient).toHaveBeenCalledWith('patient-uuid');
  });

  it('should forward the patientId to the repository', async () => {
    repository.findByPatient.mockResolvedValue([]);

    await useCase.execute('another-patient-uuid');

    expect(repository.findByPatient).toHaveBeenCalledWith('another-patient-uuid');
  });
});
