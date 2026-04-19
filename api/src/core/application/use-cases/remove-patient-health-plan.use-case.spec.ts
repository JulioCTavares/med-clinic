import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RemovePatientHealthPlanUseCase } from './remove-patient-health-plan.use-case';
import type { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';

describe('RemovePatientHealthPlanUseCase', () => {
  let useCase: RemovePatientHealthPlanUseCase;
  let repository: import('vitest').Mocked<IPatientHealthPlanRepository>;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findByPatient: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new RemovePatientHealthPlanUseCase(repository);
  });

  it('should delete the association with the correct ids', async () => {
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute('patient-uuid', 'plan-uuid');

    expect(repository.delete).toHaveBeenCalledWith('patient-uuid', 'plan-uuid');
    expect(repository.delete).toHaveBeenCalledOnce();
  });

  it('should resolve without error when association is removed', async () => {
    repository.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('patient-uuid', 'plan-uuid')).resolves.toBeUndefined();
  });

  it('should forward distinct patientId and healthPlanId separately', async () => {
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute('p-111', 'hp-222');

    const [patientArg, planArg] = repository.delete.mock.calls[0];
    expect(patientArg).toBe('p-111');
    expect(planArg).toBe('hp-222');
  });
});
