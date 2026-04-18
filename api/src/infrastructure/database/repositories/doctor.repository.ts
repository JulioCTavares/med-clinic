import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { doctors } from '@/infrastructure/database/drizzle/schemas';
import { CACHE_SERVICE } from '@/core/domain/interfaces/cache-service.interface';
import type { ICacheService } from '@/core/domain/interfaces/cache-service.interface';
import { CacheKeys } from '@/common/cache/cache-keys';
import { active } from '@/common/helpers/active';

const TTL_LIST = 300;
const TTL_ITEM = 600;

@Injectable()
export class DrizzleDoctorRepository implements IDoctorRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

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

    await this.cache.del(CacheKeys.medicoList());
    return this.toEntity(row);
  }

  async findAll(): Promise<DoctorEntity[]> {
    const cached = await this.cache.get(CacheKeys.medicoList());
    if (cached) return JSON.parse(cached) as DoctorEntity[];

    const rows = await this.db
      .select()
      .from(doctors)
      .where(active(doctors));

    const entities = rows.map((r) => this.toEntity(r));
    await this.cache.set(CacheKeys.medicoList(), JSON.stringify(entities), TTL_LIST);
    return entities;
  }

  async findById(id: string): Promise<DoctorEntity | null> {
    const cached = await this.cache.get(CacheKeys.medico(id));
    if (cached) return JSON.parse(cached) as DoctorEntity;

    const [row] = await this.db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), active(doctors)));

    if (!row) return null;
    const entity = this.toEntity(row);
    await this.cache.set(CacheKeys.medico(id), JSON.stringify(entity), TTL_ITEM);
    return entity;
  }

  async update(id: string, data: Partial<Pick<DoctorEntity, 'name' | 'crm' | 'specialtyId'>>): Promise<DoctorEntity> {
    const [row] = await this.db
      .update(doctors)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(doctors.id, id), active(doctors)))
      .returning();

    await Promise.all([
      this.cache.del(CacheKeys.medico(id)),
      this.cache.del(CacheKeys.medicoList()),
    ]);
    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(doctors)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(doctors.id, id), active(doctors)));

    await Promise.all([
      this.cache.del(CacheKeys.medico(id)),
      this.cache.del(CacheKeys.medicoList()),
    ]);
  }
}
