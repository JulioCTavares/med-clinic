import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { specialties } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzleSpecialtyRepository implements ISpecialtyRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof specialties.$inferSelect): SpecialtyEntity {
    return SpecialtyEntity.create({
      id: row.id,
      code: row.code,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  async findAll(): Promise<SpecialtyEntity[]> {
    const rows = await this.db.select().from(specialties).where(active(specialties));
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<SpecialtyEntity | null> {
    const [row] = await this.db
      .select()
      .from(specialties)
      .where(and(eq(specialties.id, id), active(specialties)));

    if (!row) return null;
    return this.toEntity(row);
  }

  async create(specialty: SpecialtyEntity): Promise<SpecialtyEntity> {
    const [row] = await this.db
      .insert(specialties)
      .values({
        id: specialty.id,
        code: specialty.code,
        name: specialty.name,
        createdAt: specialty.createdAt,
        updatedAt: specialty.updatedAt,
      })
      .returning();

    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<SpecialtyEntity, 'code' | 'name'>>): Promise<SpecialtyEntity> {
    const [row] = await this.db
      .update(specialties)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(specialties.id, id), active(specialties)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(specialties)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(specialties.id, id), active(specialties)));
  }
}
