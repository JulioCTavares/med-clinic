import { Inject, Injectable } from '@nestjs/common';
import { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { patients } from '@/infrastructure/database/drizzle/schemas';

@Injectable()
export class DrizzlePatientRepository implements IPatientRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async create(patient: PatientEntity): Promise<PatientEntity> {
    const [row] = await this.db
      .insert(patients)
      .values({
        id: patient.id,
        userId: patient.userId,
        name: patient.name,
        birthDate: patient.birthDate ?? null,
        phones: patient.phones ?? null,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      })
      .returning();

    return PatientEntity.create({
      id: row.id,
      userId: row.userId,
      name: row.name,
      birthDate: row.birthDate ?? undefined,
      phones: row.phones ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
