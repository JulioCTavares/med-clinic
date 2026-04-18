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

describe('E2E P3 - Patient Health Plans', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  let patientProfileId: string;
  let healthPlanId: string;
  const createdUserIds: string[] = [];
  const createdHealthPlanIds: string[] = [];

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
    patientProfileId = patientRes.body.patient.id;

    patientToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `patient.${suffix}@e2e.test`, password: 'Pass@123' })
        .expect(200)
    ).body.access_token;

    const [healthPlan] = await db
      .insert(healthPlans)
      .values({ code: `PHP-${suffix}`, description: `Health Plan PHP ${suffix}` })
      .returning({ id: healthPlans.id });
    healthPlanId = healthPlan.id;
    createdHealthPlanIds.push(healthPlanId);
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

  it('should associate patient to health plan (POST /pacientes/:id/planos)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pacientes/${patientProfileId}/planos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ healthPlanId, contractNumber: 'CONTRACT-001' })
      .expect(201);

    expect(res.body.patientId).toBe(patientProfileId);
    expect(res.body.healthPlanId).toBe(healthPlanId);
    expect(res.body.contractNumber).toBe('CONTRACT-001');
  });

  it('should list active patient associations (GET /pacientes/:id/planos)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pacientes/${patientProfileId}/planos`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const planIds = (res.body as Array<{ healthPlanId: string }>).map((p) => p.healthPlanId);
    expect(planIds).toContain(healthPlanId);
  });

  it('should remove association (DELETE /pacientes/:id/planos/:planId)', async () => {
    await request(app.getHttpServer())
      .delete(`/pacientes/${patientProfileId}/planos/${healthPlanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/pacientes/${patientProfileId}/planos`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    const planIds = (res.body as Array<{ healthPlanId: string }>).map((p) => p.healthPlanId);
    expect(planIds).not.toContain(healthPlanId);
  });
});
