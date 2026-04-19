import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { IPatientRepository } from '@/core/domain/interfaces/patient-repository.interface';
import { PatientEntity } from '@/core/domain/entities/patient.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { patients } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzlePatientRepository implements IPatientRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof patients.$inferSelect): PatientEntity {
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

    return this.toEntity(row);
  }

  async findAll(): Promise<PatientEntity[]> {
    const rows = await this.db
      .select()
      .from(patients)
      .where(active(patients));

    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<PatientEntity | null> {
    const [row] = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), active(patients)));

    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<PatientEntity | null> {
    const [row] = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.userId, userId), active(patients)));

    return row ? this.toEntity(row) : null;
  }

  async update(id: string, data: Partial<Pick<PatientEntity, 'name' | 'birthDate' | 'phones'>>): Promise<PatientEntity> {
    const [row] = await this.db
      .update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(patients.id, id), active(patients)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(patients)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(patients.id, id), active(patients)));
  }
}
