import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IHealthPlanRepository } from '@/core/domain/interfaces/health-plan-repository.interface';
import { HealthPlanEntity } from '@/core/domain/entities/health-plan.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { healthPlans } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzleHealthPlanRepository implements IHealthPlanRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

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
    const rows = await this.db.select().from(healthPlans).where(active(healthPlans));
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<HealthPlanEntity | null> {
    const [row] = await this.db
      .select()
      .from(healthPlans)
      .where(and(eq(healthPlans.id, id), active(healthPlans)));

    if (!row) return null;
    return this.toEntity(row);
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

    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<HealthPlanEntity, 'code' | 'description' | 'phone'>>): Promise<HealthPlanEntity> {
    const [row] = await this.db
      .update(healthPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(healthPlans.id, id), active(healthPlans)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(healthPlans)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(healthPlans.id, id), active(healthPlans)));
  }
}
