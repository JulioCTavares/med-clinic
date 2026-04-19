import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateHealthPlanUseCase } from './create-health-plan.use-case';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';

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

describe('CreateHealthPlanUseCase', () => {
  let useCase: CreateHealthPlanUseCase;
  let healthPlanRepo: import('vitest').Mocked<IHealthPlanRepository>;

  beforeEach(() => {
    healthPlanRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    useCase = new CreateHealthPlanUseCase(healthPlanRepo);
  });

  it('should create a health plan and return it', async () => {
    healthPlanRepo.create.mockImplementation(async (plan) => plan);

    const result = await useCase.execute({ code: 'PLAN-001', description: 'Plano Básico' });

    expect(result).toBeInstanceOf(HealthPlanEntity);
    expect(result.code).toBe('PLAN-001');
    expect(result.description).toBe('Plano Básico');
    expect(healthPlanRepo.create).toHaveBeenCalledOnce();
  });

  it('should set phone to null when not provided', async () => {
    healthPlanRepo.create.mockImplementation(async (plan) => plan);

    const result = await useCase.execute({ code: 'PLAN-001', description: 'Plano Básico' });

    expect(result.phone).toBeNull();
  });

  it('should pass phone when provided', async () => {
    healthPlanRepo.create.mockImplementation(async (plan) => plan);

    const result = await useCase.execute({ code: 'PLAN-001', description: 'Plano Básico', phone: '11999999999' });

    expect(result.phone).toBe('11999999999');
  });

  it('should return the entity returned by the repository', async () => {
    const stored = makeHealthPlan({ id: 'stored-uuid' });
    healthPlanRepo.create.mockResolvedValue(stored);

    const result = await useCase.execute({ code: 'PLAN-001', description: 'Plano Básico' });

    expect(result.id).toBe('stored-uuid');
  });
});
