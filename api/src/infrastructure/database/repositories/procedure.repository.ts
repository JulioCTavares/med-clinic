import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IProcedureRepository } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { procedures } from '@/infrastructure/database/drizzle/schemas';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';
import { active } from '@/common/helpers/active';

const TTL_LIST = 1800;
const TTL_ITEM = 1800;

@Injectable()
export class DrizzleProcedureRepository implements IProcedureRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  private toEntity(row: typeof procedures.$inferSelect): ProcedureEntity {
    return ProcedureEntity.create({
      id: row.id,
      code: row.code,
      name: row.name,
      value: row.value,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  async findAll(): Promise<ProcedureEntity[]> {
    const cached = await this.cache.get(CacheKeys.procedimentoList());
    if (cached) return JSON.parse(cached) as ProcedureEntity[];

    const rows = await this.db
      .select()
      .from(procedures)
      .where(active(procedures));

    const entities = rows.map((r) => this.toEntity(r));
    await this.cache.set(CacheKeys.procedimentoList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  async findById(id: string): Promise<ProcedureEntity | null> {
    const cached = await this.cache.get(CacheKeys.procedimento(id));
    if (cached) return JSON.parse(cached) as ProcedureEntity;

    const [row] = await this.db
      .select()
      .from(procedures)
      .where(and(eq(procedures.id, id), active(procedures)));

    if (!row) return null;
    const entity = this.toEntity(row);
    await this.cache.set(CacheKeys.procedimento(id), JSON.stringify(entity), TTL_ITEM);
    return entity;
  }

  async create(procedure: ProcedureEntity): Promise<ProcedureEntity> {
    const [row] = await this.db
      .insert(procedures)
      .values({
        id: procedure.id,
        code: procedure.code,
        name: procedure.name,
        value: procedure.value,
        createdAt: procedure.createdAt,
        updatedAt: procedure.updatedAt,
      })
      .returning();

    await this.cache.del(CacheKeys.procedimentoList());
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<ProcedureEntity, 'code' | 'name' | 'value'>>): Promise<ProcedureEntity> {
    const [row] = await this.db
      .update(procedures)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(procedures.id, id), active(procedures)))
      .returning();

    await Promise.all([
      this.cache.del(CacheKeys.procedimento(id)),
      this.cache.del(CacheKeys.procedimentoList()),
    ]);
    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(procedures)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(procedures.id, id), active(procedures)));

    await Promise.all([
      this.cache.del(CacheKeys.procedimento(id)),
      this.cache.del(CacheKeys.procedimentoList()),
    ]);
  }
}
