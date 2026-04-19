import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

interface UpdateHealthPlanInput {
  id: string;
  code?: string;
  description?: string;
  phone?: string | null;
}

@Injectable()
export class UpdateHealthPlanUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  async execute(input: UpdateHealthPlanInput): Promise<HealthPlanEntity> {
    const existing = await this.healthPlanRepository.findById(input.id);
    if (!existing) throw new ResourceNotFoundError('HealthPlan', input.id);

    const { id, ...data } = input;
    return this.healthPlanRepository.update(id, data);
  }
}
