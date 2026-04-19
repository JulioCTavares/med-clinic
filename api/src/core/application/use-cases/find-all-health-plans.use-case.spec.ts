import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FindAllHealthPlansUseCase } from './find-all-health-plans.use-case';
import type { IHealthPlanRepository, HealthPlanFilters } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

const makeHealthPlan = () =>
  HealthPlanEntity.create({
    id: 'plan-uuid',
    code: 'PLAN-001',
    description: 'Plano Básico',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const defaultParams: HealthPlanFilters = { page: 1, limit: 20 };

const makePaginated = (data: HealthPlanEntity[]): PaginatedResult<HealthPlanEntity> => ({
  data,
  meta: { total: data.length, page: 1, limit: 20, totalPages: 1 },
});

describe('FindAllHealthPlansUseCase', () => {
  let useCase: FindAllHealthPlansUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findPaginated: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new FindAllHealthPlansUseCase(healthPlanRepo);
  });

  it('should return paginated health plans', async () => {
    const plans = [makeHealthPlan(), makeHealthPlan()];
    healthPlanRepo.findPaginated.mockResolvedValue(makePaginated(plans));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(HealthPlanEntity);
    expect(result.meta.total).toBe(2);
    expect(healthPlanRepo.findPaginated).toHaveBeenCalledWith(defaultParams);
  });

  it('should return empty page when no plans exist', async () => {
    healthPlanRepo.findPaginated.mockResolvedValue(makePaginated([]));

    const result = await useCase.execute(defaultParams);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass code filter to repository', async () => {
    const params: HealthPlanFilters = { page: 1, limit: 10, code: 'PLAN' };
    healthPlanRepo.findPaginated.mockResolvedValue(makePaginated([]));

    await useCase.execute(params);

    expect(healthPlanRepo.findPaginated).toHaveBeenCalledWith(params);
  });
});
