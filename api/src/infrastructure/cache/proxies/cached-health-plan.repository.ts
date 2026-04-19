import { Inject, Injectable } from '@nestjs/common';
import type { IHealthPlanRepository, HealthPlanFilters } from '@/core/domain/interfaces/health-plan-repository.interface';
import type { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';

const TTL = 1800;

@Injectable()
export class CachedHealthPlanRepository implements IHealthPlanRepository {
  constructor(
    private readonly real: IHealthPlanRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async findAll(): Promise<HealthPlanEntity[]> {
    const cached = await this.cache.get(CacheKeys.planoList());
    if (cached) return JSON.parse(cached) as HealthPlanEntity[];

    const entities = await this.real.findAll();
    await this.cache.set(CacheKeys.planoList(), JSON.stringify(entities), TTL);
    return entities;
  }

  findPaginated(params: HealthPlanFilters): Promise<PaginatedResult<HealthPlanEntity>> {
    return this.real.findPaginated(params);
  }

  async findById(id: string): Promise<HealthPlanEntity | null> {
    const cached = await this.cache.get(CacheKeys.plano(id));
    if (cached) return JSON.parse(cached) as HealthPlanEntity;

    const entity = await this.real.findById(id);
    if (entity) {
      await this.cache.set(CacheKeys.plano(id), JSON.stringify(entity), TTL);
    }
    return entity;
  }

  async create(healthPlan: HealthPlanEntity): Promise<HealthPlanEntity> {
    const result = await this.real.create(healthPlan);
    await this.cache.del(CacheKeys.planoList());
    return result;
  }

  async update(id: string, data: Partial<Pick<HealthPlanEntity, 'code' | 'description' | 'phone'>>): Promise<HealthPlanEntity> {
    const result = await this.real.update(id, data);
    await Promise.all([
      this.cache.del(CacheKeys.plano(id)),
      this.cache.del(CacheKeys.planoList()),
    ]);
    return result;
  }

  async softDelete(id: string): Promise<void> {
    await this.real.softDelete(id);
    await Promise.all([
      this.cache.del(CacheKeys.plano(id)),
      this.cache.del(CacheKeys.planoList()),
    ]);
  }
}
