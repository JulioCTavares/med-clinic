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

describe('E2E P2 - Patients', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let patientProfileId: string;
  let anotherPatientProfileId: string;
  const createdUserIds: string[] = [];
  const createdSpecialtyIds: string[] = [];

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
      .values({ code: `PAT-${suffix}`, name: `Patient Spec ${suffix}` })
      .returning({ id: specialties.id });
    createdSpecialtyIds.push(specialty.id);

    const doctorRes = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor ${suffix}`,
        crm: `CRM/PAT-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);
    createdUserIds.push(doctorRes.body.id);

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

    const anotherPatientRes = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `patient2.${suffix}@e2e.test`, password: 'Pass@123', name: `Patient2 ${suffix}` })
      .expect(201);
    createdUserIds.push(anotherPatientRes.body.id);
    anotherPatientProfileId = anotherPatientRes.body.patient.id;
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

  it('should list patients with proper authorization (admin)', async () => {
    const res = await request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const ids = (res.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).toContain(patientProfileId);
  });

  it('should list patients with proper authorization (doctor)', async () => {
    const res = await request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should block patient from listing all patients', async () => {
    await request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);
  });

  it('should fetch patient by id with proper authorization', async () => {
    const res = await request(app.getHttpServer())
      .get(`/patients/${patientProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(patientProfileId);
  });

  it('should fetch patient by id as doctor', async () => {
    const res = await request(app.getHttpServer())
      .get(`/patients/${patientProfileId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(res.body.id).toBe(patientProfileId);
  });

  it('should update patient with proper authorization (admin)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/patients/${patientProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Patient Admin Updated' })
      .expect(200);

    expect(res.body.name).toBe('Patient Admin Updated');
  });

  it('should soft delete patient with proper authorization', async () => {
    await request(app.getHttpServer())
      .delete(`/patients/${anotherPatientProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/patients/${anotherPatientProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('should block unauthorized access to patient data (no token)', async () => {
    await request(app.getHttpServer())
      .get(`/patients/${patientProfileId}`)
      .expect(401);
  });
});
