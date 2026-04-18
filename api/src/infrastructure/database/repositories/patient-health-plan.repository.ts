import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { IPatientHealthPlanRepository } from '@/core/domain/interfaces/patient-health-plan-repository.interface';
import { PatientHealthPlanEntity } from '@/core/domain/entities/patient-health-plan.entity';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { patientHealthPlans } from '@/infrastructure/database/drizzle/schemas';

@Injectable()
export class DrizzlePatientHealthPlanRepository implements IPatientHealthPlanRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof patientHealthPlans.$inferSelect): PatientHealthPlanEntity {
    return PatientHealthPlanEntity.create({
      patientId: row.patientId,
      healthPlanId: row.healthPlanId,
      contractNumber: row.contractNumber,
    });
  }

  async create(entity: PatientHealthPlanEntity): Promise<PatientHealthPlanEntity> {
    const [row] = await this.db
      .insert(patientHealthPlans)
      .values({
        patientId: entity.patientId,
        healthPlanId: entity.healthPlanId,
        contractNumber: entity.contractNumber,
      })
      .returning();

    return this.toEntity(row);
  }

  async findByPatient(patientId: string): Promise<PatientHealthPlanEntity[]> {
    const rows = await this.db
      .select()
      .from(patientHealthPlans)
      .where(eq(patientHealthPlans.patientId, patientId));

    return rows.map((r) => this.toEntity(r));
  }

  async delete(patientId: string, healthPlanId: string): Promise<void> {
    await this.db
      .delete(patientHealthPlans)
      .where(
        and(
          eq(patientHealthPlans.patientId, patientId),
          eq(patientHealthPlans.healthPlanId, healthPlanId),
        ),
      );
  }
}
