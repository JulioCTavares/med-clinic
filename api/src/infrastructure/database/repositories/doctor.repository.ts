import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ilike, count } from 'drizzle-orm';
import { IDoctorRepository, DoctorFilters } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { doctors } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzleDoctorRepository implements IDoctorRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof doctors.$inferSelect): DoctorEntity {
    return DoctorEntity.create({
      id: row.id,
      userId: row.userId,
      name: row.name,
      crm: row.crm,
      specialtyId: row.specialtyId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(doctor: DoctorEntity): Promise<DoctorEntity> {
    const [row] = await this.db
      .insert(doctors)
      .values({
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.name,
        crm: doctor.crm,
        specialtyId: doctor.specialtyId,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      })
      .returning();

    return this.toEntity(row);
  }

  async findAll(): Promise<DoctorEntity[]> {
    const rows = await this.db.select().from(doctors).where(active(doctors));
    return rows.map((r) => this.toEntity(r));
  }

  async findPaginated(params: DoctorFilters): Promise<PaginatedResult<DoctorEntity>> {
    const conditions = [active(doctors)];
    if (params.name) conditions.push(ilike(doctors.name, `%${params.name}%`));
    if (params.specialtyId) conditions.push(eq(doctors.specialtyId, params.specialtyId));

    const where = and(...conditions);
    const offset = (params.page - 1) * params.limit;

    const [{ total }] = await this.db.select({ total: count() }).from(doctors).where(where);
    const rows = await this.db.select().from(doctors).where(where).limit(params.limit).offset(offset);

    return {
      data: rows.map((r) => this.toEntity(r)),
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
  }

  async findById(id: string): Promise<DoctorEntity | null> {
    const [row] = await this.db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), active(doctors)));

    if (!row) return null;
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Pick<DoctorEntity, 'name' | 'crm' | 'specialtyId'>>): Promise<DoctorEntity> {
    const [row] = await this.db
      .update(doctors)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(doctors.id, id), active(doctors)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(doctors)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(doctors.id, id), active(doctors)));
  }
}
