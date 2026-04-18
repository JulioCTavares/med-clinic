import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';

@Injectable()
export class FindAllHealthPlansUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  execute(): Promise<HealthPlanEntity[]> {
    return this.healthPlanRepository.findAll();
  }
}
