import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { ISpecialtyRepository } from '@/core/domain/interfaces/specialty-repository.interface';
import { SpecialtyEntity } from '@/core/domain/entities/specialty.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { specialties } from '@/infrastructure/database/drizzle/schemas';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';
import { active } from '@/common/helpers/active';

const TTL_LIST = 3600;
const TTL_ITEM = 1800;

@Injectable()
export class DrizzleSpecialtyRepository implements ISpecialtyRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

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
    const cached = await this.cache.get(CacheKeys.especialidadeList());
    if (cached) return JSON.parse(cached) as SpecialtyEntity[];

    const rows = await this.db
      .select()
      .from(specialties)
      .where(active(specialties));

    const entities = rows.map((r) => this.toEntity(r));
    await this.cache.set(CacheKeys.especialidadeList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  async findById(id: string): Promise<SpecialtyEntity | null> {
    const cached = await this.cache.get(CacheKeys.especialidade(id));
    if (cached) return JSON.parse(cached) as SpecialtyEntity;

    const [row] = await this.db
      .select()
      .from(specialties)
      .where(and(eq(specialties.id, id), active(specialties)));

    if (!row) return null;
    const entity = this.toEntity(row);
    await this.cache.set(CacheKeys.especialidade(id), JSON.stringify(entity), TTL_ITEM);
    return entity;
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

    await this.cache.del(CacheKeys.especialidadeList());
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<SpecialtyEntity, 'code' | 'name'>>): Promise<SpecialtyEntity> {
    const [row] = await this.db
      .update(specialties)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(specialties.id, id), active(specialties)))
      .returning();

    await Promise.all([
      this.cache.del(CacheKeys.especialidade(id)),
      this.cache.del(CacheKeys.especialidadeList()),
    ]);
    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(specialties)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(specialties.id, id), active(specialties)));

    await Promise.all([
      this.cache.del(CacheKeys.especialidade(id)),
      this.cache.del(CacheKeys.especialidadeList()),
    ]);
  }
}
