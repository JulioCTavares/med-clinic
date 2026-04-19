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
import { healthPlans } from '@/infrastructure/database/drizzle/schemas/health-plans';

describe('E2E P1 - Health Plans', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  const createdUserIds: string[] = [];
  const createdHealthPlanIds: string[] = [];
  let healthPlanId: string;
  let healthPlanCode: string;

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
    if (createdHealthPlanIds.length > 0) {
      await db.delete(healthPlans).where(inArray(healthPlans.id, createdHealthPlanIds));
    }
    if (createdUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await app.close();
  });

  it('should create health plan with authorized role', async () => {
    const suffix = randomUUID().slice(0, 8);
    healthPlanCode = `HP-${suffix}`;

    const res = await request(app.getHttpServer())
      .post('/health-plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: healthPlanCode, description: `Health Plan ${suffix}`, phone: '11999999999' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.code).toBe(healthPlanCode);
    healthPlanId = res.body.id;
    createdHealthPlanIds.push(healthPlanId);
  });

  it('should return 403 for non-admin creating health plan', async () => {
    const suffix = randomUUID().slice(0, 8);
    await request(app.getHttpServer())
      .post('/health-plans')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ code: `HP-DENIED-${suffix}`, description: `Denied ${suffix}` })
      .expect(403);
  });

  it('should list active health plans', async () => {
    const res = await request(app.getHttpServer())
      .get('/health-plans')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const ids = (res.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).toContain(healthPlanId);
  });

  it('should fetch health plan by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/health-plans/${healthPlanId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(res.body.id).toBe(healthPlanId);
    expect(res.body.code).toBe(healthPlanCode);
  });

  it('should update health plan with authorized role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/health-plans/${healthPlanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated Description' })
      .expect(200);

    expect(res.body.description).toBe('Updated Description');
  });

  it('should soft delete health plan with authorized role', async () => {
    await request(app.getHttpServer())
      .delete(`/health-plans/${healthPlanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('should not list soft-deleted health plan', async () => {
    const res = await request(app.getHttpServer())
      .get('/health-plans')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    const ids = (res.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).not.toContain(healthPlanId);
  });

  it('should return not found for GET by id of soft-deleted health plan', async () => {
    await request(app.getHttpServer())
      .get(`/health-plans/${healthPlanId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(404);
  });
});
