import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { healthPlans } from '@/infrastructure/database/drizzle/schemas';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';
import { active } from '@/common/helpers/active';

const TTL_LIST = 1800;
const TTL_ITEM = 1800;

@Injectable()
export class DrizzleHealthPlanRepository implements IHealthPlanRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  private toEntity(row: typeof healthPlans.$inferSelect): HealthPlanEntity {
    return HealthPlanEntity.create({
      id: row.id,
      code: row.code,
      description: row.description,
      phone: row.phone,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  async findAll(): Promise<HealthPlanEntity[]> {
    const cached = await this.cache.get(CacheKeys.planoList());
    if (cached) return JSON.parse(cached) as HealthPlanEntity[];

    const rows = await this.db
      .select()
      .from(healthPlans)
      .where(active(healthPlans));

    const entities = rows.map((r) => this.toEntity(r));
    await this.cache.set(CacheKeys.planoList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  async findById(id: string): Promise<HealthPlanEntity | null> {
    const cached = await this.cache.get(CacheKeys.plano(id));
    if (cached) return JSON.parse(cached) as HealthPlanEntity;

    const [row] = await this.db
      .select()
      .from(healthPlans)
      .where(and(eq(healthPlans.id, id), active(healthPlans)));

    if (!row) return null;
    const entity = this.toEntity(row);
    await this.cache.set(CacheKeys.plano(id), JSON.stringify(entity), TTL_ITEM);
    return entity;
  }

  async create(healthPlan: HealthPlanEntity): Promise<HealthPlanEntity> {
    const [row] = await this.db
      .insert(healthPlans)
      .values({
        id: healthPlan.id,
        code: healthPlan.code,
        description: healthPlan.description,
        phone: healthPlan.phone,
        createdAt: healthPlan.createdAt,
        updatedAt: healthPlan.updatedAt,
      })
      .returning();

    await this.cache.del(CacheKeys.planoList());
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<HealthPlanEntity, 'code' | 'description' | 'phone'>>): Promise<HealthPlanEntity> {
    const [row] = await this.db
      .update(healthPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(healthPlans.id, id), active(healthPlans)))
      .returning();

    await Promise.all([
      this.cache.del(CacheKeys.plano(id)),
      this.cache.del(CacheKeys.planoList()),
    ]);
    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(healthPlans)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(healthPlans.id, id), active(healthPlans)));

    await Promise.all([
      this.cache.del(CacheKeys.plano(id)),
      this.cache.del(CacheKeys.planoList()),
    ]);
  }
}
