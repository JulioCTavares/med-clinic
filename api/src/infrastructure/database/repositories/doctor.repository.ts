import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '@/core/domain/interfaces/doctor-repository.interface';
import { DoctorEntity } from '@/core/domain/entities/doctor.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { doctors } from '@/infrastructure/database/drizzle/schemas';

@Injectable()
export class DrizzleDoctorRepository implements IDoctorRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

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
}
