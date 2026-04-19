import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';

export const HEALTH_PLAN_REPOSITORY = Symbol('IHealthPlanRepository');

export interface IHealthPlanRepository {
  findAll(): Promise<HealthPlanEntity[]>;
  findById(id: string): Promise<HealthPlanEntity | null>;
  create(healthPlan: HealthPlanEntity): Promise<HealthPlanEntity>;
  update(id: string, data: Partial<Pick<HealthPlanEntity, 'code' | 'description' | 'phone'>>): Promise<HealthPlanEntity>;
  softDelete(id: string): Promise<void>;
}
