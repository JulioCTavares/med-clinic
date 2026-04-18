import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { randomUUID } from 'node:crypto';

interface CreateHealthPlanInput {
  code: string;
  description: string;
  phone?: string;
}

@Injectable()
export class CreateHealthPlanUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  execute(input: CreateHealthPlanInput): Promise<HealthPlanEntity> {
    const now = new Date();
    const plan = HealthPlanEntity.create({
      id: randomUUID(),
      code: input.code,
      description: input.description,
      phone: input.phone ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return this.healthPlanRepository.create(plan);
  }
}
