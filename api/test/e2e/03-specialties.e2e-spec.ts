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

describe('E2E P1 - Specialties', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  const createdUserIds: string[] = [];
  const createdSpecialtyIds: string[] = [];
  let specialtyId: string;
  let specialtyCode: string;

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
  });

  afterAll(async () => {
    if (createdSpecialtyIds.length > 0) {
      await db.delete(specialties).where(inArray(specialties.id, createdSpecialtyIds));
    }
    if (createdUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await app.close();
  });

  it('should create specialty (POST /specialties)', async () => {
    const suffix = randomUUID().slice(0, 8);
    specialtyCode = `SPEC-${suffix}`;

    const res = await request(app.getHttpServer())
      .post('/specialties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: specialtyCode, name: `Specialty ${suffix}` })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.code).toBe(specialtyCode);
    specialtyId = res.body.id;
    createdSpecialtyIds.push(specialtyId);
  });

  it('should list active specialties (GET /specialties)', async () => {
    const res = await request(app.getHttpServer())
      .get('/specialties')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    const ids = (res.body.data as Array<{ id: string }>).map((s) => s.id);
    expect(ids).toContain(specialtyId);
  });

  it('should fetch specialty by id (GET /specialties/:id)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/specialties/${specialtyId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(res.body.id).toBe(specialtyId);
    expect(res.body.code).toBe(specialtyCode);
  });

  it('should update specialty (PATCH /specialties/:id)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/specialties/${specialtyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Specialty Name' })
      .expect(200);

    expect(res.body.name).toBe('Updated Specialty Name');
  });

  it('should soft delete specialty (DELETE /specialties/:id)', async () => {
    await request(app.getHttpServer())
      .delete(`/specialties/${specialtyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('should not list soft-deleted specialty', async () => {
    const res = await request(app.getHttpServer())
      .get('/specialties')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    const ids = (res.body.data as Array<{ id: string }>).map((s) => s.id);
    expect(ids).not.toContain(specialtyId);
  });

  it('should return not found for GET by id of soft-deleted specialty', async () => {
    await request(app.getHttpServer())
      .get(`/specialties/${specialtyId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(404);
  });
});
