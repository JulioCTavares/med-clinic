import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class FindHealthPlanByIdUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  async execute(id: string): Promise<HealthPlanEntity> {
    const plan = await this.healthPlanRepository.findById(id);
    if (!plan) throw new ResourceNotFoundError('HealthPlan', id);
    return plan;
  }
}
