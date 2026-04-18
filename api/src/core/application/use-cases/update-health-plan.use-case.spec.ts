import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateHealthPlanUseCase } from './update-health-plan.use-case';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

const makeHealthPlan = (overrides: Partial<Parameters<typeof HealthPlanEntity.create>[0]> = {}) =>
  HealthPlanEntity.create({
    id: 'plan-uuid',
    code: 'PLAN-001',
    description: 'Plano Básico',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('UpdateHealthPlanUseCase', () => {
  let useCase: UpdateHealthPlanUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new UpdateHealthPlanUseCase(healthPlanRepo);
  });

  it('should throw ResourceNotFoundError when plan does not exist', async () => {
    healthPlanRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', description: 'Novo' })).rejects.toThrow(ResourceNotFoundError);
    expect(healthPlanRepo.update).not.toHaveBeenCalled();
  });

  it('should update and return the updated plan', async () => {
    const existing = makeHealthPlan();
    const updated = makeHealthPlan({ description: 'Plano Premium' });
    healthPlanRepo.findById.mockResolvedValue(existing);
    healthPlanRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'plan-uuid', description: 'Plano Premium' });

    expect(result.description).toBe('Plano Premium');
    expect(healthPlanRepo.update).toHaveBeenCalledWith('plan-uuid', { description: 'Plano Premium' });
  });

  it('should pass only provided fields to repository', async () => {
    healthPlanRepo.findById.mockResolvedValue(makeHealthPlan());
    healthPlanRepo.update.mockResolvedValue(makeHealthPlan({ phone: '11999999999' }));

    await useCase.execute({ id: 'plan-uuid', phone: '11999999999' });

    expect(healthPlanRepo.update).toHaveBeenCalledWith('plan-uuid', { phone: '11999999999' });
  });
});
