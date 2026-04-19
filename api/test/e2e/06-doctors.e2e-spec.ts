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

describe('E2E P2 - Doctors', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let adminToken: string;
  let doctorToken: string;
  let doctorProfileId: string;
  let anotherDoctorProfileId: string;
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
      .values({ code: `DOC-${suffix}`, name: `Doctor Spec ${suffix}` })
      .returning({ id: specialties.id });
    createdSpecialtyIds.push(specialty.id);

    const doctorRes = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor ${suffix}`,
        crm: `CRM/A-${suffix}`,
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

    const anotherDoctorRes = await request(app.getHttpServer())
      .post('/auth/register/doctor')
      .send({
        email: `doc2.${suffix}@e2e.test`,
        password: 'Pass@123',
        name: `Doctor2 ${suffix}`,
        crm: `CRM/B-${suffix}`,
        specialtyId: specialty.id,
      })
      .expect(201);
    createdUserIds.push(anotherDoctorRes.body.id);
    anotherDoctorProfileId = anotherDoctorRes.body.doctor.id;
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

  it('should list doctors', async () => {
    const res = await request(app.getHttpServer())
      .get('/doctors')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    const ids = (res.body.data as Array<{ id: string }>).map((d) => d.id);
    expect(ids).toContain(doctorProfileId);
  });

  it('should fetch doctor by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/doctors/${doctorProfileId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(res.body.id).toBe(doctorProfileId);
  });

  it('should update doctor as admin', async () => {
    const suffix = randomUUID().slice(0, 8);

    const res = await request(app.getHttpServer())
      .patch(`/doctors/${anotherDoctorProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Admin Updated ${suffix}` })
      .expect(200);

    expect(res.body.name).toContain('Admin Updated');
  });

  it('should update doctor as same doctor profile', async () => {
    const suffix = randomUUID().slice(0, 8);

    const res = await request(app.getHttpServer())
      .patch(`/doctors/${doctorProfileId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ name: `Self Updated ${suffix}` })
      .expect(200);

    expect(res.body.name).toContain('Self Updated');
  });

  it('should block doctor update for another doctor id', async () => {
    await request(app.getHttpServer())
      .patch(`/doctors/${anotherDoctorProfileId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ name: 'Unauthorized Update' })
      .expect(403);
  });

  it('should soft delete doctor as admin', async () => {
    await request(app.getHttpServer())
      .delete(`/doctors/${anotherDoctorProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/doctors/${anotherDoctorProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
