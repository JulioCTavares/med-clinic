import { Inject, Injectable } from '@nestjs/common';
import { eq, and, or, ne } from 'drizzle-orm';
import { IAppointmentRepository } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { appointments } from '@/infrastructure/database/drizzle/schemas';
import { active } from '@/common/helpers/active';

@Injectable()
export class DrizzleAppointmentRepository implements IAppointmentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  private toEntity(row: typeof appointments.$inferSelect): AppointmentEntity {
    return AppointmentEntity.create({
      id: row.id,
      code: row.code,
      date: row.date,
      time: row.time,
      isPrivate: row.isPrivate,
      status: row.status as AppointmentStatus,
      patientId: row.patientId,
      doctorId: row.doctorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  async findAll(): Promise<AppointmentEntity[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(active(appointments));

    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<AppointmentEntity | null> {
    const [row] = await this.db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), active(appointments)));

    return row ? this.toEntity(row) : null;
  }

  async findConflict(
    doctorId: string,
    patientId: string,
    date: string,
    time: string,
    excludeId?: string,
  ): Promise<AppointmentEntity | null> {
    const conditions = [
      eq(appointments.date, date),
      eq(appointments.time, time),
      active(appointments),
      or(eq(appointments.doctorId, doctorId), eq(appointments.patientId, patientId))!,
    ];

    if (excludeId) {
      conditions.push(ne(appointments.id, excludeId));
    }

    const [row] = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions));

    return row ? this.toEntity(row) : null;
  }

  async create(appointment: AppointmentEntity): Promise<AppointmentEntity> {
    const [row] = await this.db
      .insert(appointments)
      .values({
        id: appointment.id,
        code: appointment.code,
        date: appointment.date,
        time: appointment.time,
        isPrivate: appointment.isPrivate,
        status: appointment.status,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      })
      .returning();

    return this.toEntity(row);
  }

  async update(
    id: string,
    data: { status?: AppointmentStatus; date?: string; time?: string; isPrivate?: boolean },
  ): Promise<AppointmentEntity> {
    const [row] = await this.db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(appointments.id, id), active(appointments)))
      .returning();

    return this.toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(appointments)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(appointments.id, id), active(appointments)));
  }
}
