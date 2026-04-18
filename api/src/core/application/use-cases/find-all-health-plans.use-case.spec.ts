import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllHealthPlansUseCase } from './find-all-health-plans.use-case';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';

const makeHealthPlan = () =>
  HealthPlanEntity.create({
    id: 'plan-uuid',
    code: 'PLAN-001',
    description: 'Plano Básico',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('FindAllHealthPlansUseCase', () => {
  let useCase: FindAllHealthPlansUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllHealthPlansUseCase(healthPlanRepo);
  });

  it('should return all health plans', async () => {
    const plans = [makeHealthPlan(), makeHealthPlan()];
    healthPlanRepo.findAll.mockResolvedValue(plans);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(HealthPlanEntity);
    expect(healthPlanRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should return empty array when no plans exist', async () => {
    healthPlanRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
