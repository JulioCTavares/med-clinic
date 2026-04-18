import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { ResourceNotFoundError } from '@/core/application/errors/application.error';

@Injectable()
export class DeleteHealthPlanUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.healthPlanRepository.findById(id);
    if (!existing) throw new ResourceNotFoundError('HealthPlan', id);
    await this.healthPlanRepository.softDelete(id);
  }
}
