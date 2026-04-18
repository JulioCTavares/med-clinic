import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteHealthPlanUseCase } from './delete-health-plan.use-case';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeHealthPlan = () =>
  HealthPlanEntity.create({
    id: 'plan-uuid',
    code: 'PLAN-001',
    description: 'Plano Básico',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('DeleteHealthPlanUseCase', () => {
  let useCase: DeleteHealthPlanUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new DeleteHealthPlanUseCase(healthPlanRepo);
  });

  it('should soft delete when health plan exists', async () => {
    healthPlanRepo.findById.mockResolvedValue(makeHealthPlan());
    healthPlanRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('plan-uuid');

    expect(healthPlanRepo.softDelete).toHaveBeenCalledWith('plan-uuid');
  });

  it('should throw ResourceNotFoundError when plan does not exist', async () => {
    healthPlanRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
    expect(healthPlanRepo.softDelete).not.toHaveBeenCalled();
  });
});
