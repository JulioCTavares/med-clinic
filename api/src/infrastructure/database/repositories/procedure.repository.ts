import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ilike, count } from 'drizzle-orm';
import { IProcedureRepository, ProcedureFilters } from '@/core/domain/interfaces/procedure-repository.interface';
import { ProcedureEntity } from '@/core/domain/entities/procedure.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { procedures } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzleProcedureRepository implements IProcedureRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

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
    const rows = await this.db.select().from(procedures).where(active(procedures));
    return rows.map((r) => this.toEntity(r));
  }

  async findPaginated(params: ProcedureFilters): Promise<PaginatedResult<ProcedureEntity>> {
    const conditions = [active(procedures)];
    if (params.name) conditions.push(ilike(procedures.name, `%${params.name}%`));
    if (params.code) conditions.push(ilike(procedures.code, `%${params.code}%`));

    const where = and(...conditions);
    const offset = (params.page - 1) * params.limit;

    const [{ total }] = await this.db.select({ total: count() }).from(procedures).where(where);
    const rows = await this.db.select().from(procedures).where(where).limit(params.limit).offset(offset);

    return {
      data: rows.map((r) => this.toEntity(r)),
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
  }

  async findById(id: string): Promise<ProcedureEntity | null> {
    const [row] = await this.db
      .select()
      .from(procedures)
      .where(and(eq(procedures.id, id), active(procedures)));

    if (!row) return null;
    return this.toEntity(row);
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

    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<ProcedureEntity, 'code' | 'name' | 'value'>>): Promise<ProcedureEntity> {
    const [row] = await this.db
      .update(procedures)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(procedures.id, id), active(procedures)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(procedures)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(procedures.id, id), active(procedures)));
  }
}
