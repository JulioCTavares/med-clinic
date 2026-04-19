import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { IHealthPlanRepository, HealthPlanFilters } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';

@Injectable()
export class FindAllHealthPlansUseCase {
  constructor(
    @Inject(HEALTH_PLAN_REPOSITORY) private readonly healthPlanRepository: IHealthPlanRepository,
  ) {}

  execute(params: HealthPlanFilters): Promise<PaginatedResult<HealthPlanEntity>> {
    return this.healthPlanRepository.findPaginated(params);
  }
}
