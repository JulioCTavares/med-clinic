import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { DRIZZLE_DB } from '@/infrastructure/database/database.module';
import { specialties } from '@/infrastructure/database/drizzle/schemas/specialties';
import type { DrizzleDB } from '@/infrastructure/database/drizzle/drizzle.factory';

describe('E2E P0 - Auth', () => {
  let app: INestApplication;
  let db: DrizzleDB;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('register doctor and patient -> login -> refresh -> access with valid token -> logout', async () => {
    const suffix = randomUUID().slice(0, 8);
    const password = 'Password@123';

    const [specialty] = await db
      .insert(specialties)
      .values({
        code: `CARD-${suffix}`,
        name: `Cardiology ${suffix}`,
      })
      .returning({ id: specialties.id });

    const doctorRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doctor.${suffix}@e2e.test`,
        password,
        name: `Dr Test ${suffix}`,
        crm: `CRM/SP-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);

    expect(doctorRegisterResponse.body).toMatchObject({
      email: `doctor.${suffix}@e2e.test`,
      role: 'doctor',
    });
    expect(doctorRegisterResponse.body.doctor?.id).toBeDefined();

    const patientRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({
        email: `patient.${suffix}@e2e.test`,
        password,
        name: `Patient Test ${suffix}`,
      })
      .expect(201);

    expect(patientRegisterResponse.body).toMatchObject({
      email: `patient.${suffix}@e2e.test`,
      role: 'patient',
    });
    expect(patientRegisterResponse.body.patient?.id).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `patient.${suffix}@e2e.test`,
        password,
      })
      .expect(200);

    expect(loginResponse.body.access_token).toEqual(expect.any(String));
    expect(loginResponse.body.refresh_token).toEqual(expect.any(String));

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refresh_token: loginResponse.body.refresh_token,
      })
      .expect(200);

    expect(refreshResponse.body.access_token).toEqual(expect.any(String));
    expect(refreshResponse.body.refresh_token).toEqual(expect.any(String));
    expect(refreshResponse.body.access_token).not.toBe(loginResponse.body.access_token);
    expect(refreshResponse.body.refresh_token).not.toBe(loginResponse.body.refresh_token);

    await request(app.getHttpServer())
      .get('/medicos')
      .set('Authorization', `Bearer ${refreshResponse.body.access_token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshResponse.body.access_token}`)
      .expect(204);
  });

  it('should return 401 on login with non-existing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `nobody.${randomUUID().slice(0, 8)}@e2e.test`, password: 'Password@123' })
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 on login with wrong password', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `p.${suffix}@e2e.test`, password: 'Password@123', name: `Patient ${suffix}` })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `p.${suffix}@e2e.test`, password: 'WrongPassword@999' })
      .expect(401);
  });

  it('should return 401 for invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: 'not-a-valid-refresh-token' })
      .expect(401);
  });

  it('should return 401 for revoked refresh token (token rotation)', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `p.${suffix}@e2e.test`, password: 'Password@123', name: `Patient ${suffix}` })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `p.${suffix}@e2e.test`, password: 'Password@123' })
      .expect(200);

    const originalRefreshToken = loginRes.body.refresh_token;

    // First use rotates the token
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: originalRefreshToken })
      .expect(200);

    // Old refresh token is now revoked
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: originalRefreshToken })
      .expect(401);
  });

  it('should deny access with blacklisted access token after logout', async () => {
    const suffix = randomUUID().slice(0, 8);

    await request(app.getHttpServer())
      .post('/auth/register/patient')
      .send({ email: `p.${suffix}@e2e.test`, password: 'Password@123', name: `Patient ${suffix}` })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `p.${suffix}@e2e.test`, password: 'Password@123' })
      .expect(200);

    const token = loginRes.body.access_token;

    await request(app.getHttpServer())
      .get('/medicos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/medicos')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
