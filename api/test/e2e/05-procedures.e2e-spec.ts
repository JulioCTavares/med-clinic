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
import { procedures } from '@/infrastructure/database/drizzle/schemas/procedures';

describe('E2E P1 - Procedures', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  const createdUserIds: string[] = [];
  const createdProcedureIds: string[] = [];
  let procedureId: string;
  let procedureCode: string;

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
    if (createdProcedureIds.length > 0) {
      await db.delete(procedures).where(inArray(procedures.id, createdProcedureIds));
    }
    if (createdUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await app.close();
  });

  it('should create procedure with authorized role', async () => {
    const suffix = randomUUID().slice(0, 8);
    procedureCode = `PROC-${suffix}`;

    const res = await request(app.getHttpServer())
      .post('/procedimentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: procedureCode, name: `Procedure ${suffix}`, value: '250.00' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.code).toBe(procedureCode);
    procedureId = res.body.id;
    createdProcedureIds.push(procedureId);
  });

  it('should return 403 for non-admin creating procedure', async () => {
    const suffix = randomUUID().slice(0, 8);
    await request(app.getHttpServer())
      .post('/procedimentos')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ code: `PROC-DENIED-${suffix}`, name: `Denied ${suffix}`, value: '100.00' })
      .expect(403);
  });

  it('should list active procedures', async () => {
    const res = await request(app.getHttpServer())
      .get('/procedimentos')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const ids = (res.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).toContain(procedureId);
  });

  it('should fetch procedure by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/procedimentos/${procedureId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(res.body.id).toBe(procedureId);
    expect(res.body.code).toBe(procedureCode);
  });

  it('should update procedure with authorized role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/procedimentos/${procedureId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ value: '300.00' })
      .expect(200);

    expect(res.body.value).toBe('300.00');
  });

  it('should soft delete procedure with authorized role', async () => {
    await request(app.getHttpServer())
      .delete(`/procedimentos/${procedureId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('should not list soft-deleted procedure', async () => {
    const res = await request(app.getHttpServer())
      .get('/procedimentos')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    const ids = (res.body as Array<{ id: string }>).map((p) => p.id);
    expect(ids).not.toContain(procedureId);
  });

  it('should return not found for GET by id of soft-deleted procedure', async () => {
    await request(app.getHttpServer())
      .get(`/procedimentos/${procedureId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(404);
  });
});
