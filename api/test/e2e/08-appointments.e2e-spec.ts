import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { hash } from 'argon2';
import { inArray } from 'drizzle-orm';
import { AppModule } from '@/app.module';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';
import { users } from '@/infrastructure/database/drizzle/schemas/users';
import { specialties } from '@/infrastructure/database/drizzle/schemas/specialties';

describe('E2E P2 - Appointments', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let doctorProfileId: string;
  let patientProfileId: string;
  let appointmentId: string;
  const createdUserIds: string[] = [];
  const createdSpecialtyIds: string[] = [];

  const APPT_DATE = '2030-06-15';
  const APPT_TIME = '10:00';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    db = app.get<DrizzleDB>(DRIZZLE_DB);
    await app.init();
    await (app as NestFastifyApplication).getHttpAdapter().getInstance().ready();

    const suffix = randomUUID().slice(0, 8);
    const passwordHash = await hash('Admin@123');
    const [adminUser] = await db
      .insert(users)
      .values({ email: `admin.${suffix}@e2e.test`, passwordHash, role: 'admin' })
      .returning({ id: users.id });
    createdUserIds.push(adminUser.id);

    adminToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `admin.${suffix}@e2e.test`, password: 'Admin@123' })
        .expect(200)
    ).body.access_token;

    const [specialty] = await db
      .insert(specialties)
      .values({ code: `APPT-${suffix}`, name: `Appt Spec ${suffix}` })
      .returning({ id: specialties.id });
    createdSpecialtyIds.push(specialty.id);

    const doctorRes = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor ${suffix}`,
        crm: `CRM/APPT-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);
    createdUserIds.push(doctorRes.body.id);
    doctorProfileId = doctorRes.body.doctor.id;

    doctorToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `doc.${suffix}@e2e.test`, password: 'Pass@123' })
        .expect(200)
    ).body.access_token;

    const patientRes = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `patient.${suffix}@e2e.test`, password: 'Pass@123', name: `Patient ${suffix}` })
      .expect(201);
    createdUserIds.push(patientRes.body.id);
    patientProfileId = patientRes.body.patient.id;

    patientToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `patient.${suffix}@e2e.test`, password: 'Pass@123' })
        .expect(200)
    ).body.access_token;
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    if (createdSpecialtyIds.length > 0) {
      await db.delete(specialties).where(inArray(specialties.id, createdSpecialtyIds));
    }
    await app.close();
  });

  it('should create appointment with valid doctor and patient', async () => {
    const suffix = randomUUID().slice(0, 8);

    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `APPT-${suffix}`,
        date: APPT_DATE,
        time: APPT_TIME,
        isPrivate: false,
        patientId: patientProfileId,
        doctorId: doctorProfileId,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('pending');
    appointmentId = res.body.id;
  });

  it('should block creation when doctor schedule conflicts', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `APPT-CONFLICT-DOC-${suffix}`,
        date: APPT_DATE,
        time: APPT_TIME,
        isPrivate: false,
        patientId: patientProfileId,
        doctorId: doctorProfileId,
      })
      .expect(409);
  });

  it('should block creation when patient schedule conflicts', async () => {
    const suffix = randomUUID().slice(0, 8);
    const [specialty2] = await db
      .insert(specialties)
      .values({ code: `APPT2-${suffix}`, name: `Appt Spec2 ${suffix}` })
      .returning({ id: specialties.id });
    createdSpecialtyIds.push(specialty2.id);

    const doc2Res = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc2.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor2 ${suffix}`,
        crm: `CRM/APPT2-${suffix}`,
        specialtyId: specialty2.id,
      })
      .expect(201);
    createdUserIds.push(doc2Res.body.id);
    const doctor2ProfileId = doc2Res.body.doctor.id;

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `APPT-CONFLICT-PAT-${suffix}`,
        date: APPT_DATE,
        time: APPT_TIME,
        isPrivate: false,
        patientId: patientProfileId,
        doctorId: doctor2ProfileId,
      })
      .expect(409);
  });

  it('should list appointments respecting authentication', async () => {
    const res = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    const ids = (res.body.data as Array<{ id: string }>).map((a) => a.id);
    expect(ids).toContain(appointmentId);
  });

  it('should fetch appointment by id respecting authentication', async () => {
    const res = await request(app.getHttpServer())
      .get(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(res.body.id).toBe(appointmentId);
    expect(res.body.patientId).toBe(patientProfileId);
    expect(res.body.doctorId).toBe(doctorProfileId);
  });

  it('should update appointment status with valid transition', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(res.body.status).toBe('confirmed');
  });

  it('should soft delete appointment and remove it from active listing', async () => {
    const suffix = randomUUID().slice(0, 8);
    const createRes = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `APPT-DEL-${suffix}`,
        date: '2030-07-20',
        time: '14:00',
        isPrivate: false,
        patientId: patientProfileId,
        doctorId: doctorProfileId,
      })
      .expect(201);

    const toDeleteId = createRes.body.id;

    await request(app.getHttpServer())
      .delete(`/appointments/${toDeleteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const listRes = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const ids = (listRes.body.data as Array<{ id: string }>).map((a) => a.id);
    expect(ids).not.toContain(toDeleteId);
  });
});
