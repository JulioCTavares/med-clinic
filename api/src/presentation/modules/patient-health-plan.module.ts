import { Module } from '@nestjs/common';
import { PATIENT_HEALTH_PLAN_REPOSITORY } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { DrizzlePatientHealthPlanRepository } from '@/infrastructure/database/repositories/patient-health-plan.repository';
import { AssociatePatientHealthPlanUseCase } from '@/core/application/use-cases/associate-patient-health-plan.use-case';
import { ListPatientHealthPlansUseCase } from '@/core/application/use-cases/list-patient-health-plans.use-case';
import { RemovePatientHealthPlanUseCase } from '@/core/application/use-cases/remove-patient-health-plan.use-case';
import { PatientHealthPlanController } from '@/presentation/http/controllers/patient-health-plan.controller';

@Module({
  providers: [
    {
      provide: PATIENT_HEALTH_PLAN_REPOSITORY,
      useClass: DrizzlePatientHealthPlanRepository,
    },
    AssociatePatientHealthPlanUseCase,
    ListPatientHealthPlansUseCase,
    RemovePatientHealthPlanUseCase,
  ],
  controllers: [PatientHealthPlanController],
})
export class PatientHealthPlanModule {}
