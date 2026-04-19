import { Inject, Injectable } from '@nestjs/common';
import { eq, and, or, ne, count } from 'drizzle-orm';
import { IAppointmentRepository, AppointmentView, AppointmentFilters } from '@/core/domain/interfaces/appointment-repository.interface';
import { AppointmentEntity } from '@/core/domain/entities/appointment.entity';
import { AppointmentStatus } from '@/core/domain/enums/appointment-status.enum';
import type { PaginatedResult } from '@/common/types/paginated-result';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { appointments, doctors } from '@/infrastructure/database/drizzle/schemas';
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

  private toView(row: {
    id: string; code: string; date: string; time: string; isPrivate: boolean;
    status: string; patientId: string; doctorId: string; createdAt: Date; updatedAt: Date;
    doctorId2: string | null; doctorName: string | null; doctorCrm: string | null;
  }): AppointmentView {
    return {
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
      doctor: row.doctorId2 ? { id: row.doctorId2, name: row.doctorName!, crm: row.doctorCrm! } : null,
    };
  }

  private get enrichedSelect() {
    return {
      id: appointments.id,
      code: appointments.code,
      date: appointments.date,
      time: appointments.time,
      isPrivate: appointments.isPrivate,
      status: appointments.status,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      doctorId2: doctors.id,
      doctorName: doctors.name,
      doctorCrm: doctors.crm,
    };
  }

  private buildAppointmentConditions(params: Omit<AppointmentFilters, 'page' | 'limit'>) {
    const conditions = [active(appointments)];
    if (params.status) conditions.push(eq(appointments.status, params.status));
    if (params.doctorId) conditions.push(eq(appointments.doctorId, params.doctorId));
    if (params.patientId) conditions.push(eq(appointments.patientId, params.patientId));
    if (params.date) conditions.push(eq(appointments.date, params.date));
    return conditions;
  }

  async findAll(): Promise<AppointmentEntity[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(active(appointments));

    return rows.map((r) => this.toEntity(r));
  }

  async findAllWithDoctor(): Promise<AppointmentView[]> {
    const rows = await this.db
      .select(this.enrichedSelect)
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(active(appointments));

    return rows.map((r) => this.toView(r));
  }

  async findPaginatedWithDoctor(params: AppointmentFilters): Promise<PaginatedResult<AppointmentView>> {
    const conditions = this.buildAppointmentConditions(params);
    const where = and(...conditions);
    const offset = (params.page - 1) * params.limit;

    const [{ total }] = await this.db.select({ total: count() }).from(appointments).where(where);
    const rows = await this.db
      .select(this.enrichedSelect)
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(where)
      .limit(params.limit)
      .offset(offset);

    return {
      data: rows.map((r) => this.toView(r)),
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
  }

  async findById(id: string): Promise<AppointmentEntity | null> {
    const [row] = await this.db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), active(appointments)));

    return row ? this.toEntity(row) : null;
  }

  async findByIdWithDoctor(id: string): Promise<AppointmentView | null> {
    const [row] = await this.db
      .select(this.enrichedSelect)
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(eq(appointments.id, id), active(appointments)));

    return row ? this.toView(row) : null;
  }

  async findByPatientId(patientId: string): Promise<AppointmentView[]> {
    const rows = await this.db
      .select(this.enrichedSelect)
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(eq(appointments.patientId, patientId), active(appointments)));

    return rows.map((r) => this.toView(r));
  }

  async findByPatientIdPaginated(patientId: string, params: AppointmentFilters): Promise<PaginatedResult<AppointmentView>> {
    const conditions = [eq(appointments.patientId, patientId), active(appointments)];
    if (params.status) conditions.push(eq(appointments.status, params.status));
    if (params.date) conditions.push(eq(appointments.date, params.date));

    const where = and(...conditions);
    const offset = (params.page - 1) * params.limit;

    const [{ total }] = await this.db.select({ total: count() }).from(appointments).where(where);
    const rows = await this.db
      .select(this.enrichedSelect)
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(where)
      .limit(params.limit)
      .offset(offset);

    return {
      data: rows.map((r) => this.toView(r)),
      meta: { total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) },
    };
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
