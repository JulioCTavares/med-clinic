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
import { HttpExceptionFilter } from '@/presentation/http/filters/http-exception.filter';

describe('E2E P3 - Error Contract', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let patientToken: string;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    db = app.get<DrizzleDB>(DRIZZLE_DB);
    app.useGlobalFilters(new HttpExceptionFilter());
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
    if (createdUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await app.close();
  });

  it('should return standardized error payload with statusCode, code, and message', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `nobody.${randomUUID().slice(0, 8)}@e2e.test`, password: 'wrong' })
      .expect(401);

    expect(res.body).toMatchObject({
      statusCode: 401,
      code: expect.any(String),
      message: expect.any(String),
    });
  });

  it('should return standardized error payload with path, method, requestId, and timestamp', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `nobody.${randomUUID().slice(0, 8)}@e2e.test`, password: 'wrong' })
      .expect(401);

    expect(res.body).toMatchObject({
      path: '/auth/login',
      method: 'POST',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });

    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });

  it('should return 403 with standardized error payload for forbidden access', async () => {
    const suffix = randomUUID().slice(0, 8);
    const res = await request(app.getHttpServer())
      .post('/specialties')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ code: `ERR-${suffix}`, name: `Error Test ${suffix}` })
      .expect(403);

    expect(res.body).toMatchObject({
      statusCode: 403,
      code: expect.any(String),
      message: expect.any(String),
      path: '/specialties',
      method: 'POST',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('should return 404 with standardized error payload for not found resource', async () => {
    const fakeId = randomUUID();
    const res = await request(app.getHttpServer())
      .get(`/specialties/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(res.body).toMatchObject({
      statusCode: 404,
      code: expect.any(String),
      message: expect.any(String),
      path: `/specialties/${fakeId}`,
      method: 'GET',
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('should return 401 with standardized error payload for missing token', async () => {
    const res = await request(app.getHttpServer())
      .get('/doctors')
      .expect(401);

    expect(res.body).toMatchObject({
      statusCode: 401,
      code: expect.any(String),
      message: expect.any(String),
    });
  });
});
