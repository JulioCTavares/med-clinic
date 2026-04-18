import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindHealthPlanByIdUseCase } from './find-health-plan-by-id.use-case';
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

describe('FindHealthPlanByIdUseCase', () => {
  let useCase: FindHealthPlanByIdUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindHealthPlanByIdUseCase(healthPlanRepo);
  });

  it('should return the health plan when found', async () => {
    healthPlanRepo.findById.mockResolvedValue(makeHealthPlan());

    const result = await useCase.execute('plan-uuid');

    expect(result).toBeInstanceOf(HealthPlanEntity);
    expect(healthPlanRepo.findById).toHaveBeenCalledWith('plan-uuid');
  });

  it('should throw ResourceNotFoundError when not found', async () => {
    healthPlanRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(ResourceNotFoundError);
  });
});
