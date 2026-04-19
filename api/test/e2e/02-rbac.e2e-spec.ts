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

describe('E2E P0 - RBAC', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  let doctor1Token: string;
  let doctor1ProfileId: string;
  let doctor2ProfileId: string;
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
    const adminPassword = 'Admin@123';
    const passwordHash = await hash(adminPassword);

    const [adminUser] = await db
      .insert(users)
      .values({ email: `admin.${suffix}@e2e.test`, passwordHash, role: 'admin' })
      .returning({ id: users.id });
    createdUserIds.push(adminUser.id);

    adminToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `admin.${suffix}@e2e.test`, password: adminPassword })
        .expect(200)
    ).body.access_token;

    const [specialty] = await db
      .insert(specialties)
      .values({ code: `RBAC-${suffix}`, name: `RBAC Spec ${suffix}` })
      .returning({ id: specialties.id });
    createdSpecialtyIds.push(specialty.id);

    const patientRes = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `patient.${suffix}@e2e.test`, password: 'Pass@123', name: `Patient ${suffix}` })
      .expect(201);
    createdUserIds.push(patientRes.body.id);

    patientToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `patient.${suffix}@e2e.test`, password: 'Pass@123' })
        .expect(200)
    ).body.access_token;

    const doctor1Res = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc1.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor One ${suffix}`,
        crm: `CRM/D1-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);
    createdUserIds.push(doctor1Res.body.id);
    doctor1ProfileId = doctor1Res.body.doctor.id;

    doctor1Token = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `doc1.${suffix}@e2e.test`, password: 'Pass@123' })
        .expect(200)
    ).body.access_token;

    const doctor2Res = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc2.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor Two ${suffix}`,
        crm: `CRM/D2-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);
    createdUserIds.push(doctor2Res.body.id);
    doctor2ProfileId = doctor2Res.body.doctor.id;
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

  it('should return 403 when user without required role accesses admin-only route', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .post('/specialties')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ code: `FORBIDDEN-${suffix}`, name: `Forbidden ${suffix}` })
      .expect(403);
  });

  it('should return 401 when request has no token', async () => {
    await request(app.getHttpServer())
      .get('/doctors')
      .expect(401);
  });

  it('should allow doctor to update own profile', async () => {
    const suffix = randomUUID().slice(0, 8);

    const res = await request(app.getHttpServer())
      .patch(`/doctors/${doctor1ProfileId}`)
      .set('Authorization', `Bearer ${doctor1Token}`)
      .send({ name: `Doctor One Updated ${suffix}` })
      .expect(200);

    expect(res.body.name).toContain('Updated');
  });

  it('should block doctor from updating another doctor profile', async () => {
    await request(app.getHttpServer())
      .patch(`/doctors/${doctor2ProfileId}`)
      .set('Authorization', `Bearer ${doctor1Token}`)
      .send({ name: 'Unauthorized Update' })
      .expect(403);
  });

  it('should allow admin to update any doctor profile', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .patch(`/doctors/${doctor2ProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Admin Updated ${suffix}` })
      .expect(200);
  });
});
