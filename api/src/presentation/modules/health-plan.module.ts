import { Module } from '@nestjs/common';
import { HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/health-plan-repository.interface';
import { DrizzleHealthPlanRepository } from '@/infrastructure/database/repositories/health-plan.repository';
import { FindAllHealthPlansUseCase } from '@/core/application/use-cases/find-all-health-plans.use-case';
import { FindHealthPlanByIdUseCase } from '@/core/application/use-cases/find-health-plan-by-id.use-case';
import { CreateHealthPlanUseCase } from '@/core/application/use-cases/create-health-plan.use-case';
import { UpdateHealthPlanUseCase } from '@/core/application/use-cases/update-health-plan.use-case';
import { DeleteHealthPlanUseCase } from '@/core/application/use-cases/delete-health-plan.use-case';
import { HealthPlanController } from '@/presentation/http/controllers/health-plan.controller';

@Module({
  providers: [
    { provide: HEALTH_PLAN_REPOSITORY, useClass: DrizzleHealthPlanRepository },
    FindAllHealthPlansUseCase,
    FindHealthPlanByIdUseCase,
    CreateHealthPlanUseCase,
    UpdateHealthPlanUseCase,
    DeleteHealthPlanUseCase,
  ],
  controllers: [HealthPlanController],
})
export class HealthPlanModule {}
