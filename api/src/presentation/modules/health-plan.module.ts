import { Module } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import { CACHE_SERVICE, ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { DrizzleHealthPlanRepository } from '@/infrastructure/database/repositories/health-plan.repository';
import { CachedHealthPlanRepository } from '@/infrastructure/cache/proxies/cached-health-plan.repository';
import { FindAllHealthPlansUseCase } from '@/core/application/use-cases/find-all-health-plans.use-case';
import { FindHealthPlanByIdUseCase } from '@/core/application/use-cases/find-health-plan-by-id.use-case';
import { CreateHealthPlanUseCase } from '@/core/application/use-cases/create-health-plan.use-case';
import { UpdateHealthPlanUseCase } from '@/core/application/use-cases/update-health-plan.use-case';
import { DeleteHealthPlanUseCase } from '@/core/application/use-cases/delete-health-plan.use-case';
import { HealthPlanController } from '@/presentation/http/controllers/health-plan.controller';

@Module({
  providers: [
    DrizzleHealthPlanRepository,
    {
      provide: HEALTH_PLAN_REPOSITORY,
      useFactory: (repo: DrizzleHealthPlanRepository, cache: ICacheService) =>
        new CachedHealthPlanRepository(repo, cache),
      inject: [DrizzleHealthPlanRepository, CACHE_SERVICE],
    },
    FindAllHealthPlansUseCase,
    FindHealthPlanByIdUseCase,
    CreateHealthPlanUseCase,
    UpdateHealthPlanUseCase,
    DeleteHealthPlanUseCase,
  ],
  controllers: [HealthPlanController],
})
export class HealthPlanModule {}
