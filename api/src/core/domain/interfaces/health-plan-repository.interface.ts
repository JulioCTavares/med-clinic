import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';

export const HEALTH_PLAN_REPOSITORY = Symbol('IHealthPlanRepository');

export interface HealthPlanFilters {
  code?: string;
  description?: string;
  page: number;
  limit: number;
}

export interface IHealthPlanRepository {
  findAll(): Promise<HealthPlanEntity[]>;
  findPaginated(params: HealthPlanFilters): Promise<PaginatedResult<HealthPlanEntity>>;
  findById(id: string): Promise<HealthPlanEntity | null>;
  create(healthPlan: HealthPlanEntity): Promise<HealthPlanEntity>;
  update(id: string, data: Partial<Pick<HealthPlanEntity, 'code' | 'description' | 'phone'>>): Promise<HealthPlanEntity>;
  softDelete(id: string): Promise<void>;
}
