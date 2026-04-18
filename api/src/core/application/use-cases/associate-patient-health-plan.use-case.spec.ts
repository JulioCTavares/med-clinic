import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssociatePatientHealthPlanUseCase } from './associate-patient-health-plan.use-case';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';

const makeEntity = (overrides: Partial<Parameters<typeof PatientHealthPlanEntity.create>[0]> = {}) =>
  PatientHealthPlanEntity.create({
    patientId: 'patient-uuid',
    healthPlanId: 'plan-uuid',
    contractNumber: 'CONTRACT-001',
    ...overrides,
  });

describe('AssociatePatientHealthPlanUseCase', () => {
  let useCase: AssociatePatientHealthPlanUseCase;
  let repository: import('vitest').Mocked<IPatientHealthPlanRepository>;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findByPatient: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new AssociatePatientHealthPlanUseCase(repository);
  });

  it('should create the association and return the entity', async () => {
    const stored = makeEntity();
    repository.create.mockResolvedValue(stored);

    const result = await useCase.execute({
      patientId: 'patient-uuid',
      healthPlanId: 'plan-uuid',
      contractNumber: 'CONTRACT-001',
    });

    expect(result).toBeInstanceOf(PatientHealthPlanEntity);
    expect(result.patientId).toBe('patient-uuid');
    expect(result.healthPlanId).toBe('plan-uuid');
    expect(result.contractNumber).toBe('CONTRACT-001');
    expect(repository.create).toHaveBeenCalledOnce();
  });

  it('should pass a PatientHealthPlanEntity to the repository', async () => {
    repository.create.mockImplementation(async (entity) => entity);

    await useCase.execute({
      patientId: 'patient-uuid',
      healthPlanId: 'plan-uuid',
      contractNumber: 'CONTRACT-001',
    });

    const [entityArg] = repository.create.mock.calls[0];
    expect(entityArg).toBeInstanceOf(PatientHealthPlanEntity);
    expect(entityArg.patientId).toBe('patient-uuid');
    expect(entityArg.healthPlanId).toBe('plan-uuid');
    expect(entityArg.contractNumber).toBe('CONTRACT-001');
  });

  it('should return the entity returned by the repository', async () => {
    const stored = makeEntity({ contractNumber: 'STORED-999' });
    repository.create.mockResolvedValue(stored);

    const result = await useCase.execute({
      patientId: 'patient-uuid',
      healthPlanId: 'plan-uuid',
      contractNumber: 'CONTRACT-001',
    });

    expect(result.contractNumber).toBe('STORED-999');
  });
});
